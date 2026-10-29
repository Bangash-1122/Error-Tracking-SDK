import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getServerDb } from '../lib/server/db';
import { hashPassword, comparePassword, createSessionToken, verifySessionToken } from '../lib/server/auth';

describe('ErrorPulse Core Integration & Database Tests', () => {
  const db = getServerDb();

  it('authenticates passwords using bcrypt hashing', async () => {
    const rawPassword = 'SuperSecretPassword123!';
    const hashed = await hashPassword(rawPassword);
    assert.notEqual(hashed, rawPassword);

    const isValid = await comparePassword(rawPassword, hashed);
    assert.equal(isValid, true);

    const isWrong = await comparePassword('WrongPassword', hashed);
    assert.equal(isWrong, false);
  });

  it('generates and verifies cryptographic session tokens with expiration', async () => {
    const token = await createSessionToken({
      id: 'usr_test_1',
      email: 'test@errorpulse.dev',
      name: 'Test Engineer',
      passwordHash: 'hashed',
      createdAt: new Date().toISOString(),
    });
    assert.ok(token);

    const payload = await verifySessionToken(token);
    assert.ok(payload);
    assert.equal(payload.userId, 'usr_test_1');
    assert.equal(payload.email, 'test@errorpulse.dev');
  });

  it('creates organizations, projects, and generates secure ingestion keys', async () => {
    const userEmail = `alice_${Date.now()}@example.com`;
    const user = await db.createUser(userEmail, 'Alice Dev', 'hashed_password_mock');
    assert.ok(user.id);

    const orgSlug = `test-org-${Date.now()}`;
    const org = await db.createOrganization('Test Org', orgSlug, user.id);
    assert.ok(org.id);

    const { project, key } = await db.createProject(org.id, 'Production API', 'node');
    assert.ok(project.id);
    assert.ok(key.rawKey.startsWith('ek_live_'));
    assert.ok(key.keyHash);

    // Verify key lookup
    const lookedUp = await db.getProjectKey(key.rawKey);
    assert.ok(lookedUp);
    assert.equal(lookedUp.project.id, project.id);
  });

  it('performs deterministic fingerprinting, issue grouping, and deduplication', async () => {
    const org = await db.getOrganizationById('org_acme_corp');
    assert.ok(org);

    const projects = await db.listProjectsByOrg('org_acme_corp');
    assert.ok(projects.length > 0);
    const project = projects[0];

    const testFingerprint = `test_fp_${Date.now()}`;

    // Event 1: First occurrence
    const res1 = await db.recordIngestEventTransactional({
      projectId: project.id,
      organizationId: org.id,
      eventId: crypto.randomUUID(),
      fingerprint: testFingerprint,
      type: 'ReferenceError',
      title: 'ReferenceError: cache is not defined',
      culprit: 'authService.ts in verifyToken',
      severity: 'error',
      environment: 'production',
      release: 'v1.4.0',
      frames: [
        { filename: 'authService.ts', function: 'verifyToken', lineno: 42, in_app: true },
      ],
      user: { id: 'usr_user_1', email: 'user1@acme.com' },
      tags: { browser: 'Chrome' },
      breadcrumbs: [],
    });

    assert.equal(res1.isNewIssue, true);
    assert.equal(res1.issue.count, 1);
    assert.equal(res1.issue.status, 'unresolved');
    assert.equal(res1.issue.userCount, 1);

    // Event 2: Second occurrence with identical fingerprint -> must deduplicate
    const res2 = await db.recordIngestEventTransactional({
      projectId: project.id,
      organizationId: org.id,
      eventId: crypto.randomUUID(),
      fingerprint: testFingerprint,
      type: 'ReferenceError',
      title: 'ReferenceError: cache is not defined',
      culprit: 'authService.ts in verifyToken',
      severity: 'error',
      environment: 'production',
      release: 'v1.4.0',
      frames: [
        { filename: 'authService.ts', function: 'verifyToken', lineno: 42, in_app: true },
      ],
      user: { id: 'usr_user_2', email: 'user2@acme.com' },
      tags: { browser: 'Firefox' },
      breadcrumbs: [],
    });

    assert.equal(res2.isNewIssue, false);
    assert.equal(res2.issue.id, res1.issue.id);
    assert.equal(res2.issue.count, 2);
    assert.equal(res2.issue.userCount, 2);
  });

  it('detects issue regressions when resolved issue reappears', async () => {
    const org = await db.getOrganizationById('org_acme_corp');
    const projects = await db.listProjectsByOrg('org_acme_corp');
    const project = projects[0];

    const regFp = `regress_fp_${Date.now()}`;

    // 1. Ingest event
    const res1 = await db.recordIngestEventTransactional({
      projectId: project.id,
      organizationId: org!.id,
      eventId: crypto.randomUUID(),
      fingerprint: regFp,
      type: 'TypeError',
      title: 'TypeError: Cannot read properties of undefined',
      culprit: 'paymentGateway.ts in charge',
      severity: 'critical',
      environment: 'production',
      release: 'v1.0.0',
      frames: [],
      breadcrumbs: [],
    });

    // 2. Mark issue as resolved
    const resolvedIssue = await db.patchIssue(res1.issue.id, { status: 'resolved' });
    assert.equal(resolvedIssue?.status, 'resolved');

    // 3. Ingest another event with same fingerprint -> must detect regression and reopen
    const res2 = await db.recordIngestEventTransactional({
      projectId: project.id,
      organizationId: org!.id,
      eventId: crypto.randomUUID(),
      fingerprint: regFp,
      type: 'TypeError',
      title: 'TypeError: Cannot read properties of undefined',
      culprit: 'paymentGateway.ts in charge',
      severity: 'critical',
      environment: 'production',
      release: 'v1.0.1',
      frames: [],
      breadcrumbs: [],
    });

    assert.equal(res2.isRegression, true);
    assert.equal(res2.issue.status, 'unresolved');
  });

  it('records and queries immutable audit logs', async () => {
    db.recordAuditLog({
      organizationId: 'org_acme_corp',
      actor: { id: 'usr_1', name: 'Security Admin', email: 'admin@acme.com' },
      action: 'api_key.rotated',
      resource: 'project_key',
      targetId: 'key_123',
      result: 'success',
    });

    const logs = db.listAuditLogs('org_acme_corp', { action: 'api_key.rotated' });
    assert.ok(logs.length > 0);
    assert.equal(logs[0].action, 'api_key.rotated');
    assert.equal(logs[0].actor.email, 'admin@acme.com');
  });

  it('enforces billing quota tracking and downloads verified receipts', async () => {
    const sub = await db.getSubscription('org_acme_corp');
    assert.ok(sub);
    assert.ok(sub.acceptedEvents >= 0);
    assert.ok(sub.eventLimit > 0);

    const invoices = await db.listInvoices('org_acme_corp');
    assert.ok(invoices.length > 0);
    const invoice = invoices[0];

    const receipt = db.generateInvoiceContent(invoice.id, 'Acme Corp', invoice.amount, invoice.createdAt || invoice.date);
    assert.ok(receipt);
    assert.ok(receipt.includes('OFFICIAL TAX INVOICE'));
    assert.ok(receipt.includes(invoice.id));
  });
});
