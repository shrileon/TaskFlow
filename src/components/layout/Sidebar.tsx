import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjectStore } from '../../stores/projectStore';
import { useUiStore } from '../../stores/uiStore';
import { cn } from '../../utils/helpers';

export function Sidebar() {
  const { projects } = useProjectStore();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebarCollapsed, searchQuery, setSearchQuery } = useUiStore();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
      sidebarCollapsed && 'justify-center px-2',
    );

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className={cn('flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-700', sidebarCollapsed && 'justify-center px-2')}>
        {!sidebarCollapsed && (
          <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">TaskFlow</h1>
        )}
        <button
          onClick={toggleSidebarCollapsed}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {!sidebarCollapsed && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          <NavLink to="/" className={navLinkClass} end>
            <LayoutDashboard size={18} />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/kanban" className={navLinkClass}>
            <FolderKanban size={18} />
            {!sidebarCollapsed && <span>Kanban</span>}
          </NavLink>
        </div>

        {!sidebarCollapsed && (
          <>
            <div className="mt-6 mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Projects
              </span>
              <button
                onClick={() => navigate('/settings')}
                className="rounded p-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-0.5">
              {projects.map((project) => (
                <NavLink
                  key={project.id}
                  to={`/project/${project.id}`}
                  className={navLinkClass}
                >
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.name}</span>
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className={cn('border-t border-slate-200 p-3 dark:border-slate-700', sidebarCollapsed && 'flex flex-col items-center gap-2')}>
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between">
            <NavLink to="/settings" className={navLinkClass}>
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        )}
        {sidebarCollapsed && (
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}
      </div>
    </motion.aside>
  );
}