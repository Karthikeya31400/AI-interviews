import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { InterviewPage } from './pages/InterviewPage';
import { ResumePage } from './pages/ResumePage';
import { MentorPage } from './pages/MentorPage';
import { CodingPage } from './pages/CodingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-dark-surface)]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-dark-surface)]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/coding" element={<CodingPage />} />
            <Route path="/mentor" element={<MentorPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminPage />
              </AdminProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}



