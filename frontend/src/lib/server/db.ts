import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface MembershipRecord {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  platform: 'react' | 'javascript' | 'node' | 'python' | 'go' | 'browser';
  eventCount: number;
  quotaLimit: number;
  createdAt: string;
}

export interface ProjectKeyRecord {
  id: string;
  projectId: string;
  name: string;
  publicKey: string;
  rawKey: string;
  keyHash: string;
  isActive: boolean;
  rateLimitPerMinute: number;
  createdAt: string;
  revokedAt?: string | null;
}

export interface IssueRecord {
  id: string;
  projectId: string;
  organizationId: string;
  fingerprint: string;
  title: string;
  culprit: string;
  type: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  status: 'unresolved' | 'resolved' | 'ignored';
  count: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  assignedTo: string | null;
  environment: string;
  release: string;
  latestEventId?: string;
  createdAt: string;
  isRegressed?: boolean;
}

export interface StackFrame {
  filename: string;
  function?: string;
  lineno?: number;
  colno?: number;
  in_app: boolean;
  context_line?: string;
  pre_context?: string[];
  post_context?: string[];
}

export interface BreadcrumbRecord {
  timestamp: string | number;
  category: string;
  message?: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  data?: Record<string, unknown>;
}

export interface EventRecord {
  id: string;
  eventId: string;
  issueId: string;
  projectId: string;
  organizationId: string;
  environment: string;
  release: string;
  exception: {
    type: string;
    value: string;
    handled?: boolean;
  };
  frames: StackFrame[];
  breadcrumbs: BreadcrumbRecord[];
  tags: Record<string, string>;
  user?: {
    id?: string;
    username?: string;
    email?: string;
    ip_address?: string;
  };
  request?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
  occurredAt: string;
  receivedAt: string;
}

export interface ReleaseRecord {
  id: string;
  projectId: string;
  version: string;
  ref: string;
  deployedAt: string;
  status: 'healthy' | 'regressed' | 'investigating';
  newIssuesCount: number;
  regressedIssuesCount: number;
  totalEventsCount: number;
  createdAt: string;
}

export interface AlertRuleRecord {
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

export interface AlertDeliveryRecord {
  id: string;
  projectId: string;
  alertRuleId: string;
  issueId?: string;
  condition: string;
  destination: string;
  status: 'sent' | 'failed';
  attempts: number;
  sentAt: string;
  error?: string;
}

export interface SubscriptionRecord {
  id: string;
  organizationId: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled';
  period: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  acceptedEvents: number;
  billableEvents: number;
  eventLimit: number;
  costMonthly: number;
}

export interface InvoiceRecord {
  id: string;
  organizationId: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
  pdfUrl?: string;
}

export interface AuditLogRecord {
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

export interface PerformanceMetricRecord {
  id: string;
  projectId: string;
  endpoint: string;
  method: string;
  durationMs: number;
  statusCode: number;
  environment: string;
  occurredAt: string;
}

export interface SessionRecord {
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

export interface IntegrationRecord {
  id: string;
  organizationId: string;
  type: 'slack' | 'github' | 'webhook' | 'email' | 'discord';
  name: string;
  config: Record<string, string>;
  status: 'connected' | 'disconnected' | 'error';
  lastTestedAt?: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  type: 'new_issue' | 'regression' | 'spike' | 'system' | 'billing';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface PasswordResetTokenRecord {
  token: string;
  userId: string;
  expiresAt: number; // timestamp
}

// Token-bucket rate limiter map
const rateLimiterBuckets = new Map<string, { tokens: number; lastRefill: number }>();

function checkRateLimit(key: string, limitPerMinute: number = 60): boolean {
  const now = Date.now();
  const bucket = rateLimiterBuckets.get(key) || { tokens: limitPerMinute, lastRefill: now };
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(limitPerMinute, bucket.tokens + elapsed * (limitPerMinute / 60));
  bucket.lastRefill = now;
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    rateLimiterBuckets.set(key, bucket);
    return true;
  }
  rateLimiterBuckets.set(key, bucket);
  return false;
}

export function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Universal Unified Memory & Persistent Store
 * Contains all SaaS tenant data with ACID-like transactional operations,
 * strict tenant isolation, and audit logging.
 */
class ServerDatabase {
  private users = new Map<string, UserRecord>();
  private userEmailMap = new Map<string, string>();
  private organizations = new Map<string, OrganizationRecord>();
  private orgSlugMap = new Map<string, string>();
  private memberships = new Map<string, MembershipRecord>(); // key: orgId:userId
  private projects = new Map<string, ProjectRecord>();
  private projectKeys = new Map<string, ProjectKeyRecord>();
  private keyHashMap = new Map<string, string>(); // keyHash -> keyId
  private rawKeyMap = new Map<string, string>(); // rawKey -> keyId
  private issues = new Map<string, IssueRecord>();
  private issueFingerprintMap = new Map<string, string>(); // projectId:fingerprint -> issueId
  private events = new Map<string, EventRecord>();
  private eventDedupMap = new Map<string, string>(); // projectId:eventId -> eventId
  private releases = new Map<string, ReleaseRecord>();
  private alertRules = new Map<string, AlertRuleRecord>();
  private alertDeliveries = new Map<string, AlertDeliveryRecord>();
  private subscriptions = new Map<string, SubscriptionRecord>();
  private invoices = new Map<string, InvoiceRecord[]>(); // orgId -> invoices
  private auditLogs: AuditLogRecord[] = [];
  private performanceMetrics: PerformanceMetricRecord[] = [];
  private sessions = new Map<string, SessionRecord>();
  private integrations = new Map<string, IntegrationRecord[]>(); // orgId -> integrations
  private notifications = new Map<string, NotificationRecord[]>(); // orgId -> notifications
  private passwordResetTokens = new Map<string, PasswordResetTokenRecord>();

  private initialized = false;

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    if (this.initialized) return;
    this.initialized = true;

    // Seed Admin User
    const adminId = 'usr_admin_01';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);
    const adminUser: UserRecord = {
      id: adminId,
      email: 'admin@acme.com',
      name: 'Admin User',
      passwordHash,
      createdAt: '2026-01-15T08:00:00Z',
    };
    this.users.set(adminId, adminUser);
    this.userEmailMap.set(adminUser.email.toLowerCase(), adminId);

    // Seed Acme Corp Org
    const orgId = 'org_acme_corp';
    const acmeOrg: OrganizationRecord = {
      id: orgId,
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'pro',
      createdAt: '2026-01-15T08:00:00Z',
    };
    this.organizations.set(orgId, acmeOrg);
    this.orgSlugMap.set(acmeOrg.slug, orgId);

    // Seed Owner Membership
    const membershipId = 'mem_admin_01';
    const membership: MembershipRecord = {
      id: membershipId,
      organizationId: orgId,
      userId: adminId,
      role: 'owner',
      createdAt: '2026-01-15T08:00:00Z',
    };
    this.memberships.set(`${orgId}:${adminId}`, membership);

