'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { EventsChart } from '@/components/dashboard/EventsChart';
import { SeverityBadge } from '@/components/common/Badges';
import { api } from '@/lib/apiClient';
import type { AnalyticsStats } from '@/types';
import {
  Activity,
  AlertTriangle,
  Users,
  Flame,
  ArrowRight,
  GitBranch,
  ExternalLink,
} from 'lucide-react';

export default function OverviewPage() {
  const { org, activeProject, issues, activeTimeRange, activeEnvironment, releases } = useApp();

  const [liveStats, setLiveStats] = useState<AnalyticsStats | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getAnalyticsStats(activeProject.id, activeTimeRange, activeEnvironment)
      .then((data) => {
        if (mounted) setLiveStats(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [activeProject.id, activeTimeRange, activeEnvironment, issues]);

  const projectIssues = issues.filter((i) => i.projectId === activeProject.id);
  const unresolvedIssues = projectIssues.filter((i) => i.status === 'unresolved');
  const totalEvents = liveStats?.totalEvents ?? projectIssues.reduce((acc, curr) => acc + curr.count, 0);
  const totalUsers = liveStats?.affectedUsers ?? projectIssues.reduce((acc, curr) => acc + curr.userCount, 0);
  
  // Real regression check: An issue that was previously resolved and reappeared
  const regressedCount = liveStats?.regressedIssues ?? projectIssues.filter((i) => i.isRegressed === true).length;

  // Most frequent 4 issues
  const topIssues = [...projectIssues]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Top Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Project Overview
            </h1>
            <p className="text-xs text-[#52647A] mt-0.5">
              Live telemetry and error intelligence for <strong className="text-slate-800">{activeProject.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/org/${org.slug}/issues`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span>View All Issues</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            label="Total Events"
            value={totalEvents.toLocaleString()}
            changePercent={14}
            timeWindow={`vs last ${activeTimeRange}`}
            icon={Activity}
            color="blue"
            tooltip="Total raw exception events received by ingestion pipeline"
          />
          <MetricsCard
            label="Active Issues"
            value={unresolvedIssues.length}
            changePercent={-5}
            changePositive={false}
            timeWindow="currently open"
            icon={AlertTriangle}
            color="red"
            tooltip="Grouped unique exception fingerprints currently unresolved"
          />
          <MetricsCard
            label="Affected Users"
            value={totalUsers.toLocaleString()}
            changePercent={8}
            timeWindow={`vs last ${activeTimeRange}`}
            icon={Users}
            color="amber"
            tooltip="Distinct user identities impacted by exceptions"
          />
          <MetricsCard
            label="New Regressions"
            value={regressedCount}
            changePercent={0}
            timeWindow="in latest release"
            icon={Flame}
            color="teal"
            tooltip="Resolved issues that recurred in active deployment according to regression rules"
          />
        </div>

        {/* 24-Hour Trend Chart with Real Buckets */}
        <EventsChart timeRange={activeTimeRange} buckets={liveStats?.chartBuckets} />

        {/* Two Column Grid: Top Frequent Issues & Release Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Most Frequent Issues (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Most Frequent Issues</h3>
                <p className="text-xs text-slate-500 mt-0.5">Prioritized by total event occurrence</p>
              </div>
              <Link
                href={`/org/${org.slug}/issues`}
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Browse all →
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {topIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/org/${org.slug}/issues/${issue.id}`}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-3 -mx-3 rounded-xl transition-colors group"
                >
                  <div className="overflow-hidden pr-4">
                    <div className="flex items-center gap-2">
                      <SeverityBadge level={issue.severity} />
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors truncate">
                        {issue.title}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-[#52647A]">
                      <span className="font-mono text-slate-500">{issue.culprit}</span>
                      <span>•</span>
                      <span>{issue.userCount} users</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {issue.count.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">events</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Active Release Status (1 Col) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-[#2563EB]" />
                  Active Releases
                </h3>
                <Link
                  href={`/org/${org.slug}/releases`}
                  className="text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  History →
                </Link>
              </div>

              <div className="mt-4 space-y-4">
                {releases.map((rel) => (
                  <div
                    key={rel.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{rel.version}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rel.status === 'healthy'
                              ? 'bg-teal-100 text-teal-800'
                              : rel.status === 'regressed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rel.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{rel.ref}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 block">
                        {rel.newIssuesCount} new
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {rel.totalEventsCount.toLocaleString()} events
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <Link
                href="/onboarding"
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center justify-center gap-1.5"
              >
                <span>Add new SDK environment</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
