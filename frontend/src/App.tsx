import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

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
// App Routes Shell (V6 Stability)
// ---------------------------------------------------------------------------
const AppRoutes: React.FC = () => {
  return (
    <>
      {/* 
        Definitive Stability Fix (V6):
        1. Always render Header/Footer/ChatWidget. They handle internal visibility via CSS.
        2. Routes are flat. We remove the 'ProtectedRoute' wrapper component which was
           causing hook-sequence mismatches (Error #300).
        3. Auth checks are moved directly into the page components.
      */}
      <Header />
      
      <main className="flex-grow">
        <Routes>
          {/* Public */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/about"    element={<AboutPage />}   />
          <Route path="/chatbot"  element={<ChatbotPage />} />
          <Route path="/login"    element={<LoginPage />}   />

          {/* Logged in views: Auth logic is now inside Dashboard and AdminJobSetup */}
          <Route path="/dashboard"         element={<Dashboard />} />
          <Route path="/admin/job-setup"   element={<AdminJobSetup />} />

          {/* Catch-all */}
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
