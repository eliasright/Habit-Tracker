import { create } from 'zustand';
import { ThemeState, Theme } from '@/types';

/**
 * Theme Store
 * Manages application theme (light/dark mode) with localStorage persistence
 */

const THEME_STORAGE_KEY = 'theme';

/**
 * Get initial theme from localStorage or system preference
 */
const getInitialTheme = (): Theme => {
  // Check localStorage first
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  // Fall back to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

/**
 * Apply theme to DOM
 */
const applyTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

/**
 * Zustand store for theme management
 */
export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => set((state) => {
    const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    return { theme: newTheme };
  }),
}));
