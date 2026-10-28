/**
 * Typed Backend API Client for ErrorPulse Dashboard
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
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

  return res.json();
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    return request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async signup(data: { name: string; email: string; password: string; orgName: string }) {
    return request<any>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout() {
    return request<any>('/api/auth/logout', { method: 'POST' });
  },

  async getMe() {
    return request<any>('/api/auth/me');
  },

  async forgotPassword(email: string) {
    return request<any>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return request<any>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  // Projects
  async getProjects(orgId?: string) {
    const q = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return request<{ projects: any[] }>(`/api/v1/projects${q}`);
  },

  async createProject(data: { organizationId: string; name: string; platform: string }) {
    return request<any>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async rotateProjectKey(projectId: string) {
    return request<any>(`/api/v1/projects/${projectId}/rotate-key`, {
      method: 'POST',
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
  }) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.set('projectId', filter.projectId);
    if (filter?.status && filter.status !== 'all') params.set('status', filter.status);
    if (filter?.environment && filter.environment !== 'all') params.set('environment', filter.environment);
    if (filter?.query) params.set('query', filter.query);
    if (filter?.limit) params.set('limit', String(filter.limit));
    if (filter?.offset) params.set('offset', String(filter.offset));

    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ items: any[]; total: number; hasMore: boolean }>(`/api/v1/issues${qs}`);
  },

  async getIssueById(id: string) {
    return request<{ issue: any; latestEvent: any }>(`/api/v1/issues/${id}`);
  },

  async patchIssue(id: string, patch: { status?: string; assignedTo?: string | null }) {
    return request<any>(`/api/v1/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },

  async bulkUpdateIssues(issueIds: string[], status: string) {
    return request<any>('/api/v1/issues', {
      method: 'PATCH',
      body: JSON.stringify({ issueIds, status }),
    });
  },

  async getIssueEvents(issueId: string) {
    return request<{ events: any[] }>(`/api/v1/issues/${issueId}/events`);
  },

  // Ingest
  async ingestEvent(payload: any, projectKey?: string) {
    return request<any>('/api/v1/events', {
      method: 'POST',
      headers: projectKey ? { 'X-Project-Key': projectKey } : undefined,
      body: JSON.stringify(payload),
    });
  },

  // Releases
  async getReleases(projectId?: string) {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<{ releases: any[] }>(`/api/v1/releases${qs}`);
  },

  async createRelease(projectId: string, version: string, ref?: string) {
    return request<any>('/api/v1/releases', {
      method: 'POST',
      body: JSON.stringify({ projectId, version, ref }),
    });
  },

  // Alerts
  async getAlerts(projectId?: string) {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<{ rules: any[]; deliveries: any[] }>(`/api/v1/alerts${qs}`);
  },

  async createAlertRule(rule: any) {
    return request<any>('/api/v1/alerts', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  },

  async toggleAlertRule(id: string) {
    return request<any>('/api/v1/alerts', {
      method: 'PATCH',
      body: JSON.stringify({ id }),
    });
  },

  async testAlertRule(destination: string, ruleName?: string, projectId?: string) {
    return request<any>('/api/v1/alerts/test', {
      method: 'POST',
      body: JSON.stringify({ destination, ruleName, projectId }),
    });
  },

  // Members
  async getMembers(orgId?: string) {
    const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return request<{ members: any[] }>(`/api/v1/members${qs}`);
  },

  async inviteMember(data: { organizationId: string; name: string; email: string; role: string }) {
    return request<any>('/api/v1/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Billing
  async getBilling(orgId?: string) {
    const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return request<{ subscription: any; invoices: any[] }>(`/api/v1/billing${qs}`);
  },

  async updatePlan(organizationId: string, plan: string) {
    return request<any>('/api/v1/billing', {
      method: 'POST',
      body: JSON.stringify({ organizationId, plan }),
    });
  },

  async createCheckout(organizationId: string, plan: string) {
    return request<any>('/api/v1/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ organizationId, plan }),
    });
  },

  // Analytics
  async getAnalyticsStats(projectId?: string, timeRange?: string, environment?: string) {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (timeRange) params.set('timeRange', timeRange);
    if (environment) params.set('environment', environment);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<any>(`/api/v1/analytics/stats${qs}`);
  },

  // Performance
  async getPerformance(projectId?: string) {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<any>(`/api/v1/performance${qs}`);
  },

  // Sessions
  async getSessions(projectId?: string) {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<{ sessions: any[]; affectedUsers: any[] }>(`/api/v1/sessions${qs}`);
  },

  // Audit Logs
  async getAuditLogs(orgId?: string, filter?: { actorId?: string; action?: string }) {
    const params = new URLSearchParams();
    if (orgId) params.set('orgId', orgId);
    if (filter?.actorId) params.set('actorId', filter.actorId);
    if (filter?.action) params.set('action', filter.action);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ logs: any[] }>(`/api/v1/audit-logs${qs}`);
  },

  // Integrations
  async getIntegrations(orgId?: string) {
    const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return request<{ integrations: any[] }>(`/api/v1/integrations${qs}`);
  },

  async updateIntegration(organizationId: string, id: string, config: Record<string, string>, status: string) {
    return request<any>('/api/v1/integrations', {
      method: 'POST',
      body: JSON.stringify({ organizationId, id, config, status }),
    });
  },

  // Notifications
  async getNotifications(orgId?: string) {
    const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    return request<{ notifications: any[] }>(`/api/v1/notifications${qs}`);
  },

  async markNotificationRead(id: string, organizationId?: string) {
    return request<any>('/api/v1/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ id, organizationId }),
    });
  },

  // Search
  async search(query: string, orgId?: string) {
    const params = new URLSearchParams({ q: query });
    if (orgId) params.set('orgId', orgId);
    return request<{
      issues: any[];
      projects: any[];
      releases: any[];
      users: any[];
    }>(`/api/v1/search?${params.toString()}`);
  },

  // System Status
  async getSystemStatus() {
    return request<any>('/api/v1/system-status');
  },

  // SDK Health
  async getSdkHealth(projectId?: string) {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<any>(`/api/v1/sdk-health${qs}`);
  },
};