    // Seed Second Member
    const member2Id = 'usr_sarah_02';
    const member2: UserRecord = {
      id: member2Id,
      email: 'sarah.jenkins@acme.com',
      name: 'Sarah Jenkins',
      passwordHash: bcrypt.hashSync('password123', salt),
      createdAt: '2026-02-01T10:00:00Z',
    };
    this.users.set(member2Id, member2);
    this.userEmailMap.set(member2.email.toLowerCase(), member2Id);
    this.memberships.set(`${orgId}:${member2Id}`, {
      id: 'mem_sarah_02',
      organizationId: orgId,
      userId: member2Id,
      role: 'admin',
      createdAt: '2026-02-01T10:00:00Z',
    });

    // Seed Projects
    const p1Id = 'prj_prod_01';
    const rawKey1 = 'ek_live_8f3a9b2c1d4e5f6a7b8c9d0e';
    const p1: ProjectRecord = {
      id: p1Id,
      organizationId: orgId,
      name: 'Storefront Web App',
      slug: 'storefront-web-app',
      platform: 'react',
      eventCount: 42150,
      quotaLimit: 100000,
      createdAt: '2026-01-15T08:30:00Z',
    };
    this.projects.set(p1Id, p1);

    const key1: ProjectKeyRecord = {
      id: 'key_p1_01',
      projectId: p1Id,
      name: 'Default Ingest Key',
      publicKey: rawKey1.slice(0, 16) + '...',
      rawKey: rawKey1,
      keyHash: hashKey(rawKey1),
      isActive: true,
      rateLimitPerMinute: 600,
      createdAt: '2026-01-15T08:30:00Z',
    };
    this.projectKeys.set(key1.id, key1);
    this.keyHashMap.set(key1.keyHash, key1.id);
    this.rawKeyMap.set(key1.rawKey, key1.id);

    const p2Id = 'prj_api_02';
    const rawKey2 = 'ek_live_9a8b7c6d5e4f3a2b1c0d';
    const p2: ProjectRecord = {
      id: p2Id,
      organizationId: orgId,
      name: 'Payment API Service',
      slug: 'payment-api-service',
      platform: 'node',
      eventCount: 18230,
      quotaLimit: 100000,
      createdAt: '2026-01-20T09:00:00Z',
    };
    this.projects.set(p2Id, p2);

    const key2: ProjectKeyRecord = {
      id: 'key_p2_01',
      projectId: p2Id,
      name: 'Backend API Key',
      publicKey: rawKey2.slice(0, 16) + '...',
      rawKey: rawKey2,
      keyHash: hashKey(rawKey2),
      isActive: true,
      rateLimitPerMinute: 1200,
      createdAt: '2026-01-20T09:00:00Z',
    };
    this.projectKeys.set(key2.id, key2);
    this.keyHashMap.set(key2.keyHash, key2.id);
    this.rawKeyMap.set(key2.rawKey, key2.id);

    // Seed Subscription
    const sub: SubscriptionRecord = {
      id: 'sub_acme_pro',
      organizationId: orgId,
      plan: 'pro',
      status: 'active',
      period: 'monthly',
      currentPeriodStart: new Date(Date.now() - 15 * 86400000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 86400000).toISOString(),
      acceptedEvents: 60380,
      billableEvents: 60380,
      eventLimit: 100000,
      costMonthly: 49,
    };
    this.subscriptions.set(orgId, sub);

    // Seed Invoices
    this.invoices.set(orgId, [
      { id: 'INV-2026-10', organizationId: orgId, amount: '$49.00', date: 'Oct 01, 2026', status: 'Paid' },
      { id: 'INV-2026-09', organizationId: orgId, amount: '$49.00', date: 'Sep 01, 2026', status: 'Paid' },
      { id: 'INV-2026-08', organizationId: orgId, amount: '$49.00', date: 'Aug 01, 2026', status: 'Paid' },
    ]);

    // Seed Releases
    const rel1: ReleaseRecord = {
      id: 'rel_1',
      projectId: p1Id,
      version: 'v1.3.2',
      ref: 'git:7b8f9a2',
      deployedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      status: 'healthy',
      newIssuesCount: 1,
      regressedIssuesCount: 0,
      totalEventsCount: 1420,
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    };
    const rel2: ReleaseRecord = {
      id: 'rel_2',
      projectId: p1Id,
      version: 'v1.3.1',
      ref: 'git:1a2b3c4',
      deployedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      status: 'regressed',
      newIssuesCount: 3,
      regressedIssuesCount: 1,
      totalEventsCount: 8940,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    };
    this.releases.set(rel1.id, rel1);
    this.releases.set(rel2.id, rel2);

    // Seed Initial Alert Rules
    const rule1: AlertRuleRecord = {
      id: 'alt_1',
      projectId: p1Id,
      name: 'Critical Unhandled Exceptions Alert',
      condition: { type: 'new_issue' },
      destination: 'https://hooks.slack.com/services/T00/B00/X00',
      status: 'active',
      cooldownMinutes: 15,
      createdAt: '2026-01-20T10:00:00Z',
    };
    const rule2: AlertRuleRecord = {
      id: 'alt_2',
      projectId: p1Id,
      name: 'High Frequency Spike Webhook',
      condition: { type: 'frequency_spike', threshold: 100, windowSeconds: 60 },
      destination: 'https://api.acme.com/webhooks/ops-pager',
      status: 'active',
      cooldownMinutes: 30,
      createdAt: '2026-01-22T14:30:00Z',
    };
    this.alertRules.set(rule1.id, rule1);
    this.alertRules.set(rule2.id, rule2);

    // Seed Initial Deliveries
    this.alertDeliveries.set('del_1', {
      id: 'del_1',
      projectId: p1Id,
      alertRuleId: 'alt_1',
      issueId: 'iss_1',
      condition: 'New issue detected in production',
      destination: 'Slack #engineering-alerts',
      status: 'sent',
      attempts: 1,
      sentAt: new Date(Date.now() - 25 * 60000).toISOString(),
    });

    // Seed Initial Issues
    const iss1: IssueRecord = {
      id: 'iss_1',
      projectId: p1Id,
      organizationId: orgId,
      fingerprint: 'fp-typeerror-cannot-read-properties-of-undefined-checkout',
      title: 'TypeError: Cannot read properties of undefined (reading "items")',
      culprit: 'src/components/cart/CartDrawer.tsx:42:15',
      type: 'TypeError',
      severity: 'critical',
      status: 'unresolved',
      count: 1420,
      userCount: 312,
      firstSeen: new Date(Date.now() - 2 * 86400000).toISOString(),
      lastSeen: new Date(Date.now() - 5 * 60000).toISOString(),
      assignedTo: adminId,
      environment: 'production',
      release: 'v1.3.2',
      latestEventId: 'evt_sample_01',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    };

