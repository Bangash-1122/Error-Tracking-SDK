'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, Lock, Mail, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@acme.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.login({ email: loginEmail, password: loginPass });
      if (res.success) {
        const orgSlug = res.defaultOrgSlug || 'acme-corp';
        router.push(`/org/${orgSlug}/overview`);
      } else {
        setErrorMessage(res.error || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleDemoSignIn = () => {
    setEmail('admin@acme.com');
    setPassword('password123');
    performLogin('admin@acme.com', 'password123');
  };

  return (
    <div className="min-h-screen bg-[#10203C] flex items-center justify-center p-6 selection:bg-[#2563EB] selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#12A89D] flex items-center justify-center shadow-md">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-slate-900 leading-tight">ErrorPulse</h2>
            <p className="text-xs text-slate-500 font-medium">Commercial Error Monitoring</p>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor exceptions, triage stack traces, and manage team alerts.
        </p>

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Demo Account Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleDemoSignIn}
          className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 text-blue-900 font-bold text-xs hover:bg-blue-100 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-[#2563EB]" />
          <span>Quick 1-Click Demo Login (Admin User)</span>
        </button>

        <div className="relative my-6 text-center text-xs text-slate-400 before:absolute before:left-0 before:top-1/2 before:w-full before:h-px before:bg-slate-200">
          <span className="bg-white px-3 relative z-10 font-semibold uppercase tracking-wider text-[10px]">
            Or with credentials
          </span>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Link href="/forgot-password" className="text-[11px] text-[#2563EB] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition-all text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-lg shadow-[#2563EB]/30 transition-all hover:scale-[1.01] cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#2563EB] font-bold hover:underline">
            Create an organization
          </Link>
        </p>
      </div>
    </div>
  );
}
