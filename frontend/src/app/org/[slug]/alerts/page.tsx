'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { AlertRuleModal } from '@/components/alerts/AlertRuleModal';
import {
  BellRing,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  Send,
  Power,
  ShieldCheck,
} from 'lucide-react';

export default function AlertsPage() {
  const { org, activeProject, alertRules, deliveries, toggleAlertRule, showToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  const projectRules = alertRules.filter((r) => r.projectId === activeProject.id);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <BellRing className="w-6 h-6 text-[#2563EB]" />
              Alert Rules & Destinations
            </h1>
            <p className="text-xs text-[#52647A] mt-0.5">
              Configure Webhook and Slack notifications for <strong className="text-slate-800">{activeProject.name}</strong>
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#2563EB]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Alert Rule</span>
          </button>
        </div>

        {/* Alert Rules List */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active Rules ({projectRules.length})
          </h2>

          <div className="divide-y divide-slate-100">
            {projectRules.map((rule) => (
              <div
                key={rule.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900">{rule.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rule.status === 'active'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {rule.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-mono">
                    Destination: {rule.destination}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-[#52647A] pt-1">
                    <span>
                      Condition:{' '}
                      <strong className="text-slate-700 capitalize">
                        {rule.condition.type.replace('_', ' ')}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>Cooldown: {rule.cooldownMinutes} mins</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      showToast(`Test payload dispatched to ${rule.destination}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-400" />
                    <span>Test Notification</span>
                  </button>

                  <button
                    onClick={() => toggleAlertRule(rule.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      rule.status === 'active'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{rule.status === 'active' ? 'Pause' : 'Activate'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Delivery History Log */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Recent Delivery Logs
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">Rule Name</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3 text-right">Attempts</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                  <th className="py-2.5 px-3 text-right">Sent Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-800">{del.ruleName}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{del.condition}</td>
                    <td className="py-3 px-3 font-mono text-slate-400 truncate max-w-xs">{del.destination}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{del.attempts}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        {del.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {new Date(del.sentAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AlertRuleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </AppShell>
  );
}
