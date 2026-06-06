import type { ValueOf } from './common';

export const PROJECT_COLORS = {
  BLUE: '#3b82f6',
  PURPLE: '#8b5cf6',
  GREEN: '#10b981',
  ORANGE: '#f59e0b',
  RED: '#ef4444',
  PINK: '#ec4899',
  CYAN: '#06b6d4',
  INDIGO: '#6366f1',
  AMBER: '#f97316',
  SLATE: '#64748b',
} as const;

export type ProjectColor = ValueOf<typeof PROJECT_COLORS>;

export interface Project {
  id: string;
  name: string;
  description: string;
  color: ProjectColor;
  icon: string;
  memberIds: string[];
  createdAt: string;
}

export type ProjectCreateData = Omit<Project, 'id' | 'createdAt'>;
export type ProjectUpdateData = Partial<ProjectCreateData> & { id: string };