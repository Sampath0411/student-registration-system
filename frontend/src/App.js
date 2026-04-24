import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import FormBuilder from './pages/admin/FormBuilder';
import Submissions from './pages/admin/Submissions';
import AdminSettings from './pages/admin/Settings';
import Register from './pages/student/Register';
import EditSubmission from './pages/student/EditSubmission';

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  );
  return admin ? children : <Navigate to="/admin/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/edit/:token" element={<EditSubmission />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/form-builder" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
      <Route path="/admin/submissions" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#333', color: '#fff' } }} />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
