/**
 * Typed Backend API Client for ErrorPulse Dashboard
 */

import {
  User,
  Organization,
  Project,
  Issue,
  IssueStatus,
  EventRecord,
  Release,
  AlertRule,
  AlertDelivery,
  TeamMember,
  Subscription,
  Invoice,
  AuditLog,
  PerformanceStats,
  Integration,
  NotificationItem,
  AnalyticsStats,
  SdkHealthMetrics,
  ProjectSettings,
  OrganizationSettings,
  CacheDiagnostics,
  UserSession,
  AffectedUser,
} from '../types';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface SystemStatusService {
  name: string;
  status: 'operational' | 'degraded' | 'offline';
  latency: string;
  uptime: string;
}

export interface SystemIncident {
  id: string;
  title: string;
  date: string;
  impact: string;
  status: string;
  duration: string;
}

export interface SystemStatusResponse {
  overallStatus: 'all_systems_operational' | 'partial_outage' | 'major_outage';
  timestamp: string;
  services: SystemStatusService[];
  incidents: SystemIncident[];
  diagnostics: {
    nodeVersion: string;
    heapUsedMb: number;
    uptimeSeconds: number;
    cacheStatus?: string;
  };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error ${res.status}`);
  }

  return (await res.json()) as T;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }): Promise<{ success: boolean; user: User; defaultOrgSlug?: string; organizations?: Organization[]; error?: string }> {
    return request<{ success: boolean; user: User; defaultOrgSlug?: string; organizations?: Organization[]; error?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async signup(data: { name: string; email: string; password: string; orgName: string }): Promise<{ success: boolean; user: User; org?: Organization; project?: Project; ingestKey?: string; error?: string }> {
    return request<{ success: boolean; user: User; org?: Organization; project?: Project; ingestKey?: string; error?: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  async getMe(): Promise<{ authenticated: boolean; user: User | null; organizations: Array<{ org: Organization; role: string }> }> {
    return request<{ authenticated: boolean; user: User | null; organizations: Array<{ org: Organization; role: string }> }>('/api/auth/me');
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetUrl?: string; token?: string }> {
    return request<{ success: boolean; message: string; resetUrl?: string; token?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  // Projects
  async getProjects(orgId?: string): Promise<{ projects: Project[] }> {
    const q = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return request<{ projects: Project[] }>(`/api/v1/projects${q}`);
  },

  async createProject(data: { organizationId: string; name: string; platform: string }): Promise<{ project: Project; key: { id: string; rawKey: string; publicKey: string } }> {
    return request<{ project: Project; key: { id: string; rawKey: string; publicKey: string } }>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async rotateProjectKey(projectId: string): Promise<{ key: { id: string; rawKey: string; publicKey: string }; rawKey: string }> {
    return request<{ key: { id: string; rawKey: string; publicKey: string }; rawKey: string }>(`/api/v1/projects/${projectId}/rotate-key`, {
      method: 'POST',
    });
  },

  async getProjectSettings(projectId: string): Promise<{ settings: ProjectSettings }> {
    return request<{ settings: ProjectSettings }>(`/api/v1/projects/${projectId}/settings`);
  },

  async updateProjectSettings(projectId: string, settings: Partial<ProjectSettings>): Promise<{ settings: ProjectSettings }> {
    return request<{ settings: ProjectSettings }>(`/api/v1/projects/${projectId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  async exportProjectConfig(projectId: string): Promise<{ config: ProjectSettings; exportedAt: string }> {
    return request<{ config: ProjectSettings; exportedAt: string }>(`/api/v1/projects/${projectId}/export`, {
      method: 'POST',
    });
  },

  async deleteProject(projectId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/v1/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  // Organizations
  async getOrgSettings(orgId: string): Promise<{ settings: OrganizationSettings }> {
    return request<{ settings: OrganizationSettings }>(`/api/v1/organizations/${orgId}/settings`);
  },

  async updateOrgSettings(orgId: string, settings: Partial<OrganizationSettings>): Promise<{ settings: OrganizationSettings }> {
    return request<{ settings: OrganizationSettings }>(`/api/v1/organizations/${orgId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  // Issues
  async getIssues(filter?: {
    projectId?: string;
    status?: string;
    environment?: string;
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Issue[]; total: number; hasMore: boolean }> {
    const params = new URLSearchParams();
    if (filter?.projectId) params.set('projectId', filter.projectId);
    if (filter?.status && filter.status !== 'all') params.set('status', filter.status);
    if (filter?.environment && filter.environment !== 'all') params.set('environment', filter.environment);
    if (filter?.query) params.set('query', filter.query);
    if (filter?.limit) params.set('limit', String(filter.limit));
    if (filter?.offset) params.set('offset', String(filter.offset));

    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ items: Issue[]; total: number; hasMore: boolean }>(`/api/v1/issues${qs}`);
  },

  async getIssueById(id: string): Promise<{ issue: Issue; latestEvent: EventRecord | null }> {
    return request<{ issue: Issue; latestEvent: EventRecord | null }>(`/api/v1/issues/${id}`);
  },

  async patchIssue(id: string, patch: { status?: IssueStatus; assignedTo?: string | null }): Promise<{ issue: Issue }> {
    return request<{ issue: Issue }>(`/api/v1/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },

  async bulkUpdateIssues(issueIds: string[], status: IssueStatus): Promise<{ success: boolean; updatedCount: number }> {
    return request<{ success: boolean; updatedCount: number }>('/api/v1/issues', {
      method: 'PATCH',
      body: JSON.stringify({ issueIds, status }),
    });
  },

  async getIssueEvents(issueId: string): Promise<{ events: EventRecord[] }> {
    return request<{ events: EventRecord[] }>(`/api/v1/issues/${issueId}/events`);
  },

  // Ingest
  async ingestEvent(payload: unknown, projectKey?: string): Promise<{ status: string; eventId: string; issueId?: string; receivedAt: string }> {
    return request<{ status: string; eventId: string; issueId?: string; receivedAt: string }>('/api/v1/events', {
      method: 'POST',
      headers: projectKey ? { 'X-Project-Key': projectKey } : undefined,
      body: JSON.stringify(payload),
    });
  },

  // Releases
  async getReleases(projectId?: string): Promise<{ releases: Release[] }> {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<{ releases: Release[] }>(`/api/v1/releases${qs}`);
  },

  async createRelease(projectId: string, version: string, ref?: string): Promise<{ release: Release }> {
    return request<{ release: Release }>('/api/v1/releases', {
      method: 'POST',
      body: JSON.stringify({ projectId, version, ref }),
    });
  },

  // Alerts
  async getAlerts(projectId?: string): Promise<{ rules: AlertRule[]; deliveries: AlertDelivery[] }> {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<{ rules: AlertRule[]; deliveries: AlertDelivery[] }>(`/api/v1/alerts${qs}`);
  },

  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt'>): Promise<{ rule: AlertRule }> {
    return request<{ rule: AlertRule }>('/api/v1/alerts', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  },

  async toggleAlertRule(id: string): Promise<{ rule: AlertRule }> {
    return request<{ rule: AlertRule }>('/api/v1/alerts', {
      method: 'PATCH',
      body: JSON.stringify({ id }),
    });
  },

  async testAlertRule(destination: string, ruleName?: string, projectId?: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/v1/alerts/test', {
      method: 'POST',
      body: JSON.stringify({ destination, ruleName, projectId }),
    });
  },

  // Members
  async getMembers(orgId?: string): Promise<{ members: TeamMember[] }> {
    const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return request<{ members: TeamMember[] }>(`/api/v1/members${qs}`);
  },

  async inviteMember(data: { organizationId: string; name: string; email: string; role: TeamMember['role'] }): Promise<{ member: TeamMember }> {
    return request<{ member: TeamMember }>('/api/v1/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async removeMember(orgId: string, memberId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/v1/members?orgId=${encodeURIComponent(orgId)}&memberId=${encodeURIComponent(memberId)}`, {
      method: 'DELETE',
    });
  },

