'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Organization,
  Project,
  Issue,
  EventRecord,
  Release,
  AlertRule,
  AlertDelivery,
  TeamMember,
  Subscription,
  IssueStatus,
} from '../types';
import {
  INITIAL_ORG,
  INITIAL_PROJECTS,
  INITIAL_ISSUES,
  SAMPLE_EVENT_RECORD,
  INITIAL_RELEASES,
  INITIAL_ALERT_RULES,
  INITIAL_DELIVERIES,
  INITIAL_MEMBERS,
  INITIAL_SUBSCRIPTION,
} from './mockData';
import { api } from './apiClient';
import { captureException, init as initSdk } from './sdk';

interface AppContextType {
  org: Organization;
  projects: Project[];
  activeProject: Project;
  setActiveProject: (p: Project) => void;
  issues: Issue[];
  activeTimeRange: string;
  setActiveTimeRange: (range: string) => void;
  activeEnvironment: string;
  setActiveEnvironment: (env: string) => void;
  updateIssueStatus: (issueId: string, status: IssueStatus) => void;
  bulkUpdateStatus: (issueIds: string[], status: IssueStatus) => void;
  assignIssue: (issueId: string, userId: string | null) => void;
  releases: Release[];
  alertRules: AlertRule[];
  deliveries: AlertDelivery[];
  toggleAlertRule: (ruleId: string) => void;
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => void;
  members: TeamMember[];
  addMember: (name: string, email: string, role: TeamMember['role']) => void;
  subscription: Subscription;
  updatePlan: (plan: Subscription['plan']) => void;
  rotateActiveKey: () => string;
  sendSimulatedEvent: (errorType: string, message: string) => Promise<EventRecord>;
  getEventForIssue: (issueId: string) => EventRecord;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshData: () => Promise<void>;
  currentUser: { id: string; name: string; email: string } | null;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<Organization>(INITIAL_ORG);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project>(INITIAL_PROJECTS[0]);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [activeTimeRange, setActiveTimeRange] = useState<string>('24h');
  const [activeEnvironment, setActiveEnvironment] = useState<string>('all');
  const [releases, setReleases] = useState<Release[]>(INITIAL_RELEASES);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(INITIAL_ALERT_RULES);
  const [deliveries, setDeliveries] = useState<AlertDelivery[]>(INITIAL_DELIVERIES);
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [subscription, setSubscription] = useState<Subscription>(INITIAL_SUBSCRIPTION);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>({
    id: 'usr_admin_01',
    name: 'Admin User',
    email: 'admin@acme.com',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize SDK for active project
  useEffect(() => {
    if (activeProject?.rawKey) {
      initSdk({
        projectKey: activeProject.rawKey,
        environment: activeEnvironment === 'all' ? 'production' : activeEnvironment,
        release: releases[0]?.version || 'v1.3.2',
        endpoint: '/api/v1/events',
      });
    }
  }, [activeProject, activeEnvironment, releases]);

  // Synchronize state with real backend API
  const refreshData = useCallback(async () => {
    try {
      // Fetch me
      const meRes = await api.getMe().catch(() => null);
      if (meRes?.authenticated && meRes.user) {
        setCurrentUser(meRes.user);
        if (meRes.organizations?.[0]?.org) {
          const o = meRes.organizations[0].org;
          setOrg((prev) => ({
            ...prev,
            id: o.id,
            name: o.name,
            slug: o.slug,
            plan: o.plan,
          }));
        }
      }

      // Fetch projects
      const prjRes = await api.getProjects().catch(() => null);
      if (prjRes?.projects && prjRes.projects.length > 0) {
        const formattedProjects: Project[] = prjRes.projects.map((p) => ({
          id: p.id,
          organizationId: p.organizationId || 'org_acme_corp',
          name: p.name,
          slug: p.slug,
          platform: p.platform,
          publicKey: p.slug + '_key...',
          rawKey: 'ek_live_' + p.id.replace(/[^a-z0-9]/g, '') + '9b2c1d4e5f',
          status: (p.status || 'active') as 'active' | 'revoked',
          eventCount: p.eventCount || 0,
          quotaLimit: p.quotaLimit || 100000,
          createdAt: p.createdAt || new Date().toISOString(),
        }));
        setProjects(formattedProjects);
      }

      // Fetch issues from backend
      const issuesRes = await api.getIssues({
        projectId: activeProject.id,
        environment: activeEnvironment,
      }).catch(() => null);

      if (issuesRes?.items && issuesRes.items.length > 0) {
        const backendIssues: Issue[] = issuesRes.items.map((i: any) => ({
          id: i.id,
          projectId: i.projectId,
          fingerprint: i.fingerprint,
          title: i.title,
          culprit: i.culprit,
          type: i.type,
          severity: i.severity || 'error',
          status: i.status,
          count: i.count,
          userCount: i.userCount || 1,
          firstSeen: i.firstSeen,
          lastSeen: i.lastSeen,
          assignedTo: i.assignedTo,
          environment: i.environment,
          release: i.release,
          latestEventId: i.latestEventId || `evt_${i.id}`,
        }));
        setIssues(backendIssues);
      }

      // Fetch releases
      const relRes = await api.getReleases(activeProject.id).catch(() => null);
      if (relRes?.releases && relRes.releases.length > 0) {
        setReleases(relRes.releases);
      }

      // Fetch alerts
      const altRes = await api.getAlerts(activeProject.id).catch(() => null);
      if (altRes?.rules && altRes.rules.length > 0) {
        setAlertRules(altRes.rules);
      }
      if (altRes?.deliveries && altRes.deliveries.length > 0) {
        setDeliveries(altRes.deliveries);
      }

      // Fetch members
      const memRes = await api.getMembers(org.id).catch(() => null);
      if (memRes?.members && memRes.members.length > 0) {
        setMembers(memRes.members);
      }

      // Fetch billing
      const billRes = await api.getBilling(org.id).catch(() => null);
      if (billRes?.subscription) {
        setSubscription(billRes.subscription);
      }
    } catch {
      // Fallback gracefully to default state
    }
  }, [activeProject.id, activeEnvironment, org.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateIssueStatus = async (issueId: string, status: IssueStatus) => {
    // Optimistic UI update
    setIssues((prev) =>
      prev.map((iss) => (iss.id === issueId ? { ...iss, status } : iss))
    );
    showToast(`Issue ${status === 'resolved' ? 'marked as resolved' : status === 'ignored' ? 'ignored' : 'reopened'}`);

    try {
      await api.patchIssue(issueId, { status });
    } catch (err: any) {
      showToast(`Failed to update issue: ${err.message}`);
      refreshData();
    }
  };

  const bulkUpdateStatus = async (issueIds: string[], status: IssueStatus) => {
    // Optimistic UI update
    setIssues((prev) =>
      prev.map((iss) => (issueIds.includes(iss.id) ? { ...iss, status } : iss))
    );
    showToast(`${issueIds.length} issues updated to ${status}`);

    try {
      await api.bulkUpdateIssues(issueIds, status);
    } catch (err: any) {
      showToast(`Bulk update failed: ${err.message}`);
      refreshData();
    }
  };

  const assignIssue = async (issueId: string, userId: string | null) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === issueId ? { ...iss, assignedTo: userId } : iss))
    );
    showToast('Assignee updated');

    try {
      await api.patchIssue(issueId, { assignedTo: userId });
    } catch (err: any) {
      showToast(`Failed to assign: ${err.message}`);
      refreshData();
    }
  };

