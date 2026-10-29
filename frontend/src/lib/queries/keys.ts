/**
 * Centralized, type-safe TanStack Query Keys
 * Formatted with tenant (orgId) and project (projectId) scope boundaries
 * to guarantee complete tenant isolation and avoid cross-tenant caching.
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  orgs: {
    all: ['orgs'] as const,
    detail: (orgId: string) => [...queryKeys.orgs.all, orgId] as const,
    settings: (orgId: string) => [...queryKeys.orgs.all, orgId, 'settings'] as const,
    members: (orgId: string) => [...queryKeys.orgs.all, orgId, 'members'] as const,
    billing: (orgId: string) => [...queryKeys.orgs.all, orgId, 'billing'] as const,
    auditLogs: (orgId: string, filter?: Record<string, unknown>) =>
      [...queryKeys.orgs.all, orgId, 'auditLogs', filter || {}] as const,
    integrations: (orgId: string) => [...queryKeys.orgs.all, orgId, 'integrations'] as const,
    notifications: (orgId: string) => [...queryKeys.orgs.all, orgId, 'notifications'] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: (orgId: string) => [...queryKeys.projects.all, 'list', orgId] as const,
    detail: (projectId: string) => [...queryKeys.projects.all, 'detail', projectId] as const,
    settings: (projectId: string) => [...queryKeys.projects.all, 'settings', projectId] as const,
    sdkHealth: (projectId: string) => [...queryKeys.projects.all, 'sdkHealth', projectId] as const,
  },
  issues: {
    all: ['issues'] as const,
    list: (projectId: string, filter?: Record<string, unknown>) =>
      [...queryKeys.issues.all, 'list', projectId, filter || {}] as const,
    detail: (issueId: string) => [...queryKeys.issues.all, 'detail', issueId] as const,
    events: (issueId: string) => [...queryKeys.issues.all, 'events', issueId] as const,
  },
  releases: {
    all: ['releases'] as const,
    list: (projectId: string) => [...queryKeys.releases.all, 'list', projectId] as const,
  },
  alerts: {
    all: ['alerts'] as const,
    list: (projectId: string) => [...queryKeys.alerts.all, 'list', projectId] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    stats: (projectId: string, timeRange: string, environment: string) =>
      [...queryKeys.analytics.all, 'stats', projectId, timeRange, environment] as const,
  },
  performance: {
    all: ['performance'] as const,
    stats: (projectId: string) => [...queryKeys.performance.all, 'stats', projectId] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    list: (projectId: string) => [...queryKeys.sessions.all, 'list', projectId] as const,
  },
  systemStatus: {
    all: ['systemStatus'] as const,
    detail: () => [...queryKeys.systemStatus.all, 'detail'] as const,
  },
  cacheDiagnostics: {
    all: ['cacheDiagnostics'] as const,
    detail: () => [...queryKeys.cacheDiagnostics.all, 'detail'] as const,
  },
};
