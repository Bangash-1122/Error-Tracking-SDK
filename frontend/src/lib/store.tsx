'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  sendSimulatedEvent: (errorType: string, message: string) => EventRecord;
  getEventForIssue: (issueId: string) => EventRecord;
  toastMessage: string | null;
  showToast: (msg: string) => void;
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateIssueStatus = (issueId: string, status: IssueStatus) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === issueId ? { ...iss, status } : iss))
    );
    showToast(`Issue ${status === 'resolved' ? 'marked as resolved' : status === 'ignored' ? 'ignored' : 'reopened'}`);
  };

  const bulkUpdateStatus = (issueIds: string[], status: IssueStatus) => {
    setIssues((prev) =>
      prev.map((iss) => (issueIds.includes(iss.id) ? { ...iss, status } : iss))
    );
    showToast(`${issueIds.length} issues updated to ${status}`);
  };

  const assignIssue = (issueId: string, userId: string | null) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === issueId ? { ...iss, assignedTo: userId } : iss))
    );
    showToast('Assignee updated');
  };

  const toggleAlertRule = (ruleId: string) => {
    setAlertRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, status: r.status === 'active' ? 'paused' : 'active' }
          : r
      )
    );
    showToast('Alert rule status toggled');
  };

  const addAlertRule = (rule: Omit<AlertRule, 'id' | 'createdAt'>) => {
    const newRule: AlertRule = {
      ...rule,
      id: `alt_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAlertRules((prev) => [newRule, ...prev]);
    showToast('Alert rule created successfully');
  };

  const addMember = (name: string, email: string, role: TeamMember['role']) => {
    const newMember: TeamMember = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      joinedAt: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);
    showToast(`Invitation sent to ${email}`);
  };

  const updatePlan = (plan: Subscription['plan']) => {
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
    return raw;
  };

  const sendSimulatedEvent = (errorType: string, message: string) => {
    const newId = `iss_${Date.now()}`;
    const newEventId = `evt_${Date.now()}`;
    const newIssue: Issue = {
      id: newId,
      projectId: activeProject.id,
      fingerprint: `fp-${errorType.toLowerCase()}-${Date.now()}`,
      title: `${errorType}: ${message}`,
      culprit: 'src/app/checkout/PaymentGateway.tsx:88:14',
      type: errorType,
      severity: 'error',
      status: 'unresolved',
      count: 1,
      userCount: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      assignedTo: null,
      environment: 'production',
      release: 'v1.3.2',
      latestEventId: newEventId,
    };

    setIssues((prev) => [newIssue, ...prev]);
    setSubscription((prev) => ({
      ...prev,
      acceptedEvents: prev.acceptedEvents + 1,
      billableEvents: prev.billableEvents + 1,
    }));

    showToast(`Test event ingested! Created issue: ${errorType}`);
    return {
      ...SAMPLE_EVENT_RECORD,
      id: newEventId,
      eventId: `sim_${Date.now()}`,
      issueId: newId,
      exception: {
        type: errorType,
        value: message,
        handled: false,
      },
      occurredAt: new Date().toISOString(),
    };
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
