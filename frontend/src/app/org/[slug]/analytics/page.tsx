'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { SeverityBadge } from '@/components/common/Badges';
import { api } from '@/lib/apiClient';
import {
  BarChart3,
  Activity,
  Users,
  Flame,
  Download,
  Calendar,
  Layers,
  Globe,
  GitBranch,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { org, activeProject, issues, activeTimeRange, activeEnvironment, releases, showToast } = useApp();

  const [liveStats, setLiveStats] = useState<any>(null);
  const [selectedEnv, setSelectedEnv] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>(activeTimeRange);

  useEffect(() => {
    let mounted = true;
    api.getAnalyticsStats(activeProject.id, dateRange, selectedEnv)
      .then((data) => {
        if (mounted) setLiveStats(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [activeProject.id, dateRange, selectedEnv, issues]);

  const projectIssues = issues.filter((i) => i.projectId === activeProject.id);
  const totalEvents = liveStats?.totalEvents ?? projectIssues.reduce((acc, curr) => acc + curr.count, 0);
  const affectedUsers = liveStats?.affectedUsers ?? projectIssues.reduce((acc, curr) => acc + curr.userCount, 0);
  const errorRate = liveStats?.errorRate ?? 2.4;
  const crashFreePercent = liveStats?.crashFreePercent ?? 98.6;

  const topRecurring = [...projectIssues].sort((a, b) => b.count - a.count).slice(0, 5);

  const exportCsv = () => {
    const headers = ['Issue ID', 'Fingerprint', 'Title', 'Type', 'Severity', 'Count', 'Users', 'First Seen', 'Last Seen', 'Environment', 'Release'];
    const rows = projectIssues.map((i) => [
      i.id,
      i.fingerprint,
      `"${i.title.replace(/"/g, '""')}"`,
      i.type,
      i.severity,
      i.count,
      i.userCount,
      i.firstSeen,
      i.lastSeen,
      i.environment,
      i.release,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `errorpulse-analytics-${activeProject.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Analytics report exported as CSV');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#2563EB]" />
              Telemetry & Analytics
            </h1>
            <p className="text-xs text-[#52647A] mt-0.5">
              Comprehensive error frequency, user impact trends, and cross-release comparisons for{' '}
              <strong className="text-slate-800">{activeProject.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            label="Total Error Volume"
            value={totalEvents.toLocaleString()}
            changePercent={12}
            timeWindow={`in past ${dateRange}`}
            icon={Activity}
            color="blue"
            tooltip="Total aggregated occurrence of all exception events"
          />
          <MetricsCard
            label="Crash-Free Sessions"
            value={`${crashFreePercent}%`}
            changePercent={0.4}
            timeWindow="session health ratio"
            icon={Flame}
            color="teal"
            tooltip="Percentage of user sessions completed with zero uncaught fatal exceptions"
          />
          <MetricsCard
            label="Impacted Users"
            value={affectedUsers.toLocaleString()}
            changePercent={-3}
            changePositive={true}
            timeWindow={`in past ${dateRange}`}
            icon={Users}
            color="amber"
            tooltip="Distinct user identities who encountered an exception"
          />
          <MetricsCard
            label="Error Frequency Rate"
            value={`${errorRate} / req`}
            changePercent={-8}
            changePositive={true}
            timeWindow="avg errors per 1k requests"
            icon={BarChart3}
            color="red"
            tooltip="Weighted exception rate per API and client interaction"
          />
        </div>

        {/* Filters Strip */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">Date Window:</span>
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
              {['1h', '24h', '7d', '30d'].map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    dateRange === r
                      ? 'bg-white text-[#2563EB] shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">Environment:</span>
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
        </div>

        {/* Two Column Grid: Severity Distribution & Environment Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Severity Breakdown */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Severity Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Exceptions broken down by triage criticality level</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { name: 'Critical', color: 'bg-rose-500', count: Math.floor(totalEvents * 0.42), percent: 42 },
                { name: 'Error', color: 'bg-amber-500', count: Math.floor(totalEvents * 0.35), percent: 35 },
                { name: 'Warning', color: 'bg-blue-500', count: Math.floor(totalEvents * 0.18), percent: 18 },
                { name: 'Info', color: 'bg-slate-400', count: Math.floor(totalEvents * 0.05), percent: 5 },
              ].map((sev) => (
                <div key={sev.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${sev.color}`} />
                      {sev.name}
                    </span>
                    <span className="font-mono text-slate-600">
                      {sev.count.toLocaleString()} ({sev.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${sev.color} rounded-full`} style={{ width: `${sev.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Environment Comparison */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Environment Comparison</h3>
                <p className="text-xs text-slate-500 mt-0.5">Crash frequency across runtime environments</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {[
                { env: 'Production', events: Math.floor(totalEvents * 0.78), users: Math.floor(affectedUsers * 0.85), rate: '1.2%' },
                { env: 'Staging', events: Math.floor(totalEvents * 0.16), users: Math.floor(affectedUsers * 0.12), rate: '3.4%' },
                { env: 'Development', events: Math.floor(totalEvents * 0.06), users: Math.floor(affectedUsers * 0.03), rate: '8.1%' },
              ].map((item) => (
                <div key={item.env} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.env}</span>
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5">{item.users} affected users</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block">{item.events.toLocaleString()} events</span>
                    <span className="text-[10px] uppercase font-bold text-[#2563EB]">{item.rate} error rate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Recurring Errors Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Top Recurring Exceptions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Identified by algorithmic fingerprint recurrence</p>
            </div>
            <Link href={`/org/${org.slug}/issues`} className="text-xs font-semibold text-[#2563EB] hover:underline">
              View all issues →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#52647A] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Exception & Fingerprint</th>
                  <th className="py-2.5 px-3">Culprit Frame</th>
                  <th className="py-2.5 px-3 text-right">Occurrences</th>
                  <th className="py-2.5 px-3 text-right">Users</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topRecurring.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <SeverityBadge level={iss.severity} />
                        <span className="font-bold text-slate-900 truncate max-w-sm">{iss.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{iss.fingerprint}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{iss.culprit}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900">{iss.count.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-700 font-semibold">{iss.userCount}</td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/org/${org.slug}/issues/${iss.id}`}
                        className="text-xs font-bold text-[#2563EB] hover:underline"
                      >
                        Inspect
                      </Link>
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
