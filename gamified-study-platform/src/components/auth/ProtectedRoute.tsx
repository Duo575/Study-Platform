import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  // TEMPORARY BYPASS: Always allow access for development
  // TODO: Remove this bypass when authentication is fixed
  console.log(
    '🚧 AUTH BYPASS: Authentication temporarily disabled for development'
  );
  return <>{children}</>;

  /* ORIGINAL CODE - COMMENTED OUT FOR BYPASS
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If route requires authentication and user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If route is for non-authenticated users only (like login/register) and user is logged in
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
  */
}
