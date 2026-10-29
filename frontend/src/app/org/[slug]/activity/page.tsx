'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/lib/apiClient';
import type { AuditLog } from '@/types';
import {
  History,
  CheckCircle2,
  Search,
} from 'lucide-react';

export default function ActivityAuditPage() {
  const { org } = useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchActor, setSearchActor] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    api.getAuditLogs(org.id)
      .then((data) => {
        if (mounted && data.logs) setLogs(data.logs);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [org.id]);

  const filtered = logs.filter((log) => {
    if (filterAction !== 'all' && !log.action.toLowerCase().includes(filterAction.toLowerCase())) {
      return false;
    }
    if (searchActor) {
      const q = searchActor.toLowerCase();
      const match =
        log.actor?.name?.toLowerCase().includes(q) ||
        log.actor?.email?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#2563EB]" />
            Activity & Security Audit Trail
          </h1>
          <p className="text-xs text-[#52647A] mt-0.5">
            Immutable system audit logs recording authentication, role modifications, key rotations, and triage actions
            in <strong className="text-slate-800">{org.name}</strong>
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by actor or action..."
              value={searchActor}
              onChange={(e) => setSearchActor(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'auth', 'issue', 'key', 'team', 'billing', 'project'].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterAction === act
                    ? 'bg-[#10203C] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {act === 'all' ? 'All Activities' : act}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#52647A] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Actor</th>
                  <th className="py-3.5 px-6">Action Event</th>
                  <th className="py-3.5 px-6">Resource Target</th>
                  <th className="py-3.5 px-6">Diff Values (Previous → New)</th>
                  <th className="py-3.5 px-6 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.occurredAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                            {log.actor?.name?.slice(0, 2).toUpperCase() || 'AU'}
                          </div>
                          <div>
                            <span className="block">{log.actor?.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{log.actor?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB] font-mono font-bold text-[11px] border border-blue-100">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-700 font-semibold">{log.resource}</td>
                      <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500">
                        {log.previousValue && log.newValue ? (
                          <div className="flex items-center gap-1.5">
                            <span className="line-through text-rose-500">{log.previousValue}</span>
                            <span>→</span>
                            <span className="text-emerald-600 font-bold">{log.newValue}</span>
                          </div>
                        ) : log.newValue ? (
                          <span className="text-slate-800">{log.newValue}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.result === 'success'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No audit events found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
