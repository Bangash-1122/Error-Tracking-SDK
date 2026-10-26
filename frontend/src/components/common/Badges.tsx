import React from 'react';
import { SeverityLevel, IssueStatus } from '@/types';

export function SeverityBadge({ level }: { level: SeverityLevel }) {
  const styles = {
    critical: 'bg-red-50 text-red-700 border-red-200 ring-red-500/20',
    error: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    info: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
  };

  const dots = {
    critical: 'bg-red-600',
    error: 'bg-rose-600',
    warning: 'bg-amber-600',
    info: 'bg-blue-600',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ring-1 ${styles[level]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[level]}`} />
      {level}
    </span>
  );
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  const styles = {
    unresolved: 'bg-rose-50 text-rose-700 border-rose-200',
    resolved: 'bg-teal-50 text-teal-700 border-teal-200',
    ignored: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const labels = {
    unresolved: 'Unresolved',
    resolved: 'Resolved',
    ignored: 'Ignored',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
