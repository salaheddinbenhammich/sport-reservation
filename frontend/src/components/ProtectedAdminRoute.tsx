// Import React - needed for JSX components
import React from 'react';
// Import Navigate from react-router-dom - used to redirect users
import { Navigate } from 'react-router-dom';
// Import useAuth hook - gives us access to user data and auth state
import { useAuth } from '../context/AuthContext';

// Define the component props interface - tells TypeScript what props this component accepts
interface ProtectedAdminRouteProps {
  // children is the component/content that will be rendered if user is admin
  children: React.ReactNode;
}

// Export the component function
export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  // Get user, token, and loading state from AuthContext
  // This hook gives us access to the authentication context we created
  const { user, token, loading } = useAuth();

  // Show loading state while checking authentication
  // Prevents showing redirect flash while checking if user is logged in
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Check if user is not logged in (no token)
  // If not logged in, redirect to login page with return URL
  if (!token) {
    // Navigate component redirects user to /login page
    // replace: true means replace current history entry (back button won't go to admin page)
    // state: from lets login page know where to redirect after login
    return <Navigate to="/login?redirect=/admin/dashboard" replace />;
  }

  // Check if user exists but is not an admin
  // user.role comes from the backend - it's either 'user' or 'admin'
  if (user?.role !== 'admin') {
    // Redirect non-admin users to home page
    // They don't have permission to access admin routes
    return <Navigate to="/" replace />;
  }

  // If we get here, user is logged in AND is an admin
  // Render the children components (the admin page that was requested)
  return <>{children}</>;
}

