'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { SeverityBadge, StatusBadge } from '@/components/common/Badges';
import { StackTraceViewer } from '@/components/issues/StackTraceViewer';
import { BreadcrumbsViewer } from '@/components/issues/BreadcrumbsViewer';
import {
  ChevronLeft,
  CheckCircle,
  EyeOff,
  UserCheck,
  Clock,
  Users,
  Flame,
  Globe,
  Monitor,
  Tag,
  Code,
  Share2,
  Calendar,
  AlertCircle,
  History,
  GitBranch,
} from 'lucide-react';
import { Suspense } from 'react';

function IssueDetailContent() {
  const params = useParams();
  const router = useRouter();
  const issueId = (params?.id as string) || '';
  const { org, issues, updateIssueStatus, assignIssue, members, getEventForIssue, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'releases' | 'activity'>('overview');

  const issue = issues.find((i) => i.id === issueId);
  const event = getEventForIssue(issueId);

  if (!issue) {
    return (
      <AppShell>
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Issue Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The requested issue ID does not exist or was deleted.
          </p>
          <Link
            href={`/org/${org.slug}/issues`}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Issues List</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  const assignedMember = members.find((m) => m.id === issue.assignedTo);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back navigation & Share */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href={`/org/${org.slug}/issues`}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to issues list</span>
          </Link>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('Issue URL copied to clipboard');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white font-medium"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Issue</span>
          </button>
        </div>

        {/* Issue Header Banner */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge level={issue.severity} />
                <StatusBadge status={issue.status} />
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {issue.type}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  fingerprint: {issue.fingerprint}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {issue.title}
              </h1>

              <p className="font-mono text-xs text-[#52647A]">{issue.culprit}</p>
            </div>

            {/* Triage Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {issue.status !== 'resolved' ? (
                <button
                  onClick={() => updateIssueStatus(issue.id, 'resolved')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#12A89D] hover:bg-[#0E8A81] text-white shadow-sm transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Resolve</span>
                </button>
              ) : (
                <button
                  onClick={() => updateIssueStatus(issue.id, 'unresolved')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white shadow-sm transition-all"
                >
                  <span>Reopen</span>
                </button>
              )}

              {issue.status !== 'ignored' && (
                <button
                  onClick={() => updateIssueStatus(issue.id, 'ignored')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-all"
                >
                  <EyeOff className="w-4 h-4 text-slate-400" />
                  <span>Ignore</span>
                </button>
              )}

              {/* Assignee dropdown */}
              <div className="relative">
                <select
                  value={issue.assignedTo || ''}
                  onChange={(e) => assignIssue(issue.id, e.target.value || null)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Issue KPI strip */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#52647A] font-semibold block">Total Occurrences</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                {issue.count.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[#52647A] font-semibold block">Impacted Users</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                {issue.userCount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[#52647A] font-semibold block">First Seen</span>
              <span className="text-xs font-medium text-slate-700 mt-0.5 block">
                {new Date(issue.firstSeen).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-[#52647A] font-semibold block">Last Seen</span>
              <span className="text-xs font-medium text-slate-700 mt-0.5 block">
                {new Date(issue.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'events', label: 'Events & Payloads' },
            { id: 'releases', label: 'Releases' },
            { id: 'activity', label: 'Audit Activity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'events' | 'releases' | 'activity')}
              className={`pb-3 px-3 text-xs font-bold transition-all relative ${
                activeTab === tab.id
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Col: Stack Trace & Breadcrumbs */}
            <div className="lg:col-span-2 space-y-6">
              <StackTraceViewer
                frames={event.frames}
                exceptionType={event.exception.type}
                exceptionValue={event.exception.value}
              />

              <BreadcrumbsViewer breadcrumbs={event.breadcrumbs} />
            </div>

            {/* Right Rail: Tags, Environment, Metadata */}
            <div className="space-y-6">
              {/* Tags Panel */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#2563EB]" />
                  Context & Tags
                </h3>

                <div className="space-y-2 text-xs">
                  {Object.entries(event.tags).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono"
                    >
                      <span className="text-slate-500 font-semibold">{key}</span>
                      <span className="text-slate-800 truncate max-w-[160px]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Context Panel */}
              {event.user && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3 text-xs">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#12A89D]" />
                    Impacted User Identity
                  </h3>
                  <div className="space-y-1.5 text-slate-600">
                    <p>
                      <strong>ID:</strong> <span className="font-mono">{event.user.id}</span>
                    </p>
                    <p>
                      <strong>Username:</strong> {event.user.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {event.user.email}
                    </p>
                    <p>
                      <strong>IP Address:</strong>{' '}
                      <span className="font-mono">{event.user.ip_address}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Release Context */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3 text-xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[#F59E0B]" />
                  Release Linkage
                </h3>
                <div className="space-y-1.5 text-slate-600">
                  <p>
                    <strong>Release Version:</strong>{' '}
                    <span className="font-bold text-slate-800">{issue.release}</span>
                  </p>
                  <p>
                    <strong>Environment:</strong>{' '}
                    <span className="capitalize">{issue.environment}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Events */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Latest Ingested Occurrence Payload
            </h3>
            <p className="text-xs text-slate-500">
              Raw validated JSON document as accepted by the ingestion pipeline.
            </p>
            <div className="bg-[#0F172A] text-slate-200 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
              <pre>{JSON.stringify(event, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Tab 3: Releases */}
        {activeTab === 'releases' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Issue Distribution Across Deployments
            </h3>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">{issue.release} (Active)</span>
                <span className="text-slate-500">First introduced in this release</span>
              </div>
              <span className="font-extrabold text-slate-900">
                {issue.count.toLocaleString()} occurrences
              </span>
            </div>
          </div>
        )}

        {/* Tab 4: Activity */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Triage Audit History
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span>Issue created from ingestion stream</span>
                <span className="text-slate-400 font-mono">{issue.firstSeen}</span>
              </div>
              {assignedMember && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span>Assigned to {assignedMember.name}</span>
                  <span className="text-slate-400 font-mono">2h ago</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function IssueDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-[#F5F8FC] items-center justify-center text-slate-500 text-xs">
          Loading issue investigation details...
        </div>
      }
    >
      <IssueDetailContent />
    </Suspense>
  );
}

