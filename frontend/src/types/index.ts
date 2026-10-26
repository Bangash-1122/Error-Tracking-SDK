export type IssueStatus = 'unresolved' | 'resolved' | 'ignored';
export type SeverityLevel = 'critical' | 'error' | 'warning' | 'info';

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
  data?: Record<string, any>;
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
  role: 'owner' | 'admin' | 'member';
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
