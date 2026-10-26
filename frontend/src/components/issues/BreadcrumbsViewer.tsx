'use client';

import React from 'react';
import { Breadcrumb } from '@/types';
import {
  MousePointer,
  Globe,
  Terminal,
  Navigation,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export function BreadcrumbsViewer({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  const getIcon = (category: Breadcrumb['category']) => {
    switch (category) {
      case 'ui.click':
        return <MousePointer className="w-3.5 h-3.5 text-blue-500" />;
      case 'xhr':
      case 'fetch':
        return <Globe className="w-3.5 h-3.5 text-teal-500" />;
      case 'console':
        return <Terminal className="w-3.5 h-3.5 text-amber-500" />;
      case 'navigation':
        return <Navigation className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
        <span>Breadcrumbs Timeline</span>
        <span className="text-xs text-slate-500 font-medium">
          {breadcrumbs.length} recorded events before crash
        </span>
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {breadcrumbs.map((bc, idx) => (
          <div key={bc.id || idx} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center group-hover:border-[#2563EB] group-hover:scale-110 transition-all shadow-sm">
              {getIcon(bc.category)}
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-800 capitalize flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                    {bc.category}
                  </span>
                  {bc.message}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {formatTime(bc.timestamp)}
                </span>
              </div>

              {bc.data && (
                <div className="mt-2 text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-600">
                  <pre className="overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(bc.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
