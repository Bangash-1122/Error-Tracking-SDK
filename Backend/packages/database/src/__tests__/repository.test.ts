import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRepository, hashProjectKey } from '../repository.js';

describe('MemoryRepository - Organizations & Users', () => {
  let repo: MemoryRepository;

  beforeEach(async () => {
    repo = new MemoryRepository();
    await repo.clear();
  });

  it('creates an organization with default free subscription', async () => {
    const org = await repo.createOrganization('Acme Inc', 'acme-inc');
    expect(org.id).toBeDefined();
    expect(org.name).toBe('Acme Inc');
    expect(org.slug).toBe('acme-inc');

    const sub = await repo.getSubscription(org.id);
    expect(sub).toBeDefined();
    expect(sub?.plan).toBe('free');
    expect(sub?.eventLimit).toBe(10000);
  });

  it('rejects duplicate organization slugs', async () => {
    await repo.createOrganization('Acme One', 'acme');
    await expect(repo.createOrganization('Acme Two', 'acme')).rejects.toThrow(
      "Organization slug 'acme' already exists"
    );
  });

  it('creates users and prevents duplicate emails', async () => {
    const user = await repo.createUser('Alice@example.com', 'Alice', 'hash123');
    expect(user.id).toBeDefined();
    expect(user.email).toBe('alice@example.com');

    const fetched = await repo.getUserByEmail('alice@example.com');
    expect(fetched?.id).toBe(user.id);

    await expect(repo.createUser('alice@example.com', 'Alice 2', 'hash456')).rejects.toThrow(
      "User with email 'alice@example.com' already exists"
    );
  });

  it('manages organization memberships', async () => {
    const org = await repo.createOrganization('Test Org', 'test-org');
    const user = await repo.createUser('bob@example.com', 'Bob', 'hash123');

    const membership = await repo.addMembership(org.id, user.id, 'owner');
    expect(membership.role).toBe('owner');

    const check = await repo.getMembership(org.id, user.id);
    expect(check?.role).toBe('owner');
  });
});

describe('MemoryRepository - Projects & Ingest Keys', () => {
  let repo: MemoryRepository;
  let orgId: string;

  beforeEach(async () => {
    repo = new MemoryRepository();
    await repo.clear();
    const org = await repo.createOrganization('Key Org', 'key-org');
    orgId = org.id;
  });

  it('creates a project with an active default key', async () => {
    const project = await repo.createProject(orgId, 'Web App', 'react');
    expect(project.name).toBe('Web App');

    const projects = await repo.listProjectsByOrg(orgId);
    expect(projects.length).toBe(1);
    expect(projects[0].id).toBe(project.id);
  });

  it('issues, resolves, and rotates project keys', async () => {
    const project = await repo.createProject(orgId, 'API Service', 'node');
    const { key, rawKey } = await repo.issueProjectKey(project.id, 'Custom Key');
    expect(key.status).toBe('active');
    expect(key.name).toBe('Custom Key');

    // Resolve by raw key
    const resolved = await repo.getProjectKeyByRaw(rawKey);
    expect(resolved).not.toBeNull();
    expect(resolved?.projectId).toBe(project.id);
    expect(resolved?.project.name).toBe('API Service');

    // Rotate key
    const rotated = await repo.rotateProjectKey(project.id);
    expect(rotated.rawKey).not.toBe(rawKey);

    // Old key is revoked
    const oldKeyResolved = await repo.getProjectKeyByRaw(rawKey);
    expect(oldKeyResolved?.status).toBe('revoked');
    expect(oldKeyResolved?.rotatedAt).toBeInstanceOf(Date);

    // New key is active
    const newKeyResolved = await repo.getProjectKeyByRaw(rotated.rawKey);
    expect(newKeyResolved?.status).toBe('active');
  });
});

