'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { SdkSetupPanel } from '@/components/onboarding/SdkSetupPanel';
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Building,
  FolderPlus,
  KeyRound,
  Zap,
  Check,
  ChevronRight,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { org, activeProject, sendSimulatedEvent, showToast } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(3); // Default to Step 3 (SDK setup) since org & project exist, but allow full browsing
  const [projectName, setProjectName] = useState('Production Web App');
  const [platform, setPlatform] = useState('react');

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col selection:bg-[#2563EB] selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 bg-[#10203C] px-8 flex items-center justify-between border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#12A89D] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-base">ErrorPulse Onboarding Wizard</span>
        </div>

        <Link
          href={`/org/${org.slug}/overview`}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
        >
          <span>Skip to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Main wizard container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Step indicator */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          {[
            { num: 1, title: 'Organization' },
            { num: 2, title: 'Project Details' },
            { num: 3, title: 'SDK Integration' },
            { num: 4, title: 'Verify Pipeline' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep >= s.num
                    ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  currentStep >= s.num ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {s.title}
              </span>
              {idx < 3 && <ChevronRight className="w-4 h-4 text-slate-300 ml-2 hidden sm:inline" />}
            </div>
          ))}
        </div>

        {/* Wizard content cards */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Step 1: Your Organization</h2>
            <p className="text-xs text-slate-500">
              Confirm your workspace name and tenant identifier.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block">Organization Name:</span>
              <p className="text-sm font-semibold text-[#10203C] mt-1">{org.name} ({org.slug})</p>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8]"
            >
              Continue to Project Setup
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Step 2: Project Details</h2>
            <p className="text-xs text-slate-500">
              Create an application project to receive exceptions.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl capitalize"
              >
                <option value="react">React / Next.js</option>
                <option value="javascript">Browser JavaScript</option>
                <option value="node">Node.js Server</option>
                <option value="python">Python</option>
              </select>
            </div>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8]"
            >
              Issue Ingest Key & Continue
            </button>
          </div>
        )}

        {currentStep >= 3 && (
          <div className="space-y-6">
            <SdkSetupPanel />

            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Ready to explore?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Launch the live dashboard to review real-time issue graphs, stack traces, and alerts.
                </p>
              </div>

              <button
                onClick={() => router.push(`/org/${org.slug}/overview`)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10203C] hover:bg-[#1B325B] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
