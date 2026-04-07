import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

// Pages
import LandingPage    from './pages/LandingPage';
import Dashboard      from './pages/Dashboard';
import AdminJobSetup  from './pages/AdminJobSetup';
import LoginPage      from './pages/auth/LoginPage';
import AboutPage      from './pages/AboutPage';
import ChatbotPage    from './pages/ChatbotPage';

// ---------------------------------------------------------------------------
// Scroll Restoration — Ensures page starts at top on route change
// ---------------------------------------------------------------------------
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ---------------------------------------------------------------------------
// Auth guard — redirects to /login if not authenticated
// ---------------------------------------------------------------------------
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// App Routes
// ---------------------------------------------------------------------------
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const isLogin = location.pathname === '/login';

  return (
    <>
      <ScrollToTop />
      {/* Hide Header/Footer on Dashboard/Admin/Login for cleaner UI */}
      {!isDashboard && !isLogin && <Header />}
      
      <main className="flex-grow">
        <Routes>
          {/* Public */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/about"    element={<AboutPage />}   />
          <Route path="/chatbot"  element={<ChatbotPage />} />
          <Route path="/login"    element={<LoginPage />}   />

          {/* Admin — JWT protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/admin/job-setup" element={
            <ProtectedRoute><AdminJobSetup /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isDashboard && !isLogin && <Footer />}
      <ChatWidget />
    </>
  );
};

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
           <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
