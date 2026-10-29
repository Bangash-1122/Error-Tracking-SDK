import crypto from 'node:crypto';
import type { 
  Organization, 
  User, 
  Membership, 
  Project, 
  ProjectKey, 
  Issue, 
  EventRecord, 
  Release, 
  IssueRelease,
  AlertRule, 
  AlertDelivery, 
  Subscription, 
  UsageCounter 
} from './schema/index.js';

export interface IngestTransactionResult {
  status: 'inserted' | 'duplicate';
  isNewIssue: boolean;
  issue: Issue;
  event: EventRecord;
}

export interface IssueListFilter {
  projectId?: string;
  status?: string;
  query?: string;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  total?: number;
}

/**
 * Universal Repository Interface
 * Supports both high-concurrency in-memory implementation for deterministic testing
 * and direct Drizzle ORM execution for PostgreSQL production deployment.
 */
export interface IRepository {
  // Organizations & Users
  createOrganization(name: string, slug: string, ownerUserId?: string): Promise<Organization>;
  getOrganizationById(id: string): Promise<Organization | null>;
  getOrganizationBySlug(slug: string): Promise<Organization | null>;
  createUser(email: string, name: string, passwordHash: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  addMembership(orgId: string, userId: string, role?: string): Promise<Membership>;
  getMembership(orgId: string, userId: string): Promise<Membership | null>;

  // Projects & Keys
  createProject(orgId: string, name: string, platform?: string): Promise<Project>;
  getProjectById(id: string): Promise<Project | null>;
  listProjectsByOrg(orgId: string): Promise<Project[]>;
  issueProjectKey(projectId: string, name?: string): Promise<{ key: ProjectKey; rawKey: string }>;
  rotateProjectKey(projectId: string): Promise<{ key: ProjectKey; rawKey: string }>;
  getProjectKeyByHash(keyHash: string): Promise<(ProjectKey & { project: Project }) | null>;
  getProjectKeyByRaw(rawKey: string): Promise<(ProjectKey & { project: Project }) | null>;

  // Issues & Events (Transactional Worker Pipeline)
  recordIngestEventTransactional(params: {
    projectId: string;
    organizationId: string;
    eventId: string;
    fingerprint: string;
    title: string;
    culprit: string;
    type: string;
    release?: string;
    environment?: string;
    payload: Record<string, unknown>;
    occurredAt: Date;
  }): Promise<IngestTransactionResult>;

  listIssues(filter: IssueListFilter): Promise<PaginatedResult<Issue>>;
  getIssueById(id: string): Promise<Issue | null>;
  getIssueEvents(issueId: string, limit?: number, cursor?: string): Promise<PaginatedResult<EventRecord>>;
  patchIssue(id: string, patch: { status?: 'unresolved' | 'resolved' | 'ignored'; assignedTo?: string | null }): Promise<Issue | null>;

  // Releases
  createRelease(projectId: string, version: string, metadata?: Record<string, unknown>): Promise<Release>;
  getRelease(projectId: string, version: string): Promise<Release | null>;
  listReleases(projectId: string): Promise<Release[]>;
  getIssueReleases(issueId: string): Promise<IssueRelease[]>;

  // Alerts
  createAlertRule(projectId: string, condition: Record<string, unknown>, destination: string, cooldownMinutes?: number): Promise<AlertRule>;
  listAlertRules(projectId: string): Promise<AlertRule[]>;
  getAlertRuleById(id: string): Promise<AlertRule | null>;
  deleteAlertRule(id: string): Promise<boolean>;
  recordAlertDelivery(delivery: {
    projectId: string;
    alertRuleId: string;
    issueId?: string;
    condition: string;
    destination: string;
    status: 'sent' | 'failed';
    attempts?: number;
  }): Promise<AlertDelivery>;

  // Subscriptions & Usage
  getSubscription(organizationId: string): Promise<Subscription | null>;
  updateSubscription(orgId: string, plan: 'free' | 'pro' | 'enterprise', limit: number): Promise<Subscription>;
  getUsage(organizationId: string, period: string): Promise<UsageCounter | null>;
  
  // Clean / reset (for testing)
  clear(): Promise<void>;
}

export function hashProjectKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * High-performance, concurrent, in-memory repository implementing all constraints:
 * - unique(project_id, fingerprint) with atomic upsert
 * - unique(project_id, event_id) duplicate rejection without count increment
 * - (project_id, last_seen) recency sorting
 * - Deterministic cursor-based pagination
 * - Proper timestamp tracking (preventing regressions from delayed events)
 * - Release tracking and issue-release relations
 * - Tenant isolation
 */
export class MemoryRepository implements IRepository {
  private orgs = new Map<string, Organization>();
  private orgSlugToId = new Map<string, string>();

