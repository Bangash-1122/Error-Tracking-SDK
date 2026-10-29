'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  Code2,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  ChevronRight,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Search,
  Globe,
  Server,
  Laptop,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function InstallationPage() {
  const [activePkg, setActivePkg] = useState<'pnpm' | 'npm' | 'yarn' | 'bun' | 'cdn'>('pnpm');
  const [activeFramework, setActiveFramework] = useState<'nextjs' | 'react' | 'node' | 'vanilla'>('nextjs');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const packageCommands = {
    pnpm: 'pnpm add @error-tracker/browser',
    npm: 'npm install @error-tracker/browser',
    yarn: 'yarn add @error-tracker/browser',
    bun: 'bun add @error-tracker/browser',
    cdn: '<script src="https://cdn.errortracker.io/v1/browser.min.js" data-dsn="https://pk_live_8f3a9b2c@ingest.errortracker.io/prj_prod_01"></script>',
  };

  const frameworkCode = {
    nextjs: `// app/layout.tsx (Next.js 16 App Router)
import { useEffect } from 'react';
import { init } from '@error-tracker/browser';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    init({
      dsn: process.env.NEXT_PUBLIC_ERRORPULSE_DSN || 'https://pk_live_8f3a9b2c@ingest.errortracker.io/prj_prod_01',
      environment: process.env.NODE_ENV || 'production',
      release: 'v1.4.0',
      sampleRate: 1.0, // Report 100% of uncaught errors
      maxBreadcrumbs: 50,
      beforeSend(event) {
        // Automatically scrub sensitive data before sending
        if (event.tags?.secret) delete event.tags.secret;
        return event;
      },
    });
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
    react: `// src/main.tsx (Vite / CRA)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { init, captureException } from '@error-tracker/browser';

init({
  dsn: 'https://pk_live_8f3a9b2c@ingest.errortracker.io/prj_prod_01',
  environment: import.meta.env.MODE || 'production',
  release: 'v1.4.0',
  sampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    node: `// server.ts (Node.js & Express)
import express from 'express';
import { init, captureException } from '@error-tracker/browser';

const app = express();

init({
  dsn: process.env.ERRORPULSE_DSN || 'https://pk_live_8f3a9b2c@ingest.errortracker.io/prj_prod_01',
  environment: process.env.NODE_ENV || 'production',
  release: 'v1.4.0',
});

app.use(express.json());

// Express Error Handling Middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  captureException(err, {
    tags: { route: req.path, method: req.method },
    extra: { query: req.query },
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(8080, () => console.log('Server running with ErrorPulse monitoring'));`,
    vanilla: `<!-- In your HTML <head> or before </body> -->
<script
  src="https://cdn.errortracker.io/v1/browser.min.js"
  data-dsn="https://pk_live_8f3a9b2c@ingest.errortracker.io/prj_prod_01"
  data-environment="production"
  data-release="v1.4.0"
></script>

<script>
  window.addEventListener('DOMContentLoaded', () => {
    console.log('ErrorPulse SDK loaded via standalone CDN');
  });
</script>`,
  };

  return (
    <div className="min-h-screen bg-[#0B172B] text-slate-100 flex flex-col justify-between selection:bg-[#2563EB] selection:text-white font-sans antialiased">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[700px] h-[400px] bg-gradient-to-b from-[#2563EB]/15 via-[#12A89D]/5 to-transparent blur-3xl opacity-60" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B172B]/85 border-b border-[#1E2E4A]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" prefetch={true} className="flex items-center gap-3 group" title="Return to Homepage">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#12A89D] flex items-center justify-center shadow-lg shadow-[#2563EB]/30 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                ErrorPulse
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
              <Link href="/installation" prefetch={true} className="text-[#93C5FD] hover:text-white transition-colors font-bold">
                Installation
              </Link>
              <Link href="/onboarding" prefetch={true} className="hover:text-white transition-colors">
                Setup Wizard
              </Link>
              <Link href="/org/acme-corp/overview" prefetch={true} className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/org/acme-corp/system-status" prefetch={true} className="hover:text-white transition-colors flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                System Status
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              prefetch={true}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#152747] border border-[#1E2E4A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/org/acme-corp/overview"
              prefetch={true}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#2563EB]/30 transition-all hover:scale-105"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Documentation Content (PDF 2 layout) */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        {/* Breadcrumb (Next.js docs style from PDF 2) */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-200 transition-colors">Docs</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-300">Getting Started</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[#93C5FD]">Installation</span>
        </div>

        {/* Page Header */}
        <div className="border-b border-[#1E2E4A] pb-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Installation & Quickstart
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Add ErrorPulse SDK to your web application, configure your publishable ingestion key (DSN), and capture real-time exceptions with in-app stack traces in under two minutes.
              </p>
            </div>

            <button
              onClick={() => copyText(packageCommands[activePkg], 'quick-copy')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#10203C] hover:bg-[#152747] text-slate-300 border border-[#1E2E4A] self-start sm:self-auto cursor-pointer transition-colors"
            >
              {copiedKey === 'quick-copy' ? <Check className="w-3.5 h-3.5 text-[#12A89D]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Command</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            STEP 1: PACKAGE MANAGER SELECTION (from PDF 2)
        ======================================================== */}
        <section className="space-y-6 mb-14">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Install the Client SDK
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-400">
            Choose your preferred package manager. ErrorPulse is distributed as an optimized, zero-dependency tree-shakeable ES/CommonJS bundle.
          </p>

          {/* Package Manager Tabs */}
          <div className="bg-[#10203C] border border-[#1E2E4A] rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E2E4A] bg-[#0B172B]">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['pnpm', 'npm', 'yarn', 'bun', 'cdn'] as const).map((pkg) => (
                  <button
                    key={pkg}
                    onClick={() => setActivePkg(pkg)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      activePkg === pkg
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-[#152747]'
                    }`}
                  >
                    {pkg}
                  </button>
                ))}
              </div>

              <button
                onClick={() => copyText(packageCommands[activePkg], 'pkg-tab')}
                className="p-1.5 rounded-lg hover:bg-[#152747] text-slate-400 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                {copiedKey === 'pkg-tab' ? <Check className="w-4 h-4 text-[#12A89D]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-4 bg-[#081120] font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto select-all">
              <span className="text-[#93C5FD]">$</span> {packageCommands[activePkg]}
            </div>
          </div>
        </section>

        {/* ========================================================
            STEP 2: SYSTEM REQUIREMENTS (from PDF 2)
        ======================================================== */}
        <section className="space-y-4 mb-14 bg-[#10203C]/50 border border-[#1E2E4A] p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#12A89D]" />
            System Requirements & Browser Support
          </h3>
          <p className="text-xs text-slate-400">
            ErrorPulse modern SDK has lightweight footprint (&lt; 12KB gzipped) and broad platform compatibility:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="font-bold text-slate-200">Runtimes & Node.js:</div>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>Node.js 18.0.0 or higher</li>
                <li>Bun 1.0+, Deno 1.35+</li>
                <li>Vite, Next.js 13/14/15/16, Remix, Astro</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-slate-200">Supported Browsers:</div>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>Chrome & Chromium-based 111+</li>
                <li>Edge 111+</li>
                <li>Firefox 111+</li>
                <li>Safari & iOS Safari 16.4+</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================
            STEP 3: INITIALIZATION & FRAMEWORKS (from PDF 2)
        ======================================================== */}
        <section className="space-y-6 mb-14">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Initialize in Your Application
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-400">
            Select your framework to view copy-ready code snippets with your publishable ingestion key.
          </p>

          {/* Framework Switcher Tabs */}
          <div className="bg-[#10203C] border border-[#1E2E4A] rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E2E4A] bg-[#0B172B]">
              <div className="flex items-center gap-2">
                {(['nextjs', 'react', 'node', 'vanilla'] as const).map((fw) => (
                  <button
                    key={fw}
                    onClick={() => setActiveFramework(fw)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      activeFramework === fw
                        ? 'bg-[#2563EB] text-white font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-[#152747]'
                    }`}
                  >
                    {fw === 'nextjs' ? 'Next.js App Router' : fw === 'react' ? 'React / Vite' : fw === 'node' ? 'Node.js Express' : 'HTML Script'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => copyText(frameworkCode[activeFramework], 'fw-code')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-[#152747] text-slate-400 hover:text-white transition-colors text-xs font-medium"
              >
                {copiedKey === 'fw-code' ? <Check className="w-3.5 h-3.5 text-[#12A89D]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Code</span>
              </button>
            </div>

            <pre className="p-4 bg-[#081120] text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{frameworkCode[activeFramework]}</code>
            </pre>
          </div>
        </section>

        {/* ========================================================
            STEP 4: CONFIGURATION OPTIONS REFERENCE (from PDF 2)
        ======================================================== */}
        <section className="space-y-6 mb-14">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              SDK Configuration Reference
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-400">
            All parameters accepted by the <code className="text-[#93C5FD] font-mono">init(options)</code> call:
          </p>

          <div className="bg-[#10203C] border border-[#1E2E4A] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2E4A] bg-[#0B172B] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Default</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2E4A]/80 text-slate-300">
                  <tr className="hover:bg-[#152747]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#93C5FD]">dsn</td>
                    <td className="py-3 px-4 font-mono text-amber-300">string</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">Required</td>
                    <td className="py-3 px-4">Publishable ingestion key endpoint for your project.</td>
                  </tr>
                  <tr className="hover:bg-[#152747]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#93C5FD]">environment</td>
                    <td className="py-3 px-4 font-mono text-amber-300">string</td>
                    <td className="py-3 px-4 font-mono text-slate-400">&apos;production&apos;</td>
                    <td className="py-3 px-4">Logical environment name (<code className="text-slate-200">production</code>, <code className="text-slate-200">staging</code>, <code className="text-slate-200">development</code>).</td>
                  </tr>
                  <tr className="hover:bg-[#152747]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#93C5FD]">release</td>
                    <td className="py-3 px-4 font-mono text-amber-300">string</td>
                    <td className="py-3 px-4 font-mono text-slate-400">&apos;v1.0.0&apos;</td>
                    <td className="py-3 px-4">Semantic version or commit hash for release tracking and regression detection.</td>
                  </tr>
                  <tr className="hover:bg-[#152747]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#93C5FD]">sampleRate</td>
                    <td className="py-3 px-4 font-mono text-amber-300">number</td>
                    <td className="py-3 px-4 font-mono text-slate-400">1.0</td>
                    <td className="py-3 px-4">Sampling rate between <code className="text-slate-200">0.0</code> (0%) and <code className="text-slate-200">1.0</code> (100%).</td>
                  </tr>
                  <tr className="hover:bg-[#152747]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#93C5FD]">maxBreadcrumbs</td>
                    <td className="py-3 px-4 font-mono text-amber-300">number</td>
                    <td className="py-3 px-4 font-mono text-slate-400">50</td>
                    <td className="py-3 px-4">Maximum number of user interactions, logs, and network calls preserved.</td>
                  </tr>
                  <tr className="hover:bg-[#152747]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#93C5FD]">beforeSend</td>
                    <td className="py-3 px-4 font-mono text-amber-300">function</td>
                    <td className="py-3 px-4 font-mono text-slate-400">null</td>
                    <td className="py-3 px-4">Callback to inspect or mutate the event, or return <code className="text-slate-200">null</code> to discard.</td>
                  </tr>
                  <tr className="hover:bg-[#152747]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#93C5FD]">ignoreErrors</td>
                    <td className="py-3 px-4 font-mono text-amber-300">string[]</td>
                    <td className="py-3 px-4 font-mono text-slate-400">[]</td>
                    <td className="py-3 px-4">List of regex patterns or error names to ignore (e.g. <code className="text-slate-200">ResizeObserver</code>).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================
            STEP 5: VERIFICATION & TEST EVENT
        ======================================================== */}
        <section className="space-y-4 mb-14 bg-gradient-to-r from-[#10203C] to-[#152747] border border-[#2563EB]/40 p-6 rounded-2xl">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#93C5FD]" />
            <h3 className="text-base font-bold text-white">
              Verify Your Integration with a Test Event
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Trigger a diagnostic error from your browser console or application code to confirm that events flow into the ingest gateway:
          </p>

          <div className="bg-[#0B172B] p-3.5 rounded-xl font-mono text-xs text-emerald-400 border border-[#1E2E4A] flex items-center justify-between">
            <span>captureException(new Error(&quot;ErrorPulse Diagnostic Test Exception&quot;));</span>
            <button
              onClick={() => copyText('captureException(new Error("ErrorPulse Diagnostic Test Exception"));', 'test-code')}
              className="p-1 hover:text-white text-slate-400"
            >
              {copiedKey === 'test-code' ? <Check className="w-3.5 h-3.5 text-[#12A89D]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/org/acme-corp/overview"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#93C5FD] hover:underline"
            >
              <span>View live events in Acme Corp Overview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Bottom CTA Box */}
        <div className="border-t border-[#1E2E4A] pt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white">Need help or advanced configuration?</h4>
            <p className="text-xs text-slate-400">Explore the interactive onboarding wizard or check system health.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#152747] hover:bg-[#1B325B] text-slate-200 border border-[#1E2E4A] transition-all"
            >
              Interactive Setup Wizard
            </Link>
            <Link
              href="/org/acme-corp/overview"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#2563EB]/30 transition-all"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#081120] border-t border-[#1E2E4A] py-8 px-6 text-xs text-slate-500 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 ErrorPulse Technologies Inc. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span>•</span>
            <Link href="/installation" className="hover:text-slate-300">Docs</Link>
            <span>•</span>
            <Link href="/org/acme-corp/system-status" className="hover:text-slate-300">Status</Link>
            <span>•</span>
            <Link href="/org/acme-corp/overview" className="hover:text-slate-300">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