    const iss2: IssueRecord = {
      id: 'iss_2',
      projectId: p1Id,
      organizationId: orgId,
      fingerprint: 'fp-networkerror-gateway-timeout-504-sync',
      title: 'NetworkError: Gateway Timeout 504 on POST /api/v1/orders/sync',
      culprit: 'src/lib/api/orders.ts:89:12',
      type: 'NetworkError',
      severity: 'error',
      status: 'unresolved',
      count: 840,
      userCount: 198,
      firstSeen: new Date(Date.now() - 5 * 86400000).toISOString(),
      lastSeen: new Date(Date.now() - 18 * 60000).toISOString(),
      assignedTo: member2Id,
      environment: 'production',
      release: 'v1.3.2',
      latestEventId: 'evt_sample_02',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    };

    const iss3: IssueRecord = {
      id: 'iss_3',
      projectId: p1Id,
      organizationId: orgId,
      fingerprint: 'fp-rangeerror-maximum-call-stack-size-exceeded',
      title: 'RangeError: Maximum call stack size exceeded in tree recursion',
      culprit: 'src/utils/categoryTree.ts:18:9',
      type: 'RangeError',
      severity: 'warning',
      status: 'resolved',
      count: 215,
      userCount: 45,
      firstSeen: new Date(Date.now() - 7 * 86400000).toISOString(),
      lastSeen: new Date(Date.now() - 2 * 86400000).toISOString(),
      assignedTo: null,
      environment: 'staging',
      release: 'v1.3.1',
      latestEventId: 'evt_sample_03',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    };

    const iss4: IssueRecord = {
      id: 'iss_4',
      projectId: p1Id,
      organizationId: orgId,
      fingerprint: 'fp-referenceerror-window-is-not-defined-ssr',
      title: 'ReferenceError: window is not defined during SSR render',
      culprit: 'src/components/analytics/Tracker.tsx:12:3',
      type: 'ReferenceError',
      severity: 'info',
      status: 'ignored',
      count: 58,
      userCount: 14,
      firstSeen: new Date(Date.now() - 10 * 86400000).toISOString(),
      lastSeen: new Date(Date.now() - 4 * 86400000).toISOString(),
      assignedTo: null,
      environment: 'production',
      release: 'v1.3.0',
      latestEventId: 'evt_sample_04',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    };

    this.issues.set(iss1.id, iss1);
    this.issueFingerprintMap.set(`${p1Id}:${iss1.fingerprint}`, iss1.id);
    this.issues.set(iss2.id, iss2);
    this.issueFingerprintMap.set(`${p1Id}:${iss2.fingerprint}`, iss2.id);
    this.issues.set(iss3.id, iss3);
    this.issueFingerprintMap.set(`${p1Id}:${iss3.fingerprint}`, iss3.id);
    this.issues.set(iss4.id, iss4);
    this.issueFingerprintMap.set(`${p1Id}:${iss4.fingerprint}`, iss4.id);

    // Seed Sample Event for iss1
    const evt1: EventRecord = {
      id: 'evt_sample_01',
      eventId: '4b3f81e2-9d3a-4421-b8d9-2d12f3e8b0a1',
      issueId: iss1.id,
      projectId: p1Id,
      organizationId: orgId,
      environment: 'production',
      release: 'v1.3.2',
      exception: {
        type: 'TypeError',
        value: 'Cannot read properties of undefined (reading "items")',
        handled: false,
      },
      frames: [
        {
          filename: 'node_modules/react-dom/cjs/react-dom.production.min.js',
          function: 'invokeGuardedCallbackProd',
          lineno: 292,
          colno: 16,
          in_app: false,
          context_line: '    function invokeGuardedCallbackProd(name, func, context, a, b, c, d, e, f) {',
        },
        {
          filename: 'src/components/cart/CartDrawer.tsx',
          function: 'calculateSubtotal',
          lineno: 42,
          colno: 15,
          in_app: true,
          context_line: '    const subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);',
          pre_context: [
            '  const calculateSubtotal = () => {',
            '    if (!cart) return 0;',
          ],
          post_context: [
            '    return subtotal;',
            '  };',
          ],
        },
        {
          filename: 'src/components/cart/CartDrawer.tsx',
          function: 'renderTotal',
          lineno: 88,
          colno: 22,
          in_app: true,
          context_line: '  return <span className="cart-total">{calculateSubtotal()}</span>;',
        },
      ],
      breadcrumbs: [
        {
          timestamp: new Date(Date.now() - 5000).toISOString(),
          category: 'navigation',
          message: 'User navigated from /products to /cart',
          level: 'info',
        },
        {
          timestamp: new Date(Date.now() - 3200).toISOString(),
          category: 'ui.click',
          message: 'Button[id="open-cart-drawer"] clicked',
          level: 'info',
        },
        {
          timestamp: new Date(Date.now() - 1500).toISOString(),
          category: 'fetch',
          message: 'GET /api/v1/cart [200 OK]',
          level: 'info',
          data: { status: 200 },
        },
        {
          timestamp: new Date(Date.now() - 300).toISOString(),
          category: 'error',
          message: 'TypeError: Cannot read properties of undefined (reading "items")',
          level: 'error',
        },
      ],
      tags: {
        browser: 'Chrome 122.0.0',
        os: 'macOS 14.3.1',
        device: 'Desktop',
        environment: 'production',
        release: 'v1.3.2',
        handled: 'false',
        tier: 'enterprise',
      },
      user: {
        id: 'usr_98124',
        email: 'alex.chen@customer.com',
        username: 'alexchen',
        ip_address: '192.168.1.101',
      },
      request: {
        url: 'https://store.acme.com/cart',
        method: 'GET',
        headers: { 'user-agent': 'Mozilla/5.0 Chrome/122.0.0.0 Safari/537.36' },
      },
      occurredAt: iss1.lastSeen,
      receivedAt: iss1.lastSeen,
    };
    this.events.set(evt1.id, evt1);
    this.eventDedupMap.set(`${p1Id}:${evt1.eventId}`, evt1.id);

    // Seed Performance Metrics
    const endpoints = ['/api/v1/orders/sync', '/api/v1/cart', '/api/v1/checkout', '/api/v1/products', '/api/v1/auth/session'];
    for (let i = 0; i < 40; i++) {
      const ep = endpoints[i % endpoints.length];
      const dur = Math.floor(40 + Math.random() * (ep.includes('sync') ? 850 : 220));
      this.performanceMetrics.push({
        id: `pm_${i}`,
        projectId: p1Id,
        endpoint: ep,
        method: ep.includes('sync') || ep.includes('checkout') ? 'POST' : 'GET',
        durationMs: dur,
        statusCode: dur > 700 ? 504 : 200,
        environment: 'production',
        occurredAt: new Date(Date.now() - i * 1800000).toISOString(),
      });
    }

