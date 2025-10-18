import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setToken, fetchUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Authentication failed. Please try again.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (!token) {
      setError('No token received. Redirecting...');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    // Save the token and fetch user data
    setToken(token);
    fetchUser();

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/habits');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [searchParams, navigate, setToken, fetchUser]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Authentication Failed</h1>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent-hover rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          Successfully Signed In!
        </h1>
        <p className="text-text-secondary mb-8">
          Welcome back! Redirecting you to your habits...
        </p>

        {/* Countdown */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-secondary border-2 border-accent rounded-full">
          <span className="text-3xl font-bold text-accent">{countdown}</span>
        </div>
      </div>
    </div>
  );
}

export default AuthCallback;
