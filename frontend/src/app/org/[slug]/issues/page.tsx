'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { IssuesTable } from '@/components/issues/IssuesTable';
import { AlertTriangle, Plus, Filter } from 'lucide-react';

export default function IssuesListPage() {
  const { org, activeProject, issues } = useApp();

  const projectIssues = issues.filter((i) => i.projectId === activeProject.id);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Top Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#2563EB]" />
              Issues List
            </h1>
            <p className="text-xs text-[#52647A] mt-0.5">
              Exceptions and failures grouped by stack fingerprint for <strong className="text-slate-800">{activeProject.name}</strong>
            </p>
          </div>
        </div>

        {/* Issues Table with Search, Filter & Bulk Actions */}
        <IssuesTable issues={projectIssues} orgSlug={org.slug} />
      </div>
    </AppShell>
  );
}
