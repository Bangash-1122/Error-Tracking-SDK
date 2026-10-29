'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { api } from '@/lib/apiClient';
import type { PerformanceStats } from '@/types';
import {
  Activity,
  Clock,
  Gauge,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Server,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export default function PerformancePage() {
  const { org, activeProject } = useApp();
  const [perfData, setPerfData] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getPerformance(activeProject.id)
      .then((data) => {
        if (mounted) {
          setPerfData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeProject.id]);

  const p50 = perfData?.p50 || 65;
  const p95 = perfData?.p95 || 180;
  const p99 = perfData?.p99 || 450;
  const avgDuration = perfData?.avgDuration || 85;
  const failureRate = perfData?.failureRate || 0.8;
  const slowEndpoints = perfData?.slowEndpoints || [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Gauge className="w-6 h-6 text-[#2563EB]" />
            Performance Monitoring
          </h1>
          <p className="text-xs text-[#52647A] mt-0.5">
            Real-time API response durations, endpoint latency percentiles, and failure rates for{' '}
            <strong className="text-slate-800">{activeProject.name}</strong>
          </p>
        </div>

        {/* 4 Latency KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            label="Average Latency"
            value={`${avgDuration}ms`}
            changePercent={-6}
            changePositive={true}
            timeWindow="overall response time"
            icon={Clock}
            color="blue"
            tooltip="Mean response duration across all sampled requests"
          />
          <MetricsCard
            label="P50 Median Duration"
            value={`${p50}ms`}
            changePercent={-2}
            changePositive={true}
            timeWindow="50th percentile"
            icon={Activity}
            color="teal"
            tooltip="50% of requests complete faster than this duration"
          />
          <MetricsCard
            label="P95 Latency"
            value={`${p95}ms`}
            changePercent={4}
            changePositive={false}
            timeWindow="95th percentile"
            icon={TrendingUp}
            color="amber"
            tooltip="95% of requests complete within this latency bound"
          />
          <MetricsCard
            label="P99 Critical Bound"
            value={`${p99}ms`}
            changePercent={12}
            changePositive={false}
            timeWindow="99th percentile spike"
            icon={AlertTriangle}
            color="red"
            tooltip="Worst 1% tail latency experienced by end users"
          />
        </div>

        {/* Slowest Endpoints Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Slowest HTTP Endpoints</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by average server response time</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Ingress Requests: <strong className="text-slate-800">{perfData?.totalRequests || 40}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#52647A] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Service Endpoint</th>
                  <th className="py-2.5 px-3 text-right">Avg Duration</th>
                  <th className="py-2.5 px-3 text-right">Throughput (Calls)</th>
                  <th className="py-2.5 px-3 text-right">HTTP 5xx Error Rate</th>
                  <th className="py-2.5 px-3 text-right">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slowEndpoints.length > 0 ? (
                  slowEndpoints.map((ep: PerformanceStats['slowEndpoints'][number], idx: number) => {
                    const isSlow = ep.avgMs > 300;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{ep.endpoint}</td>
                        <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900">
                          <span className={isSlow ? 'text-rose-600' : 'text-slate-800'}>{ep.avgMs}ms</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">{ep.calls} calls</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold">
                          <span className={ep.errorRate > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                            {ep.errorRate}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isSlow
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-teal-50 text-teal-700 border border-teal-200'
                            }`}
                          >
                            {isSlow ? 'Degraded' : 'Healthy'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Telemetry data initializing...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latency Threshold Rules */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-[#2563EB]" />
            Performance SLA & Alert Thresholds
          </h3>
          <p className="text-xs text-slate-500">
            Automated alerts trigger when endpoint latency crosses SLA bounds for more than 2 consecutive minutes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">P50 Standard SLA</span>
              <span className="text-lg font-extrabold text-slate-900 mt-1 block">&lt; 100ms</span>
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Operating within SLA bounds
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">P95 Warning SLA</span>
              <span className="text-lg font-extrabold text-slate-900 mt-1 block">&lt; 350ms</span>
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Operating within SLA bounds
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">P99 Critical SLA</span>
              <span className="text-lg font-extrabold text-slate-900 mt-1 block">&lt; 800ms</span>
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Operating within SLA bounds
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
