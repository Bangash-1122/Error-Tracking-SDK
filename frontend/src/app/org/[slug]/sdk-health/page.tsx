'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { api } from '@/lib/apiClient';
import {
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  Zap,
  RefreshCw,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';

export default function SdkHealthPage() {
  const { org, activeProject, sendSimulatedEvent, showToast } = useApp();
  const [health, setHealth] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const fetchHealth = () => {
    api.getSdkHealth(activeProject.id)
      .then((data) => setHealth(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchHealth();
  }, [activeProject.id]);

  const handleTestEvent = async () => {
    setTesting(true);
    try {
      await sendSimulatedEvent(
        'HealthProbeException',
        'Diagnostic verification event triggered from SDK Health dashboard'
      );
      fetchHealth();
    } catch (err: any) {
      showToast(`Health probe failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const isHealthy = health?.integrationStatus === 'healthy';

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-[#2563EB]" />
              SDK Integration Health & Telemetry
            </h1>
            <p className="text-xs text-[#52647A] mt-0.5">
              Live protocol validation, rate limit diagnostics, and ingestion verification for{' '}
              <strong className="text-slate-800">{activeProject.name}</strong>
            </p>
          </div>

          <button
            onClick={handleTestEvent}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#2563EB]/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Transmitting Probe...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Send Diagnostic Probe</span>
              </>
            )}
          </button>
        </div>

        {/* 4 Health KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            label="Integration Status"
            value={isHealthy ? 'Healthy' : 'Pending'}
            changePercent={100}
            timeWindow="live pipeline status"
            icon={ShieldCheck}
            color="teal"
            tooltip="Indicates whether client telemetry is reaching the ingestion pipeline"
          />
          <MetricsCard
            label="Accepted Events"
            value={(health?.successfulIngestionCount || activeProject.eventCount).toLocaleString()}
            changePercent={14}
            timeWindow="successfully recorded"
            icon={CheckCircle2}
            color="blue"
            tooltip="Total events accepted by the worker pipeline without rejection"
          />
          <MetricsCard
            label="Rejected Events"
            value={health?.rejectedEventsCount || 0}
            changePercent={0}
            changePositive={true}
            timeWindow="schema mismatches"
            icon={AlertCircle}
            color="amber"
            tooltip="Events dropped due to invalid structure or schema mismatch"
          />
          <MetricsCard
            label="Rate-Limited Drops"
            value={health?.rateLimitedEventsCount || 0}
            changePercent={0}
            changePositive={true}
            timeWindow="429 throttle drops"
            icon={AlertTriangle}
            color="red"
            tooltip="Events throttled by per-project token bucket rate limits"
          />
        </div>

        {/* Two Column Grid: Configuration Checks & Telemetry Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Checks (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              Automated SDK Configuration Validations
            </h3>
            <p className="text-xs text-slate-500">
              The ingestion engine automatically inspects and validates event envelopes against protocol specifications.
            </p>

            <div className="space-y-3 pt-2">
              {(health?.configurationChecks || [
                { name: 'DSN Project Key Syntax', passed: true, detail: 'Valid 256-bit hashed key' },
                { name: 'Payload Schema Version 1.x.x', passed: true, detail: 'v1.0.0 compliant' },
                { name: 'Stack Trace Serialization', passed: true, detail: 'V8 / JSCore frame parser active' },
                { name: 'CORS & Origin Security', passed: true, detail: 'Wildcard public ingress allowed' },
                { name: 'Rate Limit Threshold', passed: true, detail: '600 events / minute allowed' },
              ]).map((check: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-bold text-slate-800">{check.name}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{check.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Metadata Card (1 Col) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#2563EB]" />
              Active Telemetry
            </h3>

            <div className="space-y-3 text-xs pt-1">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">SDK Client Library</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                  {health?.clientLibrary || '@error-tracker/browser'} (v{health?.sdkVersion || '1.0.0'})
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Last Event Ingested</span>
                <span className="text-slate-700 mt-0.5 block">
                  {health?.lastReceivedEventAt
                    ? new Date(health.lastReceivedEventAt).toLocaleString()
                    : 'Awaiting first event'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Sampling Rate</span>
                <span className="font-mono text-emerald-700 font-bold mt-0.5 block">100% (sampleRate: 1.0)</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Environment Detected</span>
                <span className="font-bold text-slate-800 capitalize mt-0.5 block">
                  {health?.environmentDetected || 'production'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Release Detected</span>
                <span className="font-mono text-slate-700 mt-0.5 block">{health?.releaseDetected || 'v1.3.2'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Troubleshooting Guide */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#2563EB]" />
            Actionable Troubleshooting Instructions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <h4 className="font-bold text-slate-900">Events Not Showing in Dashboard</h4>
              <p className="text-slate-600 leading-relaxed">
                Ensure <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">projectKey</code> matches the active
                key in Project Settings. If using adblockers, allow requests to{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">/api/v1/events</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <h4 className="font-bold text-slate-900">HTTP 429 Rate Limiting</h4>
              <p className="text-slate-600 leading-relaxed">
                If an error storm occurs, adjust <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">sampleRate: 0.25</code> in
                the client initializer or upgrade your subscription plan limit.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <h4 className="font-bold text-slate-900">Stack Frames Missing In-App Tags</h4>
              <p className="text-slate-600 leading-relaxed">
                Ensure stack frames do not contain minified code without sourcemaps. Set up release identifiers like{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">release: &apos;v1.3.2&apos;</code> to group issues properly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