  // Billing
  async getBilling(orgId?: string): Promise<{ subscription: Subscription; invoices: Invoice[] }> {
    const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return request<{ subscription: Subscription; invoices: Invoice[] }>(`/api/v1/billing${qs}`);
  },

  async updatePlan(organizationId: string, plan: Subscription['plan']): Promise<{ subscription: Subscription }> {
    return request<{ subscription: Subscription }>('/api/v1/billing', {
      method: 'POST',
      body: JSON.stringify({ organizationId, plan }),
    });
  },

  async createCheckout(organizationId: string, plan: Subscription['plan']): Promise<{ url: string; sessionId: string }> {
    return request<{ url: string; sessionId: string }>('/api/v1/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ organizationId, plan }),
    });
  },

  // Analytics
  async getAnalyticsStats(projectId?: string, timeRange?: string, environment?: string): Promise<AnalyticsStats> {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (timeRange) params.set('timeRange', timeRange);
    if (environment) params.set('environment', environment);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<AnalyticsStats>(`/api/v1/analytics/stats${qs}`);
  },

  // Performance
  async getPerformance(projectId?: string): Promise<PerformanceStats> {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<PerformanceStats>(`/api/v1/performance${qs}`);
  },

  // Sessions
  async getSessions(projectId?: string): Promise<{ sessions: UserSession[]; affectedUsers: AffectedUser[] }> {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<{ sessions: UserSession[]; affectedUsers: AffectedUser[] }>(`/api/v1/sessions${qs}`);
  },

  // Audit Logs
  async getAuditLogs(orgId?: string, filter?: { actorId?: string; action?: string }): Promise<{ logs: AuditLog[] }> {
    const params = new URLSearchParams();
    if (orgId) params.set('orgId', orgId);
    if (filter?.actorId) params.set('actorId', filter.actorId);
    if (filter?.action) params.set('action', filter.action);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ logs: AuditLog[] }>(`/api/v1/audit-logs${qs}`);
  },

  // Integrations
  async getIntegrations(orgId?: string): Promise<{ integrations: Integration[] }> {
    const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return request<{ integrations: Integration[] }>(`/api/v1/integrations${qs}`);
  },

  async updateIntegration(organizationId: string, id: string, config: Record<string, string>, status: Integration['status']): Promise<{ integration: Integration }> {
    return request<{ integration: Integration }>('/api/v1/integrations', {
      method: 'POST',
      body: JSON.stringify({ organizationId, id, config, status }),
    });
  },

  async testIntegration(id: string, orgId?: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/v1/integrations/test', {
      method: 'POST',
      body: JSON.stringify({ id, orgId }),
    });
  },

  // Notifications
  async getNotifications(orgId?: string): Promise<{ notifications: NotificationItem[] }> {
    const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return request<{ notifications: NotificationItem[] }>(`/api/v1/notifications${qs}`);
  },

  async markNotificationRead(id: string, organizationId?: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/v1/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ id, organizationId }),
    });
  },

  // Search
  async search(query: string, orgId?: string): Promise<{
    issues: Issue[];
    projects: Project[];
    releases: Release[];
    users: User[];
  }> {
    const params = new URLSearchParams({ q: query });
    if (orgId) params.set('orgId', orgId);
    return request<{
      issues: Issue[];
      projects: Project[];
      releases: Release[];
      users: User[];
    }>(`/api/v1/search?${params.toString()}`);
  },

  // System Status
  async getSystemStatus(): Promise<SystemStatusResponse> {
    return request<SystemStatusResponse>('/api/v1/system-status');
  },

  // Cache Diagnostics
  async getCacheDiagnostics(): Promise<{ diagnostics: CacheDiagnostics }> {
    return request<{ diagnostics: CacheDiagnostics }>('/api/v1/cache-diagnostics');
  },

  // SDK Health
  async getSdkHealth(projectId?: string): Promise<SdkHealthMetrics> {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<SdkHealthMetrics>(`/api/v1/sdk-health${qs}`);
  },
};
