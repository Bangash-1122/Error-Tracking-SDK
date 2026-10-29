'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, Lock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
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

      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Set new password</h1>
      <p className="text-xs text-slate-500 mt-1">
        Choose a strong, secure password of at least 8 characters.
      </p>

      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {success ? (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Password Reset Successful!</span>
            </div>
            <p className="text-emerald-700 leading-relaxed">
              Your password has been securely updated. You can now log into your account.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-lg shadow-[#2563EB]/30 transition-all mt-4"
          >
            <span>Sign In with New Password</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={loading}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={loading}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

      <p className="mt-6 text-center text-xs text-slate-500">
        Back to{' '}
        <Link href="/login" className="text-[#2563EB] font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#10203C] flex items-center justify-center p-6 selection:bg-[#2563EB] selection:text-white">
      <Suspense fallback={<div className="text-white text-xs">Loading reset page...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
