import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import { useUserStore } from '../stores/userStore';
import { formatRelativeDate, isOverdue } from '../utils/formatters';
import type { TaskStatus, TaskPriority } from '../types/task';

const statusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const statusColors: Record<TaskStatus, string> = {
  backlog: '#64748b',
  in_progress: '#6366f1',
  review: '#f59e0b',
  done: '#10b981',
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#64748b' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#f97316' },
  urgent: { label: 'Urgent', color: '#ef4444' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const size = 160;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="shrink-0">
        {data.map((segment, i) => {
          const percent = segment.value / total;
          const offset = (accumulated / total) * circumference;
          accumulated += segment.value;
          const dashArray = `${percent * circumference} ${circumference - percent * circumference}`;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-500"
            />
          );
        })}
        <text x={size / 2} y={size / 2 - 8} textAnchor="middle" className="fill-slate-900 dark:fill-slate-100" fontSize="24" fontWeight="700">
          {total}
        </text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" className="fill-slate-500" fontSize="12">
          tasks
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600 dark:text-slate-400">{d.label}</span>
            <span className="ml-auto font-medium text-slate-900 dark:text-slate-100">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{d.value}</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="w-full rounded-t-md min-h-[4px]"
            style={{ backgroundColor: d.color }}
          />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full text-center">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const projects = useProjectStore((s) => s.projects);
  const tasks = useTaskStore((s) => s.tasks);
  const getUser = useUserStore((s) => s.getUser);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const overdue = tasks.filter((t) => t.dueDate && t.status !== 'done' && isOverdue(t.dueDate)).length;
    return { total, done, inProgress, overdue };
  }, [tasks]);

  const statusChartData = useMemo(
    () => [
      { label: 'Backlog', value: tasks.filter((t) => t.status === 'backlog').length, color: '#64748b' },
      { label: 'In Progress', value: tasks.filter((t) => t.status === 'in_progress').length, color: '#6366f1' },
      { label: 'Review', value: tasks.filter((t) => t.status === 'review').length, color: '#f59e0b' },
      { label: 'Done', value: tasks.filter((t) => t.status === 'done').length, color: '#10b981' },
    ],
    [tasks],
  );

  const projectChartData = useMemo(
    () =>
      projects.map((p) => ({
        label: p.name,
        value: tasks.filter((t) => t.projectId === p.id && t.status !== 'done').length,
        color: p.color,
      })),
    [projects, tasks],
  );

  const recentTasks = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [tasks],
  );

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Completed', value: stats.done, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6">
        <motion.h1 variants={itemVariants} className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Dashboard
        </motion.h1>
        <motion.p variants={itemVariants} className="text-sm text-slate-500 dark:text-slate-400">
          Overview of project activity and progress
        </motion.p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <motion.div key={card.label} variants={itemVariants}>
            <Card>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2.5 ${card.bg}`}>
                  <card.icon size={20} className={card.color} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Status Distribution
            </h3>
            <DonutChart data={statusChartData} />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Active Tasks by Project
            </h3>
            <BarChart data={projectChartData} />
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Tasks</h3>
            <Link
              to="/kanban"
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              All tasks <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {recentTasks.map((task) => {
              const assignee = task.assigneeId ? getUser(task.assigneeId) : null;
              const project = projects.find((p) => p.id === task.projectId);
              const priority = priorityConfig[task.priority];
              return (
                <Link
                  key={task.id}
                  to={`/task/${task.id}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 -mx-4 px-4 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{task.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {project && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">{project.name}</span>
                      )}
                      <Badge color={priority.color}>{priority.label}</Badge>
                      <Badge color={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                      {formatRelativeDate(task.updatedAt)}
                    </span>
                    {assignee && <Avatar name={assignee.name} size="sm" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}