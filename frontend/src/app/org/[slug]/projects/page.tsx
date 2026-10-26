'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { KeyRotationModal } from '@/components/projects/KeyRotationModal';
import {
  Settings,
  KeyRound,
  RotateCcw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';

export default function ProjectSettingsPage() {
  const { org, activeProject, showToast } = useApp();
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [rotationOpen, setRotationOpen] = useState(false);
  const [sampleRate, setSampleRate] = useState(1.0);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(activeProject.rawKey);
    setCopiedKey(true);
    showToast('Ingest key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const usagePercent = Math.min(
    100,
    Math.round((activeProject.eventCount / activeProject.quotaLimit) * 100)
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#2563EB]" />
            Project Settings
          </h1>
          <p className="text-xs text-[#52647A] mt-0.5">
            Manage ingest credentials, sampling, and quotas for <strong className="text-slate-800">{activeProject.name}</strong>
          </p>
        </div>

        {/* Credentials & Key Rotation Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#2563EB]" />
                Publishable Ingestion Key
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pass this key to your client SDKs (browser/mobile). This key is write-only and cannot read dashboard data.
              </p>
            </div>

            <button
              onClick={() => setRotationOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rotate Key</span>
            </button>
          </div>

          <div className="bg-[#0F172A] text-slate-200 p-4 rounded-xl flex items-center justify-between font-mono text-xs border border-slate-800 gap-3">
            <span className="text-[#93C5FD] truncate select-all">
              {showKey ? activeProject.rawKey : activeProject.publicKey}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title={showKey ? 'Hide key' : 'Reveal full key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                onClick={handleCopyKey}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy to clipboard"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Quota & Event Rate Limiting */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#12A89D]" />
            Monthly Event Quota & Usage
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Events Ingested This Period</span>
              <span className="text-slate-900">
                {activeProject.eventCount.toLocaleString()} / {activeProject.quotaLimit.toLocaleString()} ({usagePercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                style={{ width: `${usagePercent}%` }}
                className="bg-gradient-to-r from-[#2563EB] to-[#12A89D] h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Sampling Configuration */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#F59E0B]" />
            Sampling Rate
          </h2>
          <p className="text-xs text-slate-500">
            Dynamically adjust the percentage of captured exceptions ingested by the pipeline.
          </p>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={sampleRate}
              onChange={(e) => setSampleRate(parseFloat(e.target.value))}
              className="flex-1 accent-[#2563EB] cursor-pointer"
            />
            <span className="font-mono font-bold text-sm text-slate-800 w-16 text-right">
              {Math.round(sampleRate * 100)}%
            </span>
          </div>
        </div>
      </div>

      <KeyRotationModal isOpen={rotationOpen} onClose={() => setRotationOpen(false)} />
    </AppShell>
  );
}
