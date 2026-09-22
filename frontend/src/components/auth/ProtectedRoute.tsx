import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute(): React.ReactElement {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicRoute(): React.ReactElement {
  const { token, user } = useAuth();

  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
