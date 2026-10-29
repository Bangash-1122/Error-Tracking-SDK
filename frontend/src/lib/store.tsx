'use client';

import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
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
  User,
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
import {
  useUiStore,
  useProjectStore,
  useAuthStore,
  useSidebarCollapsed,
  useMobileDrawerOpen,
  useActiveTimeRange,
  useActiveEnvironment,
  useToastMessage,
  useShowToast,
  useActiveProject,
  useSetActiveProject,
  useCurrentUser,
  useCurrentOrg,
} from './stores';
import {
  useProjectsQuery,
  useIssuesQuery,
  useReleasesQuery,
  useAlertsQuery,
  useMembersQuery,
  useBillingQuery,
  useUpdateIssueMutation,
  useBulkUpdateIssuesMutation,
  useToggleAlertRuleMutation,
  useCreateAlertRuleMutation,
  useInviteMemberMutation,
  useUpdatePlanMutation,
  useRotateKeyMutation,
  useAuthQuery,
} from './queries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queries/keys';

// Re-export modular Zustand stores and selectors for direct, re-render-optimized consumption
export * from './stores';

export interface AppContextType {
  org: Organization;
  projects: Project[];
  activeProject: Project;
  setActiveProject: (p: Project) => void;
  issues: Issue[];
  activeTimeRange: string;
  setActiveTimeRange: (range: string) => void;
  activeEnvironment: string;
  setActiveEnvironment: (env: string) => void;
  updateIssueStatus: (issueId: string, status: IssueStatus) => Promise<void>;
  bulkUpdateStatus: (issueIds: string[], status: IssueStatus) => Promise<void>;
  assignIssue: (issueId: string, userId: string | null) => Promise<void>;
  releases: Release[];
  alertRules: AlertRule[];
  deliveries: AlertDelivery[];
  toggleAlertRule: (ruleId: string) => Promise<void>;
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => Promise<void>;
  members: TeamMember[];
  addMember: (name: string, email: string, role: TeamMember['role']) => Promise<void>;
  subscription: Subscription;
  updatePlan: (plan: Subscription['plan']) => Promise<void>;
  rotateActiveKey: () => string;
  sendSimulatedEvent: (errorType: string, message: string) => Promise<EventRecord>;
  getEventForIssue: (issueId: string) => EventRecord;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshData: () => Promise<void>;
  currentUser: User | null;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Zustand Stores
  const {
    activeTimeRange,
    setActiveTimeRange,
    activeEnvironment,
    setActiveEnvironment,
    toastMessage,
    showToast,
  } = useUiStore();

  const { activeProject, setActiveProject } = useProjectStore();
  const { currentUser, setCurrentUser, currentOrg, setCurrentOrg } = useAuthStore();

  // TanStack Query: Server State Queries
  const { data: authData } = useAuthQuery();
  const { data: projectsData } = useProjectsQuery(currentOrg.id);
  const { data: issuesData } = useIssuesQuery({
    projectId: activeProject?.id,
    environment: activeEnvironment,
  });
  const { data: releasesData } = useReleasesQuery(activeProject?.id);
  const { data: alertsData } = useAlertsQuery(activeProject?.id);
  const { data: membersData } = useMembersQuery(currentOrg.id);
  const { data: billingData } = useBillingQuery(currentOrg.id);

  // TanStack Query: Mutations
  const updateIssueMutation = useUpdateIssueMutation();
  const bulkUpdateMutation = useBulkUpdateIssuesMutation();
  const toggleAlertMutation = useToggleAlertRuleMutation();
  const createAlertMutation = useCreateAlertRuleMutation();
  const inviteMemberMutation = useInviteMemberMutation();
  const updatePlanMutation = useUpdatePlanMutation();
  const rotateKeyMutation = useRotateKeyMutation();

  // Sync authenticated user into Zustand auth store
  useEffect(() => {
    if (authData?.authenticated && authData.user) {
      setCurrentUser(authData.user);
      if (authData.organizations?.[0]?.org) {
        const o = authData.organizations[0].org;
        setCurrentOrg({
          id: o.id,
          name: o.name,
          slug: o.slug,
          plan: o.plan,
          createdAt: o.createdAt || INITIAL_ORG.createdAt,
        });
      }
    }
  }, [authData, setCurrentUser, setCurrentOrg]);

  // Sync projects from server
  const projects = useMemo(() => {
    if (projectsData?.projects && projectsData.projects.length > 0) {
      return projectsData.projects;
    }
    return INITIAL_PROJECTS;
  }, [projectsData]);

