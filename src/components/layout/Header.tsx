import { Bell, Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useUserStore } from '../../stores/userStore';
import { useUiStore } from '../../stores/uiStore';

export function Header() {
  const currentUser = useUserStore((s) => s.getCurrentUser());
  const { toggleSidebarCollapsed } = useUiStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebarCollapsed}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar name={currentUser.name} size="sm" />
          <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 sm:block">
            {currentUser.name}
          </span>
        </div>
      </div>
    </header>
  );
}