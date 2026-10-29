import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useUiStore, useProjectStore, useAuthStore } from '../lib/stores';

describe('Zustand Modular Stores Unit Tests', () => {
  beforeEach(() => {
    // Reset stores before each test
    useUiStore.setState({
      sidebarCollapsed: false,
      mobileDrawerOpen: false,
      searchModalOpen: false,
      keyRotationModalOpen: false,
      alertModalOpen: false,
      inviteModalOpen: false,
      activeTimeRange: '24h',
      activeEnvironment: 'all',
      toastMessage: null,
      issueFilter: {
        query: '',
        status: 'all',
        severity: 'all',
      },
    });

    useProjectStore.setState({
      activeProject: {
        id: 'prj_prod_01',
        organizationId: 'org_acme_corp',
        name: 'Storefront Web',
        slug: 'storefront-web',
        platform: 'react',
        publicKey: 'pub_test',
        rawKey: 'ep_test_key',
        status: 'active',
        eventCount: 15420,
        quotaLimit: 100000,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      rotatedKey: null,
    });

    useAuthStore.getState().clearSession();
  });

  describe('UI Store', () => {
    it('manages sidebar collapsed state and toggling', () => {
      assert.equal(useUiStore.getState().sidebarCollapsed, false);

      useUiStore.getState().toggleSidebar();
      assert.equal(useUiStore.getState().sidebarCollapsed, true);

      useUiStore.getState().setSidebarCollapsed(false);
      assert.equal(useUiStore.getState().sidebarCollapsed, false);
    });

    it('controls modal visibility without cross-contamination', () => {
      const state = useUiStore.getState();
      assert.equal(state.searchModalOpen, false);
      assert.equal(state.inviteModalOpen, false);

      state.toggleSearchModal();
      assert.equal(useUiStore.getState().searchModalOpen, true);
      assert.equal(useUiStore.getState().inviteModalOpen, false);

      state.setInviteModalOpen(true);
      assert.equal(useUiStore.getState().inviteModalOpen, true);

      state.setSearchModalOpen(false);
      assert.equal(useUiStore.getState().searchModalOpen, false);
      assert.equal(useUiStore.getState().inviteModalOpen, true);
    });

    it('manages toast notifications with automatic message clearing', () => {
      useUiStore.getState().showToast('Settings saved successfully');
      assert.equal(useUiStore.getState().toastMessage, 'Settings saved successfully');

      useUiStore.getState().clearToast();
      assert.equal(useUiStore.getState().toastMessage, null);
    });

    it('updates client-side temporary issue filters incrementally', () => {
      useUiStore.getState().setIssueFilter({ query: 'TypeError', severity: 'critical' });
      const current = useUiStore.getState().issueFilter;
      assert.equal(current.query, 'TypeError');
      assert.equal(current.severity, 'critical');
      assert.equal(current.status, 'all');

      useUiStore.getState().resetIssueFilter();
      const reset = useUiStore.getState().issueFilter;
      assert.equal(reset.query, '');
      assert.equal(reset.severity, 'all');
      assert.equal(reset.status, 'all');
    });

    it('manages environment and time range filters', () => {
      useUiStore.getState().setActiveEnvironment('staging');
      useUiStore.getState().setActiveTimeRange('7d');

      assert.equal(useUiStore.getState().activeEnvironment, 'staging');
      assert.equal(useUiStore.getState().activeTimeRange, '7d');
    });
  });

  describe('Project Store', () => {
    it('updates the active project and keeps track of rotated key', () => {
      const newProj = {
        id: 'prj_mobile_02',
        organizationId: 'org_acme_corp',
        name: 'Mobile App',
        slug: 'mobile-app',
        platform: 'browser' as const,
        publicKey: 'pub_mobile',
        rawKey: 'ep_mobile_key',
        status: 'active' as const,
        eventCount: 200,
        quotaLimit: 50000,
        createdAt: '2026-02-01T00:00:00.000Z',
      };

      useProjectStore.getState().setActiveProject(newProj);
      assert.equal(useProjectStore.getState().activeProject.id, 'prj_mobile_02');
      assert.equal(useProjectStore.getState().activeProject.name, 'Mobile App');

      useProjectStore.getState().setRotatedKey('ep_live_rotated_key_999');
      assert.equal(useProjectStore.getState().rotatedKey, 'ep_live_rotated_key_999');
    });
  });

  describe('Auth Store', () => {
    it('stores authenticated user session without persistent credentials', () => {
      const testUser = {
        id: 'usr_dev_10',
        name: 'Jane Doe',
        email: 'jane@acme.com',
      };
      const testOrg = {
        id: 'org_acme_corp',
        name: 'Acme Corp',
        slug: 'acme-corp',
        plan: 'pro' as const,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setSession(testUser, testOrg);
      const current = useAuthStore.getState();

      assert.equal(current.currentUser?.id, 'usr_dev_10');
      assert.equal(current.currentOrg?.slug, 'acme-corp');

      useAuthStore.getState().clearSession();
      const cleared = useAuthStore.getState();
      assert.equal(cleared.currentUser, null);
    });
  });
});
