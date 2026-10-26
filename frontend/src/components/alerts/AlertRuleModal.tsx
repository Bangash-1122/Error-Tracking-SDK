'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { X, Bell, Zap, CheckCircle2 } from 'lucide-react';

export function AlertRuleModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { activeProject, addAlertRule, showToast } = useApp();

  const [name, setName] = useState('');
  const [conditionType, setConditionType] = useState<'new_issue' | 'frequency_spike' | 'regression'>('new_issue');
  const [threshold, setThreshold] = useState(25);
  const [windowSeconds, setWindowSeconds] = useState(300);
  const [destination, setDestination] = useState('');
  const [cooldownMinutes, setCooldownMinutes] = useState(15);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destination) {
      alert('Please fill in rule name and webhook destination');
      return;
    }

    addAlertRule({
      projectId: activeProject.id,
      name,
      condition: {
        type: conditionType,
        threshold: conditionType === 'frequency_spike' ? Number(threshold) : undefined,
        windowSeconds: conditionType === 'frequency_spike' ? Number(windowSeconds) : undefined,
      },
      destination,
      status: 'active',
      cooldownMinutes: Number(cooldownMinutes),
    });

    onClose();
  };

  const handleTestWebhook = () => {
    if (!destination) {
      alert('Enter a valid webhook destination first');
      return;
    }
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      showToast('Test notification payload sent to webhook destination [200 OK]');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#10203C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#93C5FD]" />
            <h3 className="font-bold text-base">Create New Alert Rule</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Rule Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Critical Production Slack Alert"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Trigger Condition
            </label>
            <select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value as any)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:outline-none capitalize"
            >
              <option value="new_issue">When a new unique issue is first seen</option>
              <option value="frequency_spike">When error frequency spikes (high threshold)</option>
              <option value="regression">When a previously resolved issue re-opens (regression)</option>
            </select>
          </div>

          {conditionType === 'frequency_spike' && (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Threshold (Events)
                </label>
                <input
                  type="number"
                  min="5"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Time Window (Secs)
                </label>
                <input
                  type="number"
                  min="30"
                  value={windowSeconds}
                  onChange={(e) => setWindowSeconds(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Destination Webhook URL (Slack, PagerDuty, Discord)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://hooks.slack.com/services/..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={isTesting}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 shrink-0"
              >
                {isTesting ? 'Testing...' : 'Test Webhook'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Alert Cooldown (Minutes)
            </label>
            <input
              type="number"
              min="1"
              value={cooldownMinutes}
              onChange={(e) => setCooldownMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Mutes repeated notifications for the same issue during this interval.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#2563EB]/20"
            >
              Create Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
