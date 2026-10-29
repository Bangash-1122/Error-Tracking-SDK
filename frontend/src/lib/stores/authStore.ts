import { create } from 'zustand';
import { User, Organization } from '../../types';
import { INITIAL_ORG } from '../mockData';

export interface AuthState {
  currentUser: User | null;
  currentOrg: Organization;
  setCurrentUser: (user: User | null) => void;
  setCurrentOrg: (org: Organization) => void;
  setSession: (user: User | null, org: Organization) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: {
    id: 'usr_admin_01',
    name: 'Admin User',
    email: 'admin@acme.com',
  },
  currentOrg: INITIAL_ORG,
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentOrg: (org) => set({ currentOrg: org }),
  setSession: (user, org) => set({ currentUser: user, currentOrg: org }),
  clearSession: () => set({ currentUser: null }),
}));

// Selectors
export const useCurrentUser = () => useAuthStore((s) => s.currentUser);
export const useCurrentOrg = () => useAuthStore((s) => s.currentOrg);
