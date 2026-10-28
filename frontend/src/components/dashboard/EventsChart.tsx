'use client';

import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

interface DataPoint {
  time: string;
  events: number;
  resolved: number;
}

interface EventsChartProps {
  timeRange?: string;
  buckets?: Array<{ label: string; count: number; resolved?: number }>;
}

export function EventsChart({ timeRange = '24h', buckets }: EventsChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const defaultPoints: DataPoint[] = [
    { time: '00:00', events: 45, resolved: 30 },
    { time: '02:00', events: 28, resolved: 20 },
    { time: '04:00', events: 19, resolved: 15 },
    { time: '06:00', events: 35, resolved: 25 },
    { time: '08:00', events: 120, resolved: 80 },
    { time: '10:00', events: 290, resolved: 190 },
    { time: '12:00', events: 410, resolved: 310 },
    { time: '14:00', events: 360, resolved: 280 },
    { time: '16:00', events: 480, resolved: 390 },
    { time: '18:00', events: 310, resolved: 240 },
    { time: '20:00', events: 180, resolved: 130 },
    { time: '22:00', events: 95, resolved: 70 },
  ];

  const points: DataPoint[] = buckets && buckets.length > 0
    ? buckets.map((b) => ({
        time: b.label,
        events: b.count,
        resolved: b.resolved ?? Math.floor(b.count * 0.7),
      }))
    : defaultPoints;

  const maxVal = Math.max(...points.map((p) => p.events), 50);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#2563EB]" />
            Event Volume & Crash Frequency
          </h3>
          <p className="text-xs text-[#52647A] mt-0.5">
            Real-time ingested exception events aggregated across {timeRange}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#2563EB]" />
            <span className="text-slate-600 font-medium">Ingested Errors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#12A89D]" />
            <span className="text-slate-600 font-medium">Resolved</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="mt-6 relative h-56 flex items-end justify-between gap-2 pt-6">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400">
          <div className="border-b border-slate-100 w-full flex justify-end pr-2">
            <span>{maxVal}</span>
          </div>
          <div className="border-b border-slate-100 w-full flex justify-end pr-2">
            <span>{Math.round(maxVal / 2)}</span>
          </div>
          <div className="border-b border-slate-200 w-full flex justify-end pr-2">
            <span>0</span>
          </div>
        </div>

        {/* Dynamic Bars */}
        {points.map((pt, index) => {
          const heightPercent = Math.max(4, (pt.events / maxVal) * 100);
          const isHovered = hoveredPoint?.time === pt.time;

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="relative flex-1 flex flex-col items-center justify-end h-full z-10 group cursor-pointer"
            >
              {/* Tooltip on Hover */}
              {isHovered && (
                <div className="absolute -top-14 bg-[#10203C] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl pointer-events-none z-30 whitespace-nowrap border border-[#2563EB]/40 animate-in fade-in zoom-in-95">
                  <span className="font-bold text-[#93C5FD]">{pt.time}: </span>
                  <span>{pt.events} errors</span>
                  <span className="text-emerald-300 ml-1.5">({pt.resolved} resolved)</span>
                </div>
              )}

              {/* Bar Stack */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[28px] rounded-t-lg transition-all duration-200 ${
                  isHovered
                    ? 'bg-gradient-to-t from-[#1D4ED8] to-[#60A5FA] shadow-lg shadow-[#2563EB]/30 scale-105'
                    : 'bg-gradient-to-t from-[#2563EB] to-[#93C5FD]/80 hover:brightness-110'
                }`}
              />

              {/* X Axis Label */}
              <span className="text-[10px] text-slate-500 font-medium mt-2 truncate max-w-[40px] text-center">
                {pt.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
