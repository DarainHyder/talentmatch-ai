import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LandingPage    from './pages/LandingPage';
import Dashboard      from './pages/Dashboard';
import AdminJobSetup  from './pages/AdminJobSetup';
import LoginPage      from './pages/auth/LoginPage';

// ---------------------------------------------------------------------------
// Auth guard — redirects to /login if not authenticated
// ---------------------------------------------------------------------------
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// App routes
// ---------------------------------------------------------------------------
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />}   />

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
  );
};

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
