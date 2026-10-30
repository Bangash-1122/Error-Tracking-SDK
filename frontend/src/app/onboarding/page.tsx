'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Layers,
  Laptop,
  Server,
  Code2,
  Activity,
  CheckCheck,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { org, activeProject, sendSimulatedEvent, showToast } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(3); // Default to Step 3 (SDK setup) per PDF 2, but allow browsing all 4
  const [projectName, setProjectName] = useState('Bangash Web App');
  const [platform, setPlatform] = useState('react');

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between selection:bg-[#8B5CF6] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* 3D Constellation Canvas */}
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

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050814]/80 border-b border-white/10 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" prefetch={true} className="flex items-center gap-3 group" title="Return to Homepage">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#06B6D4] via-[#8B5CF6] to-[#F43F5E] p-[1.5px] shadow-lg shadow-[#8B5CF6]/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#080D1D] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[#38BDF8] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
                ErrorPulse Onboarding Wizard
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-linear-to-r from-[#8B5CF6]/20 to-[#06B6D4]/20 text-[#A78BFA] border border-[#8B5CF6]/40 hidden sm:inline-block">
                Setup
              </span>
            </div>
          </Link>

          <Link
            href={`/org/${org.slug}/overview`}
            prefetch={true}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer"
          >
            <span>Skip to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>
      </header>

      {/* Main wizard container */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Step indicator (Matches PDF 2 perfectly) */}
        <div className="bg-[#0C1427]/90 rounded-3xl p-4 sm:p-5 border border-white/10 shadow-2xl backdrop-blur-xl flex items-center justify-between">
          {[
            { num: 1, title: 'Organization' },
            { num: 2, title: 'Project Details' },
            { num: 3, title: 'SDK Integration' },
            { num: 4, title: 'Verify Pipeline' },
          ].map((s, idx) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group text-left"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === s.num
                    ? 'bg-linear-to-r from-cyan-400 to-[#8B5CF6] text-white shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/50'
                    : currentStep > s.num
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/5 text-slate-500 border border-white/5'
                }`}
              >
                {currentStep > s.num ? <Check className="w-4 h-4 text-emerald-400" /> : s.num}
              </div>
              <span
                className={`text-xs font-semibold hidden md:inline transition-colors ${
                  currentStep === s.num
                    ? 'text-white font-bold'
                    : currentStep > s.num
                    ? 'text-emerald-300'
                    : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {s.title}
              </span>
              {idx < 3 && <ChevronRight className="w-4 h-4 text-slate-600 ml-2 hidden sm:inline" />}
            </button>
          ))}
        </div>

        {/* STEP 1: ORGANIZATION */}
        {currentStep === 1 && (
          <div className="bg-[#0C1427]/90 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl space-y-5 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold mb-2">
                STEP 1 OF 4
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Building className="w-5 h-5 text-cyan-400" />
                Confirm Your Organization
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your high-concurrency event ingestion workspace and multi-tenant billing boundary.
              </p>
            </div>

            <div className="p-5 bg-[#060A16] rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">Workspace Tenant</span>
                  <p className="text-base font-bold text-white mt-0.5">{org.name}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#8B5CF6]/20 text-purple-300 border border-[#8B5CF6]/40 uppercase">
                  {org.plan} Tier
                </span>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Slug: <strong className="text-cyan-400">{org.slug}</strong></span>
                <span>Ingest Quota: <strong className="text-emerald-400">100,000 evt/mo</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#2563EB] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold transition-all shadow-lg shadow-[#8B5CF6]/30 cursor-pointer"
              >
                <span>Continue to Project Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROJECT DETAILS */}
        {currentStep === 2 && (
          <div className="bg-[#0C1427]/90 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold mb-2">
                STEP 2 OF 4
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-purple-400" />
                Configure Target Application
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Name your application project and select its runtime ecosystem to generate tailored initialization snippets.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Bangash Web App"
                  className="w-full px-4 py-3 text-xs bg-[#060A16] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-cyan-400 font-mono shadow-inner transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Target Framework Platform
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'react', name: 'React / Next.js', icon: Layers, tag: 'Frontend' },
                    { id: 'javascript', name: 'Browser JS', icon: Laptop, tag: 'Universal' },
                    { id: 'node', name: 'Node.js Express', icon: Server, tag: 'Backend' },
                    { id: 'python', name: 'Python Service', icon: Code2, tag: 'Data / API' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                        platform === p.id
                          ? 'bg-linear-to-b from-[#101F3D] to-[#0A1428] border-cyan-400 shadow-lg shadow-cyan-500/10'
                          : 'bg-[#060A16] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <p.icon className={`w-5 h-5 mb-2 ${platform === p.id ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.tag}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Back
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#2563EB] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold transition-all shadow-lg shadow-[#8B5CF6]/30 cursor-pointer"
              >
                <span>Issue Ingest Key & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SDK INTEGRATION (Matches PDF 2) */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SdkSetupPanel />

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Project Details
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <span>Proceed to Pipeline Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFY PIPELINE */}
        {currentStep === 4 && (
          <div className="bg-[#0C1427]/90 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold mb-2">
                STEP 4 OF 4 • FINAL
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Ingestion Pipeline Active & Verified
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your SDK telemetry connection is live. Events sent to <code className="text-cyan-300">{activeProject.name}</code> are parsed with deterministic SHA-256 fingerprinting.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#060A16] p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-mono uppercase text-slate-400">Gateway Status</span>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Operational
                </div>
              </div>
              <div className="bg-[#060A16] p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-mono uppercase text-slate-400">Ingest Latency</span>
                <div className="text-sm font-bold text-cyan-400 mt-1">&lt; 1.4ms (p95)</div>
              </div>
              <div className="bg-[#060A16] p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-mono uppercase text-slate-400">Cache Layer</span>
                <div className="text-sm font-bold text-purple-400 mt-1">LRU Active (5K)</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
              <CheckCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Full-Stack Setup Complete!</p>
                <p className="text-emerald-300/90 mt-0.5">
                  You are ready to triage crashes, monitor APM transactions, and set up alert rules in your dashboard.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => router.push(`/org/${org.slug}/overview`)}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-linear-to-r from-[#2563EB] via-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white text-xs font-bold transition-all shadow-xl shadow-[#8B5CF6]/30 hover:scale-105 cursor-pointer"
              >
                <span>Launch Acme Corp Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Banner (Matches PDF 2) */}
        <div className="bg-[#0C1427]/80 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ready to explore?
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Launch the live dashboard to review real-time issue graphs, stack traces, and alerts.
            </p>
          </div>

          <button
            onClick={() => router.push(`/org/${org.slug}/overview`)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#2563EB] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold transition-all shadow-md shadow-[#2563EB]/20 cursor-pointer shrink-0"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#050814] border-t border-white/10 py-8 px-6 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 ErrorPulse Technologies Inc. All rights reserved. Distributed under MIT License.</div>
          <div className="flex items-center gap-4">
            <Link href="/" prefetch={true} className="hover:text-slate-300">Home</Link>
            <span>•</span>
            <Link href="/installation" prefetch={true} className="hover:text-slate-300">Installation</Link>
            <span>•</span>
            <Link href="/docs" prefetch={true} className="hover:text-slate-300">Docs</Link>
            <span>•</span>
            <Link href={`/org/${org.slug}/overview`} prefetch={true} className="hover:text-slate-300">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
