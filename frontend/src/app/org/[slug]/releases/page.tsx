'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { GitBranch, Clock, AlertTriangle, CheckCircle2, Flame, ExternalLink } from 'lucide-react';

export default function ReleasesPage() {
  const { org, activeProject, releases } = useApp();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-[#2563EB]" />
            Release Tracking & Regressions
          </h1>
          <p className="text-xs text-[#52647A] mt-0.5">
            Monitor deployments and regressions introduced in <strong className="text-slate-800">{activeProject.name}</strong>
          </p>
        </div>

        {/* Releases Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#52647A] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Release Version</th>
                  <th className="py-3.5 px-6">Commit Reference</th>
                  <th className="py-3.5 px-6">Deployed Date</th>
                  <th className="py-3.5 px-6 text-center">New Issues</th>
                  <th className="py-3.5 px-6 text-center">Regressions</th>
                  <th className="py-3.5 px-6 text-right">Total Events</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {releases.map((rel) => (
                  <tr key={rel.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                      <span>{rel.version}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500">{rel.ref}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(rel.deployedAt).toLocaleDateString()} at{' '}
                      {new Date(rel.deployedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-slate-800">
                      {rel.newIssuesCount}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {rel.regressedIssuesCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          <Flame className="w-3 h-3" />
                          {rel.regressedIssuesCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900">
                      {rel.totalEventsCount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          rel.status === 'healthy'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : rel.status === 'regressed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {rel.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