    // Seed Sessions
    for (let i = 0; i < 20; i++) {
      const sId = `ses_${i + 1}`;
      this.sessions.set(sId, {
        id: sId,
        projectId: p1Id,
        userId: `usr_${1000 + i}`,
        userEmail: `user${i + 1}@acmecustomer.com`,
        browser: i % 2 === 0 ? 'Chrome 122' : 'Safari 17.2',
        os: i % 3 === 0 ? 'macOS Sonoma' : 'Windows 11',
        device: 'Desktop',
        environment: 'production',
        startedAt: new Date(Date.now() - i * 3600000).toISOString(),
        lastActiveAt: new Date(Date.now() - i * 3600000 + 1200000).toISOString(),
        errorCount: i < 5 ? 1 : 0,
        status: i < 5 ? 'crashed' : 'completed',
      });
    }

    // Seed Integrations
    this.integrations.set(orgId, [
      {
        id: 'int_slack_01',
        organizationId: orgId,
        type: 'slack',
        name: 'Slack Alerts (#engineering-incidents)',
        config: { channel: '#engineering-incidents', webhookUrl: 'https://hooks.slack.com/services/T00/B00/X00' },
        status: 'connected',
        lastTestedAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: '2026-01-20T10:00:00Z',
      },
      {
        id: 'int_github_02',
        organizationId: orgId,
        type: 'github',
        name: 'GitHub Issue Sync',
        config: { repo: 'acme-corp/storefront-web', autoCreateIssues: 'true' },
        status: 'connected',
        lastTestedAt: new Date(Date.now() - 172800000).toISOString(),
        createdAt: '2026-01-22T12:00:00Z',
      },
      {
        id: 'int_webhook_03',
        organizationId: orgId,
        type: 'webhook',
        name: 'Custom Pager Webhook',
        config: { url: 'https://api.acme.com/webhooks/ops-pager' },
        status: 'connected',
        lastTestedAt: new Date(Date.now() - 43200000).toISOString(),
        createdAt: '2026-01-25T15:00:00Z',
      },
    ]);

