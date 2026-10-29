import { create } from 'zustand';

export interface IssueFilterState {
  query: string;
  status: string;
  severity: string;
}

export interface UiState {
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  searchModalOpen: boolean;
  keyRotationModalOpen: boolean;
  alertModalOpen: boolean;
  inviteModalOpen: boolean;
  activeTimeRange: string;
  activeEnvironment: string;
  toastMessage: string | null;
  issueFilter: IssueFilterState;

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  toggleSearchModal: () => void;
  setKeyRotationModalOpen: (open: boolean) => void;
  setAlertModalOpen: (open: boolean) => void;
  setInviteModalOpen: (open: boolean) => void;
  setActiveTimeRange: (range: string) => void;
  setActiveEnvironment: (env: string) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  setIssueFilter: (filter: Partial<IssueFilterState>) => void;
  resetIssueFilter: () => void;
}

export const useUiStore = create<UiState>((set) => ({
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

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
  setSearchModalOpen: (open) => set({ searchModalOpen: open }),
  toggleSearchModal: () => set((state) => ({ searchModalOpen: !state.searchModalOpen })),
  setKeyRotationModalOpen: (open) => set({ keyRotationModalOpen: open }),
  setAlertModalOpen: (open) => set({ alertModalOpen: open }),
  setInviteModalOpen: (open) => set({ inviteModalOpen: open }),
  setActiveTimeRange: (range) => set({ activeTimeRange: range }),
  setActiveEnvironment: (env) => set({ activeEnvironment: env }),
  showToast: (msg: string) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      set((current) => (current.toastMessage === msg ? { toastMessage: null } : current));
    }, 3500);
  },
  clearToast: () => set({ toastMessage: null }),
  setIssueFilter: (filter) =>
    set((state) => ({
      issueFilter: { ...state.issueFilter, ...filter },
    })),
  resetIssueFilter: () =>
    set({
      issueFilter: { query: '', status: 'all', severity: 'all' },
    }),
}));

// Typed selector hooks to avoid unnecessary re-renders
export const useSidebarCollapsed = () => useUiStore((s) => s.sidebarCollapsed);
export const useMobileDrawerOpen = () => useUiStore((s) => s.mobileDrawerOpen);
export const useActiveTimeRange = () => useUiStore((s) => s.activeTimeRange);
export const useActiveEnvironment = () => useUiStore((s) => s.activeEnvironment);
export const useToastMessage = () => useUiStore((s) => s.toastMessage);
export const useShowToast = () => useUiStore((s) => s.showToast);
export const useIssueFilter = () => useUiStore((s) => s.issueFilter);
