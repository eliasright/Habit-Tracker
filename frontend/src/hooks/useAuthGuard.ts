import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook to handle authentication routing and user data fetching
 * Centralizes auth logic that was duplicated across components
 */
export function useAuthGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, fetchUser } = useAuthStore();

  useEffect(() => {
    // Define public routes that don't require authentication
    const publicPaths = ['/', '/auth/callback'];
    
    // Skip auth checks for public pages
    if (publicPaths.includes(location.pathname)) {
      return;
    }

    // Redirect to home if not authenticated
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Fetch user data if authenticated but user not loaded
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, location.pathname, navigate, fetchUser]);

  return {
    isAuthenticated,
    user,
    isLoading: isAuthenticated && !user, // User is being fetched
  };
}