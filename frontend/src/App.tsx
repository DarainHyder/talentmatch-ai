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
// Scroll Restoration
// ---------------------------------------------------------------------------
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ---------------------------------------------------------------------------
// Protected Route
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
// App Routes Shell
// ---------------------------------------------------------------------------
const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      {/* Header and Footer now handle their own visibility internally. 
          This keeps the React component tree stable and prevents Hook Error #300. */}
      <Header />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/about"    element={<AboutPage />}   />
          <Route path="/chatbot"  element={<ChatbotPage />} />
          <Route path="/login"    element={<LoginPage />}   />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/admin/job-setup" element={
            <ProtectedRoute><AdminJobSetup /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <ChatWidget />
    </>
  );
};

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
