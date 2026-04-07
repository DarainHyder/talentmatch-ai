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
// App Content Shell (V7 Nuclear Stability)
// ---------------------------------------------------------------------------
const AppContent: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  // Scroll to top on every navigation
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const isLogin = location.pathname === '/login';
  const hideShell = isDashboard || isLogin;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* 
        V7 Stability Rule:
        Components are NEVER unmounted based on navigation. 
        We pass 'hidden' as a prop so they maintain their hook state internally. 
      */}
      <Header user={user} logout={logout} hidden={hideShell} />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/about"    element={<AboutPage />}   />
          <Route path="/chatbot"  element={<ChatbotPage />} />
          <Route path="/login"    element={<LoginPage />}   />

          {/* Secure Routes */}
          <Route path="/dashboard" element={
             <Dashboard user={user} isLoading={isLoading} logout={logout} />
          } />
          <Route path="/admin/job-setup" element={
             <AdminJobSetup user={user} isLoading={isLoading} logout={logout} />
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer hidden={hideShell} />
      <ChatWidget user={user} hidden={isDashboard} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
