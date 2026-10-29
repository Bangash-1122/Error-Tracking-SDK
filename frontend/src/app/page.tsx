'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import {
  ShieldAlert,
  ArrowRight,
  Zap,
  CheckCircle2,
  Lock,
  Activity,
  Sparkles,
  Terminal,
  Copy,
  Check,
  Code2,
  Layers,
  Cpu,
  BarChart3,
  GitBranch,
  BellRing,
  Workflow,
  ExternalLink,
  ChevronRight,
  Server,
  FileCode,
  ShieldCheck,
  Clock,
  Flame,
  Search,
  Laptop,
  Play,
  RotateCw,
  Eye,
  Radio,
  Sliders,
  Globe2,
  Database,
  ArrowUpRight,
  AlertOctagon,
  HelpCircle,
} from 'lucide-react';

interface SimulatedException {
  name: string;
  message: string;
  source: string;
  type: 'TypeError' | 'NetworkError' | 'DatabaseError';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

const SAMPLE_ERRORS: Record<string, SimulatedException> = {
  type: {
    name: 'TypeError',
    message: "Cannot read properties of undefined (reading 'customer_id')",
    source: 'checkout/payment-flow.tsx:142:19',
    type: 'TypeError',
    severity: 'CRITICAL',
  },
  db: {
    name: 'PostgresTimeoutError',
    message: 'Connection pool exhausted while acquiring transaction lock',
    source: 'db/pool-manager.ts:89:12',
    type: 'DatabaseError',
    severity: 'HIGH',
  },
  fetch: {
    name: 'ChunkLoadError',
    message: 'Failed to fetch dynamic module from CDN edge node',
    source: 'chunks/app-router.js:21:4',
    type: 'NetworkError',
    severity: 'MEDIUM',
  },
};

export default function HomePage() {
  const [selectedPkg, setSelectedPkg] = useState<'pnpm' | 'npm' | 'yarn' | 'bun' | 'cdn'>('pnpm');
  const [copiedPkg, setCopiedPkg] = useState(false);
  const [selectedSimError, setSelectedSimError] = useState<'type' | 'db' | 'fetch'>('type');
  const [simulatedStatus, setSimulatedStatus] = useState<'idle' | 'ingesting' | 'captured'>('idle');
  const [activeTabCode, setActiveTabCode] = useState<'sdk' | 'payload' | 'fingerprint'>('sdk');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const installCommands = {
    pnpm: 'pnpm add @error-tracker/browser',
    npm: 'npm install @error-tracker/browser',
    yarn: 'yarn add @error-tracker/browser',
    bun: 'bun add @error-tracker/browser',
    cdn: '<script src="https://cdn.errorpulse.dev/v2/sdk.min.js" data-dsn="https://ep_live_..."></script>',
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(installCommands[selectedPkg]);
    setCopiedPkg(true);
    setTimeout(() => setCopiedPkg(false), 2000);
  };

  // ========================================================
  // ULTRA-FAST 3D TELEMETRY SPHERE / CONSTELLATION CANVAS
  // Lightweight 3D projection without CPU/GPU bottlenecks
  // ========================================================
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

    // Multi-color palette for telemetry nodes
    const nodeColors = ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#F43F5E', '#38BDF8'];

    // Generate 3D sphere points
    const pointCount = Math.min(65, Math.max(35, Math.floor(width / 35)));
    const points: Array<{
      x: number;
      y: number;
      z: number;
      color: string;
      size: number;
    }> = [];

    const radius = Math.min(width, height) * 0.42;

    for (let i = 0; i < pointCount; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        color: nodeColors[i % nodeColors.length],
        size: Math.random() * 2 + 1.2,
      });
    }

    let rotX = 0;
    let rotY = 0;
    let mouseTargetX = 0;
    let mouseTargetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseTargetX = (e.clientX - width / 2) * 0.0003;
      mouseTargetY = (e.clientY - height / 2) * 0.0003;
    };
    window.addEventListener('mousemove', onMouseMove);

    const fov = 400;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotX += 0.002 + mouseTargetY * 0.05;
      rotY += 0.003 + mouseTargetX * 0.05;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const projected = points.map((p) => {
        // Rotate around Y
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate around X
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Project
        const scale = fov / (fov + z2 + radius * 1.2);
        const x2d = x1 * scale + width / 2;
        const y2d = y2 * scale + height * 0.38;

        return { x2d, y2d, scale, z: z2, color: p.color, size: p.size * scale };
      });

      // Draw subtle connecting lines between close points
      ctx.lineWidth = 0.7;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x2d - p2.x2d;
          const dy = p1.y2d - p2.y2d;
          const dist = dx * dx + dy * dy;

          if (dist < 7500) {
            const alpha = (1 - Math.sqrt(dist) / 86) * 0.22 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x2d, p1.y2d);
            ctx.lineTo(p2.x2d, p2.y2d);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
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
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // GSAP Entrance Animations
  const handleGsapReady = () => {
    if (typeof window === 'undefined') return;
    const gsap = (window as unknown as { gsap?: { from: (...args: unknown[]) => void } }).gsap;
    if (!gsap) return;

    try {
      gsap.from('.gsap-hero-title', {
        duration: 0.85,
        y: 28,
        opacity: 0,
        ease: 'power3.out',
      });
      gsap.from('.gsap-hero-sub', {
        duration: 0.8,
        y: 20,
        opacity: 0,
        delay: 0.12,
        ease: 'power3.out',
      });
      gsap.from('.gsap-cli-bar', {
        duration: 0.75,
        scale: 0.96,
        opacity: 0,
        delay: 0.22,
        ease: 'back.out(1.4)',
      });
      gsap.from('.gsap-card', {
        duration: 0.65,
        y: 20,
        opacity: 0,
        stagger: 0.05,
        delay: 0.3,
        ease: 'power2.out',
      });
    } catch {
      // ignore
    }
  };

  const handleSimulateInPage = () => {
    setSimulatedStatus('ingesting');
    setTimeout(() => {
      setSimulatedStatus('captured');
    }, 450);
  };

  const currentErr = SAMPLE_ERRORS[selectedSimError];

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between selection:bg-[#8B5CF6] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* GSAP CDN Loader with fast non-blocking execution */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
        strategy="afterInteractive"
        onLoad={handleGsapReady}
      />

      {/* Interactive 3D Wireframe Constellation Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-65"
      />

      {/* ========================================================
          MULTI-COLOR AURORA GLOW MESH
          Vibrant gradients across the viewport
      ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Cyan/Blue Aurora */}
        <div className="absolute -top-40 left-1/4 w-[750px] h-[500px] bg-gradient-to-br from-[#06B6D4]/25 via-[#2563EB]/20 to-transparent blur-[120px] rounded-full animate-aurora opacity-75" />
        
        {/* Violet / Purple Luminous Core */}
        <div className="absolute top-20 right-10 w-[650px] h-[550px] bg-gradient-to-bl from-[#8B5CF6]/30 via-[#A855F7]/15 to-transparent blur-[140px] rounded-full opacity-80" />
        
        {/* Mid-page Emerald Aurora */}
        <div className="absolute top-[650px] -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-[#10B981]/20 via-[#06B6D4]/15 to-transparent blur-[130px] rounded-full opacity-70" />
        
        {/* Amber / Rose Sunset Core */}
        <div className="absolute top-[1100px] right-0 w-[600px] h-[600px] bg-gradient-to-l from-[#F43F5E]/18 via-[#F59E0B]/15 to-transparent blur-[140px] rounded-full opacity-70" />
      </div>

      {/* ========================================================
          TOP NAVBAR (Instant Prefetched Navigation)
      ======================================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050814]/80 border-b border-white/10 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" prefetch={true} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06B6D4] via-[#8B5CF6] to-[#F43F5E] p-[1.5px] shadow-lg shadow-[#8B5CF6]/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#080D1D] rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#38BDF8] group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
                  ErrorPulse
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#06B6D4]/20 text-[#A78BFA] border border-[#8B5CF6]/40">
                  APM 2.0
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
              <Link href="/installation" prefetch={true} className="hover:text-white transition-colors flex items-center gap-1.5 text-cyan-300">
                <FileCode className="w-3.5 h-3.5" />
                Installation Guide
              </Link>
              <Link href="/installation" prefetch={true} className="hover:text-white transition-colors">
                Documentation
              </Link>
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#simulator" className="hover:text-white transition-colors flex items-center gap-1 text-emerald-400">
                <Zap className="w-3 h-3" />
                Live Ingestion Demo
              </a>
              <Link href="/org/acme-corp/system-status" prefetch={true} className="hover:text-white transition-colors flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                System Status
              </Link>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              prefetch={true}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>

            <Link
              href="/installation"
              prefetch={true}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all hover:border-cyan-400/50"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>SDK Quickstart</span>
            </Link>

            <Link
              href="/org/acme-corp/overview"
              prefetch={true}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#06B6D4] hover:opacity-90 text-white shadow-lg shadow-[#8B5CF6]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {/* ========================================================
            HERO SECTION (High Aesthetic, Vibrant, Modern)
        ======================================================== */}
        <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0D152C]/90 border border-[#8B5CF6]/40 text-[#C4B5FD] text-xs font-semibold mb-8 shadow-xl shadow-[#8B5CF6]/15 backdrop-blur-md animate-float-slow">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-300 to-rose-400 bg-clip-text text-transparent font-bold">
              ErrorPulse 2.0 Released
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Zustand v5, TanStack Query & LRU Caching</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
          </div>

          {/* Hero Headline with Vibrant Multi-Color Gradients */}
          <h1 className="gsap-hero-title text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.08] mb-6">
            <span className="text-white">Commercial Error Monitoring & </span>
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#06B6D4] via-[#A855F7] to-[#F43F5E] bg-clip-text text-transparent">
              High-Velocity APM SaaS
            </span>
          </h1>

          {/* Subtitle */}
          <p className="gsap-hero-sub text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-10">
            Real-time exception tracking, deterministic SHA-256 fingerprint deduplication, and sub-millisecond cached telemetry across browser, mobile, and server workloads.
          </p>

          {/* Copyable CLI Command Widget with Multi-Package Switcher */}
          <div className="gsap-cli-bar w-full max-w-lg bg-[#0C1427]/90 border border-white/10 hover:border-[#8B5CF6]/60 rounded-2xl p-3 shadow-2xl backdrop-blur-xl mb-9 transition-colors">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10 px-2 text-xs">
              <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Package Manager
              </span>
              <div className="flex items-center gap-1">
                {(['pnpm', 'npm', 'yarn', 'bun', 'cdn'] as const).map((pkg) => (
                  <button
                    key={pkg}
                    onClick={() => setSelectedPkg(pkg)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      selectedPkg === pkg
                        ? 'bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {pkg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#060A16] px-3.5 py-2.5 rounded-xl font-mono text-xs text-slate-200 border border-white/5">
              <span className="truncate select-all text-slate-100 font-medium">
                <span className="text-cyan-400">$</span> {installCommands[selectedPkg]}
              </span>
              <button
                onClick={copyCommand}
                className="ml-3 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy installation command"
              >
                {copiedPkg ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/org/acme-corp/overview"
              prefetch={true}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#06B6D4] text-white shadow-xl shadow-[#8B5CF6]/30 hover:opacity-95 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/installation"
              prefetch={true}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Installation & Configuration Guide</span>
            </Link>
          </div>
        </section>

        {/* ========================================================
            LIVE TELEMETRY TICKER (Dynamic Real-Time Stream)
        ======================================================== */}
        <section className="py-6 px-6 max-w-7xl mx-auto overflow-hidden">
          <div className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-[#091122]/70 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-white/10">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Live Ingest Stream
              </span>
            </div>
            
            <div className="flex items-center gap-6 overflow-x-auto text-xs font-mono no-scrollbar py-1 text-slate-300">
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                  CRITICAL
                </span>
                <span>TypeError: Cannot read properties of undefined</span>
                <span className="text-slate-500 text-[11px]">&lt;1.2ms</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                  REGRESSION
                </span>
                <span>PostgresConnectionTimeout: Pool exhausted</span>
                <span className="text-slate-500 text-[11px]">&lt;2.1ms</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  RESOLVED
                </span>
                <span>ChunkLoadError: Failed to fetch module</span>
                <span className="text-slate-500 text-[11px]">&lt;0.8ms</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] font-bold">
                  APM
                </span>
                <span>Transaction &apos;GET /api/issues&apos; p95 18ms</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            INTERACTIVE SDK SIMULATOR (Live In-Page Pipeline)
        ======================================================== */}
        <section id="simulator" className="py-14 px-6 max-w-5xl mx-auto">
          <div className="bg-[#0C1427]/80 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Interactive SDK Ingestion & Normalizer Simulator
                </h3>
                <p className="text-xs text-slate-400">
                  Select an exception type and trigger live normalization, SHA-256 fingerprinting, and grouping.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSimError}
                  onChange={(e) => setSelectedSimError(e.target.value as 'type' | 'db' | 'fetch')}
                  className="bg-[#060A16] border border-white/10 text-xs font-mono text-slate-200 px-3 py-1.5 rounded-xl outline-none"
                >
                  <option value="type">TypeError (Null Reference)</option>
                  <option value="db">PostgresTimeout (Pool Lock)</option>
                  <option value="fetch">ChunkLoadError (CDN Edge)</option>
                </select>

                <button
                  onClick={handleSimulateInPage}
                  disabled={simulatedStatus === 'ingesting'}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white shadow-lg shadow-rose-500/25 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${simulatedStatus === 'ingesting' ? 'animate-spin' : ''}`} />
                  <span>{simulatedStatus === 'ingesting' ? 'Ingesting...' : 'Trigger Exception'}</span>
                </button>
              </div>
            </div>

            {/* Code / Event tabs */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setActiveTabCode('sdk')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTabCode === 'sdk' ? 'bg-[#8B5CF6] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Client Code
                </button>
                <button
                  onClick={() => setActiveTabCode('payload')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTabCode === 'payload' ? 'bg-[#8B5CF6] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Normalized Ingest Payload
                </button>
                <button
                  onClick={() => setActiveTabCode('fingerprint')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTabCode === 'fingerprint' ? 'bg-[#8B5CF6] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Deterministic Fingerprint Result
                </button>
              </div>

              {/* Code viewer window */}
              <div className="bg-[#060A16] rounded-xl p-4 border border-white/5 font-mono text-xs overflow-x-auto text-slate-300">
                {activeTabCode === 'sdk' && (
                  <pre><code>{`// Client-side instrumentation
import { init, captureException } from '@error-tracker/browser';

init({
  dsn: 'https://ep_live_9f81a7b8e2194@ingest.errorpulse.dev/1',
  environment: 'production',
  release: 'checkout-v2.14.0',
});

try {
  // Simulating: ${currentErr.name}
  throw new ${currentErr.name}("${currentErr.message}");
} catch (err) {
  captureException(err, {
    tags: { section: 'checkout', tier: 'enterprise' },
    level: '${currentErr.severity.toLowerCase()}'
  });
}`}</code></pre>
                )}

                {activeTabCode === 'payload' && (
                  <pre><code>{`{
  "eventId": "evt_${Math.random().toString(36).substring(2, 10)}",
  "timestamp": "${new Date().toISOString()}",
  "type": "${currentErr.name}",
  "message": "${currentErr.message}",
  "level": "${currentErr.severity.toLowerCase()}",
  "culprit": "${currentErr.source}",
  "stacktrace": [
    { "filename": "${currentErr.source}", "function": "executeTransaction", "in_app": true }
  ],
  "context": {
    "runtime": "V8 12.4.254",
    "os": "Linux x86_64",
    "browser": "Chrome 128.0"
  }
}`}</code></pre>
                )}

                {activeTabCode === 'fingerprint' && (
                  <pre><code>{`{
  "fingerprint": "fp_${currentErr.type === 'TypeError' ? '9e4a77bc' : currentErr.type === 'DatabaseError' ? '3b18fa90' : '71c8de12'}",
  "groupedIssueTitle": "${currentErr.name}: ${currentErr.message}",
  "firstSeen": "2026-10-29T16:40:00.000Z",
  "lastSeen": "${new Date().toISOString()}",
  "eventCount": ${simulatedStatus === 'captured' ? 142 : 141},
  "algorithm": "sha256(error.name + in_app_frames + top_fn)",
  "deduplication": "Auto-grouped under active issue #14"
}`}</code></pre>
                )}
              </div>

              {simulatedStatus === 'captured' && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Exception ingested in 1.2ms! Deduplicated and grouped under <strong>Acme Corp</strong> project.</span>
                  </div>
                  <Link href="/org/acme-corp/issues" prefetch={true} className="font-bold underline text-white hover:text-emerald-200">
                    View in Issues List →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================
            FEATURE GRID (VIBRANT MULTI-COLOR ACCENTS)
        ======================================================== */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
          <div className="mb-14 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Everything you need to observe <br />
              and heal modern software stacks
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Complete exception capture, deterministic fingerprinting, real-time telemetry, and enterprise controls built strictly to architectural blueprints.
            </p>
          </div>

          {/* 3x3 Grid of Feature Cards with Distinctive Vibrant Color Themes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Cyan / Sky Blue */}
            <div className="gsap-card bg-gradient-to-b from-[#0C152B]/90 to-[#070D1C]/90 border border-cyan-500/20 hover:border-cyan-400 p-6 rounded-2xl transition-all hover:shadow-2xl hover:shadow-cyan-500/10 group backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                Intelligent Deduplication →
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Algorithmic SHA-256 fingerprinting clusters thousands of duplicate events into actionable issues using normalized in-app frames and top function signatures.
              </p>
            </div>

            {/* Card 2: Emerald / Mint */}
            <div className="gsap-card bg-gradient-to-b from-[#0B1A24]/90 to-[#061118]/90 border border-emerald-500/20 hover:border-emerald-400 p-6 rounded-2xl transition-all hover:shadow-2xl hover:shadow-emerald-500/10 group backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
                Dynamic Stack Trace Analysis →
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically parses V8 and JSCore frames, separates proprietary application code from third-party vendor noise, and displays expandable source context lines.
              </p>
            </div>

            {/* Card 3: Cyber Violet / Purple */}
            <div className="gsap-card bg-gradient-to-b from-[#15102D]/90 to-[#0D091D]/90 border border-purple-500/20 hover:border-purple-400 p-6 rounded-2xl transition-all hover:shadow-2xl hover:shadow-purple-500/10 group backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5 group-hover:text-purple-300 transition-colors">
                Real-Time Breadcrumb Trails →
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Chronological timeline of user clicks, console logs, route navigation changes, and network fetch/XHR requests leading up to the exact moment of failure.
              </p>
            </div>

            {/* Card 4: Sunset Amber / Gold */}
            <div className="gsap-card bg-gradient-to-b from-[#1C150A]/90 to-[#120D05]/90 border border-amber-500/20 hover:border-amber-400 p-6 rounded-2xl transition-all hover:shadow-2xl hover:shadow-amber-500/10 group backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                Automated Alerts & Webhooks →
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Threshold spike detection, regression alerts, and multi-channel webhook dispatching to Slack, Discord, and Email with configurable quiet hours.
              </p>
            </div>

            {/* Card 5: Hot Rose / Crimson */}
            <div className="gsap-card bg-gradient-to-b from-[#1D0C15]/90 to-[#13070D]/90 border border-rose-500/20 hover:border-rose-400 p-6 rounded-2xl transition-all hover:shadow-2xl hover:shadow-rose-500/10 group backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5 group-hover:text-rose-300 transition-colors">
                Token-Bucket Rate Limiting →
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Robust ingress protection that prevents runaway client-side loops and DDoS spikes from depleting monthly organization event quotas.
              </p>
            </div>

            {/* Card 6: Cosmic Indigo */}
            <div className="gsap-card bg-gradient-to-b from-[#10142C]/90 to-[#0A0D1D]/90 border border-indigo-500/20 hover:border-indigo-400 p-6 rounded-2xl transition-all hover:shadow-2xl hover:shadow-indigo-500/10 group backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5 group-hover:text-indigo-300 transition-colors">
                In-Memory LRU Caching Engine →
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                5,000 capacity LRU cache with background TTL sweeps, tag-based tenant invalidations, and live administrator diagnostics.
              </p>
            </div>

            {/* Card 7: Neon Teal */}
            <div className="gsap-card bg-gradient-to-b from-[#091A1E]/90 to-[#051114]/90 border border-teal-500/20 hover:border-teal-400 p-6 rounded-2xl transition-all hover:shadow-2xl hover:shadow-teal-500/10 group backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5 group-hover:text-teal-300 transition-colors">
                APM & Performance Telemetry →
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track transaction durations, p50/p95/p99 latency percentiles, slow database queries, and network bottlenecks with customizable sampling rates.
              </p>
            </div>

            {/* Card 8: Fuchsia / Magenta */}
            <div className="gsap-card bg-gradient-to-b from-[#1A0B22]/90 to-[#100615]/90 border border-fuchsia-500/20 hover:border-fuchsia-400 p-6 rounded-2xl transition-all hover:shadow-2xl hover:shadow-fuchsia-500/10 group backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 mb-4 group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5 group-hover:text-fuchsia-300 transition-colors">
                PII Privacy & Data Scrubbing →
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client-side and gateway regex scrubbing for passwords, auth tokens, session cookies, and credit cards with complete PII anonymization.
              </p>
            </div>

            {/* Card 9: Prismatic Gradient Highlight */}
            <div className="gsap-card bg-gradient-to-tr from-[#8B5CF6] via-[#EC4899] to-[#F59E0B] p-6 rounded-2xl text-white shadow-2xl flex flex-col justify-between group hover:scale-[1.02] transition-all">
              <div>
                <div className="inline-block px-2.5 py-1 rounded-md bg-white/20 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
                  Full-Stack Architecture
                </div>
                <h3 className="text-xl font-extrabold mb-2">
                  Full Observability from SDK to Database →
                </h3>
                <p className="text-xs text-white/95 leading-relaxed">
                  Engineered with Next.js 16 App Router, Zustand v5 modular state, TanStack Query v5, and 10 interactive enterprise settings sections.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold underline underline-offset-4">
                <Link href="/installation" prefetch={true} className="flex items-center gap-1.5">
                  <span>Explore the 10 Settings Sections</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            TOOLING & INFRASTRUCTURE SECTION
        ======================================================== */}
        <section id="tooling" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
          <div className="mb-14 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Built on a foundation of fast, production-grade tooling
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Modern engineering choices guaranteeing zero render bottlenecks, type-safe execution, and ultra-low latency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#0C1427]/60 border border-cyan-500/20 hover:border-cyan-400/50 p-5 rounded-2xl transition-colors">
              <div className="text-xs font-bold font-mono text-cyan-400 mb-2">01 / Next.js 16 & React 19</div>
              <h4 className="text-sm font-bold text-white mb-1">Server Components & Turbopack</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lightning-fast builds in under 22 seconds with static partial prerendering across all 52 dashboard and API routes.
              </p>
            </div>

            <div className="bg-[#0C1427]/60 border border-emerald-500/20 hover:border-emerald-400/50 p-5 rounded-2xl transition-colors">
              <div className="text-xs font-bold font-mono text-emerald-400 mb-2">02 / Zustand v5</div>
              <h4 className="text-sm font-bold text-white mb-1">Modular Client State</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fine-grained state selectors for UI modals, active filters, and session auth that prevent heavy table and chart re-renders.
              </p>
            </div>

            <div className="bg-[#0C1427]/60 border border-amber-500/20 hover:border-amber-400/50 p-5 rounded-2xl transition-colors">
              <div className="text-xs font-bold font-mono text-amber-400 mb-2">03 / TanStack Query v5</div>
              <h4 className="text-sm font-bold text-white mb-1">Server Cache & Invalidation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hierarchical query keys, automatic mutation invalidations, deduplication, and strict multi-tenant cache isolation.
              </p>
            </div>

            <div className="bg-[#0C1427]/60 border border-purple-500/20 hover:border-purple-400/50 p-5 rounded-2xl transition-colors">
              <div className="text-xs font-bold font-mono text-purple-400 mb-2">04 / Strict TypeScript 5.x</div>
              <h4 className="text-sm font-bold text-white mb-1">100% Type-Safe Contracts</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero explicit any types, safe error narrowing, strict null checks, and end-to-end API response interfaces.
              </p>
            </div>

            <div className="bg-[#0C1427]/60 border border-sky-500/20 hover:border-sky-400/50 p-5 rounded-2xl transition-colors">
              <div className="text-xs font-bold font-mono text-sky-400 mb-2">05 / PostgreSQL & Drizzle ORM</div>
              <h4 className="text-sm font-bold text-white mb-1">ACID Relational Storage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-performance cursor-based pagination with deterministic UUID tie-breaking and timestamp regression protection.
              </p>
            </div>

            <div className="bg-[#0C1427]/60 border border-rose-500/20 hover:border-rose-400/50 p-5 rounded-2xl transition-colors">
              <div className="text-xs font-bold font-mono text-rose-400 mb-2">06 / In-Memory LRU Engine</div>
              <h4 className="text-sm font-bold text-white mb-1">Sub-Millisecond Queries</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                5,000 capacity LRU cache with background TTL sweeps, tag-based invalidations, and live administrator diagnostics.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            SOCIAL PROOF & PLATFORM METRICS
        ======================================================== */}
        <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-16">
            <div className="bg-[#0C1427]/60 border border-cyan-500/30 p-6 rounded-2xl">
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">500M+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Exceptions Ingested</div>
            </div>
            <div className="bg-[#0C1427]/60 border border-emerald-500/30 p-6 rounded-2xl">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">&lt; 1.5ms</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Ingestion Latency</div>
            </div>
            <div className="bg-[#0C1427]/60 border border-amber-500/30 p-6 rounded-2xl">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">99.99%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Platform Uptime</div>
            </div>
            <div className="bg-[#0C1427]/60 border border-purple-500/30 p-6 rounded-2xl">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 font-mono">85%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Faster MTTR</div>
            </div>
          </div>

          {/* Testimonial Quote Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0C1427]/70 border border-white/10 p-6 rounded-2xl">
              <p className="text-sm text-slate-200 italic leading-relaxed mb-4">
                &ldquo;ErrorPulse detected our checkout regression before our customer support queue even noticed. The breadcrumb timeline and grouped stack traces made identifying the root cause instantaneous.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center font-bold text-xs text-white">
                  JL
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Jonathan Lemon</div>
                  <div className="text-[10px] text-slate-400">Software Engineering Manager, E-Commerce</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0C1427]/70 border border-white/10 p-6 rounded-2xl">
              <p className="text-sm text-slate-200 italic leading-relaxed mb-4">
                &ldquo;With ErrorPulse, our engineering team consistently maintains a 99.8% crash-free session rate. The SDK took less than 2 minutes to drop into our Next.js App Router setup.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#12A89D] flex items-center justify-center font-bold text-xs text-white">
                  AS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Amira Saedi</div>
                  <div className="text-[10px] text-slate-400">Principal Frontend Architect</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            CALL TO ACTION
        ======================================================== */}
        <section className="py-20 px-6 max-w-5xl mx-auto text-center border-t border-white/10">
          <div className="bg-gradient-to-b from-[#0C1427] to-[#050814] border border-white/15 p-10 sm:p-14 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#06B6D4]/20 via-[#8B5CF6]/20 to-transparent blur-3xl rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Ready to eliminate silent crashes?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
              Start tracking client and server errors today with full stack traces, rate limiting, and automated alerts.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/installation"
                prefetch={true}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-xl shadow-[#8B5CF6]/30 transition-all hover:scale-105 cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
                <span>Read Installation Docs</span>
              </Link>

              <Link
                href="/org/acme-corp/overview"
                prefetch={true}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all hover:border-cyan-400/50 cursor-pointer"
              >
                <span>Open Acme Corp Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Comprehensive Footer */}
      <footer className="bg-[#050814] border-t border-white/10 py-12 px-6 text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1 */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#06B6D4] via-[#8B5CF6] to-[#F43F5E] flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">ErrorPulse</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Enterprise Error Tracking & APM Monitoring Platform. Built with Next.js 16, Zustand v5, and TanStack Query.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Product</h5>
            <ul className="space-y-2">
              <li><Link href="/org/acme-corp/overview" prefetch={true} className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link href="/org/acme-corp/issues" prefetch={true} className="hover:text-white transition-colors">Issues List</Link></li>
              <li><Link href="/org/acme-corp/performance" prefetch={true} className="hover:text-white transition-colors">APM Performance</Link></li>
              <li><Link href="/org/acme-corp/releases" prefetch={true} className="hover:text-white transition-colors">Releases</Link></li>
              <li><Link href="/org/acme-corp/alerts" prefetch={true} className="hover:text-white transition-colors">Alert Rules</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Documentation</h5>
            <ul className="space-y-2">
              <li><Link href="/installation" prefetch={true} className="hover:text-white transition-colors">Quick Start</Link></li>
              <li><Link href="/installation" prefetch={true} className="hover:text-white transition-colors">Package Managers</Link></li>
              <li><Link href="/installation" prefetch={true} className="hover:text-white transition-colors">Configuration Options</Link></li>
              <li><Link href="/onboarding" prefetch={true} className="hover:text-white transition-colors">Interactive Wizard</Link></li>
              <li><Link href="/org/acme-corp/sdk-health" prefetch={true} className="hover:text-white transition-colors">SDK Diagnostics</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Platform</h5>
            <ul className="space-y-2">
              <li><Link href="/org/acme-corp/projects" prefetch={true} className="hover:text-white transition-colors">Advanced Settings</Link></li>
              <li><Link href="/org/acme-corp/settings" prefetch={true} className="hover:text-white transition-colors">Team & RBAC</Link></li>
              <li><Link href="/org/acme-corp/billing" prefetch={true} className="hover:text-white transition-colors">Quotas & Billing</Link></li>
              <li><Link href="/org/acme-corp/activity" prefetch={true} className="hover:text-white transition-colors">Security Audit Log</Link></li>
              <li><Link href="/org/acme-corp/system-status" prefetch={true} className="hover:text-white transition-colors">System Status</Link></li>
            </ul>
          </div>

          {/* Col 5 */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Account</h5>
            <ul className="space-y-2">
              <li><Link href="/login" prefetch={true} className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/signup" prefetch={true} className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/forgot-password" prefetch={true} className="hover:text-white transition-colors">Reset Password</Link></li>
              <li><a href="https://github.com/Bangash-1122/Error-Tracking-SDK" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">GitHub <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© 2026 ErrorPulse Technologies Inc. All rights reserved. Distributed under MIT License.</div>
          <div className="flex items-center gap-4">
            <Link href="/org/acme-corp/system-status" prefetch={true} className="hover:text-slate-400">Operational</Link>
            <span>•</span>
            <Link href="/installation" prefetch={true} className="hover:text-slate-400">Privacy & Scrubbing</Link>
            <span>•</span>
            <Link href="/installation" prefetch={true} className="hover:text-slate-400">Security Guidelines</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
