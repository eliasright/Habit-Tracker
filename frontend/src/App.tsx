import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import { useAuthGuard } from './hooks/useAuthGuard';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import TodosPage from './pages/TodosPage';
import AuthCallback from './pages/AuthCallback';
import './App.css';

function AppContent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasToken = searchParams.has('token');
  const hasError = searchParams.has('error');

  // Global authentication guard
  useAuthGuard();

  // Redirect to auth callback if token or error is in URL
  useEffect(() => {
    if ((hasToken || hasError) && location.pathname === '/') {
      window.location.href = `/auth/callback${location.search}`;
    }
  }, [hasToken, hasError, location]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/todos" element={<TodosPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </>
  );
}

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Apply theme on mount and when it changes
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppContent />
    </Router>
  );
}

export default App;
