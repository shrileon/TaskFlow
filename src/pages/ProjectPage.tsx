import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import { useUserStore } from '../stores/userStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatDate, isOverdue } from '../utils/formatters';
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

const priorityColors: Record<TaskPriority, string> = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const projects = useProjectStore((s) => s.projects);
  const { tasks, addTask } = useTaskStore();
  const getUser = useUserStore((s) => s.getUser);
  const users = useUserStore((s) => s.users);

  const project = projects.find((p) => p.id === id);
  const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === id), [tasks, id]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'backlog' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assigneeId: '',
    dueDate: '',
  });

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 dark:text-slate-400">Project not found</p>
        <Link to="/" className="text-indigo-600 dark:text-indigo-400 text-sm mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const memberAvatars = project.memberIds.map((uid) => getUser(uid)).filter(Boolean);
  const doneCount = projectTasks.filter((t) => t.status === 'done').length;
  const progressPercent = projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;

  function handleCreateTask() {
    if (!newTask.title.trim() || !project) return;
    addTask({
      projectId: project.id,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      status: newTask.status,
      priority: newTask.priority,
      assigneeId: newTask.assigneeId || null,
      labels: [],
      checklist: [],
      dueDate: newTask.dueDate || null,
    });
    setNewTask({ title: '', description: '', status: 'backlog', priority: 'medium', assigneeId: '', dueDate: '' });
    setShowCreateModal(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={14} /> All projects
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: project.color }} />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus size={16} /> New Task
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projectTasks.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Progress</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{progressPercent}%</p>
            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Members</p>
          <div className="mt-1 flex -space-x-2">
            {memberAvatars.map((u) => u && <Avatar key={u.id} name={u.name} size="sm" />)}
          </div>
        </Card>
      </div>

      <Card padding={false}>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {projectTasks.map((task) => {
            const assignee = task.assigneeId ? getUser(task.assigneeId) : null;
            const isTaskOverdue = task.dueDate && task.status !== 'done' && isOverdue(task.dueDate);
            return (
              <Link
                key={task.id}
                to={`/task/${task.id}`}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{task.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge color={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
                    <Badge color={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge>
                    {task.dueDate && (
                      <span className={`text-xs ${isTaskOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                {assignee && <Avatar name={assignee.name} size="sm" />}
              </Link>
            );
          })}
          {projectTasks.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              No tasks yet
            </div>
          )}
        </div>
      </Card>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Task" size="lg">
        <div className="space-y-4">
          <Input
            label="Title"
            value={newTask.title}
            onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
            placeholder="Enter task title"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Describe the task"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              value={newTask.status}
              onChange={(v) => setNewTask((p) => ({ ...p, status: v as TaskStatus }))}
              options={[
                { value: 'backlog', label: 'Backlog' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'review', label: 'Review' },
                { value: 'done', label: 'Done' },
              ]}
            />
            <Select
              value={newTask.priority}
              onChange={(v) => setNewTask((p) => ({ ...p, priority: v as TaskPriority }))}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
            <Select
              value={newTask.assigneeId}
              onChange={(v) => setNewTask((p) => ({ ...p, assigneeId: v }))}
              options={[
                { value: '', label: 'Unassigned' },
                ...users.map((u) => ({ value: u.id, label: u.name })),
              ]}
            />
            <Input
              label="Due Date"
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask((p) => ({ ...p, dueDate: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>Create</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}