'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import {
  Building2,
  Users,
  UserPlus,
  Shield,
  Trash2,
  Mail,
  X,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function OrgSettingsPage() {
  const { org, members, addMember, showToast } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [retentionDays, setRetentionDays] = useState(90);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    addMember(inviteName, inviteEmail, inviteRole);
    setInviteEmail('');
    setInviteName('');
    setInviteOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#2563EB]" />
            Organization Settings
          </h1>
          <p className="text-xs text-[#52647A] mt-0.5">
            Manage organization members, RBAC permissions, and telemetry retention for <strong className="text-slate-800">{org.name}</strong>
          </p>
        </div>

        {/* Organization Information Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Organization Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Display Name
              </label>
              <input
                type="text"
                disabled
                value={org.name}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Tenant Slug
              </label>
              <input
                type="text"
                disabled
                value={org.slug}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2563EB]" />
                Team Members ({members.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Users with access to project dashboards, issue triaging, and alert settings.
              </p>
            </div>

            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-[#2563EB]/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div
                key={member.id}
                className="py-3.5 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#12A89D] flex items-center justify-center font-bold text-xs text-white">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{member.name}</span>
                    <span className="text-slate-500 text-[11px]">{member.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      member.role === 'owner'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : member.role === 'admin'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {member.role}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Retention & Privacy Policy */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#12A89D]" />
            Data Retention & Privacy
          </h2>
          <p className="text-xs text-slate-500">
            Raw telemetry payloads, breadcrumbs, and stack trace events are automatically purged after this window.
          </p>

          <div className="flex items-center gap-3 max-w-xs">
            <select
              value={retentionDays}
              onChange={(e) => {
                setRetentionDays(Number(e.target.value));
                showToast(`Data retention updated to ${e.target.value} days`);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value={30}>30 Days (Basic)</option>
              <option value={90}>90 Days (Pro default)</option>
              <option value={180}>180 Days (Extended)</option>
              <option value={365}>365 Days (Enterprise Compliance)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#10203C] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Invite Team Member</h3>
              <button onClick={() => setInviteOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@acme.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role & Permissions</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="member">Member (View data & resolve issues)</option>
                  <option value="admin">Admin (Manage projects, keys, and alerts)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2563EB] text-white font-bold hover:bg-[#1D4ED8]"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