describe('MemoryRepository - Ingest Transactions & Deduplication', () => {
  let repo: MemoryRepository;
  let orgId: string;
  let projectId: string;

  beforeEach(async () => {
    repo = new MemoryRepository();
    await repo.clear();
    const org = await repo.createOrganization('Trans Org', 'trans-org');
    orgId = org.id;
    const project = await repo.createProject(orgId, 'Frontend', 'javascript');
    projectId = project.id;
  });

  it('creates a new issue for a unique fingerprint and tracks usage', async () => {
    const result = await repo.recordIngestEventTransactional({
      projectId,
      organizationId: orgId,
      eventId: 'evt-001',
      fingerprint: 'fp-typeerror-map',
      title: 'TypeError: Cannot read properties of undefined',
      culprit: 'components/List.tsx',
      type: 'TypeError',
      release: 'v1.0.0',
      payload: { foo: 'bar' },
      occurredAt: new Date('2026-10-26T10:00:00Z'),
    });

    expect(result.status).toBe('inserted');
    expect(result.isNewIssue).toBe(true);
    expect(result.issue.count).toBe(1);
    expect(result.issue.fingerprint).toBe('fp-typeerror-map');
    expect(result.event.eventId).toBe('evt-001');

    // Verify usage counter
    const period = new Date().toISOString().slice(0, 7);
    const usage = await repo.getUsage(orgId, period);
    expect(usage?.acceptedEvents).toBe(1);
    expect(usage?.billableEvents).toBe(1);

    // Verify release link
    const releases = await repo.listReleases(projectId);
    expect(releases.length).toBe(1);
    expect(releases[0].version).toBe('v1.0.0');

    const issueReleases = await repo.getIssueReleases(result.issue.id);
    expect(issueReleases.length).toBe(1);
  });

  it('increments issue count and updates recency on recurring fingerprint', async () => {
    const t1 = new Date('2026-10-26T10:00:00Z');
    const t2 = new Date('2026-10-26T11:00:00Z');

    const r1 = await repo.recordIngestEventTransactional({
      projectId,
      organizationId: orgId,
      eventId: 'evt-001',
      fingerprint: 'fp-err',
      title: 'Err',
      culprit: 'app.js',
      type: 'Error',
      payload: {},
      occurredAt: t1,
    });

    const r2 = await repo.recordIngestEventTransactional({
      projectId,
      organizationId: orgId,
      eventId: 'evt-002',
      fingerprint: 'fp-err',
      title: 'Err',
      culprit: 'app.js',
      type: 'Error',
      payload: {},
      occurredAt: t2,
    });

    expect(r2.status).toBe('inserted');
    expect(r2.isNewIssue).toBe(false);
    expect(r2.issue.id).toBe(r1.issue.id);
    expect(r2.issue.count).toBe(2);
    expect(r2.issue.lastSeen.getTime()).toBe(t2.getTime());
    expect(r2.issue.firstSeen.getTime()).toBe(t1.getTime());
  });

  it('does NOT regress lastSeen when an older out-of-order event arrives', async () => {
    const tRecent = new Date('2026-10-26T12:00:00Z');
    const tOlder = new Date('2026-10-26T08:00:00Z');

    const r1 = await repo.recordIngestEventTransactional({
      projectId,
      organizationId: orgId,
      eventId: 'evt-recent',
      fingerprint: 'fp-order',
      title: 'Order Err',
      culprit: 'order.js',
      type: 'Error',
      payload: {},
      occurredAt: tRecent,
    });
    expect(r1.issue.lastSeen.getTime()).toBe(tRecent.getTime());

    // Older event arrives later
    const r2 = await repo.recordIngestEventTransactional({
      projectId,
      organizationId: orgId,
      eventId: 'evt-older',
      fingerprint: 'fp-order',
      title: 'Order Err',
      culprit: 'order.js',
      type: 'Error',
      payload: {},
      occurredAt: tOlder,
    });

    expect(r2.issue.count).toBe(2);
    // lastSeen must remain the newer timestamp
    expect(r2.issue.lastSeen.getTime()).toBe(tRecent.getTime());
    // firstSeen updates to the earlier timestamp
    expect(r2.issue.firstSeen.getTime()).toBe(tOlder.getTime());
  });

  it('re-opens resolved issues on new occurrence', async () => {
    const r1 = await repo.recordIngestEventTransactional({
      projectId,
      organizationId: orgId,
      eventId: 'evt-1',
      fingerprint: 'fp-resolve',
      title: 'Resolve Test',
      culprit: 'index.js',
      type: 'Error',
      payload: {},
      occurredAt: new Date(),
    });

    // Resolve the issue
    await repo.patchIssue(r1.issue.id, { status: 'resolved' });
    const resolved = await repo.getIssueById(r1.issue.id);
    expect(resolved?.status).toBe('resolved');

    // New event occurs
    const r2 = await repo.recordIngestEventTransactional({
      projectId,
      organizationId: orgId,
      eventId: 'evt-2',
      fingerprint: 'fp-resolve',
      title: 'Resolve Test',
      culprit: 'index.js',
      type: 'Error',
      payload: {},
      occurredAt: new Date(),
    });

    expect(r2.issue.status).toBe('unresolved');
  });

  it('rejects duplicate eventId without incrementing issue count or usage', async () => {
    const res1 = await repo.recordIngestEventTransactional({
      projectId,
      organizationId: orgId,
      eventId: 'evt-dup-check',
      fingerprint: 'fp-dup',
      title: 'Dup Err',
      culprit: 'dup.js',
      type: 'Error',
      payload: {},
      occurredAt: new Date(),
    });
    expect(res1.status).toBe('inserted');
    expect(res1.issue.count).toBe(1);

    // Ingest the EXACT same event ID again
    const res2 = await repo.recordIngestEventTransactional({
      projectId,
      organizationId: orgId,
      eventId: 'evt-dup-check',
      fingerprint: 'fp-dup',
      title: 'Dup Err',
      culprit: 'dup.js',
      type: 'Error',
      payload: {},
      occurredAt: new Date(),
    });

    expect(res2.status).toBe('duplicate');
    expect(res2.isNewIssue).toBe(false);
    expect(res2.issue.count).toBe(1); // count remained 1!
  });
});

