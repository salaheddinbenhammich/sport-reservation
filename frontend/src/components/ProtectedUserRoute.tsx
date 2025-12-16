import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protect user routes by blocking admins, redirecting them to the admin dashboard
export default function ProtectedUserRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null; // wait until auth is loaded
  if (user?.role === 'admin') {
    // If logged in as admin, redirect to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }
  // If not admin, allow access (could also require logged-in if desired)
  return <>{children}</>;
}
