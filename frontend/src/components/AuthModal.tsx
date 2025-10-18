import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface AuthModalProps {
  onClose: () => void;
}

function AuthModal({ onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { email, password, name };

      const response = await fetch(`http://localhost:3011${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = 'http://localhost:3011/api/auth/google';
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-primary border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-6 bg-bg-secondary rounded-full p-1">
          <button
            className={`flex-1 py-2.5 px-4 rounded-full font-medium transition-all duration-200 ${
              isLogin
                ? 'bg-gradient-to-r from-accent to-accent-hover text-white shadow-lg'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2.5 px-4 rounded-full font-medium transition-all duration-200 ${
              !isLogin
                ? 'bg-gradient-to-r from-accent to-accent-hover text-white shadow-lg'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <button
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-border hover:border-accent/30 rounded-xl font-medium text-text-primary hover:bg-bg-secondary transition-all duration-200"
          onClick={handleGoogleAuth}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <path d="M17.6 9.2l-.1-1.8H9v3.4h4.8C13.6 12 13 13 12 13.6v2.2h3a8.8 8.8 0 0 0 2.6-6.6z" fill="#4285F4" fillRule="nonzero"/>
              <path d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.2a5.4 5.4 0 0 1-8-2.9H1V13a9 9 0 0 0 8 5z" fill="#34A853" fillRule="nonzero"/>
              <path d="M4 10.7a5.4 5.4 0 0 1 0-3.4V5H1a9 9 0 0 0 0 8l3-2.3z" fill="#FBBC05" fillRule="nonzero"/>
              <path d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 0 0 1 5l3 2.4a5.4 5.4 0 0 1 5-3.7z" fill="#EA4335" fillRule="nonzero"/>
              <path d="M0 0h18v18H0z"/>
            </g>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-text-secondary text-sm font-medium">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent to-accent-hover text-white font-medium py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-accent/30 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
