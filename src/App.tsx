import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';
import { ProjectPage } from './pages/ProjectPage';
import { TaskDetail } from './pages/TaskDetail';
import { Settings } from './pages/Settings';
import { useUiStore } from './stores/uiStore';

export default function App() {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}