  private users = new Map<string, User>();
  private userEmailToId = new Map<string, string>();

  private memberships = new Map<string, Membership>(); // key: `orgId:userId`
  private projects = new Map<string, Project>();
  private keys = new Map<string, ProjectKey>();
  private keyHashToId = new Map<string, string>();

  private issues = new Map<string, Issue>(); // key: issue.id
  private issueFingerprintToId = new Map<string, string>(); // key: `projectId:fingerprint`

  private events = new Map<string, EventRecord>(); // key: event.id
  private eventDedup = new Map<string, string>(); // key: `projectId:eventId` -> event.id

  private releases = new Map<string, Release>(); // key: `projectId:version`
  private issueReleases = new Map<string, IssueRelease>(); // key: `issueId:releaseId`

  private alertRules = new Map<string, AlertRule>();
  private alertDeliveries = new Map<string, AlertDelivery>();
  private subscriptions = new Map<string, Subscription>(); // key: orgId
  private usage = new Map<string, UsageCounter>(); // key: `orgId:YYYY-MM`

  // Mutex lock for atomic transactional operations
  private lockPromise = Promise.resolve();

  private async withLock<T>(fn: () => T | Promise<T>): Promise<T> {
    const next = this.lockPromise.then(fn, fn);
    this.lockPromise = next.then(() => {}, () => {});
    return next;
  }

  async clear(): Promise<void> {
    this.orgs.clear();
    this.orgSlugToId.clear();
    this.users.clear();
    this.userEmailToId.clear();
    this.memberships.clear();
    this.projects.clear();
    this.keys.clear();
    this.keyHashToId.clear();
    this.issues.clear();
    this.issueFingerprintToId.clear();
    this.events.clear();
    this.eventDedup.clear();
    this.releases.clear();
    this.issueReleases.clear();
    this.alertRules.clear();
    this.alertDeliveries.clear();
    this.subscriptions.clear();
    this.usage.clear();
  }

  async createOrganization(name: string, slug: string, ownerUserId?: string): Promise<Organization> {
    if (this.orgSlugToId.has(slug)) {
      throw new Error(`Organization slug '${slug}' already exists`);
    }

    const org: Organization = {
      id: crypto.randomUUID(),
      name,
      slug,
      createdAt: new Date(),
    };
    this.orgs.set(org.id, org);
    this.orgSlugToId.set(slug, org.id);

    // Default free subscription
    const sub: Subscription = {
      id: crypto.randomUUID(),
      organizationId: org.id,
      plan: 'free',
      period: 'monthly',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      eventLimit: 10000,
    };
    this.subscriptions.set(org.id, sub);

    if (ownerUserId) {
      await this.addMembership(org.id, ownerUserId, 'owner');
    }

    return org;
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return this.orgs.get(id) || null;
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    const id = this.orgSlugToId.get(slug);
    if (!id) return null;
    return this.orgs.get(id) || null;
  }

  async createUser(email: string, name: string, passwordHash: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.userEmailToId.has(normalizedEmail)) {
      throw new Error(`User with email '${email}' already exists`);
    }
    const user: User = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name,
      passwordHash,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    this.userEmailToId.set(normalizedEmail, user.id);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const id = this.userEmailToId.get(normalizedEmail);
    if (!id) return null;
    return this.users.get(id) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async addMembership(orgId: string, userId: string, role = 'member'): Promise<Membership> {
    const key = `${orgId}:${userId}`;
    const membership: Membership = {
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId,
      role,
      createdAt: new Date(),
    };
    this.memberships.set(key, membership);
    return membership;
  }

