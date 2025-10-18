import { create } from 'zustand';
import { AuthState, User } from '@/types';
import { API_URL } from '@/config/api';

/**
 * Authentication Store
 * Manages user authentication state with localStorage persistence
 */

const TOKEN_STORAGE_KEY = 'token';

/**
 * Zustand store for authentication management
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_STORAGE_KEY),

  login: (token, user) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user });
  },

  setToken: (token) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token, isAuthenticated: true });
  },

  fetchUser: async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        set({ user });
      } else {
        // Token is invalid, clear it
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        set({ token: null, user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  },
}));
