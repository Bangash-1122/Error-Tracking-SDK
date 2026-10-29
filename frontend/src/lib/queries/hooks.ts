'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../apiClient';
import { queryKeys } from './keys';
import {
  IssueStatus,
  AlertRule,
  TeamMember,
  Subscription,
  Integration,
  ProjectSettings,
  OrganizationSettings,
} from '../../types';

// ==================== AUTH ====================

export function useAuthQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => api.getMe(),
    staleTime: 60 * 1000,
    retry: false,
  });
}

// ==================== PROJECTS ====================

export function useProjectsQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.projects.list(orgId),
    queryFn: () => api.getProjects(orgId),
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationId: string; name: string; platform: string }) =>
      api.createProject(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list(variables.organizationId) });
    },
  });
}

export function useRotateKeyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => api.rotateProjectKey(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.settings(projectId) });
    },
  });
}

export function useProjectSettingsQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.settings(projectId),
    queryFn: () => api.getProjectSettings(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

export function useUpdateProjectSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, settings }: { projectId: string; settings: Partial<ProjectSettings> }) =>
      api.updateProjectSettings(projectId, settings),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.projects.settings(variables.projectId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.settings(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

// ==================== ORGANIZATIONS ====================

export function useOrgSettingsQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.orgs.settings(orgId),
    queryFn: () => api.getOrgSettings(orgId),
    enabled: !!orgId,
    staleTime: 30 * 1000,
  });
}

export function useUpdateOrgSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, settings }: { orgId: string; settings: Partial<OrganizationSettings> }) =>
      api.updateOrgSettings(orgId, settings),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.orgs.settings(variables.orgId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.settings(variables.orgId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.detail(variables.orgId) });
    },
  });
}

// ==================== ISSUES ====================

export function useIssuesQuery(filter?: {
  projectId?: string;
  status?: string;
  environment?: string;
  query?: string;
  limit?: number;
  offset?: number;
}) {
  const projectId = filter?.projectId || 'all';
  return useQuery({
    queryKey: queryKeys.issues.list(projectId, filter),
    queryFn: () => api.getIssues(filter),
    enabled: !!filter?.projectId,
    staleTime: 15 * 1000,
  });
}

export function useIssueQuery(issueId: string) {
  return useQuery({
    queryKey: queryKeys.issues.detail(issueId),
    queryFn: () => api.getIssueById(issueId),
    enabled: !!issueId,
  });
}

export function useIssueEventsQuery(issueId: string) {
  return useQuery({
    queryKey: queryKeys.issues.events(issueId),
    queryFn: () => api.getIssueEvents(issueId),
    enabled: !!issueId,
  });
}

export function useUpdateIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      issueId,
      patch,
    }: {
      issueId: string;
      patch: { status?: IssueStatus; assignedTo?: string | null };
    }) => api.patchIssue(issueId, patch),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(variables.issueId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useBulkUpdateIssuesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueIds, status }: { issueIds: string[]; status: IssueStatus }) =>
      api.bulkUpdateIssues(issueIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

// ==================== RELEASES ====================

export function useReleasesQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.releases.list(projectId),
    queryFn: () => api.getReleases(projectId),
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });
}

export function useCreateReleaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, version, ref }: { projectId: string; version: string; ref?: string }) =>
      api.createRelease(projectId, version, ref),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.releases.list(variables.projectId) });
    },
  });
}

// ==================== ALERTS ====================

export function useAlertsQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.alerts.list(projectId),
    queryFn: () => api.getAlerts(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

export function useCreateAlertRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => api.createAlertRule(rule),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.list(variables.projectId) });
    },
  });
}

export function useToggleAlertRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => api.toggleAlertRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });
}

export function useTestAlertRuleMutation() {
  return useMutation({
    mutationFn: ({
      destination,
      ruleName,
      projectId,
    }: {
      destination: string;
      ruleName?: string;
      projectId?: string;
    }) => api.testAlertRule(destination, ruleName, projectId),
  });
}

// ==================== MEMBERS ====================

export function useMembersQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.orgs.members(orgId),
    queryFn: () => api.getMembers(orgId),
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

export function useInviteMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { organizationId: string; name: string; email: string; role: TeamMember['role'] }) =>
      api.inviteMember(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.members(variables.organizationId) });
    },
  });
}

export function useRemoveMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      api.removeMember(orgId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.members(variables.orgId) });
    },
  });
}

// ==================== BILLING ====================

export function useBillingQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.orgs.billing(orgId),
    queryFn: () => api.getBilling(orgId),
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

export function useUpdatePlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, plan }: { organizationId: string; plan: Subscription['plan'] }) =>
      api.updatePlan(organizationId, plan),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.billing(variables.organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.detail(variables.organizationId) });
    },
  });
}

// ==================== ANALYTICS & MONITORING ====================

export function useAnalyticsStatsQuery(projectId?: string, timeRange?: string, environment?: string) {
  const prj = projectId || 'prj_prod_01';
  const range = timeRange || '24h';
  const env = environment || 'all';

  return useQuery({
    queryKey: queryKeys.analytics.stats(prj, range, env),
    queryFn: () => api.getAnalyticsStats(prj, range, env),
    enabled: !!prj,
    staleTime: 20 * 1000,
  });
}

// ==================== PERFORMANCE ====================

export function usePerformanceQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.performance.stats(projectId),
    queryFn: () => api.getPerformance(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

// ==================== SESSIONS ====================

export function useSessionsQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.sessions.list(projectId),
    queryFn: () => api.getSessions(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

// ==================== AUDIT LOGS ====================

export function useAuditLogsQuery(orgId: string, filter?: { actorId?: string; action?: string }) {
  return useQuery({
    queryKey: queryKeys.orgs.auditLogs(orgId, filter),
    queryFn: () => api.getAuditLogs(orgId, filter),
    enabled: !!orgId,
    staleTime: 30 * 1000,
  });
}

// ==================== INTEGRATIONS ====================

export function useIntegrationsQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.orgs.integrations(orgId),
    queryFn: () => api.getIntegrations(orgId),
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

export function useUpdateIntegrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      id,
      config,
      status,
    }: {
      organizationId: string;
      id: string;
      config: Record<string, string>;
      status: Integration['status'];
    }) => api.updateIntegration(organizationId, id, config, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.integrations(variables.organizationId) });
    },
  });
}

// ==================== NOTIFICATIONS ====================

export function useNotificationsQuery(orgId: string) {
  return useQuery({
    queryKey: queryKeys.orgs.notifications(orgId),
    queryFn: () => api.getNotifications(orgId),
    enabled: !!orgId,
    staleTime: 15 * 1000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, organizationId }: { id: string; organizationId?: string }) =>
      api.markNotificationRead(id, organizationId),
    onSuccess: (_, variables) => {
      if (variables.organizationId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.orgs.notifications(variables.organizationId) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all });
      }
    },
  });
}

// ==================== HEALTH & DIAGNOSTICS ====================

export function useSdkHealthQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.sdkHealth(projectId),
    queryFn: () => api.getSdkHealth(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

export function useSystemStatusQuery() {
  return useQuery({
    queryKey: queryKeys.systemStatus.detail(),
    queryFn: () => api.getSystemStatus(),
    staleTime: 15 * 1000,
  });
}

export function useCacheDiagnosticsQuery() {
  return useQuery({
    queryKey: queryKeys.cacheDiagnostics.detail(),
    queryFn: () => api.getCacheDiagnostics(),
    staleTime: 10 * 1000,
  });
}
