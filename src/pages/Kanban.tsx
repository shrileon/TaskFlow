import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTaskStore } from '../stores/taskStore';
import { useProjectStore } from '../stores/projectStore';
import { useUserStore } from '../stores/userStore';
import { useUiStore } from '../stores/uiStore';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { TaskCard } from '../components/kanban/TaskCard';
import { Select } from '../components/ui/Select';
import type { Task, TaskStatus } from '../types/task';

const columns: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'backlog', title: 'Backlog', color: '#64748b' },
  { status: 'in_progress', title: 'In Progress', color: '#6366f1' },
  { status: 'review', title: 'Review', color: '#f59e0b' },
  { status: 'done', title: 'Done', color: '#10b981' },
];

export function Kanban() {
  const tasks = useTaskStore((s) => s.tasks);
  const moveTask = useTaskStore((s) => s.moveTask);
  const projects = useProjectStore((s) => s.projects);
  const getUser = useUserStore((s) => s.getUser);
  const searchQuery = useUiStore((s) => s.searchQuery);

  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('project') || '';

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (projectId) {
      result = result.filter((t) => t.projectId === projectId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [tasks, projectId, searchQuery]);

  const columnTasks = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      in_progress: [],
      review: [],
      done: [],
    };
    filteredTasks.forEach((t) => {
      if (map[t.status]) {
        map[t.status].push(t);
      }
    });
    return map;
  }, [filteredTasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && activeTask.status === overTask.status) return;

    const overColumn = columns.find((c) => c.status === overId);
    if (overColumn) {
      moveTask(activeId, overColumn.status);
      return;
    }

    if (overTask) {
      moveTask(activeId, overTask.status);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overColumn = columns.find((c) => c.status === overId);
    if (overColumn) {
      moveTask(activeId, overColumn.status);
      return;
    }

    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      moveTask(activeId, overTask.status);
    }
  }

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Kanban Board</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Drag and drop tasks between columns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={projectId}
            onChange={(v) => setSearchParams(v ? { project: v } : {})}
            options={projectOptions}
            className="w-44"
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <SortableContext
              key={col.status}
              items={columnTasks[col.status].map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                status={col.status}
                title={col.title}
                color={col.color}
                taskCount={columnTasks[col.status].length}
              >
                {columnTasks[col.status].map((task) => (
                  <TaskCard key={task.id} task={task} assignee={task.assigneeId ? getUser(task.assigneeId) : null} />
                ))}
                {columnTasks[col.status].length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
                    <p className="text-xs text-slate-400 dark:text-slate-500">No tasks</p>
                  </div>
                )}
              </KanbanColumn>
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-72">
              <TaskCard task={activeTask} assignee={activeTask.assigneeId ? getUser(activeTask.assigneeId) : null} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}