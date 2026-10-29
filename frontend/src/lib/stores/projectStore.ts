import { create } from 'zustand';
import { Project } from '../../types';
import { INITIAL_PROJECTS } from '../mockData';

export interface ProjectState {
  activeProject: Project;
  rotatedKey: string | null;
  setActiveProject: (project: Project) => void;
  setRotatedKey: (key: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProject: INITIAL_PROJECTS[0],
  rotatedKey: null,
  setActiveProject: (project: Project) => set({ activeProject: project }),
  setRotatedKey: (key: string | null) => set({ rotatedKey: key }),
}));

// Selectors
export const useActiveProject = () => useProjectStore((s) => s.activeProject);
export const useSetActiveProject = () => useProjectStore((s) => s.setActiveProject);
