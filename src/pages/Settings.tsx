import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Plus, Trash2, Palette } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import { useUserStore } from '../stores/userStore';
import { useUiStore } from '../stores/uiStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import { formatDate } from '../utils/formatters';
import { PROJECT_COLORS, type ProjectColor } from '../types/project';

const colorOptions = Object.values(PROJECT_COLORS);

export function Settings() {
  const { projects, addProject, deleteProject } = useProjectStore();
  const tasks = useTaskStore((s) => s.tasks);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const users = useUserStore((s) => s.users);
  const { theme, toggleTheme } = useUiStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#6366f1' as ProjectColor,
  });

  function handleCreateProject() {
    if (!newProject.name.trim()) return;
    addProject({
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      color: newProject.color as ProjectColor,
      icon: 'FolderKanban',
      memberIds: ['user-1'],
    });
    setNewProject({ name: '', description: '', color: '#6366f1' as ProjectColor });
    setShowCreateModal(false);
  }

  function handleDeleteProject(projectId: string) {
    tasks
      .filter((t) => t.projectId === projectId)
      .forEach((t) => deleteTask(t.id));
    deleteProject(projectId);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage projects and app preferences</p>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Theme</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Projects</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage your projects</p>
            </div>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> New Project
            </Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const members = project.memberIds.map((uid) => users.find((u) => u.id === uid)).filter(Boolean);
              return (
                <div key={project.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: project.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{project.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {projectTasks.length} tasks · {members.length} members · Created {formatDate(project.createdAt)}
                    </p>
                  </div>
                  <div className="flex -space-x-1">
                    {members.slice(0, 3).map((m) => m && <Avatar key={m.id} name={m.name} size="sm" />)}
                  </div>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Team</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar name={user.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  {user.role === 'admin' ? 'Admin' : user.role === 'member' ? 'Member' : 'Viewer'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Project">
        <div className="space-y-4">
          <Input
            label="Name"
            value={newProject.name}
            onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
            placeholder="Enter project name"
          />
          <Input
            label="Description"
            value={newProject.description}
            onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
            placeholder="Brief description"
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              <Palette size={14} className="inline mr-1" /> Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewProject((p) => ({ ...p, color }))}
                  className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    newProject.color === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} disabled={!newProject.name.trim()}>Create</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}