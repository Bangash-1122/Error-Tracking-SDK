'use client';

import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon, Info } from 'lucide-react';

interface MetricsCardProps {
  label: string;
  value: string | number;
  changePercent?: number;
  changePositive?: boolean; // is increase good or bad
  timeWindow?: string;
  icon: LucideIcon;
  color: 'blue' | 'teal' | 'amber' | 'red';
  tooltip?: string;
}

export function MetricsCard({
  label,
  value,
  changePercent,
  changePositive = false,
  timeWindow = 'vs last 24h',
  icon: Icon,
  color,
  tooltip,
}: MetricsCardProps) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-[#2563EB]',
      border: 'border-blue-100',
    },
    teal: {
      bg: 'bg-teal-50',
      text: 'text-[#12A89D]',
      border: 'border-teal-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-[#F59E0B]',
      border: 'border-amber-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-[#EF4444]',
      border: 'border-red-100',
    },
  };

  const isUp = (changePercent ?? 0) >= 0;
  const isGood = changePositive ? isUp : !isUp;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#52647A] uppercase tracking-wider flex items-center gap-1.5">
          {label}
          {tooltip && (
            <span title={tooltip} className="cursor-help text-slate-400 hover:text-slate-600">
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </span>
        <div className={`p-2.5 rounded-xl ${colorMap[color].bg} ${colorMap[color].text} border ${colorMap[color].border} group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{value}</span>
      </div>

      {changePercent !== undefined && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-semibold ${
              isGood
                ? 'bg-teal-50 text-teal-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isUp ? `+${changePercent}%` : `${changePercent}%`}
          </span>
          <span className="text-[#52647A] text-[11px] font-medium">{timeWindow}</span>
        </div>
      )}
    </div>
  );
}
