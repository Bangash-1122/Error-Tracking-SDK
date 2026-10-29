export type IssueStatus = 'unresolved' | 'resolved' | 'ignored';
export type SeverityLevel = 'critical' | 'error' | 'warning' | 'info';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface StackFrame {
  filename: string;
  function: string;
  lineno?: number;
  colno?: number;
  in_app: boolean;
  context_line?: string;
  pre_context?: string[];
  post_context?: string[];
}

export interface Breadcrumb {
  id: string;
  timestamp: string;
  category: 'ui.click' | 'xhr' | 'fetch' | 'console' | 'navigation' | 'default';
  message: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  data?: Record<string, unknown>;
}

export interface EventRecord {
  id: string;
  eventId: string;
  issueId: string;
  projectId: string;
  receivedAt: string;
  occurredAt: string;
  environment: string;
  release?: string;
  user?: {
    id?: string;
    username?: string;
    email?: string;
    ip_address?: string;
  };
  tags: Record<string, string>;
  breadcrumbs: Breadcrumb[];
  frames: StackFrame[];
  exception: {
    type: string;
    value: string;
    handled: boolean;
  };
  request?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
}

export interface Issue {
  id: string;
  projectId: string;
  fingerprint: string;
  title: string;
  culprit: string;
  type: string;
  severity: SeverityLevel;
  status: IssueStatus;
  count: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  assignedTo?: string | null;
  environment: string;
  release: string;
  latestEventId?: string;
  isRegressed?: boolean;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  platform: 'javascript' | 'react' | 'nextjs' | 'node' | 'python' | 'go' | 'browser';
  publicKey: string;
  rawKey: string;
  status: 'active' | 'revoked';
  eventCount: number;
  quotaLimit: number;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Release {
  id: string;
  projectId: string;
  version: string;
  ref?: string;
  deployedAt: string;
  newIssuesCount: number;
  regressedIssuesCount: number;
  totalEventsCount: number;
  status: 'healthy' | 'regressed' | 'stable';
  createdAt?: string;
}

export interface AlertRule {
  id: string;
  projectId: string;
  name: string;
  condition: {
    type: 'new_issue' | 'frequency_spike' | 'regression';
    threshold?: number;
    windowSeconds?: number;
  };
  destination: string;
  status: 'active' | 'paused';
  cooldownMinutes: number;
  createdAt: string;
}

export interface AlertDelivery {
  id: string;
  ruleName: string;
  destination: string;
  condition: string;
  status: 'sent' | 'failed';
  attempts: number;
  sentAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer' | 'member';
  joinedAt: string;
  avatarUrl?: string;
}

export interface Subscription {
  plan: 'free' | 'pro' | 'enterprise';
  period: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  eventLimit: number;
  acceptedEvents: number;
  billableEvents: number;
  costMonthly: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
  pdfUrl?: string;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  resource: string;
  targetId?: string;
  previousValue?: string;
  newValue?: string;
  result: 'success' | 'failure';
  occurredAt: string;
  ipAddress?: string;
}

export interface PerformanceStats {
  avgDuration: number;
  p50: number;
  p95: number;
  p99: number;
  slowEndpoints: Array<{
    endpoint: string;
    avgMs: number;
    calls: number;
    errorRate: number;
  }>;
  totalRequests: number;
  failureRate: number;
}

export interface Session {
  id: string;
  projectId: string;
  userId?: string;
  userEmail?: string;
  browser?: string;
  os?: string;
  device?: string;
  ipAddress?: string;
  environment: string;
  startedAt: string;
  lastActiveAt: string;
  errorCount: number;
  status: 'active' | 'crashed' | 'completed';
}

export interface Integration {
  id: string;
  organizationId: string;
  type: 'slack' | 'github' | 'webhook' | 'email' | 'discord';
  name: string;
  config: Record<string, string>;
  status: 'connected' | 'disconnected' | 'error';
  description?: string;
  lastTestedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  type: 'new_issue' | 'regression' | 'spike' | 'system' | 'billing';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface SdkHealthMetrics {
  status?: 'healthy' | 'degraded' | 'offline';
  sdkVersion: string;
  clientLibrary?: string;
  integrationStatus?: 'healthy' | 'pending_setup' | 'degraded' | 'offline' | string;
  lastReceivedEventAt?: string;
  successfulIngestionCount?: number;
  rejectedEventsCount?: number;
  rateLimitedEventsCount?: number;
  sampleRateConfigured?: string;
  environmentDetected?: string;
  releaseDetected?: string;
  configurationChecks?: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  failureReasons?: Array<{
    reason: string;
    occurrences: number;
  }>;
  lastPing?: string;
  eventsLastHour?: number;
  dropRatePercent?: number;
  p95LatencyMs?: number;
  queueDepth?: number;
}

export interface AnalyticsStats {
  totalEvents: number;
  unresolvedIssues: number;
  resolvedIssues: number;
  affectedUsers: number;
  regressedIssues: number;
  errorRate: number;
  crashFreePercent: number;
  chartBuckets: Array<{
    label: string;
    count: number;
    timestamp: string;
  }>;
  severityMap: Record<SeverityLevel, number>;
}

export interface CacheDiagnostics {
  status: 'operational' | 'degraded' | 'disabled';
  backend: 'redis' | 'memory';
  hits: number;
  misses: number;
  hitRatio: number;
  keysCount: number;
  evictions: number;
  uptimeSeconds: number;
  lastInvalidatedAt?: string | null;
}

// ==================== ADVANCED SETTINGS CONTRACTS ====================

export interface ProjectSettings {
  projectId: string;
  // A. General Settings
  projectName: string;
  projectDescription: string;
  defaultEnvironment: 'production' | 'staging' | 'development';
  timezone: string;
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss' | 'MM/DD/YYYY hh:mm A' | 'DD/MM/YYYY HH:mm';
  projectStatus: 'active' | 'archived' | 'maintenance';
  
