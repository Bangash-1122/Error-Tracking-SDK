'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ArrowRight,
  Lock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { api } from '@/lib/apiClient';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (!token) {
      setErrorMessage('Missing password reset token in URL');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed. Token may have expired.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0C1427]/90 rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 backdrop-blur-xl">
      {/* Logo & Headline */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#06B6D4] via-[#8B5CF6] to-[#F43F5E] p-[1.5px] shadow-md shadow-[#8B5CF6]/30">
          <div className="w-full h-full bg-[#080D1D] rounded-[10px] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <h2 className="font-extrabold text-lg text-white leading-tight">ErrorPulse Security</h2>
          <p className="text-xs text-slate-400 font-medium">Account Recovery Portal</p>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        Set new password
      </h1>
      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
        Choose a strong, secure password of at least 8 characters.
      </p>

      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {success ? (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Password Reset Successful!</span>
            </div>
            <p className="text-emerald-200/90 leading-relaxed">
              Your password has been securely updated. You can now log into your account.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-linear-to-r from-[#2563EB] via-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#8B5CF6]/30 transition-all mt-4"
          >
            <span>Sign In with New Password</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={loading}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#060A16] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={loading}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#060A16] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-linear-to-r from-[#2563EB] via-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#8B5CF6]/30 transition-all hover:scale-[1.01] cursor-pointer mt-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        Back to{' '}
        <Link href="/login" className="text-cyan-400 font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
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
    const pointCount = Math.min(45, Math.floor(width / 40));
    const points: Array<{ x: number; y: number; z: number; color: string; size: number }> = [];
    const radius = Math.min(width, height) * 0.45;

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
          y2d: y2 * scale + height * 0.4,
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

      {/* Top Simple Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">
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

        <Link
          href="/login"
          prefetch={true}
          className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 py-12">
        <Suspense fallback={<div className="text-white text-xs">Loading reset page...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-white/5">
        © 2026 ErrorPulse Technologies Inc. All rights reserved.
      </footer>
    </div>
  );
}
