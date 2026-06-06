import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CheckSquare } from 'lucide-react';
import type { Task } from '../../types/task';
import type { User } from '../../types/user';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { cn, truncate } from '../../utils/helpers';
import { formatDateShort, isOverdue, isDueSoon, getChecklistPercentage } from '../../utils/formatters';

const priorityColors: Record<string, string> = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

const priorityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

interface TaskCardProps {
  task: Task;
  assignee: User | undefined | null;
  isDragging?: boolean;
}

export function TaskCard({ task, assignee, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const checkedCount = task.checklist.filter((i) => i.checked).length;
  const totalCount = task.checklist.length;
  const checklistPercent = getChecklistPercentage(checkedCount, totalCount);
  const isTaskOverdue = task.dueDate && task.status !== 'done' && isOverdue(task.dueDate);
  const isTaskDueSoon = task.dueDate && task.status !== 'done' && isDueSoon(task.dueDate);

  return (
    <Link
      ref={setNodeRef}
      to={`/task/${task.id}`}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800',
        (isDragging || isSortableDragging) && 'opacity-50 shadow-lg rotate-2',
      )}
    >
      <div className="flex flex-wrap gap-1">
        {task.labels.map((label) => (
          <Badge key={label.id} color={label.color}>
            {label.name}
          </Badge>
        ))}
        <Badge color={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge>
      </div>

      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {truncate(task.title, 60)}
      </p>

      {totalCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${checklistPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">
            {checkedCount}/{totalCount}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-1',
                isTaskOverdue && 'text-red-500',
                isTaskDueSoon && 'text-amber-500',
              )}
            >
              <Calendar size={12} />
              {formatDateShort(task.dueDate)}
            </span>
          )}
          {totalCount > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare size={12} />
              {checklistPercent}%
            </span>
          )}
        </div>
        {assignee && <Avatar name={assignee.name} size="sm" />}
      </div>
    </Link>
  );
}