describe('MemoryRepository - Stable Cursor Pagination', () => {
  let repo: MemoryRepository;
  let projectId: string;

  beforeEach(async () => {
    repo = new MemoryRepository();
    await repo.clear();
    const org = await repo.createOrganization('Page Org', 'page-org');
    const project = await repo.createProject(org.id, 'Paging App', 'node');
    projectId = project.id;
  });

  it('paginates issues with identical lastSeen timestamps without duplicates or skips', async () => {
    const sharedTime = new Date('2026-10-26T12:00:00Z');

    // Create 5 issues sharing the exact same timestamp
    for (let i = 1; i <= 5; i++) {
      await repo.recordIngestEventTransactional({
        projectId,
        organizationId: 'org_1',
        eventId: `evt-page-${i}`,
        fingerprint: `fp-${i}`,
        title: `Issue #${i}`,
        culprit: `file_${i}.ts`,
        type: 'Error',
        payload: {},
        occurredAt: sharedTime,
      });
    }

    // Page 1: limit 2
    const page1 = await repo.listIssues({ projectId, limit: 2 });
    expect(page1.items.length).toBe(2);
    expect(page1.nextCursor).not.toBeNull();
    const p1Ids = page1.items.map(i => i.id);

    // Page 2: limit 2
    const page2 = await repo.listIssues({ projectId, limit: 2, cursor: page1.nextCursor! });
    expect(page2.items.length).toBe(2);
    expect(page2.nextCursor).not.toBeNull();
    const p2Ids = page2.items.map(i => i.id);

    // Page 3: limit 2
    const page3 = await repo.listIssues({ projectId, limit: 2, cursor: page2.nextCursor! });
    expect(page3.items.length).toBe(1);
    expect(page3.nextCursor).toBeNull();
    const p3Ids = page3.items.map(i => i.id);

    // Ensure all 5 items were returned with zero overlaps
    const allSeen = [...p1Ids, ...p2Ids, ...p3Ids];
    expect(allSeen.length).toBe(5);
    const uniqueIds = new Set(allSeen);
    expect(uniqueIds.size).toBe(5);
  });

  it('paginates issue events correctly', async () => {
    const res = await repo.recordIngestEventTransactional({
      projectId,
      organizationId: 'org_1',
      eventId: 'evt-ev-1',
      fingerprint: 'fp-ev',
      title: 'Ev Issue',
      culprit: 'ev.js',
      type: 'Error',
      payload: {},
      occurredAt: new Date(),
    });
    const issueId = res.issue.id;

    // Add 4 more events for this issue
    for (let i = 2; i <= 5; i++) {
      await repo.recordIngestEventTransactional({
        projectId,
        organizationId: 'org_1',
        eventId: `evt-ev-${i}`,
        fingerprint: 'fp-ev',
        title: 'Ev Issue',
        culprit: 'ev.js',
        type: 'Error',
        payload: { attempt: i },
        occurredAt: new Date(),
      });
    }

    const page1 = await repo.getIssueEvents(issueId, 2);
    expect(page1.items.length).toBe(2);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await repo.getIssueEvents(issueId, 2, page1.nextCursor!);
    expect(page2.items.length).toBe(2);
    expect(page2.nextCursor).not.toBeNull();

    const page3 = await repo.getIssueEvents(issueId, 2, page2.nextCursor!);
    expect(page3.items.length).toBe(1);
    expect(page3.nextCursor).toBeNull();
  });
});