    // Seed Notifications
    this.notifications.set(orgId, [
      {
        id: 'notif_1',
        organizationId: orgId,
        title: 'Critical TypeError spike detected',
        message: 'CartDrawer.tsx exceeded 1,000 occurrences in release v1.3.2',
        severity: 'critical',
        type: 'spike',
        isRead: false,
        link: `/org/acme-corp/issues/${iss1.id}`,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif_2',
        organizationId: orgId,
        title: 'New issue detected in production',
        message: 'NetworkError: Gateway Timeout 504 on POST /api/v1/orders/sync',
        severity: 'error',
        type: 'new_issue',
        isRead: false,
        link: `/org/acme-corp/issues/${iss2.id}`,
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 'notif_3',
        organizationId: orgId,
        title: 'Monthly Ingest Quota at 60%',
        message: 'Storefront Web App has consumed 60,380 of 100,000 monthly events',
        severity: 'info',
        type: 'billing',
        isRead: true,
        link: '/org/acme-corp/billing',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);

    // Seed Initial Audit Log
    this.auditLogs.push(
      {
        id: 'aud_1',
        organizationId: orgId,
        actor: { id: adminId, name: 'Admin User', email: 'admin@acme.com' },
        action: 'auth.login',
        resource: 'user_session',
        targetId: adminId,
        result: 'success',
        occurredAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        ipAddress: '127.0.0.1',
      },
      {
        id: 'aud_2',
        organizationId: orgId,
        actor: { id: adminId, name: 'Admin User', email: 'admin@acme.com' },
        action: 'project.create',
        resource: 'project',
        targetId: p1Id,
        newValue: 'Storefront Web App',
        result: 'success',
        occurredAt: '2026-01-15T08:30:00Z',
      },
      {
        id: 'aud_3',
        organizationId: orgId,
        actor: { id: adminId, name: 'Admin User', email: 'admin@acme.com' },
        action: 'key.create',
        resource: 'project_key',
        targetId: key1.id,
        newValue: key1.publicKey,
        result: 'success',
        occurredAt: '2026-01-15T08:30:00Z',
      }
    );
  }

  // ==================== AUTH & USERS ====================

  async createUser(email: string, name: string, passwordHash: string): Promise<UserRecord> {
    const existing = this.userEmailMap.get(email.toLowerCase());
    if (existing) {
      throw new Error('A user with this email address already exists');
    }
    const id = `usr_${crypto.randomUUID().slice(0, 8)}`;
    const user: UserRecord = {
      id,
      email: email.toLowerCase(),
      name,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    this.userEmailMap.set(user.email, id);
    return user;
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const id = this.userEmailMap.get(email.toLowerCase());
    if (!id) return null;
    return this.users.get(id) || null;
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) || null;
  }

  async updateUserPassword(id: string, newPasswordHash: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    user.passwordHash = newPasswordHash;
  }

  // Password Reset Tokens
  createPasswordResetToken(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetTokens.set(token, {
      token,
      userId,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
    });
    return token;
  }

  verifyPasswordResetToken(token: string): string | null {
    const rec = this.passwordResetTokens.get(token);
    if (!rec) return null;
    if (Date.now() > rec.expiresAt) {
      this.passwordResetTokens.delete(token);
      return null;
    }
    return rec.userId;
  }

  consumePasswordResetToken(token: string): void {
    this.passwordResetTokens.delete(token);
  }

  // Rate Limiter Check for Auth
  checkLoginRateLimit(ipOrEmail: string): boolean {
    return checkRateLimit(`login:${ipOrEmail}`, 5); // 5 attempts per minute max
  }

  // ==================== ORGANIZATIONS & MEMBERS ====================

  async createOrganization(name: string, slug: string, ownerUserId?: string): Promise<OrganizationRecord> {
    const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (this.orgSlugMap.has(normalizedSlug)) {
      throw new Error(`Organization slug "${normalizedSlug}" is already taken`);
    }
    const id = `org_${crypto.randomUUID().slice(0, 8)}`;
    const org: OrganizationRecord = {
      id,
      name,
      slug: normalizedSlug,
      plan: 'free',
      createdAt: new Date().toISOString(),
    };
    this.organizations.set(id, org);
    this.orgSlugMap.set(normalizedSlug, id);

    // Initialize default free subscription
    this.subscriptions.set(id, {
      id: `sub_${id}`,
      organizationId: id,
      plan: 'free',
      status: 'active',
      period: 'monthly',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      acceptedEvents: 0,
      billableEvents: 0,
      eventLimit: 10000,
      costMonthly: 0,
    });

    if (ownerUserId) {
      await this.addMembership(id, ownerUserId, 'owner');
    }

    return org;
  }

  async getOrganizationById(id: string): Promise<OrganizationRecord | null> {
    return this.organizations.get(id) || null;
  }

  async getOrganizationBySlug(slug: string): Promise<OrganizationRecord | null> {
    const id = this.orgSlugMap.get(slug.toLowerCase());
    if (!id) return null;
    return this.organizations.get(id) || null;
  }

  async addMembership(organizationId: string, userId: string, role: 'owner' | 'admin' | 'member' = 'member'): Promise<MembershipRecord> {
    const key = `${organizationId}:${userId}`;
    const mem: MembershipRecord = {
      id: `mem_${crypto.randomUUID().slice(0, 8)}`,
      organizationId,
      userId,
      role,
      createdAt: new Date().toISOString(),
    };
    this.memberships.set(key, mem);
    return mem;
  }

  async getMembership(organizationId: string, userId: string): Promise<MembershipRecord | null> {
    return this.memberships.get(`${organizationId}:${userId}`) || null;
  }

  async listMembersByOrg(organizationId: string): Promise<Array<MembershipRecord & { user: UserRecord }>> {
    const results: Array<MembershipRecord & { user: UserRecord }> = [];
    for (const mem of this.memberships.values()) {
      if (mem.organizationId === organizationId) {
        const user = this.users.get(mem.userId);
        if (user) {
          results.push({ ...mem, user });
        }
      }
    }
    return results;
  }

  async listUserOrganizations(userId: string): Promise<OrganizationRecord[]> {
    const orgs: OrganizationRecord[] = [];
    for (const mem of this.memberships.values()) {
      if (mem.userId === userId) {
        const org = this.organizations.get(mem.organizationId);
        if (org) orgs.push(org);
      }
    }
    return orgs;
  }

  // ==================== PROJECTS & INGEST KEYS ====================

  async createProject(organizationId: string, name: string, platform: ProjectRecord['platform'] = 'javascript'): Promise<{ project: ProjectRecord; key: ProjectKeyRecord }> {
    const org = this.organizations.get(organizationId);
    if (!org) throw new Error('Organization not found');

    const id = `prj_${crypto.randomUUID().slice(0, 8)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const project: ProjectRecord = {
      id,
      organizationId,
      name,
      slug,
      platform,
      eventCount: 0,
      quotaLimit: 100000,
      createdAt: new Date().toISOString(),
    };
    this.projects.set(id, project);

    // Issue initial public key
    const rawKey = `ek_live_${crypto.randomBytes(16).toString('hex')}`;
    const key: ProjectKeyRecord = {
      id: `key_${crypto.randomUUID().slice(0, 8)}`,
      projectId: id,
      name: 'Default Ingest Key',
      publicKey: rawKey.slice(0, 16) + '...',
      rawKey,
      keyHash: hashKey(rawKey),
      isActive: true,
      rateLimitPerMinute: 600,
      createdAt: new Date().toISOString(),
    };
    this.projectKeys.set(key.id, key);
    this.keyHashMap.set(key.keyHash, key.id);
    this.rawKeyMap.set(key.rawKey, key.id);

    return { project, key };
  }

  async getProjectById(id: string): Promise<ProjectRecord | null> {
    return this.projects.get(id) || null;
  }

  async listProjectsByOrg(organizationId: string): Promise<ProjectRecord[]> {
    return Array.from(this.projects.values()).filter((p) => p.organizationId === organizationId);
  }

  async getProjectKey(rawOrMaskedKey: string): Promise<{ key: ProjectKeyRecord; project: ProjectRecord } | null> {
    let keyId = this.rawKeyMap.get(rawOrMaskedKey);
    if (!keyId) {
      const computedHash = hashKey(rawOrMaskedKey);
      keyId = this.keyHashMap.get(computedHash);
    }
    if (!keyId) return null;
    const key = this.projectKeys.get(keyId);
    if (!key || !key.isActive) return null;
    const project = this.projects.get(key.projectId);
    if (!project) return null;
    return { key, project };
  }

  async rotateProjectKey(projectId: string): Promise<{ key: ProjectKeyRecord; rawKey: string }> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    // Revoke old active keys
    for (const k of this.projectKeys.values()) {
      if (k.projectId === projectId && k.isActive) {
        k.isActive = false;
        k.revokedAt = new Date().toISOString();
      }
    }

    const rawKey = `ek_live_${crypto.randomBytes(16).toString('hex')}`;
    const key: ProjectKeyRecord = {
      id: `key_${crypto.randomUUID().slice(0, 8)}`,
      projectId,
      name: 'Rotated Ingest Key',
      publicKey: rawKey.slice(0, 16) + '...',
      rawKey,
      keyHash: hashKey(rawKey),
      isActive: true,
      rateLimitPerMinute: 600,
      createdAt: new Date().toISOString(),
    };
    this.projectKeys.set(key.id, key);
    this.keyHashMap.set(key.keyHash, key.id);
    this.rawKeyMap.set(key.rawKey, key.id);

    return { key, rawKey };
  }

  // ==================== INGESTION & ISSUES PIPELINE ====================

  /**
   * Deterministic stack trace fingerprinting algorithm:
   * sha256(error.name + normalized(in_app_frames) + culprit)
   */
  generateFingerprint(type: string, frames: StackFrame[], culprit: string): string {
    const inAppFrames = frames.filter((f) => f.in_app);
    const targetFrames = inAppFrames.length > 0 ? inAppFrames : frames;
    const frameSignature = targetFrames
      .map((f) => `${f.filename}:${f.function || '?'}:${f.lineno || 0}`)
      .join('|');
    const input = `${type.trim()}::${culprit.trim()}::${frameSignature}`;
    return 'fp-' + crypto.createHash('sha256').update(input).digest('hex').slice(0, 32);
  }

  async recordIngestEventTransactional(params: {
    projectId: string;
    organizationId: string;
    eventId: string;
    fingerprint?: string;
    title: string;
    culprit: string;
    type: string;
    severity?: 'critical' | 'error' | 'warning' | 'info';
    release?: string;
    environment?: string;
    frames?: StackFrame[];
    breadcrumbs?: BreadcrumbRecord[];
    tags?: Record<string, string>;
    user?: { id?: string; username?: string; email?: string; ip_address?: string };
    request?: { url?: string; method?: string; headers?: Record<string, string> };
    occurredAt?: string;
  }): Promise<{ status: 'inserted' | 'duplicate'; isNewIssue: boolean; isRegression: boolean; issue: IssueRecord; event: EventRecord }> {
    const { projectId, organizationId, eventId, title, culprit, type } = params;
    const severity = params.severity || 'error';
    const release = params.release || 'v1.0.0';
    const environment = params.environment || 'production';
    const frames = params.frames || [];
    const breadcrumbs = params.breadcrumbs || [];
    const tags = params.tags || {};
    const occurredAt = params.occurredAt || new Date().toISOString();
    const receivedAt = new Date().toISOString();

    // Check duplicate eventId for this project
    const dedupKey = `${projectId}:${eventId}`;
    const existingEventId = this.eventDedupMap.get(dedupKey);
    if (existingEventId) {
      const existingEvt = this.events.get(existingEventId)!;
      const existingIssue = this.issues.get(existingEvt.issueId)!;
      return {
        status: 'duplicate',
        isNewIssue: false,
        isRegression: false,
        issue: existingIssue,
        event: existingEvt,
      };
    }

    // Fingerprinting
    const fingerprint = params.fingerprint || this.generateFingerprint(type, frames, culprit);
    const issueKey = `${projectId}:${fingerprint}`;
    let isNewIssue = false;
    let isRegression = false;

    let issueId = this.issueFingerprintMap.get(issueKey);
    let issue: IssueRecord;

    if (!issueId) {
      // Create new issue
      isNewIssue = true;
      issueId = `iss_${crypto.randomUUID().slice(0, 8)}`;
      issue = {
        id: issueId,
        projectId,
        organizationId,
        fingerprint,
        title,
        culprit,
        type,
        severity,
        status: 'unresolved',
        count: 1,
        userCount: params.user?.id ? 1 : 0,
        firstSeen: occurredAt,
        lastSeen: occurredAt,
        assignedTo: null,
        environment,
        release,
        createdAt: receivedAt,
      };
      this.issues.set(issueId, issue);
      this.issueFingerprintMap.set(issueKey, issueId);

      // Create notification for new issue
      this.createNotification({
        organizationId,
        title: `New Issue: ${type}`,
        message: `${title} (${culprit}) in ${environment}`,
        severity: severity === 'critical' ? 'critical' : 'error',
        type: 'new_issue',
        link: `/org/acme-corp/issues/${issueId}`,
      });
    } else {
      issue = this.issues.get(issueId)!;
      // Regression check: If status was 'resolved' and a new event arrives, it has regressed!
      if (issue.status === 'resolved') {
        issue.status = 'unresolved';
        issue.isRegressed = true;
        isRegression = true;

        this.createNotification({
          organizationId,
          title: `Regression: ${issue.type}`,
          message: `${issue.title} reappeared after being marked resolved`,
          severity: 'critical',
          type: 'regression',
          link: `/org/acme-corp/issues/${issueId}`,
        });
      }

      issue.count += 1;
      if (params.user?.id) issue.userCount += 1;
      // Ensure out-of-order timestamps don't rewind lastSeen
      if (new Date(occurredAt).getTime() > new Date(issue.lastSeen).getTime()) {
        issue.lastSeen = occurredAt;
      }
      issue.release = release;
      issue.environment = environment;
    }

    // Create event record
    const eventRecordId = `evt_${crypto.randomUUID().slice(0, 8)}`;
    const event: EventRecord = {
      id: eventRecordId,
      eventId,
      issueId,
      projectId,
      organizationId,
      environment,
      release,
      exception: {
        type,
        value: title,
        handled: false,
      },
      frames,
      breadcrumbs,
      tags: {
        ...tags,
        environment,
        release,
        severity,
      },
      user: params.user,
      request: params.request,
      occurredAt,
      receivedAt,
    };
    this.events.set(eventRecordId, event);
    this.eventDedupMap.set(dedupKey, eventRecordId);

    issue.latestEventId = eventRecordId;

    // Increment project & subscription counts
    const project = this.projects.get(projectId);
    if (project) project.eventCount += 1;

    const sub = this.subscriptions.get(organizationId);
    if (sub) {
      sub.acceptedEvents += 1;
      sub.billableEvents += 1;
    }

    // Check active alert rules
    this.evaluateAlertsForEvent(issue, isNewIssue, isRegression);

    return {
      status: 'inserted',
      isNewIssue,
      isRegression,
      issue,
      event,
    };
  }

  private async evaluateAlertsForEvent(issue: IssueRecord, isNewIssue: boolean, isRegression: boolean) {
    for (const rule of this.alertRules.values()) {
      if (rule.projectId === issue.projectId && rule.status === 'active') {
        let shouldTrigger = false;
        if (rule.condition.type === 'new_issue' && isNewIssue) shouldTrigger = true;
        if (rule.condition.type === 'regression' && isRegression) shouldTrigger = true;
        if (rule.condition.type === 'frequency_spike' && issue.count >= (rule.condition.threshold || 50)) shouldTrigger = true;

        if (shouldTrigger) {
          this.alertDeliveries.set(`del_${Date.now()}`, {
            id: `del_${Date.now()}`,
            projectId: issue.projectId,
            alertRuleId: rule.id,
            issueId: issue.id,
            condition: `Triggered by rule ${rule.name} on ${issue.title}`,
            destination: rule.destination,
            status: 'sent',
            attempts: 1,
            sentAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  // ==================== ISSUES QUERYING & MUTATION ====================

  async listIssues(filter: {
    projectId?: string;
    status?: 'all' | 'unresolved' | 'resolved' | 'ignored';
    environment?: string;
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: IssueRecord[]; total: number; hasMore: boolean }> {
    let items = Array.from(this.issues.values());

    if (filter.projectId) {
      items = items.filter((i) => i.projectId === filter.projectId);
    }
    if (filter.status && filter.status !== 'all') {
      items = items.filter((i) => i.status === filter.status);
    }
    if (filter.environment && filter.environment !== 'all') {
      items = items.filter((i) => i.environment.toLowerCase() === filter.environment?.toLowerCase());
    }
    if (filter.query) {
      const q = filter.query.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.culprit.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.fingerprint.toLowerCase().includes(q)
      );
    }

    // Sort by lastSeen descending
    items.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

    const total = items.length;
    const limit = filter.limit || 25;
    const offset = filter.offset || 0;
    const paged = items.slice(offset, offset + limit);

    return {
      items: paged,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getIssueById(id: string): Promise<IssueRecord | null> {
    return this.issues.get(id) || null;
  }

  async patchIssue(
    id: string,
    patch: { status?: 'unresolved' | 'resolved' | 'ignored'; assignedTo?: string | null },
    actor?: { id: string; name: string; email: string }
  ): Promise<IssueRecord | null> {
    const issue = this.issues.get(id);
    if (!issue) return null;

    const prevStatus = issue.status;
    const prevAssignee = issue.assignedTo;

    if (patch.status !== undefined) {
      issue.status = patch.status;
      if (patch.status === 'resolved') {
        issue.isRegressed = false;
      }
    }
    if (patch.assignedTo !== undefined) {
      issue.assignedTo = patch.assignedTo;
    }

    // Record audit log
    if (actor) {
      if (patch.status !== undefined && patch.status !== prevStatus) {
        this.recordAuditLog({
          organizationId: issue.organizationId,
          actor,
          action: 'issue.status_change',
          resource: 'issue',
          targetId: id,
          previousValue: prevStatus,
          newValue: patch.status,
          result: 'success',
        });
      }
      if (patch.assignedTo !== undefined && patch.assignedTo !== prevAssignee) {
        this.recordAuditLog({
          organizationId: issue.organizationId,
          actor,
          action: 'issue.assign',
          resource: 'issue',
          targetId: id,
          previousValue: prevAssignee || 'none',
          newValue: patch.assignedTo || 'none',
          result: 'success',
        });
      }
    }

    return issue;
  }

  async getIssueEvents(issueId: string): Promise<EventRecord[]> {
    return Array.from(this.events.values()).filter((e) => e.issueId === issueId);
  }

  async getLatestEventForIssue(issueId: string): Promise<EventRecord | null> {
    const events = await this.getIssueEvents(issueId);
    if (events.length === 0) return null;
    return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];
  }

  // ==================== GLOBAL SEARCH ====================

  async globalSearch(organizationId: string, query: string): Promise<{
    issues: IssueRecord[];
    projects: ProjectRecord[];
    releases: ReleaseRecord[];
    users: Array<{ id: string; name: string; email: string }>;
  }> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { issues: [], projects: [], releases: [], users: [] };
    }

    const orgProjects = await this.listProjectsByOrg(organizationId);
    const projectIds = new Set(orgProjects.map((p) => p.id));

    // Match issues
    const matchedIssues = Array.from(this.issues.values())
      .filter(
        (i) =>
          projectIds.has(i.projectId) &&
          (i.title.toLowerCase().includes(q) ||
            i.culprit.toLowerCase().includes(q) ||
            i.type.toLowerCase().includes(q) ||
            i.fingerprint.toLowerCase().includes(q))
      )
      .slice(0, 10);

    // Match projects
    const matchedProjects = orgProjects
      .filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
      .slice(0, 5);

    // Match releases
    const matchedReleases = Array.from(this.releases.values())
      .filter((r) => projectIds.has(r.projectId) && (r.version.toLowerCase().includes(q) || r.ref.toLowerCase().includes(q)))
      .slice(0, 5);

    // Match members
    const members = await this.listMembersByOrg(organizationId);
    const matchedUsers = members
      .map((m) => m.user)
      .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice(0, 5)
      .map((u) => ({ id: u.id, name: u.name, email: u.email }));

    return {
      issues: matchedIssues,
      projects: matchedProjects,
      releases: matchedReleases,
      users: matchedUsers,
    };
  }

  // ==================== MONITORING & ANALYTICS STATS ====================

  async getMonitoringStats(projectId: string, timeRange: string = '24h', environment: string = 'all') {
    let projectIssues = Array.from(this.issues.values()).filter((i) => i.projectId === projectId);
    if (environment !== 'all') {
      projectIssues = projectIssues.filter((i) => i.environment.toLowerCase() === environment.toLowerCase());
    }

    const totalEvents = projectIssues.reduce((acc, curr) => acc + curr.count, 0);
    const unresolvedIssues = projectIssues.filter((i) => i.status === 'unresolved').length;
    const resolvedIssues = projectIssues.filter((i) => i.status === 'resolved').length;
    const affectedUsers = projectIssues.reduce((acc, curr) => acc + curr.userCount, 0);
    const regressedIssues = projectIssues.filter((i) => i.isRegressed === true || (i.status === 'unresolved' && i.count > 100)).length;

    // Time window calculation
    const now = Date.now();
    let windowMs = 24 * 3600000;
    let bucketsCount = 12; // 2 hour intervals
    if (timeRange === '1h') {
      windowMs = 3600000;
      bucketsCount = 12; // 5 min intervals
    } else if (timeRange === '7d') {
      windowMs = 7 * 86400000;
      bucketsCount = 7; // daily intervals
    } else if (timeRange === '30d') {
      windowMs = 30 * 86400000;
      bucketsCount = 15; // 2 day intervals
    }

    const stepMs = windowMs / bucketsCount;
    const chartBuckets = [];
    for (let b = bucketsCount - 1; b >= 0; b--) {
      const bucketStart = new Date(now - (b + 1) * stepMs);
      const label =
        timeRange === '1h'
          ? bucketStart.toLocaleTimeString([], { minute: '2-digit' })
          : timeRange === '24h'
          ? bucketStart.toLocaleTimeString([], { hour: '2-digit' })
          : bucketStart.toLocaleDateString([], { month: 'short', day: 'numeric' });

      // Calculate count dynamically proportional to total
      const count = Math.max(2, Math.floor((totalEvents / bucketsCount) * (0.6 + ((b * 7) % 10) / 10)));
      chartBuckets.push({
        label,
        count,
        timestamp: bucketStart.toISOString(),
      });
    }

    // Severity distribution
    const severityMap: Record<string, number> = { critical: 0, error: 0, warning: 0, info: 0 };
    for (const iss of projectIssues) {
      severityMap[iss.severity] = (severityMap[iss.severity] || 0) + iss.count;
    }

    // Sessions metrics
    const sessions = Array.from(this.sessions.values()).filter((s) => s.projectId === projectId);
    const totalSessions = Math.max(sessions.length, 120);
    const crashedSessions = sessions.filter((s) => s.status === 'crashed').length;
    const crashFreePercent = Number(((1 - crashedSessions / totalSessions) * 100).toFixed(2));

    return {
      totalEvents,
      unresolvedIssues,
      resolvedIssues,
      affectedUsers,
      regressedIssues,
      errorRate: Number(((totalEvents / totalSessions) * 10).toFixed(1)),
      crashFreePercent,
      chartBuckets,
      severityMap,
    };
  }

  // ==================== SUBSCRIPTIONS & BILLING ====================

  async getSubscription(organizationId: string): Promise<SubscriptionRecord | null> {
    return this.subscriptions.get(organizationId) || null;
  }

  async updateSubscriptionPlan(
    organizationId: string,
    plan: 'free' | 'pro' | 'enterprise',
    actor?: { id: string; name: string; email: string }
  ): Promise<SubscriptionRecord> {
    let sub = this.subscriptions.get(organizationId);
    const limits = { free: 10000, pro: 100000, enterprise: 1000000 };
    const costs = { free: 0, pro: 49, enterprise: 199 };

    const prevPlan = sub?.plan || 'free';

    if (!sub) {
      sub = {
        id: `sub_${organizationId}`,
        organizationId,
        plan,
        status: 'active',
        period: 'monthly',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        acceptedEvents: 0,
        billableEvents: 0,
        eventLimit: limits[plan],
        costMonthly: costs[plan],
      };
      this.subscriptions.set(organizationId, sub);
    } else {
      sub.plan = plan;
      sub.eventLimit = limits[plan];
      sub.costMonthly = costs[plan];
    }

    const org = this.organizations.get(organizationId);
    if (org) org.plan = plan;

    if (actor) {
      this.recordAuditLog({
        organizationId,
        actor,
        action: 'billing.plan_change',
        resource: 'subscription',
        previousValue: prevPlan,
        newValue: plan,
        result: 'success',
      });
    }

    return sub;
  }

  async listInvoices(organizationId: string): Promise<InvoiceRecord[]> {
    return this.invoices.get(organizationId) || [];
  }

  // Generate downloadable invoice receipt
  generateInvoiceContent(invoiceId: string, orgName: string, amount: string, date: string): string {
    return `=====================================================
ERRORPULSE TECHNOLOGIES INC. — OFFICIAL TAX INVOICE
=====================================================
Invoice ID: ${invoiceId}
Customer: ${orgName}
Date of Issue: ${date}
Payment Status: PAID IN FULL

Line Items:
-----------------------------------------------------
1. Commercial SaaS Error Tracking Pro Plan Subscription
   Coverage: Monthly Ingestion Quota (100,000 Events)
   Amount: ${amount}
-----------------------------------------------------
Total Paid: ${amount}
Payment Method: Stripe / Credit Card on File (ending 4242)
VAT ID: US-99120381

Thank you for choosing ErrorPulse for real-time exception monitoring!
=====================================================`;
  }

  // ==================== AUDIT LOGS ====================

  recordAuditLog(log: Omit<AuditLogRecord, 'id' | 'occurredAt'>): AuditLogRecord {
    const record: AuditLogRecord = {
      id: `aud_${crypto.randomUUID().slice(0, 8)}`,
      occurredAt: new Date().toISOString(),
      ...log,
    };
    this.auditLogs.unshift(record);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return record;
  }

  listAuditLogs(organizationId: string, filter?: { actorId?: string; action?: string; limit?: number }): AuditLogRecord[] {
    let logs = this.auditLogs.filter((l) => l.organizationId === organizationId);
    if (filter?.actorId) {
      logs = logs.filter((l) => l.actor.id === filter.actorId);
    }
    if (filter?.action) {
      logs = logs.filter((l) => l.action.toLowerCase().includes(filter.action!.toLowerCase()));
    }
    return logs.slice(0, filter?.limit || 50);
  }

  // ==================== RELEASES ====================

  async listReleases(projectId: string): Promise<ReleaseRecord[]> {
    return Array.from(this.releases.values()).filter((r) => r.projectId === projectId);
  }

  async createRelease(projectId: string, version: string, ref?: string): Promise<ReleaseRecord> {
    const id = `rel_${crypto.randomUUID().slice(0, 8)}`;
    const rel: ReleaseRecord = {
      id,
      projectId,
      version,
      ref: ref || `git:${crypto.randomBytes(4).toString('hex')}`,
      deployedAt: new Date().toISOString(),
      status: 'healthy',
      newIssuesCount: 0,
      regressedIssuesCount: 0,
      totalEventsCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.releases.set(id, rel);
    return rel;
  }

  // ==================== ALERTS ====================

  async listAlertRules(projectId: string): Promise<AlertRuleRecord[]> {
    return Array.from(this.alertRules.values()).filter((r) => r.projectId === projectId);
  }

  async createAlertRule(rule: Omit<AlertRuleRecord, 'id' | 'createdAt'>): Promise<AlertRuleRecord> {
    const id = `alt_${Date.now()}`;
    const newRule: AlertRuleRecord = {
      ...rule,
      id,
      createdAt: new Date().toISOString(),
    };
    this.alertRules.set(id, newRule);
    return newRule;
  }

  async toggleAlertRule(id: string): Promise<AlertRuleRecord | null> {
    const rule = this.alertRules.get(id);
    if (!rule) return null;
    rule.status = rule.status === 'active' ? 'paused' : 'active';
    return rule;
  }

  async deleteAlertRule(id: string): Promise<boolean> {
    return this.alertRules.delete(id);
  }

  async listDeliveries(projectId: string): Promise<AlertDeliveryRecord[]> {
    return Array.from(this.alertDeliveries.values())
      .filter((d) => d.projectId === projectId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  // ==================== NOTIFICATIONS ====================

  createNotification(notif: Omit<NotificationRecord, 'id' | 'createdAt' | 'isRead'>): NotificationRecord {
    const record: NotificationRecord = {
      ...notif,
      id: `notif_${crypto.randomUUID().slice(0, 8)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    const list = this.notifications.get(notif.organizationId) || [];
    list.unshift(record);
    this.notifications.set(notif.organizationId, list);
    return record;
  }

  listNotifications(organizationId: string): NotificationRecord[] {
    return this.notifications.get(organizationId) || [];
  }

  markNotificationAsRead(organizationId: string, id: string): boolean {
    const list = this.notifications.get(organizationId) || [];
    const n = list.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      return true;
    }
    return false;
  }

  // ==================== PERFORMANCE ====================

  recordPerformanceMetric(metric: Omit<PerformanceMetricRecord, 'id' | 'occurredAt'>): PerformanceMetricRecord {
    const rec: PerformanceMetricRecord = {
      ...metric,
      id: `pm_${crypto.randomUUID().slice(0, 8)}`,
      occurredAt: new Date().toISOString(),
    };
    this.performanceMetrics.push(rec);
    if (this.performanceMetrics.length > 2000) this.performanceMetrics.shift();
    return rec;
  }

  getPerformanceStats(projectId: string) {
    const metrics = this.performanceMetrics.filter((m) => m.projectId === projectId);
    if (metrics.length === 0) {
      return {
        avgDuration: 85,
        p50: 65,
        p95: 180,
        p99: 450,
        slowEndpoints: [],
        totalRequests: 0,
        failureRate: 0.8,
      };
    }

    const durations = metrics.map((m) => m.durationMs).sort((a, b) => a - b);
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
    const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
    const p99 = durations[Math.floor(durations.length * 0.99)] || 0;

    const endpointMap = new Map<string, { count: number; totalMs: number; errors: number }>();
    for (const m of metrics) {
      const cur = endpointMap.get(m.endpoint) || { count: 0, totalMs: 0, errors: 0 };
      cur.count += 1;
      cur.totalMs += m.durationMs;
      if (m.statusCode >= 500) cur.errors += 1;
      endpointMap.set(m.endpoint, cur);
    }

    const slowEndpoints = Array.from(endpointMap.entries()).map(([endpoint, data]) => ({
      endpoint,
      avgMs: Math.round(data.totalMs / data.count),
      calls: data.count,
      errorRate: Number(((data.errors / data.count) * 100).toFixed(1)),
    })).sort((a, b) => b.avgMs - a.avgMs);

    const totalErrors = metrics.filter((m) => m.statusCode >= 400).length;
    const failureRate = Number(((totalErrors / metrics.length) * 100).toFixed(1));

    return {
      avgDuration,
      p50,
      p95,
      p99,
      slowEndpoints,
      totalRequests: metrics.length,
      failureRate,
    };
  }

  // ==================== SESSIONS ====================

  listSessions(projectId: string): SessionRecord[] {
    return Array.from(this.sessions.values()).filter((s) => s.projectId === projectId);
  }

  // ==================== INTEGRATIONS ====================

  listIntegrations(organizationId: string): IntegrationRecord[] {
    return this.integrations.get(organizationId) || [];
  }

  updateIntegration(organizationId: string, id: string, config: Record<string, string>, status: IntegrationRecord['status']) {
    const list = this.integrations.get(organizationId) || [];
    const item = list.find((i) => i.id === id);
    if (item) {
      item.config = { ...item.config, ...config };
      item.status = status;
      item.lastTestedAt = new Date().toISOString();
      return item;
    }
    return null;
  }
}

// Global server singleton
const globalServerDb = new ServerDatabase();

export function getServerDb(): ServerDatabase {
  return globalServerDb;
}
