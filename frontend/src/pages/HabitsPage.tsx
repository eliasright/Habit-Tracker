import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function HabitsPage() {
  const { isAuthenticated, user, logout, fetchUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Fetch user data if not already loaded
    if (!user) {
      fetchUser();
    }
  }, [isAuthenticated, user, navigate, fetchUser]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-accent to-accent-hover rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-white/90 text-lg">
            You're successfully logged in with {user?.email}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-bg-primary border border-border rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">You're Logged In</h2>
              <p className="text-text-secondary">Your session is active</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-bg-secondary rounded-xl">
              <p className="text-sm text-text-secondary mb-1">Email</p>
              <p className="text-text-primary font-medium">{user?.email || 'Loading...'}</p>
            </div>

            {user?.name && (
              <div className="p-4 bg-bg-secondary rounded-xl">
                <p className="text-sm text-text-secondary mb-1">Name</p>
                <p className="text-text-primary font-medium">{user.name}</p>
              </div>
            )}

            <div className="p-4 bg-bg-secondary rounded-xl">
              <p className="text-sm text-text-secondary mb-1">User ID</p>
              <p className="text-text-primary font-mono text-xs">{user?.id || 'Loading...'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-6 bg-bg-primary border-2 border-border hover:border-accent/30 rounded-xl font-medium text-text-primary transition-all duration-200 hover:bg-bg-secondary"
          >
            Go Home
          </button>
          <button
            onClick={logout}
            className="flex-1 py-3 px-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 rounded-xl font-medium text-red-600 dark:text-red-400 transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 p-6 bg-bg-secondary border border-border rounded-xl text-center">
          <p className="text-text-secondary">
            Habit tracking features coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

export default HabitsPage;