describe('MemoryRepository - Alerts & Subscriptions', () => {
  let repo: MemoryRepository;
  let orgId: string;
  let projectId: string;

  beforeEach(async () => {
    repo = new MemoryRepository();
    await repo.clear();
    const org = await repo.createOrganization('Alert Org', 'alert-org');
    orgId = org.id;
    const project = await repo.createProject(orgId, 'Alert App', 'javascript');
    projectId = project.id;
  });

  it('creates, retrieves, and deletes alert rules', async () => {
    const rule = await repo.createAlertRule(
      projectId,
      { type: 'frequency_spike', threshold: 50 },
      'https://hooks.slack.com/demo',
      20
    );
    expect(rule.id).toBeDefined();
    expect(rule.destination).toBe('https://hooks.slack.com/demo');

    const rules = await repo.listAlertRules(projectId);
    expect(rules.length).toBe(1);

    const fetched = await repo.getAlertRuleById(rule.id);
    expect(fetched?.id).toBe(rule.id);

    const deleted = await repo.deleteAlertRule(rule.id);
    expect(deleted).toBe(true);

    const remaining = await repo.listAlertRules(projectId);
    expect(remaining.length).toBe(0);
  });

  it('records alert delivery records', async () => {
    const rule = await repo.createAlertRule(
      projectId,
      { type: 'new_issue' },
      'https://webhook.site/test'
    );

    const delivery = await repo.recordAlertDelivery({
      projectId,
      alertRuleId: rule.id,
      condition: 'new_issue',
      destination: rule.destination,
      status: 'sent',
      attempts: 1,
    });

    expect(delivery.id).toBeDefined();
    expect(delivery.status).toBe('sent');
  });

  it('updates subscriptions with new plan and limit', async () => {
    const updated = await repo.updateSubscription(orgId, 'pro', 100000);
    expect(updated.plan).toBe('pro');
    expect(updated.eventLimit).toBe(100000);

    const sub = await repo.getSubscription(orgId);
    expect(sub?.plan).toBe('pro');
    expect(sub?.eventLimit).toBe(100000);
  });
});
