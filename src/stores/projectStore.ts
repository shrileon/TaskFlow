import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectCreateData, ProjectUpdateData } from '../types/project';
import { mockProjects } from '../data/mockData';
import { generateId } from '../utils/helpers';

interface ProjectState {
  projects: Project[];
  addProject: (data: ProjectCreateData) => Project;
  updateProject: (data: ProjectUpdateData) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: mockProjects,

      addProject: (data) => {
        const project: Project = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, project] }));
        return project;
      },

      updateProject: ({ id, ...data }) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data } : p,
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      getProject: (id) => {
        return get().projects.find((p) => p.id === id);
      },
    }),
    { name: 'taskflow_projects' },
  ),
);