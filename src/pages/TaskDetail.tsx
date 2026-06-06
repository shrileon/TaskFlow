import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckSquare,
  Plus,
  Trash2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useProjectStore } from '../stores/projectStore';
import { useUserStore } from '../stores/userStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { formatDate, formatRelativeDate, isOverdue, getChecklistPercentage } from '../utils/formatters';
import { cn } from '../utils/helpers';
import type { TaskStatus, TaskPriority } from '../types/task';

const statusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask, toggleChecklistItem, addChecklistItem, removeChecklistItem, addComment, deleteComment } = useTaskStore();
  const projects = useProjectStore((s) => s.projects);
  const getUser = useUserStore((s) => s.getUser);
  const currentUserId = useUserStore((s) => s.currentUserId);

  const task = tasks.find((t) => t.id === id);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [showChecklistInput, setShowChecklistInput] = useState(false);

  if (!task) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 dark:text-slate-400">Task not found</p>
        <Link to="/" className="text-indigo-600 dark:text-indigo-400 text-sm mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const project = projects.find((p) => p.id === task.projectId);
  const assignee = task.assigneeId ? getUser(task.assigneeId) : null;
  const checkedCount = task.checklist.filter((i) => i.checked).length;
  const totalCount = task.checklist.length;
  const checklistPercent = getChecklistPercentage(checkedCount, totalCount);
  const isTaskOverdue = task.dueDate && task.status !== 'done' && isOverdue(task.dueDate);

  function handleAddChecklistItem() {
    if (!newChecklistText.trim() || !task) return;
    addChecklistItem(task.id, newChecklistText.trim());
    setNewChecklistText('');
  }

  function handleAddComment() {
    if (!newCommentText.trim() || !task) return;
    addComment(task.id, currentUserId, newCommentText.trim());
    setNewCommentText('');
  }

  function handleDeleteTask() {
    if (!task) return;
    deleteTask(task.id);
    navigate(project ? `/project/${project.id}` : '/');
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to={project ? `/project/${project.id}` : '/'}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={14} /> {project ? project.name : 'Back'}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {task.labels.map((label) => (
                <Badge key={label.id} color={label.color}>{label.name}</Badge>
              ))}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{task.title}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{task.description}</p>
          </div>

          {totalCount > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare size={16} className="text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Checklist ({checkedCount}/{totalCount})
                  </h3>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{checklistPercent}%</span>
              </div>
              <div className="mb-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>
              <div className="space-y-1">
                {task.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleChecklistItem(task.id, item.id)}
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                        item.checked
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-slate-300 hover:border-indigo-400 dark:border-slate-600',
                      )}
                    >
                      {item.checked && <Check size={12} />}
                    </button>
                    <span
                      className={cn(
                        'flex-1 text-sm',
                        item.checked
                          ? 'text-slate-400 line-through dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-300',
                      )}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => removeChecklistItem(task.id, item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              {showChecklistInput ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                    placeholder="Add item"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddChecklistItem}>Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowChecklistInput(false); setNewChecklistText(''); }}>Cancel</Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowChecklistInput(true)}
                  className="mt-2 flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  <Plus size={14} /> Add item
                </button>
              )}
            </Card>
          )}

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Comments ({task.comments.length})
              </h3>
            </div>

            <div className="space-y-4 mb-4">
              {task.comments.map((comment) => {
                const author = getUser(comment.authorId);
                return (
                  <div key={comment.id} className="flex gap-3 group">
                    <Avatar name={author?.name || 'Unknown'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {author?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-slate-400">{formatRelativeDate(comment.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{comment.text}</p>
                    </div>
                    {comment.authorId === currentUserId && (
                      <button
                        onClick={() => deleteComment(task.id, comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <Button size="sm" onClick={handleAddComment} disabled={!newCommentText.trim()}>
                <Send size={14} />
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Status</label>
                <Select
                  value={task.status}
                  onChange={(v) => updateTask({ id: task.id, status: v as TaskStatus })}
                  options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Priority</label>
                <Select
                  value={task.priority}
                  onChange={(v) => updateTask({ id: task.id, priority: v as TaskPriority })}
                  options={Object.entries(priorityLabels).map(([value, label]) => ({ value, label }))}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Assignee</label>
                <div className="flex items-center gap-2 mt-1">
                  {assignee ? (
                    <>
                      <Avatar name={assignee.name} size="sm" />
                      <span className="text-sm text-slate-900 dark:text-slate-100">{assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">Unassigned</span>
                  )}
                </div>
              </div>
              {task.dueDate && (
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">Due Date</label>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar size={14} className={cn(isTaskOverdue && 'text-red-500')} />
                    <span className={cn('text-sm', isTaskOverdue ? 'text-red-500 font-medium' : 'text-slate-900 dark:text-slate-100')}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Created</label>
                <p className="text-sm text-slate-900 dark:text-slate-100">{formatDate(task.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Updated</label>
                <p className="text-sm text-slate-900 dark:text-slate-100">{formatRelativeDate(task.updatedAt)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Project</h3>
            {project ? (
              <Link to={`/project/${project.id}`} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded" style={{ backgroundColor: project.color }} />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{project.name}</span>
              </Link>
            ) : (
              <p className="text-sm text-slate-400">No project</p>
            )}
          </Card>

          {totalCount === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => addChecklistItem(task.id, 'New item')}
            >
              <CheckSquare size={14} /> Add Checklist
            </Button>
          )}

          <Button variant="danger" size="sm" className="w-full" onClick={handleDeleteTask}>
            <Trash2 size={14} /> Delete Task
          </Button>
        </div>
      </div>
    </motion.div>
  );
}