'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import {
  CreditCard,
  CheckCircle2,
  Zap,
  ShieldCheck,
  FileText,
  Download,
  Sparkles,
} from 'lucide-react';

export default function BillingPage() {
  const { org, subscription, updatePlan, showToast } = useApp();

  const usagePercent = Math.min(
    100,
    Math.round((subscription.acceptedEvents / subscription.eventLimit) * 100)
  );

  const tiers = [
    {
      id: 'free',
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      limit: '10,000 events / mo',
      features: [
        '1 Project',
        '30-day retention',
        'Community support',
        'Standard rate limiting',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Tier',
      price: '$49',
      period: 'per month',
      limit: '100,000 events / mo',
      popular: true,
      features: [
        'Unlimited projects',
        '90-day retention',
        'Webhook & Slack alerts',
        'Source map symbolication',
        'Priority support',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      price: '$199',
      period: 'per month',
      limit: '1,000,000 events / mo',
      features: [
        'Custom ingest quotas',
        '365-day compliance retention',
        'Dedicated SLA & support',
        'Single Sign-On (SAML/SSO)',
        'Private Cloud VPC bridge',
      ],
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#2563EB]" />
            Subscription & Usage Quotas
          </h1>
          <p className="text-xs text-[#52647A] mt-0.5">
            Transparent metered billing and capacity limits for <strong className="text-slate-800">{org.name}</strong>
          </p>
        </div>

        {/* Current Plan Overview Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Current Plan
              </span>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-xl font-extrabold text-slate-900 uppercase">
                  {subscription.plan} Tier
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Active
                </span>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-2xl font-extrabold text-slate-900">
                ${subscription.costMonthly}
              </span>
              <span className="text-xs text-slate-500 font-medium"> / month</span>
            </div>
          </div>

          {/* Usage progress meter */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Monthly Ingestion Quota</span>
              <span className="text-slate-900">
                {subscription.acceptedEvents.toLocaleString()} of{' '}
                {subscription.eventLimit.toLocaleString()} events ({usagePercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                style={{ width: `${usagePercent}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent > 80
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-[#2563EB] to-[#12A89D]'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Period renews on{' '}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. Unused events do not roll over.
            </p>
          </div>
        </div>

        {/* Available Plan Comparison Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const isCurrent = subscription.plan === tier.id;
            return (
              <div
                key={tier.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between relative ${
                  tier.popular
                    ? 'border-[#2563EB] shadow-xl ring-2 ring-[#2563EB]/10'
                    : 'border-[#E2E8F0] shadow-sm'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">{tier.price}</span>
                    <span className="text-xs text-slate-500">{tier.period}</span>
                  </div>

                  <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 text-center">
                    {tier.limit}
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold cursor-default"
                    >
                      Current Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => updatePlan(tier.id as any)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        tier.popular
                          ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#2563EB]/25'
                          : 'bg-[#10203C] hover:bg-[#1B325B] text-white'
                      }`}
                    >
                      Switch to {tier.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Invoice History */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Billing & Invoices History
          </h2>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              { id: 'INV-2026-10', date: 'Oct 01, 2026', amount: '$49.00', status: 'Paid' },
              { id: 'INV-2026-09', date: 'Sep 01, 2026', amount: '$49.00', status: 'Paid' },
              { id: 'INV-2026-08', date: 'Aug 01, 2026', amount: '$49.00', status: 'Paid' },
            ].map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">{inv.id}</span>
                  <span className="text-slate-400 text-[11px]">{inv.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">{inv.amount}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {inv.status}
                  </span>
                  <button
                    onClick={() => showToast(`Downloaded invoice ${inv.id}`)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
