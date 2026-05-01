import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function getDashboardPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'staff') return '/staff';
  if (role === 'guest') return '/guest';
  return '/';
}

function RequireAuth({ allowedRoles, children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location, authError: 'Please sign in to continue.' }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          authError: 'Your account does not have permission to access that page.',
        }}
        replace
      />
    );
  }

  return children;
}

export default RequireAuth;

