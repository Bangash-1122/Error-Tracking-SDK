'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  Code,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';

export function SdkSetupPanel() {
  const { activeProject, rotateActiveKey, sendSimulatedEvent, showToast } = useApp();
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeTab, setActiveTab] = useState<'react' | 'js' | 'node' | 'python'>('react');
  const [isSending, setIsSending] = useState(false);
  const [eventSent, setEventSent] = useState(false);

  const installCommands = {
    react: 'npm install @error-tracker/react',
    js: 'npm install @error-tracker/browser',
    node: 'npm install @error-tracker/node',
    python: 'pip install error-tracker-python',
  };

  const getSnippet = () => {
    switch (activeTab) {
      case 'react':
        return `import { init, ErrorBoundary } from '@error-tracker/react';

// Initialize in root index.tsx / app layout
init({
  projectKey: '${activeProject.rawKey}',
  environment: 'production',
  release: 'v1.0.0',
  sampleRate: 1.0, // 100% of errors collected
});

export function App() {
  return (
    <ErrorBoundary fallback={<CrashFallback />}>
      <YourApplication />
    </ErrorBoundary>
  );
}`;
      case 'js':
        return `<script src="https://cdn.errorpulse.io/v1/sdk.min.js"></script>
<script>
  ErrorPulse.init({
    projectKey: "${activeProject.rawKey}",
    environment: "production"
  });
</script>`;
      case 'node':
        return `const ErrorPulse = require('@error-tracker/node');

ErrorPulse.init({
  projectKey: '${activeProject.rawKey}',
  environment: 'production',
  serviceName: '${activeProject.slug}'
});

// Capture handled errors manually
try {
  processOrder();
} catch (err) {
  ErrorPulse.captureException(err);
}`;
      case 'python':
        return `import error_tracker

error_tracker.init(
    project_key="${activeProject.rawKey}",
    environment="production"
)

# Automatic unhandled exception logging`;
    }
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(installCommands[activeTab]);
    setCopiedInstall(true);
    showToast('Install command copied');
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopiedSnippet(true);
    showToast('Initialization code copied');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleSendTest = () => {
    setIsSending(true);
    setTimeout(() => {
      sendSimulatedEvent(
        'SDKTestException',
        'Verification event generated from SDK Integration Setup Panel'
      );
      setIsSending(false);
      setEventSent(true);
    }, 800);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-[#2563EB]" />
            Client SDK Installation & Initialization
          </h3>
          <p className="text-xs text-[#52647A] mt-0.5">
            Configure exception capture for <strong className="text-slate-800">{activeProject.name}</strong>
          </p>
        </div>

        {/* Platform tabs */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
          {[
            { id: 'react', label: 'React / Next.js' },
            { id: 'js', label: 'Browser JS' },
            { id: 'node', label: 'Node.js' },
            { id: 'python', label: 'Python' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#2563EB] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 1: Install Command */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          Step 1: Install Package
        </label>
        <div className="flex items-center justify-between bg-[#0F172A] text-slate-200 px-4 py-3 rounded-xl font-mono text-xs border border-slate-800">
          <span className="text-emerald-400 select-all">{installCommands[activeTab]}</span>
          <button
            onClick={handleCopyInstall}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Copy command"
          >
            {copiedInstall ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Code Snippet */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Step 2: Initialize in Application
          </label>
          <button
            onClick={handleCopySnippet}
            className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold"
          >
            {copiedSnippet ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </div>
        <div className="bg-[#0F172A] text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800 overflow-x-auto">
          <pre className="whitespace-pre">{getSnippet()}</pre>
        </div>
      </div>

      {/* Step 3: Test Event Verification */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Step 3: Verify Ingestion Pipeline
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Send a synthetic test exception to confirm that this project key receives events.
          </p>
        </div>

        <button
          onClick={handleSendTest}
          disabled={isSending}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#2563EB]/20 disabled:opacity-60 transition-all cursor-pointer"
        >
          {isSending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Ingesting...</span>
            </>
          ) : eventSent ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Event Received! Test Again</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Send Test Event</span>
            </>
          )}
        </button>
      </div>

      {eventSent && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Test Event Successfully Ingested!</p>
            <p className="text-emerald-700 mt-0.5">
              The event was received by the worker pipeline and recorded in your issues list.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
