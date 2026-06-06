import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskCreateData, TaskUpdateData, TaskStatus, ChecklistItem, TaskComment } from '../types/task';
import { mockTasks } from '../data/mockData';
import { generateId } from '../utils/helpers';

interface TaskState {
  tasks: Task[];
  addTask: (data: TaskCreateData) => Task;
  updateTask: (data: TaskUpdateData) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  getTask: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (projectId: string, status: TaskStatus) => Task[];
  toggleChecklistItem: (taskId: string, checklistItemId: string) => void;
  addChecklistItem: (taskId: string, text: string) => void;
  removeChecklistItem: (taskId: string, checklistItemId: string) => void;
  addComment: (taskId: string, authorId: string, text: string) => void;
  deleteComment: (taskId: string, commentId: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: mockTasks,

      addTask: (data) => {
        const task: Task = {
          ...data,
          id: generateId(),
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
        return task;
      },

      updateTask: ({ id, ...data }) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t,
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      moveTask: (taskId, newStatus) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
              : t,
          ),
        }));
      },

      getTask: (id) => get().tasks.find((t) => t.id === id),

      getTasksByProject: (projectId) =>
        get().tasks.filter((t) => t.projectId === projectId),

      getTasksByStatus: (projectId, status) =>
        get().tasks.filter((t) => t.projectId === projectId && t.status === status),

      toggleChecklistItem: (taskId, checklistItemId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  updatedAt: new Date().toISOString(),
                  checklist: t.checklist.map((item) =>
                    item.id === checklistItemId
                      ? { ...item, checked: !item.checked }
                      : item,
                  ),
                }
              : t,
          ),
        }));
      },

      addChecklistItem: (taskId, text) => {
        const item: ChecklistItem = { id: generateId(), text, checked: false };
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, updatedAt: new Date().toISOString(), checklist: [...t.checklist, item] }
              : t,
          ),
        }));
      },

      removeChecklistItem: (taskId, checklistItemId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  updatedAt: new Date().toISOString(),
                  checklist: t.checklist.filter((item) => item.id !== checklistItemId),
                }
              : t,
          ),
        }));
      },

      addComment: (taskId, authorId, text) => {
        const comment: TaskComment = {
          id: generateId(),
          authorId,
          text,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, updatedAt: new Date().toISOString(), comments: [...t.comments, comment] }
              : t,
          ),
        }));
      },

      deleteComment: (taskId, commentId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  updatedAt: new Date().toISOString(),
                  comments: t.comments.filter((c) => c.id !== commentId),
                }
              : t,
          ),
        }));
      },
    }),
    { name: 'taskflow_tasks' },
  ),
);