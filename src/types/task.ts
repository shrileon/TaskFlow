import type { ValueOf } from './common';

export const TASK_STATUSES = {
  BACKLOG: 'backlog',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
} as const;

export type TaskStatus = ValueOf<typeof TASK_STATUSES>;

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TaskPriority = ValueOf<typeof TASK_PRIORITIES>;

export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  urgent: 3,
};

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TaskComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  labels: TaskLabel[];
  checklist: ChecklistItem[];
  comments: TaskComment[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskCreateData = Omit<Task, 'id' | 'comments' | 'createdAt' | 'updatedAt'>;

export type TaskUpdateData = Partial<TaskCreateData> & { id: string };

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const STATUS_ORDER: TaskStatus[] = [
  'backlog',
  'in_progress',
  'review',
  'done',
];

export function isTaskStatus(value: string): value is TaskStatus {
  return Object.values(TASK_STATUSES).includes(value as TaskStatus);
}

export function isTaskPriority(value: string): value is TaskPriority {
  return Object.values(TASK_PRIORITIES).includes(value as TaskPriority);
}