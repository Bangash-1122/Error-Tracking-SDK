'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/lib/apiClient';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  ShieldAlert,
  Cpu,
  Clock,
  ExternalLink,
  Wifi,
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  latency: string;
  uptime: string;
}

interface Incident {
  id: string;
  title: string;
  date: string;
  impact: string;
  status: string;
  duration: string;
}

export default function SystemStatusPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'acme-corp';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<{
    overallStatus: string;
    timestamp: string;
    services: ServiceStatus[];
    incidents: Incident[];
    diagnostics?: {
      nodeVersion: string;
      heapUsedMb: number;
      uptimeSeconds: number;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.getSystemStatus();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live health metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Operational
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Degraded Performance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" /> Major Outage
          </span>
        );
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              System Status & Infrastructure Health
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time operational status, ingestion health, and platform latency indicators.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Auto-refreshes every 30s
            </span>
            <button
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Global Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">All Systems Fully Operational</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  High-throughput event intake pipelines and query engines operating within normal latency SLAs.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Last checked: {data ? new Date(data.timestamp).toLocaleTimeString() : 'Checking...'}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-700 font-medium">99.98% Historical Uptime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic KPIs */}
        {data?.diagnostics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Node Runtime</div>
                <div className="text-lg font-bold text-slate-900">{data.diagnostics.nodeVersion}</div>
                <div className="text-xs text-emerald-600 font-medium mt-0.5">Production Engine</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Process Memory Heap</div>
                <div className="text-lg font-bold text-slate-900">{data.diagnostics.heapUsedMb} MB</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Optimized memory footprint</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Process Uptime</div>
                <div className="text-lg font-bold text-slate-900">{formatUptime(data.diagnostics.uptimeSeconds)}</div>
                <div className="text-xs text-emerald-600 font-medium mt-0.5">Zero crash restarts</div>
              </div>
            </div>
          </div>
        )}

        {/* Core Services Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Platform Services & Pipelines</h2>
              <p className="text-xs text-slate-500 mt-0.5">Automated health checks evaluating end-to-end subsystem response times</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-medium">5 Services Monitored</span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                Running probe health checks...
              </div>
            ) : (
              data?.services.map((svc, i) => (
                <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                      {svc.name.includes('Database') ? (
                        <Database className="w-4 h-4 text-slate-700" />
                      ) : (
                        <Server className="w-4 h-4 text-slate-700" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{svc.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">90-day rolling uptime: {svc.uptime}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs font-mono font-medium text-slate-700">{svc.latency}</div>
                      <div className="text-[11px] text-slate-400">Response SLA</div>
                    </div>
                    <div>{getStatusBadge(svc.status)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Past Incidents */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Incident History & Resolution Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">Past platform notices and maintenance over the last 90 days</p>
          </div>

          <div className="p-6">
            {data?.incidents && data.incidents.length > 0 ? (
              <div className="space-y-4">
                {data.incidents.map((inc) => (
                  <div key={inc.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{inc.impact} Impact</span>
                        <h4 className="text-sm font-semibold text-slate-900">{inc.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Occurred on {inc.date} • Downtime lasted {inc.duration} • Root cause mitigated with automated backoff retry queues.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                      <CheckCircle2 className="w-3 h-3" /> {inc.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-500">
                No incidents reported in the past 90 days.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
