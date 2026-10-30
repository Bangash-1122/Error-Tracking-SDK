'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import {
  useOrgSettingsQuery,
  useUpdateOrgSettingsMutation,
  useMembersQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
} from '@/lib/queries';
import { OrganizationSettings, TeamMember } from '@/types';
import {
  Building2,
  Users,
  UserPlus,
  Trash2,
  X,
  Lock,
  RefreshCw,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function OrgSettingsPage() {
  const { org, showToast } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer' | 'member'>('developer');
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  // TanStack Query: Org Settings & Members
  const { data: orgSettingsData } = useOrgSettingsQuery(org.id);
  const updateOrgSettingsMutation = useUpdateOrgSettingsMutation();
  const { data: membersData } = useMembersQuery(org.id);
  const inviteMemberMutation = useInviteMemberMutation();
  const removeMemberMutation = useRemoveMemberMutation();

  const [formOverrides, setFormOverrides] = useState<Partial<OrganizationSettings>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const formState: Partial<OrganizationSettings> = {
    ...orgSettingsData?.settings,
    ...formOverrides,
  };

  const members = membersData?.members || [];

  const handleFieldChange = <K extends keyof OrganizationSettings>(key: K, value: OrganizationSettings[K]) => {
    setFormOverrides((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await updateOrgSettingsMutation.mutateAsync({
        orgId: org.id,
        settings: formState,
      });
      setFormOverrides({});
      setHasUnsavedChanges(false);
      showToast('Organization settings saved successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      showToast(`Error saving settings: ${msg}`);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    try {
      await inviteMemberMutation.mutateAsync({
        organizationId: org.id,
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
      showToast(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteName('');
      setInviteOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invitation failed';
      showToast(`Invitation error: ${msg}`);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMemberMutation.mutateAsync({
        orgId: org.id,
        memberId: memberToRemove.id,
      });
      showToast(`Removed ${memberToRemove.name} from organization`);
      setMemberToRemove(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove member';
      showToast(`Error: ${msg}`);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#2563EB]" />
              Organization Settings
            </h1>
            <p className="text-xs text-[#52647A] mt-0.5">
              Manage organization members, RBAC permissions, and telemetry retention for <strong className="text-slate-800">{org.name}</strong>
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
              disabled={updateOrgSettingsMutation.isPending || !hasUnsavedChanges}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#2563EB]/20 transition-all cursor-pointer"
            >
              {updateOrgSettingsMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{updateOrgSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
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
                value={formState.orgName || org.name}
                onChange={(e) => handleFieldChange('orgName', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold focus:ring-2 focus:ring-[#2563EB]"
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
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Billing & Security Contact Email
              </label>
              <input
                type="email"
                value={formState.billingEmail || 'billing@acme.com'}
                onChange={(e) => handleFieldChange('billingEmail', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Compliance Tier
              </label>
              <select
                value={formState.complianceTier || 'soc2'}
                onChange={(e) => handleFieldChange('complianceTier', e.target.value as OrganizationSettings['complianceTier'])}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="standard">Standard Commercial</option>
                <option value="soc2">SOC2 Type II Certified</option>
                <option value="gdpr">GDPR Privacy Shield</option>
                <option value="hipaa">HIPAA BAA Healthcare</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team Members List (Section F: Team & Permissions) */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2563EB]" />
                Team Members ({members.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Role-based access control (RBAC): Administrators, Developers, and Viewers.
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
                  <div className="w-9 h-9 rounded-full bg-linear-to-tr from-[#2563EB] to-[#12A89D] flex items-center justify-center font-bold text-xs text-white">
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
                        : member.role === 'developer'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {member.role}
                  </span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>

                  {member.role !== 'owner' && (
                    <button
                      type="button"
                      onClick={() => setMemberToRemove(member)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Retention & Privacy Policy */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#12A89D]" />
            Organization Security & Data Retention
          </h2>
          <p className="text-xs text-slate-500">
            Raw telemetry payloads, breadcrumbs, and stack trace events are automatically purged after this window.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Data Retention Window
              </label>
              <select
                value={formState.defaultDataRetentionDays || 90}
                onChange={(e) => handleFieldChange('defaultDataRetentionDays', Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value={30}>30 Days (Basic)</option>
                <option value={90}>90 Days (Pro default)</option>
                <option value={180}>180 Days (Extended)</option>
                <option value={365}>365 Days (Enterprise Compliance)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block">Enforce Two-Factor Authentication</span>
                <span className="text-[11px] text-slate-500">Require 2FA for all organization members</span>
              </div>
              <button
                type="button"
                onClick={() => handleFieldChange('enforceMfa', !formState.enforceMfa)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  formState.enforceMfa ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    formState.enforceMfa ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
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
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'developer' | 'viewer')}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="admin">Administrator (Manage projects, keys, billing, and alerts)</option>
                  <option value="developer">Developer (Triage issues, create releases, view performance)</option>
                  <option value="viewer">Viewer (Read-only dashboard access)</option>
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
                  disabled={inviteMemberMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-[#2563EB] text-white font-bold hover:bg-[#1D4ED8] disabled:opacity-50"
                >
                  {inviteMemberMutation.isPending ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Remove Team Member
              </h3>
              <button onClick={() => setMemberToRemove(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Are you sure you want to revoke access for <strong className="text-slate-900 font-bold">{memberToRemove.name}</strong> ({memberToRemove.email})?
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMemberToRemove(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRemoveMember}
                  disabled={removeMemberMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 disabled:opacity-50"
                >
                  {removeMemberMutation.isPending ? 'Removing...' : 'Confirm Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
