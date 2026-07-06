import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ClassPage from './pages/ClassPage';

type Page = string;

function AppContent() {
  const { user, profile, loading, profileLoading } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [classId, setClassId] = useState<string>('');

  const navigate = (target: Page) => {
    if (target.startsWith('class:')) {
      setClassId(target.replace('class:', ''));
      setPage('class');
      return;
    }
    if (target.startsWith('home#') && page === 'home') {
      const anchor = target.split('#')[1];
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    setPage(target.replace(/#.*$/, ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Consolidated redirect logic — all redirects happen in useEffect, never during render
  useEffect(() => {
    if (loading || profileLoading) return;

    // Authenticated user on landing/auth pages → redirect to their space
    if (user && (page === 'login' || page === 'register' || page === 'home')) {
      setPage(profile?.role === 'admin' ? 'admin' : 'dashboard');
      return;
    }

    // Admin on dashboard → redirect to admin panel
    if (user && profile?.role === 'admin' && page === 'dashboard') {
      setPage('admin');
      return;
    }

    // Student on admin page → redirect to dashboard
    if (user && profile?.role !== 'admin' && page === 'admin') {
      setPage('dashboard');
      return;
    }

    // Unauthenticated user on protected pages → redirect to login
    if (!user && (page === 'dashboard' || page === 'admin' || page === 'class')) {
      setPage('login');
      return;
    }
  }, [user, profile, loading, profileLoading, page]);

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  // Guard protected pages without calling setState during render
  if (page === 'dashboard') {
    if (!user) return null;
    return <Dashboard onNavigate={navigate} />;
  }

  if (page === 'admin') {
    if (!user || profile?.role !== 'admin') return null;
    return <AdminPanel onNavigate={navigate} />;
  }

  if (page === 'class') {
    if (!user) return null;
    return <ClassPage classId={classId} onNavigate={navigate} />;
  }

  if (page === 'login' || page === 'register') {
    return <AuthPage mode={page} onNavigate={navigate} />;
  }

  return (
    <div>
      <Navbar onNavigate={navigate} currentPage={page} />
      <Landing onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
