'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Play,
  CheckCheck,
  Radio,
} from 'lucide-react';
import { useApp } from '@/lib/store';

export default function InstallationPage() {
  const { sendSimulatedEvent, showToast } = useApp();
  const [activePkg, setActivePkg] = useState<'pnpm' | 'npm' | 'yarn' | 'bun' | 'cdn'>('pnpm');
  const [activeFramework, setActiveFramework] = useState<'nextjs' | 'react' | 'node' | 'vanilla'>('nextjs');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testingEvent, setTestingEvent] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Ultra-fast 3D wireframe constellation canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const nodeColors = ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#38BDF8'];
    const pointCount = Math.min(50, Math.floor(width / 40));
    const points: Array<{ x: number; y: number; z: number; color: string; size: number }> = [];
    const radius = Math.min(width, height) * 0.4;

    for (let i = 0; i < pointCount; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        color: nodeColors[i % nodeColors.length],
        size: Math.random() * 2 + 1,
      });
    }

    let rotX = 0;
    let rotY = 0;
    const fov = 400;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      rotX += 0.0015;
      rotY += 0.002;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const projected = points.map((p) => {
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const scale = fov / (fov + z2 + radius * 1.2);
        return {
          x2d: x1 * scale + width / 2,
          y2d: y2 * scale + height * 0.35,
          scale,
          color: p.color,
          size: p.size * scale,
        };
      });

      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x2d - projected[j].x2d;
          const dy = projected[i].y2d - projected[j].y2d;
          const dist = dx * dx + dy * dy;
          if (dist < 7000) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - Math.sqrt(dist) / 84)})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x2d, projected[i].y2d);
            ctx.lineTo(projected[j].x2d, projected[j].y2d);
            ctx.stroke();
          }
        }
      }

      projected.forEach((p) => {
        if (p.scale <= 0) return;
        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, Math.max(0.8, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.2, Math.min(1, p.scale));
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleTriggerTest = async () => {
    setTestingEvent(true);
    setTestSuccess(false);
    try {
      sendSimulatedEvent(
        'DiagnosticException',
        'ErrorPulse verification test event: Ingestion pipeline active and healthy'
      );
      setTimeout(() => {
        setTestingEvent(false);
        setTestSuccess(true);
        showToast('Diagnostic test event delivered to ingest gateway');
      }, 500);
    } catch {
      setTestingEvent(false);
    }
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

// Express error handling middleware
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
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between selection:bg-[#8B5CF6] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Interactive 3D Wireframe Constellation Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-60"
      />

      {/* Multi-Color Aurora Glow Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-187.5 h-125 bg-linear-to-br from-[#06B6D4]/20 via-[#2563EB]/15 to-transparent blur-[120px] rounded-full animate-aurora opacity-75" />
        <div className="absolute top-20 right-10 w-162.5 h-137.5 bg-linear-to-bl from-[#8B5CF6]/25 via-[#A855F7]/12 to-transparent blur-[140px] rounded-full opacity-80" />
        <div className="absolute top-162.5 -left-40 w-150 h-150 bg-linear-to-tr from-[#10B981]/18 via-[#06B6D4]/12 to-transparent blur-[130px] rounded-full opacity-70" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050814]/80 border-b border-white/10 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" prefetch={true} className="flex items-center gap-3 group" title="Return to Homepage">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#06B6D4] via-[#8B5CF6] to-[#F43F5E] p-[1.5px] shadow-lg shadow-[#8B5CF6]/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#080D1D] rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#38BDF8] group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
                  ErrorPulse
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-linear-to-r from-[#8B5CF6]/20 to-[#06B6D4]/20 text-[#A78BFA] border border-[#8B5CF6]/40">
                  APM 2.0
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
              <Link href="/installation" prefetch={true} className="text-cyan-400 hover:text-white transition-colors font-bold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                Installation
              </Link>
              <Link href="/docs" prefetch={true} className="hover:text-white transition-colors flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                Documentation
              </Link>
              <Link href="/onboarding" prefetch={true} className="hover:text-white transition-colors">
                Setup Wizard
              </Link>
              <Link href="/org/acme-corp/overview" prefetch={true} className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/org/acme-corp/system-status" prefetch={true} className="hover:text-white transition-colors flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                System Status
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              prefetch={true}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/org/acme-corp/overview"
              prefetch={true}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-linear-to-r from-[#2563EB] via-[#8B5CF6] to-[#06B6D4] hover:opacity-90 text-white shadow-lg shadow-[#8B5CF6]/30 transition-all hover:scale-105"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Documentation Content */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link href="/docs" prefetch={true} className="hover:text-slate-200 transition-colors">Docs</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-300">Getting Started</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400">Installation & Quickstart</span>
        </div>

        {/* Page Header */}
        <div className="border-b border-white/10 pb-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D152C] border border-[#8B5CF6]/40 text-[#C4B5FD] text-xs font-mono font-bold mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                SDK v2.1.0 • Modern Telemetry
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Installation & Quickstart
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Add ErrorPulse SDK to your web application, configure your publishable ingestion key (DSN), and capture real-time exceptions with in-app stack traces in under two minutes.
              </p>
            </div>

            <button
              onClick={() => copyText(packageCommands[activePkg], 'quick-copy')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0C1427] hover:bg-[#121E38] text-slate-200 border border-white/10 hover:border-cyan-400/50 self-start sm:self-auto cursor-pointer transition-all shadow-md"
            >
              {copiedKey === 'quick-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>Copy Command</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            STEP 1: PACKAGE MANAGER SELECTION
        ======================================================== */}
        <section className="space-y-6 mb-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-linear-to-tr from-[#06B6D4] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shadow-md">
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
          <div className="bg-[#0C1427]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#060A16]">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['pnpm', 'npm', 'yarn', 'bun', 'cdn'] as const).map((pkg) => (
                  <button
                    key={pkg}
                    onClick={() => setActivePkg(pkg)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      activePkg === pkg
                        ? 'bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {pkg}
                  </button>
                ))}
              </div>

              <button
                onClick={() => copyText(packageCommands[activePkg], 'pkg-code')}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy install command"
              >
                {copiedKey === 'pkg-code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto">
              <span className="text-cyan-400 font-bold">$</span> {packageCommands[activePkg]}
            </div>
          </div>

          {/* System Requirements & Browser Support Box */}
          <div className="bg-[#0C1427]/60 border border-white/10 rounded-2xl p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                System Requirements & Browser Support
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              ErrorPulse modern SDK has lightweight footprint (&lt; 12KB gzipped) and broad platform compatibility:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#060A16] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                  Runtimes & Node.js:
                </span>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>Node.js 18.0.0 or higher</li>
                  <li>Bun 1.0+, Deno 1.35+</li>
                  <li>Vite, Next.js 13/14/15/16, Remix, Astro</li>
                </ul>
              </div>

              <div className="bg-[#060A16] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Supported Browsers:
                </span>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>Chrome & Chromium-based 111+</li>
                  <li>Edge 111+</li>
                  <li>Firefox 111+</li>
                  <li>Safari & iOS Safari 16.4+</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            STEP 2: INITIALIZE IN APPLICATION
        ======================================================== */}
        <section className="space-y-6 mb-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-linear-to-tr from-[#06B6D4] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shadow-md">
              2
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Initialize in Your Application
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-400">
            Select your framework to view copy-ready code snippets with your publishable ingestion key.
          </p>

          <div className="bg-[#0C1427]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            {/* Framework Switcher Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#060A16]">
              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'nextjs', label: 'Next.js App Router' },
                  { id: 'react', label: 'React / Vite' },
                  { id: 'node', label: 'Node.js Express' },
                  { id: 'vanilla', label: 'HTML Script' },
                ].map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setActiveFramework(fw.id as 'nextjs' | 'react' | 'node' | 'vanilla')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeFramework === fw.id
                        ? 'bg-linear-to-r from-[#2563EB] to-[#8B5CF6] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {fw.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => copyText(frameworkCode[activeFramework], 'fw-code')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
              >
                {copiedKey === 'fw-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>Copy Code</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 font-mono text-xs overflow-x-auto text-slate-200 leading-relaxed bg-[#060A16]/90">
              <pre>
                <code>{frameworkCode[activeFramework]}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* ========================================================
            STEP 3: CONFIGURATION REFERENCE
        ======================================================== */}
        <section className="space-y-6 mb-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-linear-to-tr from-[#06B6D4] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shadow-md">
              3
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              SDK Configuration Reference
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-400">
            All parameters accepted by the <code className="text-cyan-400 bg-[#0C1427] px-2 py-0.5 rounded border border-white/10">init(options)</code> call:
          </p>

          <div className="bg-[#0C1427]/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#060A16] border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">Property</th>
                    <th className="py-3 px-4 font-bold">Type</th>
                    <th className="py-3 px-4 font-bold">Default</th>
                    <th className="py-3 px-4 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">dsn</td>
                    <td className="py-3 px-4 font-mono text-purple-400">string</td>
                    <td className="py-3 px-4 font-mono text-rose-400 font-bold">Required</td>
                    <td className="py-3 px-4">Publishable ingestion key endpoint for your project.</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">environment</td>
                    <td className="py-3 px-4 font-mono text-purple-400">string</td>
                    <td className="py-3 px-4 font-mono text-slate-400">&apos;production&apos;</td>
                    <td className="py-3 px-4">Logical environment name (production, staging, development).</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">release</td>
                    <td className="py-3 px-4 font-mono text-purple-400">string</td>
                    <td className="py-3 px-4 font-mono text-slate-400">&apos;v1.0.0&apos;</td>
                    <td className="py-3 px-4">Semantic version or commit hash for release tracking and regression detection.</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">sampleRate</td>
                    <td className="py-3 px-4 font-mono text-purple-400">number</td>
                    <td className="py-3 px-4 font-mono text-slate-400">1.0</td>
                    <td className="py-3 px-4">Sampling rate between 0.0 (0%) and 1.0 (100%).</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">maxBreadcrumbs</td>
                    <td className="py-3 px-4 font-mono text-purple-400">number</td>
                    <td className="py-3 px-4 font-mono text-slate-400">50</td>
                    <td className="py-3 px-4">Maximum number of user interactions, logs, and network calls preserved.</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">beforeSend</td>
                    <td className="py-3 px-4 font-mono text-purple-400">function</td>
                    <td className="py-3 px-4 font-mono text-slate-400">null</td>
                    <td className="py-3 px-4">Callback to inspect or mutate the event, or return null to discard.</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">ignoreErrors</td>
                    <td className="py-3 px-4 font-mono text-purple-400">string[]</td>
                    <td className="py-3 px-4 font-mono text-slate-400">[]</td>
                    <td className="py-3 px-4">List of regex patterns or error names to ignore (e.g. <code className="text-slate-200">ResizeObserver</code>).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================
            STEP 4: VERIFICATION & TEST EVENT
        ======================================================== */}
        <section className="space-y-4 mb-14 bg-linear-to-r from-[#0C1427] via-[#101935] to-[#0C1427] border border-cyan-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Verify Your Integration with a Live Test Event
                </h3>
                <p className="text-xs text-slate-400">
                  Trigger a diagnostic error from your browser console or click the button below to confirm ingress:
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerTest}
              disabled={testingEvent}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white shadow-lg shadow-emerald-500/25 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${testingEvent ? 'animate-spin' : ''}`} />
              <span>{testingEvent ? 'Ingesting...' : 'Trigger Test Event'}</span>
            </button>
          </div>

          <div className="bg-[#060A16] p-3.5 rounded-xl font-mono text-xs text-emerald-400 border border-white/5 flex items-center justify-between overflow-x-auto">
            <span>captureException(new Error(&quot;ErrorPulse Diagnostic Test Exception&quot;));</span>
            <button
              onClick={() => copyText('captureException(new Error("ErrorPulse Diagnostic Test Exception"));', 'test-code')}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors ml-2"
              title="Copy snippet"
            >
              {copiedKey === 'test-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {testSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Test event ingested in &lt;1.4ms! Deduplicated and grouped under <strong>Acme Corp</strong>.</span>
              </div>
              <Link href="/org/acme-corp/issues" prefetch={true} className="font-bold underline text-white hover:text-emerald-200">
                View in Issues List →
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/org/acme-corp/overview"
              prefetch={true}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1.5"
            >
              <span>View live events in Acme Corp Overview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ========================================================
            NEED HELP CALLOUT (from PDF 1 page 2)
        ======================================================== */}
        <section className="bg-linear-to-b from-[#0C1427] to-[#050814] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Need help or advanced configuration?
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore the interactive onboarding wizard, review full docs, or check system health.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              prefetch={true}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-cyan-400/50 transition-colors"
            >
              Interactive Setup Wizard
            </Link>

            <Link
              href="/org/acme-corp/overview"
              prefetch={true}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-linear-to-r from-[#2563EB] to-[#8B5CF6] hover:opacity-90 text-white shadow-md shadow-[#8B5CF6]/20 transition-all"
            >
              Open Dashboard
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#050814] border-t border-white/10 py-8 px-6 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 ErrorPulse Technologies Inc. All rights reserved. Distributed under MIT License.</div>
          <div className="flex items-center gap-4">
            <Link href="/" prefetch={true} className="hover:text-slate-300">Home</Link>
            <span>•</span>
            <Link href="/docs" prefetch={true} className="hover:text-slate-300">Docs</Link>
            <span>•</span>
            <Link href="/org/acme-corp/system-status" prefetch={true} className="hover:text-slate-300">Status</Link>
            <span>•</span>
            <Link href="/org/acme-corp/overview" prefetch={true} className="hover:text-slate-300">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