  async getMembership(orgId: string, userId: string): Promise<Membership | null> {
    return this.memberships.get(`${orgId}:${userId}`) || null;
  }

  async createProject(orgId: string, name: string, platform = 'javascript'): Promise<Project> {
    const project: Project = {
      id: crypto.randomUUID(),
      organizationId: orgId,
      name,
      platform,
      createdAt: new Date(),
    };
    this.projects.set(project.id, project);

    // Automatically issue default key
    await this.issueProjectKey(project.id, 'Default Ingest Key');
    return project;
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projects.get(id) || null;
  }

  async listProjectsByOrg(orgId: string): Promise<Project[]> {
    const list: Project[] = [];
    for (const p of this.projects.values()) {
      if (p.organizationId === orgId) list.push(p);
    }
    return list;
  }

  async issueProjectKey(projectId: string, name = 'Default Ingest Key'): Promise<{ key: ProjectKey; rawKey: string }> {
    const rawKey = `ek_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = hashProjectKey(rawKey);

    const key: ProjectKey = {
      id: crypto.randomUUID(),
      projectId,
      name,
      publicKey: rawKey.slice(0, 16) + '...',
      keyHash,
      status: 'active',
      rotatedAt: null,
      createdAt: new Date(),
    };
    this.keys.set(key.id, key);
    this.keyHashToId.set(keyHash, key.id);
    return { key, rawKey };
  }

  async rotateProjectKey(projectId: string): Promise<{ key: ProjectKey; rawKey: string }> {
    // Revoke previous active keys
    const now = new Date();
    for (const k of this.keys.values()) {
      if (k.projectId === projectId && k.status === 'active') {
        k.status = 'revoked';
        k.rotatedAt = now;
      }
    }
    return this.issueProjectKey(projectId, 'Rotated Ingest Key');
  }

  async getProjectKeyByHash(keyHash: string): Promise<(ProjectKey & { project: Project }) | null> {
    const keyId = this.keyHashToId.get(keyHash);
    if (!keyId) return null;
    const key = this.keys.get(keyId);
    if (!key) return null;
    const project = this.projects.get(key.projectId);
    if (!project) return null;
    return { ...key, project };
  }

  async getProjectKeyByRaw(rawKey: string): Promise<(ProjectKey & { project: Project }) | null> {
    const hash = hashProjectKey(rawKey);
    return this.getProjectKeyByHash(hash);
  }

  /**
   * Transactional Event & Issue Processing
   * Enforces:
   * 1. Duplicate check: if (projectId, eventId) exists, return duplicate, DO NOT increment count.
   * 2. Atomic issue upsert by (projectId, fingerprint) -> increment count, reopen if resolved,
   *    and correctly update firstSeen/lastSeen bounds without date regressions.
   * 3. Insert event record.
   * 4. Link release & issueReleases if release is specified.
   * 5. Increment usage counter for org.
   */
  async recordIngestEventTransactional(params: {
    projectId: string;
    organizationId: string;
    eventId: string;
    fingerprint: string;
    title: string;
    culprit: string;
    type: string;
    release?: string;
    environment?: string;
    payload: Record<string, unknown>;
    occurredAt: Date;
  }): Promise<IngestTransactionResult> {
    return this.withLock(async () => {
      // 1. Check duplicate (project_id, event_id)
      const dedupKey = `${params.projectId}:${params.eventId}`;
      const existingEventId = this.eventDedup.get(dedupKey);
      if (existingEventId) {
        const existingEvent = this.events.get(existingEventId)!;
        const existingIssue = this.issues.get(existingEvent.issueId)!;
        return {
          status: 'duplicate',
          isNewIssue: false,
          issue: existingIssue,
          event: existingEvent,
        };
      }

      // 2. Atomic issue upsert by (project_id, fingerprint)
      const issueKey = `${params.projectId}:${params.fingerprint}`;
      const existingIssueId = this.issueFingerprintToId.get(issueKey);
      let issue: Issue;
      let isNewIssue = false;

      if (!existingIssueId) {
        isNewIssue = true;
        issue = {
          id: crypto.randomUUID(),
          projectId: params.projectId,
          fingerprint: params.fingerprint,
          title: params.title,
          culprit: params.culprit,
          type: params.type,
          status: 'unresolved',
          count: 1,
          firstSeen: params.occurredAt,
          lastSeen: params.occurredAt,
          assignedTo: null,
          createdAt: new Date(),
        };
        this.issues.set(issue.id, issue);
        this.issueFingerprintToId.set(issueKey, issue.id);
      } else {
        issue = this.issues.get(existingIssueId)!;
        issue.count += 1;
        // Avoid setting lastSeen backwards when historical/delayed events arrive
        if (params.occurredAt.getTime() > issue.lastSeen.getTime()) {
          issue.lastSeen = params.occurredAt;
        }
        if (params.occurredAt.getTime() < issue.firstSeen.getTime()) {
          issue.firstSeen = params.occurredAt;
        }
        if (issue.status === 'resolved') {
          issue.status = 'unresolved'; // reopen resolved issues on new occurrences
        }
      }

      // 3. Insert event
      const eventRecord: EventRecord = {
        id: crypto.randomUUID(),
        projectId: params.projectId,
        issueId: issue.id,
        eventId: params.eventId,
        payload: params.payload,
        receivedAt: new Date(),
      };
      this.events.set(eventRecord.id, eventRecord);
      this.eventDedup.set(dedupKey, eventRecord.id);

      // 4. Release tracking
      if (params.release) {
        const releaseKey = `${params.projectId}:${params.release}`;
        let release = this.releases.get(releaseKey);
        if (!release) {
          release = {
            id: crypto.randomUUID(),
            projectId: params.projectId,
            version: params.release,
            metadata: null,
            createdAt: new Date(),
          };
          this.releases.set(releaseKey, release);
        }
        const irKey = `${issue.id}:${release.id}`;
        if (!this.issueReleases.has(irKey)) {
          const issueRel: IssueRelease = {
            id: crypto.randomUUID(),
            issueId: issue.id,
            releaseId: release.id,
            firstSeenAt: params.occurredAt,
          };
          this.issueReleases.set(irKey, issueRel);
        }
      }

      // 5. Update usage counter
      const period = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
      const usageKey = `${params.organizationId}:${period}`;
      let counter = this.usage.get(usageKey);
      if (!counter) {
        counter = {
          id: crypto.randomUUID(),
          organizationId: params.organizationId,
          period,
          acceptedEvents: 1,
          billableEvents: 1,
          updatedAt: new Date(),
        };
        this.usage.set(usageKey, counter);
      } else {
        counter.acceptedEvents += 1;
        counter.billableEvents += 1;
        counter.updatedAt = new Date();
      }

      return {
        status: 'inserted',
        isNewIssue,
        issue,
        event: eventRecord,
      };
    });
  }

  async listIssues(filter: IssueListFilter): Promise<PaginatedResult<Issue>> {
    let list: Issue[] = [];

    for (const issue of this.issues.values()) {
      if (filter.projectId && issue.projectId !== filter.projectId) continue;
      if (filter.status && issue.status !== filter.status) continue;
      if (filter.query) {
        const q = filter.query.toLowerCase();
        const matches = issue.title.toLowerCase().includes(q) || issue.culprit.toLowerCase().includes(q);
        if (!matches) continue;
      }
      list.push(issue);
    }

    // Sort by lastSeen DESC, tie-break by ID DESC for absolute stability
    list.sort((a, b) => {
      const diff = b.lastSeen.getTime() - a.lastSeen.getTime();
      if (diff !== 0) return diff;
      return b.id.localeCompare(a.id);
    });

    // Cursor pagination (cursor is base64 timestamp:id or JSON { lastSeen, id })
    let startIndex = 0;
    if (filter.cursor) {
      try {
        let cursorTime: number | null = null;
        let cursorId: string | null = null;

        let raw = filter.cursor;
        try {
          const decoded = Buffer.from(filter.cursor, 'base64').toString('utf8');
          if (decoded.startsWith('{') || decoded.includes(':')) {
            raw = decoded;
          }
        } catch {
          // not base64
        }

        if (raw.startsWith('{')) {
          const parsed = JSON.parse(raw);
          cursorTime = parsed.lastSeen ? new Date(parsed.lastSeen).getTime() : (parsed.t ? new Date(parsed.t).getTime() : null);
          cursorId = parsed.id;
        } else if (raw.includes(':')) {
          const lastColon = raw.lastIndexOf(':');
          const timeStr = raw.slice(0, lastColon);
          cursorId = raw.slice(lastColon + 1);
          cursorTime = new Date(timeStr).getTime();
        }

        if (cursorId) {
          const foundIndex = list.findIndex(i => i.id === cursorId);
          if (foundIndex !== -1) {
            startIndex = foundIndex + 1;
          } else if (cursorTime !== null && !isNaN(cursorTime)) {
            const found = list.findIndex(i => {
              const t = i.lastSeen.getTime();
              return t < cursorTime! || (t === cursorTime! && i.id.localeCompare(cursorId!) < 0);
            });
            if (found !== -1) startIndex = found;
          }
        }
      } catch {
        // fallback to start
      }
    }

    const limit = filter.limit || 25;
    const paginated = list.slice(startIndex, startIndex + limit);

    let nextCursor: string | null = null;
    if (startIndex + paginated.length < list.length && paginated.length > 0) {
      const lastItem = paginated[paginated.length - 1];
      nextCursor = Buffer.from(`${lastItem.lastSeen.toISOString()}:${lastItem.id}`).toString('base64');
    }

    return {
      items: paginated,
      nextCursor,
      total: list.length,
    };
  }

  async getIssueById(id: string): Promise<Issue | null> {
    return this.issues.get(id) || null;
  }

  async getIssueEvents(issueId: string, limit = 25, cursor?: string): Promise<PaginatedResult<EventRecord>> {
    const list: EventRecord[] = [];

    for (const ev of this.events.values()) {
      if (ev.issueId === issueId) {
        list.push(ev);
      }
    }

    // Sort by receivedAt DESC, tie-break by ID DESC
    list.sort((a, b) => {
      const diff = b.receivedAt.getTime() - a.receivedAt.getTime();
      if (diff !== 0) return diff;
      return b.id.localeCompare(a.id);
    });

    let startIndex = 0;
    if (cursor) {
      try {
        let cursorTime: number | null = null;
        let cursorId: string | null = null;

        let raw = cursor;
        try {
          const decoded = Buffer.from(cursor, 'base64').toString('utf8');
          if (decoded.startsWith('{') || decoded.includes(':')) {
            raw = decoded;
          }
        } catch {
          // not base64
        }

        if (raw.startsWith('{')) {
          const parsed = JSON.parse(raw);
          cursorTime = parsed.receivedAt ? new Date(parsed.receivedAt).getTime() : (parsed.t ? new Date(parsed.t).getTime() : null);
          cursorId = parsed.id;
        } else if (raw.includes(':')) {
          const lastColon = raw.lastIndexOf(':');
          const timeStr = raw.slice(0, lastColon);
          cursorId = raw.slice(lastColon + 1);
          cursorTime = new Date(timeStr).getTime();
        }

        if (cursorId) {
          const foundIndex = list.findIndex(e => e.id === cursorId);
          if (foundIndex !== -1) {
            startIndex = foundIndex + 1;
          } else if (cursorTime !== null && !isNaN(cursorTime)) {
            const found = list.findIndex(e => {
              const t = e.receivedAt.getTime();
              return t < cursorTime! || (t === cursorTime! && e.id.localeCompare(cursorId!) < 0);
            });
            if (found !== -1) startIndex = found;
          }
        }
      } catch {
        // fallback
      }
    }

    const paginated = list.slice(startIndex, startIndex + limit);

    let nextCursor: string | null = null;
    if (startIndex + paginated.length < list.length && paginated.length > 0) {
      const lastItem = paginated[paginated.length - 1];
      nextCursor = Buffer.from(`${lastItem.receivedAt.toISOString()}:${lastItem.id}`).toString('base64');
    }

    return {
      items: paginated,
      nextCursor,
      total: list.length,
    };
  }

  async patchIssue(id: string, patch: { status?: 'unresolved' | 'resolved' | 'ignored'; assignedTo?: string | null }): Promise<Issue | null> {
    const issue = this.issues.get(id);
    if (!issue) return null;

    if (patch.status) issue.status = patch.status;
    if (patch.assignedTo !== undefined) issue.assignedTo = patch.assignedTo;

    return issue;
  }

  async createRelease(projectId: string, version: string, metadata?: Record<string, unknown>): Promise<Release> {
    const release: Release = {
      id: crypto.randomUUID(),
      projectId,
      version,
      metadata: metadata || null,
      createdAt: new Date(),
    };
    this.releases.set(`${projectId}:${version}`, release);
    return release;
  }

  async getRelease(projectId: string, version: string): Promise<Release | null> {
    return this.releases.get(`${projectId}:${version}`) || null;
  }

  async listReleases(projectId: string): Promise<Release[]> {
    const list: Release[] = [];
    for (const r of this.releases.values()) {
      if (r.projectId === projectId) list.push(r);
    }
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return list;
  }

  async getIssueReleases(issueId: string): Promise<IssueRelease[]> {
    const list: IssueRelease[] = [];
    for (const ir of this.issueReleases.values()) {
      if (ir.issueId === issueId) list.push(ir);
    }
    return list;
  }

  async createAlertRule(projectId: string, condition: Record<string, unknown>, destination: string, cooldownMinutes = 15): Promise<AlertRule> {
    const rule: AlertRule = {
      id: crypto.randomUUID(),
      projectId,
      condition: { ...condition, cooldownMinutes },
      destination,
      status: 'active',
      createdAt: new Date(),
    };
    this.alertRules.set(rule.id, rule);
    return rule;
  }

  async listAlertRules(projectId: string): Promise<AlertRule[]> {
    const list: AlertRule[] = [];
    for (const r of this.alertRules.values()) {
      if (r.projectId === projectId && r.status === 'active') {
        list.push(r);
      }
    }
    return list;
  }

  async getAlertRuleById(id: string): Promise<AlertRule | null> {
    return this.alertRules.get(id) || null;
  }

  async deleteAlertRule(id: string): Promise<boolean> {
    return this.alertRules.delete(id);
  }

  async recordAlertDelivery(delivery: {
    projectId: string;
    alertRuleId: string;
    issueId?: string;
    condition: string;
    destination: string;
    status: 'sent' | 'failed';
    attempts?: number;
  }): Promise<AlertDelivery> {
    const record: AlertDelivery = {
      id: crypto.randomUUID(),
      projectId: delivery.projectId,
      alertRuleId: delivery.alertRuleId,
      issueId: delivery.issueId || null,
      condition: delivery.condition,
      destination: delivery.destination,
      attempts: delivery.attempts || 1,
      status: delivery.status,
      sentAt: new Date(),
    };
    this.alertDeliveries.set(record.id, record);
    return record;
  }

  async getSubscription(organizationId: string): Promise<Subscription | null> {
    return this.subscriptions.get(organizationId) || null;
  }

  async updateSubscription(orgId: string, plan: 'free' | 'pro' | 'enterprise', limit: number): Promise<Subscription> {
    let sub = this.subscriptions.get(orgId);
    if (!sub) {
      sub = {
        id: crypto.randomUUID(),
        organizationId: orgId,
        plan,
        period: 'monthly',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        eventLimit: limit,
      };
      this.subscriptions.set(orgId, sub);
    } else {
      sub.plan = plan;
      sub.eventLimit = limit;
    }
    return sub;
  }

  async getUsage(organizationId: string, period: string): Promise<UsageCounter | null> {
    return this.usage.get(`${organizationId}:${period}`) || null;
  }
}

// Global default repository singleton
let globalRepo: IRepository = new MemoryRepository();

export function getRepository(): IRepository {
  return globalRepo;
}

export function setRepository(repo: IRepository) {
  globalRepo = repo;
}
