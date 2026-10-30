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
  Sparkles,
  Layers,
  Server,
  FileCode,
} from 'lucide-react';

export function SdkSetupPanel() {
  const { activeProject, sendSimulatedEvent, showToast } = useApp();
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeTab, setActiveTab] = useState<'react' | 'js' | 'node' | 'python'>('react');
  const [isSending, setIsSending] = useState(false);
  const [eventSent, setEventSent] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);

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
  projectKey: '${activeProject.rawKey || 'ep_live_9f81a7b8e2194'}',
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
    projectKey: "${activeProject.rawKey || 'ep_live_9f81a7b8e2194'}",
    environment: "production"
  });
</script>`;
      case 'node':
        return `const ErrorPulse = require('@error-tracker/node');

ErrorPulse.init({
  projectKey: '${activeProject.rawKey || 'ep_live_9f81a7b8e2194'}',
  environment: 'production',
  serviceName: '${activeProject.slug || 'web-app'}'
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
    project_key="${activeProject.rawKey || 'ep_live_9f81a7b8e2194'}",
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

  const handleSendTest = async () => {
    setIsSending(true);
    setIngestError(null);
    setEventSent(false);

    try {
      await sendSimulatedEvent(
        'SDKTestException',
        'Verification event generated from SDK Integration Setup Panel'
      );
      setEventSent(true);
      showToast('Diagnostic test event delivered to pipeline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'SDK test ingestion failed.';
      setIngestError(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#0C1427]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            STEP 3 OF 4
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            Client SDK Installation & Initialization
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure exception capture for <strong className="text-cyan-300 font-mono">{activeProject.name}</strong>
          </p>
        </div>

        {/* Platform tabs */}
        <div className="flex items-center gap-1.5 bg-[#060A16] p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto overflow-x-auto">
          {[
            { id: 'react', label: 'React / Next.js' },
            { id: 'js', label: 'Browser JS' },
            { id: 'node', label: 'Node.js' },
            { id: 'python', label: 'Python' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'react' | 'js' | 'node' | 'python')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-linear-to-r from-[#2563EB] to-[#8B5CF6] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 1: Install Command */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          Step 1: Install Package
        </label>
        <div className="flex items-center justify-between bg-[#060A16] px-4 py-3 rounded-2xl font-mono text-xs border border-white/10 shadow-inner">
          <span className="text-cyan-400 select-all font-medium">
            <span className="text-slate-500">$</span> {installCommands[activeTab]}
          </span>
          <button
            onClick={handleCopyInstall}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Copy command"
          >
            {copiedInstall ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Code Snippet */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            Step 2: Initialize in Application
          </label>
          <button
            onClick={handleCopySnippet}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            {copiedSnippet ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </div>
        <div className="bg-[#060A16] text-slate-200 p-4 rounded-2xl font-mono text-xs border border-white/10 overflow-x-auto shadow-inner leading-relaxed">
          <pre className="whitespace-pre">{getSnippet()}</pre>
        </div>
      </div>

      {/* Step 3: Test Event Verification */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Step 3: Verify Ingestion Pipeline
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Send a synthetic test exception to confirm that this project key receives events.
          </p>
        </div>

        <button
          onClick={handleSendTest}
          disabled={isSending}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-60 transition-all cursor-pointer"
        >
          {isSending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Ingesting...</span>
            </>
          ) : eventSent ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
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
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-white">Test Event Successfully Ingested (&lt;1.2ms)!</p>
            <p className="text-emerald-300/90 mt-0.5">
              The exception was processed through the SHA-256 deduplication normalizer and recorded under issue #1.
            </p>
          </div>
        </div>
      )}

      {ingestError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300 animate-in fade-in duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <div>
            <p className="font-bold text-white">Ingestion Pipeline Rejection</p>
            <p className="text-rose-300 mt-0.5">{ingestError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