  const toggleAlertRule = async (ruleId: string) => {
    setAlertRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, status: r.status === 'active' ? 'paused' : 'active' }
          : r
      )
    );
    showToast('Alert rule status toggled');

    try {
      await api.toggleAlertRule(ruleId);
    } catch (err: any) {
      showToast(`Failed to toggle: ${err.message}`);
      refreshData();
    }
  };

  const addAlertRule = async (rule: Omit<AlertRule, 'id' | 'createdAt'>) => {
    const tempId = `alt_${Date.now()}`;
    const newRule: AlertRule = {
      ...rule,
      id: tempId,
      createdAt: new Date().toISOString(),
    };
    setAlertRules((prev) => [newRule, ...prev]);
    showToast('Alert rule created successfully');

    try {
      const res = await api.createAlertRule({
        ...rule,
        projectId: rule.projectId || activeProject.id,
      });
      if (res?.rule) {
        setAlertRules((prev) => prev.map((r) => (r.id === tempId ? res.rule : r)));
      }
    } catch (err: any) {
      showToast(`Failed to save alert rule: ${err.message}`);
    }
  };

  const addMember = async (name: string, email: string, role: TeamMember['role']) => {
    const tempId = `usr_${Date.now()}`;
    const newMember: TeamMember = {
      id: tempId,
      name,
      email,
      role,
      joinedAt: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);
    showToast(`Invitation sent to ${email}`);

    try {
      const res = await api.inviteMember({
        organizationId: org.id,
        name,
        email,
        role,
      });
      if (res?.member) {
        setMembers((prev) => prev.map((m) => (m.id === tempId ? res.member : m)));
      }
    } catch (err: any) {
      showToast(`Invitation error: ${err.message}`);
    }
  };

  const updatePlan = async (plan: Subscription['plan']) => {
    const limits = { free: 10000, pro: 100000, enterprise: 1000000 };
    const costs = { free: 0, pro: 49, enterprise: 199 };
    setSubscription((prev) => ({
      ...prev,
      plan,
      eventLimit: limits[plan],
      costMonthly: costs[plan],
    }));
    setOrg((prev) => ({ ...prev, plan }));
    showToast(`Plan successfully upgraded to ${plan.toUpperCase()}`);

    try {
      await api.updatePlan(org.id, plan);
    } catch (err: any) {
      showToast(`Plan update failed: ${err.message}`);
    }
  };

  const rotateActiveKey = () => {
    const raw = `ek_live_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
    const masked = raw.slice(0, 16) + '...';
    setActiveProject((prev) => ({
      ...prev,
      publicKey: masked,
      rawKey: raw,
    }));
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? { ...p, publicKey: masked, rawKey: raw } : p))
    );
    showToast('Project ingest key rotated successfully');

    // Asynchronously call backend to rotate key
    api.rotateProjectKey(activeProject.id).catch(() => {});
    return raw;
  };

  // Real SDK error ingestion
  const sendSimulatedEvent = async (errorType: string, message: string): Promise<EventRecord> => {
    const syntheticError = new Error(message);
    syntheticError.name = errorType;
    syntheticError.stack = `${errorType}: ${message}\n    at calculateOrderTotal (src/app/checkout/PaymentGateway.tsx:88:14)\n    at processCheckout (src/app/checkout/CheckoutForm.tsx:142:5)`;

    showToast(`Submitting ${errorType} through real SDK pipeline...`);

    try {
      const response = await captureException(syntheticError, {
        tags: {
          environment: activeEnvironment === 'all' ? 'production' : activeEnvironment,
          release: releases[0]?.version || 'v1.3.2',
          section: 'checkout',
          tier: 'enterprise',
        },
      });

      showToast(`SDK Event Accepted! Event ID: ${response.eventId.slice(0, 8)}...`);

      // Refresh real issues from backend
      await refreshData();

      return {
        ...SAMPLE_EVENT_RECORD,
        id: response.eventId,
        eventId: response.eventId,
        issueId: (response as any).issueId || `iss_${Date.now()}`,
        exception: {
          type: errorType,
          value: message,
          handled: false,
        },
        occurredAt: response.receivedAt,
      };
    } catch (err: any) {
      showToast(`Ingestion error: ${err.message}`);
      throw err;
    }
  };

  const getEventForIssue = (issueId: string): EventRecord => {
    const foundIssue = issues.find((i) => i.id === issueId);
    return {
      ...SAMPLE_EVENT_RECORD,
      issueId,
      exception: {
        type: foundIssue?.type || 'TypeError',
        value: foundIssue?.title.split(': ')[1] || 'An error occurred',
        handled: false,
      },
    };
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // continue
    }
    window.location.href = '/login';
  };

  return (
    <AppContext.Provider
      value={{
        org,
        projects,
        activeProject,
        setActiveProject,
        issues,
        activeTimeRange,
        setActiveTimeRange,
        activeEnvironment,
        setActiveEnvironment,
        updateIssueStatus,
        bulkUpdateStatus,
        assignIssue,
        releases,
        alertRules,
        deliveries,
        toggleAlertRule,
        addAlertRule,
        members,
        addMember,
        subscription,
        updatePlan,
        rotateActiveKey,
        sendSimulatedEvent,
        getEventForIssue,
        toastMessage,
        showToast,
        refreshData,
        currentUser,
        logout,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#10203C] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-[#2563EB]/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-[#12A89D] animate-ping" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
