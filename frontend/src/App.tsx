import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import HabitsPage from './pages/HabitsPage';
import AuthCallback from './pages/AuthCallback';
import './App.css';

function AppContent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasToken = searchParams.has('token');
  const hasError = searchParams.has('error');

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
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </>
  );
}

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
