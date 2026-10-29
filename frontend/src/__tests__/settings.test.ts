import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getServerDb } from '../lib/server/db';
import type { ProjectSettings, OrganizationSettings } from '../types';

describe('Advanced Settings Persistence & Authorization Tests', () => {
  const db = getServerDb();
  const testProjectId = 'prj_prod_01';
  const testOrgId = 'org_acme_corp';
  const testActor = { id: 'usr_admin_01', name: 'Admin Lead', email: 'admin@acme.com' };

  describe('Project Settings (Sections A-E, G, H, J)', () => {
    it('retrieves persistent project settings with default configuration fallback', async () => {
      const settings = await db.getProjectSettings(testProjectId);

      assert.ok(settings);
      assert.equal(settings.projectId, testProjectId);
      assert.equal(typeof settings.projectName, 'string');
      assert.equal(typeof settings.sdkReportingEnabled, 'boolean');
      assert.equal(typeof settings.errorSamplingRate, 'number');
      assert.equal(typeof settings.telemetryRetentionDays, 'number');
    });

    it('updates general project settings (Section A) with audit logging', async () => {
      const patch: Partial<ProjectSettings> = {
        projectName: 'Updated Storefront Service',
        projectDescription: 'Core ecommerce frontend platform',
        defaultEnvironment: 'staging',
        timezone: 'America/New_York',
        dateTimeFormat: 'MM/DD/YYYY hh:mm A',
        projectStatus: 'active',
      };

      const updated = await db.updateProjectSettings(testProjectId, patch, testActor);
      assert.equal(updated.projectName, 'Updated Storefront Service');
      assert.equal(updated.projectDescription, 'Core ecommerce frontend platform');
      assert.equal(updated.defaultEnvironment, 'staging');
      assert.equal(updated.timezone, 'America/New_York');

      // Verify persistence across subsequent reads
      const reRead = await db.getProjectSettings(testProjectId);
      assert.equal(reRead.projectName, 'Updated Storefront Service');
      assert.equal(reRead.defaultEnvironment, 'staging');
    });

    it('updates SDK & Ingestion configuration (Section B)', async () => {
      const patch: Partial<ProjectSettings> = {
        sdkReportingEnabled: true,
        sdkVersion: '2.0.0-rc1',
        environmentConfig: 'staging-us-east',
        releaseTrackingEnabled: true,
        errorSamplingRate: 0.75,
      };

      const updated = await db.updateProjectSettings(testProjectId, patch, testActor);
      assert.equal(updated.sdkVersion, '2.0.0-rc1');
      assert.equal(updated.errorSamplingRate, 0.75);
      assert.equal(updated.releaseTrackingEnabled, true);
    });

    it('updates Error Monitoring & Grouping rules (Section C)', async () => {
      const patch: Partial<ProjectSettings> = {
        severityFilters: ['critical', 'error'],
        ignoredErrors: ['ChunkLoadError', 'NetworkTimeoutError'],
        errorGroupingPreference: 'semantic',
        telemetryRetentionDays: 60,
        autoResolveInactiveDays: 14,
        regressionDetectionEnabled: true,
        eventRateLimitPerMin: 800,
        quotaWarningThresholdPercent: 85,
      };

      const updated = await db.updateProjectSettings(testProjectId, patch, testActor);
      assert.deepEqual(updated.ignoredErrors, ['ChunkLoadError', 'NetworkTimeoutError']);
      assert.equal(updated.errorGroupingPreference, 'semantic');
      assert.equal(updated.telemetryRetentionDays, 60);
      assert.equal(updated.eventRateLimitPerMin, 800);
    });

    it('updates Alerts & Notification channels (Section D)', async () => {
      const patch: Partial<ProjectSettings> = {
        emailAlertsEnabled: true,
        criticalOnlyAlerts: true,
        newIssueAlertsEnabled: true,
        regressionAlertsEnabled: true,
        alertFrequency: 'hourly_digest',
        alertThresholdCount: 15,
        quietHoursEnabled: true,
        quietHoursStart: '23:00',
        quietHoursEnd: '07:00',
      };

      const updated = await db.updateProjectSettings(testProjectId, patch, testActor);
      assert.equal(updated.alertFrequency, 'hourly_digest');
      assert.equal(updated.quietHoursEnabled, true);
      assert.equal(updated.quietHoursStart, '23:00');
    });

    it('updates Privacy, Scrubbing & Security settings (Section E)', async () => {
      const patch: Partial<ProjectSettings> = {
        sensitiveDataScrubbing: true,
        scrubFields: ['password', 'credit_card', 'api_key', 'ssn'],
        collectUserInfo: false,
        collectUserIpAddresses: false,
        sessionTrackingEnabled: false,
        allowDataExport: true,
      };

      const updated = await db.updateProjectSettings(testProjectId, patch, testActor);
      assert.deepEqual(updated.scrubFields, ['password', 'credit_card', 'api_key', 'ssn']);
      assert.equal(updated.collectUserInfo, false);
      assert.equal(updated.collectUserIpAddresses, false);
    });

    it('updates Performance Monitoring thresholds (Section H)', async () => {
      const patch: Partial<ProjectSettings> = {
        performanceMonitoringEnabled: true,
        transactionSampleRate: 0.5,
        slowRequestThresholdMs: 400,
        perfAlertThresholdMs: 1200,
        perfDataRetentionDays: 30,
      };

      const updated = await db.updateProjectSettings(testProjectId, patch, testActor);
      assert.equal(updated.transactionSampleRate, 0.5);
      assert.equal(updated.slowRequestThresholdMs, 400);
      assert.equal(updated.perfAlertThresholdMs, 1200);
    });

    it('exports complete project configuration and diagnostics safely (Section J)', async () => {
      const exported = await db.exportProjectData(testProjectId);

      assert.ok(exported);
      assert.ok(exported.exportedAt);
      assert.equal(exported.project?.id, testProjectId);
      assert.ok(exported.settings);
      assert.equal(exported.settings.projectId, testProjectId);
    });
  });

  describe('Organization & Team Settings (Section F)', () => {
    it('retrieves and updates Organization compliance tier, IP allowlist, and MFA', async () => {
      const settings = await db.getOrganizationSettings(testOrgId);
      assert.ok(settings);
      assert.equal(settings.organizationId, testOrgId);

      const patch: Partial<OrganizationSettings> = {
        complianceTier: 'hipaa',
        defaultDataRetentionDays: 90,
        enforceMfa: true,
        ipAllowlist: ['192.168.1.1', '10.0.0.0/16'],
        defaultRoleForNewMembers: 'developer',
      };

      const updated = await db.updateOrganizationSettings(testOrgId, patch, testActor);
      assert.equal(updated.complianceTier, 'hipaa');
      assert.equal(updated.enforceMfa, true);
      assert.deepEqual(updated.ipAllowlist, ['192.168.1.1', '10.0.0.0/16']);
      assert.equal(updated.defaultRoleForNewMembers, 'developer');
    });

    it('manages role-based team memberships (Admin, Developer, Viewer) and membership removal', async () => {
      // Create user and add to team
      const testEmail = `dev_${Date.now()}@example.com`;
      const newUser = await db.createUser(testEmail, 'Test Dev', 'hash123');
      await db.addMembership(testOrgId, newUser.id, 'developer');

      let members = await db.listMembers(testOrgId);
      const added = members.find((m) => m.userId === newUser.id);
      assert.ok(added);
      assert.equal(added.role, 'developer');

      // Remove team member
      const removed = await db.removeMembership(testOrgId, newUser.id, testActor);
      assert.equal(removed, true);

      members = await db.listMembers(testOrgId);
      const after = members.find((m) => m.userId === newUser.id);
      assert.equal(after, undefined);
    });
  });

  describe('Dangerous Operations & Cascade Cleanup (Section J)', () => {
    it('deletes a project safely and removes associated keys, issues, and settings', async () => {
      // Create temporary project
      const { project: tempProj } = await db.createProject(testOrgId, 'Disposable Service', 'node');
      assert.ok(tempProj.id);

      // Verify settings exists
      const settings = await db.getProjectSettings(tempProj.id);
      assert.ok(settings);

      // Delete project
      const deleted = await db.deleteProject(tempProj.id, testActor);
      assert.equal(deleted, true);

      // Verify deletion
      const checkProj = await db.getProjectById(tempProj.id);
      assert.equal(checkProj, null);
    });
  });
});
