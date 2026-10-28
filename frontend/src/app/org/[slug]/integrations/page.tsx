'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/lib/apiClient';
import {
  Workflow,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
  Sliders,
  Power,
  RefreshCw,
  X,
} from 'lucide-react';

export default function IntegrationsPage() {
  const { org, activeProject, showToast } = useApp();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [editConfig, setEditConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    api.getIntegrations(org.id)
      .then((data) => {
        if (mounted && data.integrations) setIntegrations(data.integrations);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [org.id]);

  const handleTestConnection = async (item: any) => {
    setTestingId(item.id);
    const dest = item.config?.webhookUrl || item.config?.url;
    if (!dest) {
      showToast(`Please configure a destination URL for ${item.name} first`);
      setTestingId(null);
      return;
    }

    try {
      const res = await api.testAlertRule(dest, item.name, activeProject.id);
      if (res.success) {
        showToast(`Connection to ${item.name} succeeded! Status: OK`);
      } else {
        showToast(`Connection test failed: ${res.message}`);
      }
    } catch (err: any) {
      showToast(`Connection error: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleToggle = async (item: any) => {
    const newStatus = item.status === 'connected' ? 'disconnected' : 'connected';
    setIntegrations((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
    );
    showToast(`${item.name} ${newStatus === 'connected' ? 'enabled' : 'disabled'}`);
    api.updateIntegration(org.id, item.id, item.config, newStatus).catch(() => {});
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setIntegrations((prev) =>
      prev.map((i) => (i.id === editModal.id ? { ...i, config: { ...i.config, ...editConfig } } : i))
    );
    showToast(`${editModal.name} settings saved`);
    await api.updateIntegration(org.id, editModal.id, editConfig, editModal.status).catch(() => {});
    setEditModal(null);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Workflow className="w-6 h-6 text-[#2563EB]" />
            Developer Integrations & Webhooks
          </h1>
          <p className="text-xs text-[#52647A] mt-0.5">
            Connect incident workflows, ticketing queues, and notifications for <strong className="text-slate-800">{org.name}</strong>
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(integrations.length > 0 ? integrations : [
            {
              id: 'int_slack',
              type: 'slack',
              name: 'Slack Notifications',
              status: 'connected',
              config: { channel: '#engineering-alerts', webhookUrl: 'https://hooks.slack.com/services/T00/B00/X00' },
              description: 'Broadcast instant exception alerts and regression spikes into team Slack channels.',
            },
            {
              id: 'int_github',
              type: 'github',
              name: 'GitHub Issue Sync',
              status: 'connected',
              config: { repo: 'acme-corp/storefront-web', autoCreateIssues: 'true' },
              description: 'Automatically file tracked issues and regressions directly into your GitHub repository.',
            },
            {
              id: 'int_webhook',
              type: 'webhook',
              name: 'Generic Ingress Webhooks',
              status: 'connected',
              config: { url: 'https://api.acme.com/webhooks/ops-pager' },
              description: 'Deliver signed JSON envelopes to custom endpoints, PagerDuty, or Discord bots.',
            },
          ]).map((item) => {
            const isConnected = item.status === 'connected';
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{item.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isConnected
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description || 'Deliver telemetry events and incident updates to this destination.'}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 truncate">
                    {item.config?.webhookUrl || item.config?.url || item.config?.repo || 'Not configured'}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggle(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Power className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isConnected ? 'Disable' : 'Enable'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditModal(item);
                        setEditConfig(item.config || {});
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                      title="Edit settings"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleTestConnection(item)}
                      disabled={testingId === item.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                    >
                      {testingId === item.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Test</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Configuration Modal */}
        {editModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Configure {editModal.name}</h3>
                <button
                  onClick={() => setEditModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                {editModal.type === 'slack' && (
                  <>
                    <div>
                      <label className="font-bold text-slate-700 uppercase block mb-1">Slack Channel</label>
                      <input
                        type="text"
                        value={editConfig.channel || ''}
                        onChange={(e) => setEditConfig({ ...editConfig, channel: e.target.value })}
                        placeholder="#engineering-alerts"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 uppercase block mb-1">Webhook URL</label>
                      <input
                        type="url"
                        value={editConfig.webhookUrl || ''}
                        onChange={(e) => setEditConfig({ ...editConfig, webhookUrl: e.target.value })}
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </>
                )}

                {editModal.type === 'github' && (
                  <div>
                    <label className="font-bold text-slate-700 uppercase block mb-1">GitHub Repository</label>
                    <input
                      type="text"
                      value={editConfig.repo || ''}
                      onChange={(e) => setEditConfig({ ...editConfig, repo: e.target.value })}
                      placeholder="owner/repo"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                )}

                {editModal.type === 'webhook' && (
                  <div>
                    <label className="font-bold text-slate-700 uppercase block mb-1">Target Webhook URL</label>
                    <input
                      type="url"
                      value={editConfig.url || ''}
                      onChange={(e) => setEditConfig({ ...editConfig, url: e.target.value })}
                      placeholder="https://api.yourcompany.com/webhook"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModal(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#2563EB]/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
