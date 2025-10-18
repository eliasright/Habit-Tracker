import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import AuthModal from './AuthModal';

function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, logout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      navigate('/habits');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <header className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto bg-bg-primary border border-border rounded-full px-6 py-3 shadow-lg">
          <div className="flex justify-between items-center">
            {/* Left Side - Logo/Home & Theme Toggle */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-text-primary font-semibold text-lg hover:text-accent transition-colors duration-200"
              >
                Home
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="relative w-14 h-7 bg-gradient-to-r from-accent to-accent-hover rounded-full p-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
              >
                <div className="flex items-center justify-between px-1 relative z-10">
                  <span className="text-xs">☀️</span>
                  <span className="text-xs">🌙</span>
                </div>
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Right Side - Auth Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <button
                  onClick={logout}
                  className="text-text-primary font-medium hover:text-accent transition-colors duration-200 px-4 py-2"
                >
                  Logout
                </button>
              )}
              <button
                onClick={handleAuthAction}
                className="bg-gradient-to-r from-accent to-accent-hover text-white font-medium px-6 py-2 rounded-full hover:shadow-lg hover:shadow-accent/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
              >
                {isAuthenticated ? 'View Habits' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default Header;