  // Update active project if needed
  useEffect(() => {
    if (projects.length > 0 && !projects.some((p) => p.id === activeProject?.id)) {
      setActiveProject(projects[0]);
    }
  }, [projects, activeProject, setActiveProject]);

  // Sync issues from server
  const issues = useMemo(() => {
    if (issuesData?.items && issuesData.items.length > 0) {
      return issuesData.items;
    }
    return INITIAL_ISSUES;
  }, [issuesData]);

  // Sync releases from server
  const releases = useMemo(() => {
    if (releasesData?.releases && releasesData.releases.length > 0) {
      return releasesData.releases;
    }
    return INITIAL_RELEASES;
  }, [releasesData]);

  // Sync alert rules & deliveries from server
  const alertRules = useMemo(() => {
    if (alertsData?.rules && alertsData.rules.length > 0) {
      return alertsData.rules;
    }
    return INITIAL_ALERT_RULES;
  }, [alertsData]);

  const deliveries = useMemo(() => {
    if (alertsData?.deliveries && alertsData.deliveries.length > 0) {
      return alertsData.deliveries;
    }
    return INITIAL_DELIVERIES;
  }, [alertsData]);

  // Sync members from server
  const members = useMemo(() => {
    if (membersData?.members && membersData.members.length > 0) {
      return membersData.members;
    }
    return INITIAL_MEMBERS;
  }, [membersData]);

  // Sync subscription from server
  const subscription = useMemo(() => {
    if (billingData?.subscription) {
      return billingData.subscription;
    }
    return INITIAL_SUBSCRIPTION;
  }, [billingData]);

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

  // Manually refresh all active queries
  const refreshData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.releases.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
    ]);
  }, [queryClient]);

  // Actions
  const updateIssueStatus = async (issueId: string, status: IssueStatus) => {
    showToast(`Issue ${status === 'resolved' ? 'marked as resolved' : status === 'ignored' ? 'ignored' : 'reopened'}`);
    try {
      await updateIssueMutation.mutateAsync({ issueId, patch: { status } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed to update issue: ${msg}`);
    }
  };

  const bulkUpdateStatus = async (issueIds: string[], status: IssueStatus) => {
    showToast(`${issueIds.length} issues updated to ${status}`);
    try {
      await bulkUpdateMutation.mutateAsync({ issueIds, status });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Bulk update failed: ${msg}`);
    }
  };

  const assignIssue = async (issueId: string, userId: string | null) => {
    showToast('Assignee updated');
    try {
      await updateIssueMutation.mutateAsync({ issueId, patch: { assignedTo: userId } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed to assign: ${msg}`);
    }
  };

  const toggleAlertRule = async (ruleId: string) => {
    showToast('Alert rule status toggled');
    try {
      await toggleAlertMutation.mutateAsync(ruleId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed to toggle: ${msg}`);
    }
  };

  const addAlertRule = async (rule: Omit<AlertRule, 'id' | 'createdAt'>) => {
    showToast('Alert rule created successfully');
    try {
      await createAlertMutation.mutateAsync({
        ...rule,
        projectId: rule.projectId || activeProject.id,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed to save alert rule: ${msg}`);
    }
  };

  const addMember = async (name: string, email: string, role: TeamMember['role']) => {
    showToast(`Invitation sent to ${email}`);
    try {
      await inviteMemberMutation.mutateAsync({
        organizationId: currentOrg.id,
        name,
        email,
        role,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Invitation error: ${msg}`);
    }
  };

  const updatePlan = async (plan: Subscription['plan']) => {
    showToast(`Plan successfully upgraded to ${plan.toUpperCase()}`);
    try {
      await updatePlanMutation.mutateAsync({ organizationId: currentOrg.id, plan });
      setCurrentOrg({ ...currentOrg, plan });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Plan update failed: ${msg}`);
    }
  };

  const rotateActiveKey = () => {
    const raw = `ek_live_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
    const masked = raw.slice(0, 16) + '...';
    setActiveProject({
      ...activeProject,
      publicKey: masked,
      rawKey: raw,
    });
    showToast('Project ingest key rotated successfully');
    rotateKeyMutation.mutate(activeProject.id);
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

      // Invalidate issues and analytics cache so fresh telemetry shows up immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
      ]);

      return {
        ...SAMPLE_EVENT_RECORD,
        id: response.eventId,
        eventId: response.eventId,
        issueId: `iss_${Date.now()}`,
        exception: {
          type: errorType,
          value: message,
          handled: false,
        },
        occurredAt: response.receivedAt,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Ingestion error: ${msg}`);
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
        org: currentOrg,
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

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
