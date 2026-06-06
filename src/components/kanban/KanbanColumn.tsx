import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../utils/helpers';

interface KanbanColumnProps {
  status: string;
  title: string;
  color: string;
  taskCount: number;
  children: ReactNode;
}

export function KanbanColumn({ status, title, color, taskCount, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl bg-slate-50 dark:bg-slate-900/50 transition-colors',
        isOver && 'bg-indigo-50/50 dark:bg-indigo-500/5',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
          {taskCount}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-2 pb-2">{children}</div>
    </div>
  );
}