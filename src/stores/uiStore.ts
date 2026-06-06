import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  searchQuery: string;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSearchQuery: (query: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarOpen: true,
      sidebarCollapsed: false,
      searchQuery: '',

      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'taskflow_ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);