  // B. SDK Configuration
  sdkReportingEnabled: boolean;
  sdkVersion: string;
  environmentConfig: string;
  releaseTrackingEnabled: boolean;
  errorSamplingRate: number; // 0.0 - 1.0
  ingestionKeyStatus: 'active' | 'revoked';
  installationVerified: boolean;
  
  // C. Error Monitoring Settings
  severityFilters: SeverityLevel[];
  ignoredErrors: string[];
  errorGroupingPreference: 'fingerprint' | 'type_message' | 'semantic';
  telemetryRetentionDays: number;
  autoResolveInactiveDays: number;
  regressionDetectionEnabled: boolean;
  eventRateLimitPerMin: number;
  quotaWarningThresholdPercent: number;

  // D. Alerts & Notifications
  emailAlertsEnabled: boolean;
  criticalOnlyAlerts: boolean;
  newIssueAlertsEnabled: boolean;
  regressionAlertsEnabled: boolean;
  alertFrequency: 'instant' | 'hourly_digest' | 'daily_digest';
  notificationChannels: Array<'email' | 'slack' | 'webhook'>;
  alertThresholdCount: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"

  // E. Privacy & Security
  sensitiveDataScrubbing: boolean;
  scrubFields: string[];
  collectUserIpAddresses: boolean;
  collectUserInfo: boolean;
  sessionTrackingEnabled: boolean;
  allowDataExport: boolean;

  // G. Integrations
  githubIntegrationEnabled: boolean;
  slackIntegrationEnabled: boolean;
  webhookIntegrationEnabled: boolean;
  webhookEndpointUrl?: string;

  // H. Performance Monitoring
  performanceMonitoringEnabled: boolean;
  transactionSampleRate: number; // 0.0 - 1.0
  slowRequestThresholdMs: number;
  perfAlertThresholdMs: number;
  perfDataRetentionDays: number;

  // J. Advanced Settings
  debugDiagnosticsEnabled: boolean;
  maintenanceMode: boolean;
  updatedAt: string;
}

export interface OrganizationSettings {
  organizationId: string;
  orgName: string;
  slug: string;
  billingEmail: string;
  complianceTier: 'standard' | 'hipaa' | 'gdpr' | 'soc2';
  defaultDataRetentionDays: number;
  enforceMfa: boolean;
  ipAllowlist: string[];
  defaultRoleForNewMembers: 'admin' | 'developer' | 'viewer';
  updatedAt: string;
}

export interface UserSession {
  id: string;
  projectId: string;
  userId?: string;
  userEmail?: string;
  device?: string;
  os?: string;
  browser?: string;
  startedAt: string;
  lastActiveAt: string;
  errorCount: number;
  status: 'active' | 'crashed' | 'completed';
}

export interface AffectedUser {
  userId: string;
  email: string;
  sessions: number;
  errors: number;
  lastSeen: string;
}

