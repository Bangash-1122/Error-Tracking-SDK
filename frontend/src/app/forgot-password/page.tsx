'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Mail, AlertCircle, CheckCircle2, RefreshCw, KeyRound } from 'lucide-react';
import { api } from '@/lib/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ message: string; resetUrl?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    try {
      const res = await api.forgotPassword(email);
      setSuccessInfo({
        message: res.message || 'Password reset link generated successfully.',
        resetUrl: res.resetUrl,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process reset request. Please check your email.');
    } finally {
      setLoading(false);
    }
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

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset your password</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your account email to receive a secure, expiring password reset link.
        </p>

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successInfo ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Reset Link Generated!</span>
              </div>
              <p className="text-emerald-700 leading-relaxed">{successInfo.message}</p>
            </div>

            {successInfo.resetUrl && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">
                  Direct Verification Link (Dev Mode)
                </span>
                <Link
                  href={successInfo.resetUrl}
                  className="text-xs text-[#2563EB] font-bold break-all hover:underline flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4 shrink-0" />
                  <span>Click here to complete password reset →</span>
                </Link>
              </div>
            )}

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#10203C] hover:bg-[#1B325B] text-white font-bold text-xs shadow-md transition-all mt-4"
            >
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="admin@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Request Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          Remember your password?{' '}
          <Link href="/login" className="text-[#2563EB] font-bold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
