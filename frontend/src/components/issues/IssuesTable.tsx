'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Issue, IssueStatus } from '@/types';
import { SeverityBadge, StatusBadge } from '@/components/common/Badges';
import { useApp } from '@/lib/store';
import {
  CheckCircle,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Flame,
  Search,
} from 'lucide-react';

function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface IssuesTableProps {
  issues: Issue[];
  orgSlug: string;
}

export function IssuesTable({ issues, orgSlug }: IssuesTableProps) {
  const router = useRouter();
  const { bulkUpdateStatus } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | IssueStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filter issues
  const filtered = issues.filter((iss) => {
    if (statusFilter !== 'all' && iss.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        iss.title.toLowerCase().includes(q) ||
        iss.culprit.toLowerCase().includes(q) ||
        iss.type.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkResolve = () => {
    bulkUpdateStatus(selectedIds, 'resolved');
    setSelectedIds([]);
  };

  const handleBulkIgnore = () => {
    bulkUpdateStatus(selectedIds, 'ignored');
    setSelectedIds([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FCFDFE]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by error, file, or type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'unresolved', 'resolved', 'ignored'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-[#10203C] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#EFF6FF] px-4 py-2.5 border-b border-[#BFDBFE] flex items-center justify-between animate-in fade-in duration-150">
          <span className="text-xs font-semibold text-[#1D4ED8]">
            {selectedIds.length} issue(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkResolve}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#12A89D] text-white hover:brightness-105 transition-all shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
            <button
              onClick={handleBulkIgnore}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-600 text-white hover:bg-slate-700 transition-all shadow-sm"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Ignore</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#52647A] uppercase tracking-wider">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={paginated.length > 0 && selectedIds.length === paginated.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                />
              </th>
              <th className="py-3 px-4">Issue Details</th>
              <th className="py-3 px-4 w-32">Status</th>
              <th className="py-3 px-4 w-28 text-right">Events</th>
              <th className="py-3 px-4 w-28 text-right">Users</th>
              <th className="py-3 px-4 w-32 text-right">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Flame className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No issues found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No exceptions match the specified query or filters.
                  </p>
                </td>
              </tr>
            ) : (
              paginated.map((issue) => {
                const isSelected = selectedIds.includes(issue.id);
                return (
                  <tr
                    key={issue.id}
                    className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer group ${
                      isSelected ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).tagName !== 'INPUT') {
                        router.push(`/org/${orgSlug}/issues/${issue.id}`);
                      }
                    }}
                  >
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(issue.id)}
                        className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex items-center gap-2">
                        <SeverityBadge level={issue.severity} />
                        <Link
                          href={`/org/${orgSlug}/issues/${issue.id}`}
                          className="font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors truncate"
                          title={issue.title}
                        >
                          {issue.title}
                        </Link>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-[#52647A]">
                        <span className="font-mono text-slate-500">{issue.culprit}</span>
                        <span>•</span>
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          {issue.environment}
                        </span>
                        <span>•</span>
                        <span>{issue.release}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {issue.count.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                      {issue.userCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                      {formatTimeAgo(issue.lastSeen)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500 bg-[#FCFDFE]">
        <span>
          Showing page {currentPage} of {totalPages} ({filtered.length} issues)
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
