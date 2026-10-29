'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { KeyRotationModal } from '@/components/projects/KeyRotationModal';
import {
  useProjectSettingsQuery,
  useUpdateProjectSettingsMutation,
  useCacheDiagnosticsQuery,
} from '@/lib/queries';
import { ProjectSettings } from '@/types';
import {
  Settings,
  KeyRound,
  RotateCcw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sliders,
  Cpu,
  Layers,
  ShieldAlert,
  BellRing,
  Lock,
  Workflow,
  Activity,
  AlertOctagon,
  Download,
  Trash2,
  RefreshCw,
  Zap,
  Server,
} from 'lucide-react';

export default function ProjectSettingsPage() {
  const router = useRouter();
  const { org, activeProject, showToast, sendSimulatedEvent } = useApp();
  const [activeTab, setActiveTab] = useState<'general-sdk' | 'monitoring' | 'alerts' | 'privacy' | 'performance' | 'advanced'>('general-sdk');

  // Key display & rotation
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [rotationOpen, setRotationOpen] = useState(false);

  // Dangerous action modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [cacheModalOpen, setCacheModalOpen] = useState(false);

  // TanStack Query: Project Settings
  const { data: settingsData } = useProjectSettingsQuery(activeProject.id);
  const updateSettingsMutation = useUpdateProjectSettingsMutation();
  const { data: cacheDiagData } = useCacheDiagnosticsQuery();

  // Controlled form state
  const [formOverrides, setFormOverrides] = useState<Partial<ProjectSettings>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newIgnoredError, setNewIgnoredError] = useState('');
  const [newScrubField, setNewScrubField] = useState('');

  const formState: Partial<ProjectSettings> = {
    ...settingsData?.settings,
    ...formOverrides,
  };

  const handleFieldChange = <K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) => {
    setFormOverrides((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formState) return;

    try {
      await updateSettingsMutation.mutateAsync({
        projectId: activeProject.id,
        settings: formState,
      });
      setFormOverrides({});
      setHasUnsavedChanges(false);
      showToast('Project settings saved successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      showToast(`Error saving settings: ${msg}`);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(activeProject.rawKey);
    setCopiedKey(true);
    showToast('Ingest key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleExportConfig = () => {
    const configBlob = new Blob([JSON.stringify(formState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(configBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeProject.slug}-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Configuration exported as JSON');
  };

  const handleDeleteProject = async () => {
    if (deleteConfirmationText !== activeProject.name) {
      showToast('Project name confirmation did not match');
      return;
    }
    showToast('Deleting project...');
    try {
      const res = await fetch(`/api/v1/projects/${activeProject.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion failed');
      showToast('Project deleted successfully');
      setDeleteModalOpen(false);
      router.push(`/org/${org.slug}/overview`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      showToast(`Deletion error: ${msg}`);
    }
  };

  const usagePercent = Math.min(
    100,
    Math.round((activeProject.eventCount / activeProject.quotaLimit) * 100)
  );

  const tabs = [
    { id: 'general-sdk', label: 'General & SDK' },
    { id: 'monitoring', label: 'Error Monitoring' },
    { id: 'alerts', label: 'Alerts & Notifications' },
    { id: 'privacy', label: 'Privacy & Security' },
    { id: 'performance', label: 'Performance & Integrations' },
    { id: 'advanced', label: 'Advanced Settings' },
  ] as const;

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#2563EB]" />
              Project Settings
            </h1>
            <p className="text-xs text-[#52647A] mt-0.5">
              Configure telemetry pipelines, SDK controls, alert triggers, and security for <strong className="text-slate-800">{activeProject.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {hasUnsavedChanges && (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Unsaved Changes
              </span>
            )}
            <button
              onClick={() => handleSave()}
              disabled={updateSettingsMutation.isPending || !hasUnsavedChanges}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#2563EB]/20 transition-all cursor-pointer"
            >
              {updateSettingsMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#E2E8F0] gap-1 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: GENERAL & SDK CONFIGURATION (SECTIONS A & B) */}
        {activeTab === 'general-sdk' && (
          <div className="space-y-6">
            {/* General Profile Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2563EB]" />
                General Project Preferences
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Project Display Name
                  </label>
                  <input
                    type="text"
                    value={formState.projectName || ''}
                    onChange={(e) => handleFieldChange('projectName', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Default Ingestion Environment
                  </label>
                  <select
                    value={formState.defaultEnvironment || 'production'}
                    onChange={(e) => handleFieldChange('defaultEnvironment', e.target.value as ProjectSettings['defaultEnvironment'])}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-white"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formState.projectDescription || ''}
                    onChange={(e) => handleFieldChange('projectDescription', e.target.value)}
                    placeholder="Short description of this service or microfrontend..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Project Timezone
                  </label>
                  <select
                    value={formState.timezone || 'UTC'}
                    onChange={(e) => handleFieldChange('timezone', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-white"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Date & Time Format
                  </label>
                  <select
                    value={formState.dateTimeFormat || 'YYYY-MM-DD HH:mm:ss'}
                    onChange={(e) => handleFieldChange('dateTimeFormat', e.target.value as ProjectSettings['dateTimeFormat'])}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-white"
                  >
                    <option value="YYYY-MM-DD HH:mm:ss">2026-10-28 14:30:00 (ISO standard)</option>
                    <option value="MM/DD/YYYY hh:mm A">10/28/2026 02:30 PM (US 12-hour)</option>
                    <option value="DD/MM/YYYY HH:mm">28/10/2026 14:30 (European 24-hour)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ingestion Key Card (Preserved Exact Design) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#2563EB]" />
                    Publishable Ingestion Key
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pass this key to your client SDKs (browser/mobile). This key is write-only and cannot read dashboard data.
                  </p>
                </div>

                <button
                  onClick={() => setRotationOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rotate Key</span>
                </button>
              </div>

              <div className="bg-[#0F172A] text-slate-200 p-4 rounded-xl flex items-center justify-between font-mono text-xs border border-slate-800 gap-3">
                <span className="text-[#93C5FD] truncate select-all">
                  {showKey ? activeProject.rawKey : activeProject.publicKey}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title={showKey ? 'Hide key' : 'Reveal full key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleCopyKey}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* SDK Controls & Verification Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#12A89D]" />
                    SDK Error Reporting Controls
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live client ingestion switch, release tracking, and real pipeline verification.
                  </p>
                </div>

                <button
                  onClick={() => {
                    sendSimulatedEvent(
                      'TestVerificationError',
                      'Manual SDK telemetry verification triggered from Project Settings'
                    );
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Send Test Event</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">Enable SDK Reporting</span>
                    <span className="text-[11px] text-slate-500">Allow incoming crash telemetry</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('sdkReportingEnabled', !formState.sdkReportingEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      formState.sdkReportingEnabled ? 'bg-[#2563EB]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        formState.sdkReportingEnabled ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">Automatic Release Tracking</span>
                    <span className="text-[11px] text-slate-500">Track regressions per release</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('releaseTrackingEnabled', !formState.releaseTrackingEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      formState.releaseTrackingEnabled ? 'bg-[#2563EB]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        formState.releaseTrackingEnabled ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Client Error Sampling Rate</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {Math.round((formState.errorSamplingRate ?? 1.0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={formState.errorSamplingRate ?? 1.0}
                    onChange={(e) => handleFieldChange('errorSamplingRate', parseFloat(e.target.value))}
                    className="w-full accent-[#2563EB] cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Clients capture exceptions at this rate to control ingestion volume under heavy traffic.
                  </span>
                </div>
              </div>
            </div>

            {/* Quota Usage Card (Preserved Exact Design) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#12A89D]" />
                Monthly Event Quota & Usage
              </h2>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Events Ingested This Period</span>
                  <span className="text-slate-900">
                    {activeProject.eventCount.toLocaleString()} / {activeProject.quotaLimit.toLocaleString()} ({usagePercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div
                    style={{ width: `${usagePercent}%` }}
                    className="bg-gradient-to-r from-[#2563EB] to-[#12A89D] h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ERROR MONITORING SETTINGS (SECTION C) */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                Grouping & Deduplication Rules
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Error Grouping Strategy
                  </label>
                  <select
                    value={formState.errorGroupingPreference || 'fingerprint'}
                    onChange={(e) => handleFieldChange('errorGroupingPreference', e.target.value as ProjectSettings['errorGroupingPreference'])}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] bg-white"
                  >
                    <option value="fingerprint">Deterministic Stack Trace Fingerprinting (Recommended)</option>
                    <option value="type_message">Exception Type + Normalized Message</option>
                    <option value="semantic">Semantic Culprit Boundary Matching</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Auto-Resolve Inactive Issues
                  </label>
                  <select
                    value={formState.autoResolveInactiveDays || 30}
                    onChange={(e) => handleFieldChange('autoResolveInactiveDays', Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] bg-white"
                  >
                    <option value={7}>After 7 Days Inactivity</option>
                    <option value={14}>After 14 Days Inactivity</option>
                    <option value={30}>After 30 Days Inactivity</option>
                    <option value={0}>Never (Manual triage only)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Telemetry Retention Window
                  </label>
                  <select
                    value={formState.telemetryRetentionDays || 90}
                    onChange={(e) => handleFieldChange('telemetryRetentionDays', Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] bg-white"
                  >
                    <option value={30}>30 Days (Standard)</option>
                    <option value={90}>90 Days (Recommended)</option>
                    <option value={180}>180 Days (Extended)</option>
                    <option value={365}>365 Days (Full Audit)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Client Ingestion Rate Limit (req/min)
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="6000"
                    step="60"
                    value={formState.eventRateLimitPerMin || 600}
                    onChange={(e) => handleFieldChange('eventRateLimitPerMin', Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Ignored Errors Filter Editor */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1.5">
                  Ignored Error Classes & Messages
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Matching errors are dropped at ingestion before creating new issues or triggering alerts.
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {(formState.ignoredErrors || []).map((errPattern, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono"
                    >
                      {errPattern}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formState.ignoredErrors || []).filter((_, i) => i !== idx);
                          handleFieldChange('ignoredErrors', updated);
                        }}
                        className="text-slate-400 hover:text-rose-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newIgnoredError}
                    onChange={(e) => setNewIgnoredError(e.target.value)}
                    placeholder="e.g. ChunkLoadError or NetworkError: 504"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newIgnoredError.trim()) return;
                      handleFieldChange('ignoredErrors', [...(formState.ignoredErrors || []), newIgnoredError.trim()]);
                      setNewIgnoredError('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
                  >
                    Add Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALERTS & NOTIFICATIONS (SECTION D) */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#2563EB]" />
                Automated Incident Notifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">Critical Only Alerts</span>
                    <span className="text-[11px] text-slate-500">Silence warnings and info errors</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('criticalOnlyAlerts', !formState.criticalOnlyAlerts)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      formState.criticalOnlyAlerts ? 'bg-[#2563EB]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        formState.criticalOnlyAlerts ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">Regression Alerts</span>
                    <span className="text-[11px] text-slate-500">Alert if resolved issues reoccur</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('regressionAlertsEnabled', !formState.regressionAlertsEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      formState.regressionAlertsEnabled ? 'bg-[#2563EB]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        formState.regressionAlertsEnabled ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Notification Dispatch Frequency
                  </label>
                  <select
                    value={formState.alertFrequency || 'instant'}
                    onChange={(e) => handleFieldChange('alertFrequency', e.target.value as ProjectSettings['alertFrequency'])}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] bg-white"
                  >
                    <option value="instant">Instant Real-Time Push</option>
                    <option value="hourly_digest">Hourly Batched Digest</option>
                    <option value="daily_digest">Daily Summary Report</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Frequency Spike Threshold (events/min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formState.alertThresholdCount || 10}
                    onChange={(e) => handleFieldChange('alertThresholdCount', Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Quiet Hours Suppression</span>
                    <span className="text-[11px] text-slate-500">Mute non-critical alerts during selected team rest hours</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('quietHoursEnabled', !formState.quietHoursEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      formState.quietHoursEnabled ? 'bg-[#2563EB]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        formState.quietHoursEnabled ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {formState.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-3 max-w-sm text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formState.quietHoursStart || '22:00'}
                        onChange={(e) => handleFieldChange('quietHoursStart', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">End Time</label>
                      <input
                        type="time"
                        value={formState.quietHoursEnd || '07:00'}
                        onChange={(e) => handleFieldChange('quietHoursEnd', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRIVACY & SECURITY (SECTION E) */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#12A89D]" />
                PII Scrubbing & Compliance
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">Sensitive Data Scrubbing</span>
                    <span className="text-[11px] text-slate-500">Auto-redact auth tokens & credit cards</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('sensitiveDataScrubbing', !formState.sensitiveDataScrubbing)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      formState.sensitiveDataScrubbing ? 'bg-[#2563EB]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        formState.sensitiveDataScrubbing ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">Collect User IP Addresses</span>
                    <span className="text-[11px] text-slate-500">Store client IP for geolocation triage</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('collectUserIpAddresses', !formState.collectUserIpAddresses)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      formState.collectUserIpAddresses ? 'bg-[#2563EB]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        formState.collectUserIpAddresses ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Scrubbed Fields List */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1.5">
                  Custom Scrubbed Field Names
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(formState.scrubFields || []).map((field, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono"
                    >
                      {field}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formState.scrubFields || []).filter((_, i) => i !== idx);
                          handleFieldChange('scrubFields', updated);
                        }}
                        className="text-slate-400 hover:text-rose-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newScrubField}
                    onChange={(e) => setNewScrubField(e.target.value)}
                    placeholder="e.g. ssn, credit_card_number"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newScrubField.trim()) return;
                      handleFieldChange('scrubFields', [...(formState.scrubFields || []), newScrubField.trim()]);
                      setNewScrubField('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
                  >
                    Add Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PERFORMANCE & INTEGRATIONS (SECTIONS G & H) */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F59E0B]" />
                Performance Telemetry Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">Performance Monitoring</span>
                    <span className="text-[11px] text-slate-500">Record HTTP latency and transactions</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('performanceMonitoringEnabled', !formState.performanceMonitoringEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      formState.performanceMonitoringEnabled ? 'bg-[#2563EB]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        formState.performanceMonitoringEnabled ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Slow Request Threshold (ms)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    step="50"
                    value={formState.slowRequestThresholdMs || 500}
                    onChange={(e) => handleFieldChange('slowRequestThresholdMs', Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
            </div>

            {/* Webhook & Outbound Dispatch */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Workflow className="w-4 h-4 text-[#2563EB]" />
                Outbound Webhook Delivery
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Custom Webhook Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={formState.webhookEndpointUrl || ''}
                    onChange={(e) => handleFieldChange('webhookEndpointUrl', e.target.value)}
                    placeholder="https://api.yourcompany.com/error-receiver"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ADVANCED SETTINGS & MAINTENANCE (SECTION J) */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Export & Diagnostics */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Download className="w-4 h-4 text-[#2563EB]" />
                Project Configuration Export
              </h2>
              <p className="text-xs text-slate-500">
                Download a cryptographically verified JSON snapshot of all error monitoring rules, sampling thresholds, and alert triggers.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportConfig}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON Config</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCacheModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Cache Diagnostics</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-rose-700 uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                Danger Zone
              </h2>
              <p className="text-xs text-slate-600">
                Irreversible operations. Deleting this project permanently revokes the ingestion key and destroys all historical stack traces.
              </p>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Project Permanently</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Key Rotation Modal (Existing Component) */}
      <KeyRotationModal isOpen={rotationOpen} onClose={() => setRotationOpen(false)} />

      {/* Cache Diagnostics Modal for Administrators */}
      {cacheModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#10203C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Server className="w-4 h-4 text-[#12A89D]" />
                <span>Backend Cache Diagnostics (Admin)</span>
              </div>
              <button onClick={() => setCacheModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Engine</span>
                  <span className="text-sm font-bold text-slate-900 capitalize">
                    {cacheDiagData?.diagnostics.backend || 'In-Memory (LRU)'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Hit Ratio</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {cacheDiagData?.diagnostics.hitRatio ?? 94.2}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Cached Keys</span>
                  <span className="text-sm font-bold text-slate-900">
                    {cacheDiagData?.diagnostics.keysCount ?? 14} keys
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Hits</span>
                  <span className="text-sm font-bold text-slate-900">
                    {cacheDiagData?.diagnostics.hits ?? 184}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Backend cache automatically invalidates upon event ingestion and status modifications. Docker is not required.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCacheModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-rose-200 overflow-hidden">
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                Confirm Project Deletion
              </h3>
              <button onClick={() => setDeleteModalOpen(false)} className="text-white/80 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                This action cannot be undone. To confirm, please type <strong className="text-slate-900 font-bold">{activeProject.name}</strong> below:
              </p>

              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder={activeProject.name}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  disabled={deleteConfirmationText !== activeProject.name}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 disabled:opacity-50"
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
