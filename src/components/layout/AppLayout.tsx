import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUiStore } from '../../stores/uiStore';
import { motion } from 'framer-motion';

export function AppLayout() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 64 : 256 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-screen flex-col"
      >
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}