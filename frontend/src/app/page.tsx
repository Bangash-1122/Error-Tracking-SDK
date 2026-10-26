import Link from 'next/link';
import { ShieldAlert, ArrowRight, Zap, CheckCircle2, Lock, Activity, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#10203C] text-white flex flex-col justify-between selection:bg-[#2563EB] selection:text-white">
      {/* Top Navbar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#12A89D] flex items-center justify-center shadow-lg shadow-[#2563EB]/40">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white block">
              ErrorPulse
            </span>
            <span className="text-[11px] text-[#93C5FD] font-semibold tracking-wider uppercase">
              Commercial SaaS Baseline
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/org/acme-corp/overview"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-[#2563EB]/30 transition-all hover:scale-105"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#152747] border border-[#2563EB]/50 text-[#93C5FD] text-xs font-semibold mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#12A89D]" />
          <span>Technical Blueprint 01 & 02 Compliant Implementation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
          Real-Time Exception Tracking & Error Monitoring SaaS
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          Full customer-facing Next.js dashboard featuring deep stack traces, grouped fingerprints,
          time-series telemetry, release regressions, webhook alerts, and tenant management.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/org/acme-corp/overview"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#2563EB] to-[#12A89D] text-white shadow-xl shadow-[#2563EB]/30 hover:opacity-95 transition-all hover:scale-105"
          >
            <span>Enter Acme Corp Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/onboarding"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-[#152747] hover:bg-[#1B325B] text-slate-200 border border-[#1E2E4A] transition-all"
          >
            <Zap className="w-4 h-4 text-[#93C5FD]" />
            <span>Interactive SDK Setup</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
          <div className="bg-[#152747]/60 border border-[#1E2E4A] p-5 rounded-2xl backdrop-blur-sm">
            <Activity className="w-6 h-6 text-[#2563EB] mb-3" />
            <h4 className="font-bold text-white text-sm">Real-time Ingestion & Telemetry</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              24-hour crash frequency histograms, active issues count, user impact and recency sorting.
            </p>
          </div>

          <div className="bg-[#152747]/60 border border-[#1E2E4A] p-5 rounded-2xl backdrop-blur-sm">
            <CheckCircle2 className="w-6 h-6 text-[#12A89D] mb-3" />
            <h4 className="font-bold text-white text-sm">Deep Trace Inspection</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              In-app frame highlights, expandable context code snippets, breadcrumbs timeline, and tags.
            </p>
          </div>

          <div className="bg-[#152747]/60 border border-[#1E2E4A] p-5 rounded-2xl backdrop-blur-sm">
            <Lock className="w-6 h-6 text-amber-400 mb-3" />
            <h4 className="font-bold text-white text-sm">Key Rotation & Quotas</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Instant publishable ingest key revocation, member RBAC permissions, and transparent billing.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-[#1E2E4A] text-center text-xs text-slate-500">
        © 2026 ErrorPulse Technologies Inc. Commercial SaaS Architecture Baseline.
      </footer>
    </div>
  );
}
