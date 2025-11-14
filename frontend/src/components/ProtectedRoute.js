import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles = [], requireSameUser = false, userId = null }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is accessing their own dashboard (not applicable to admins)
  if (requireSameUser && user.role !== 'admin') {
    if (userId && user.id !== parseInt(userId)) {
      return <Navigate to={`/${user.role}/${user.id}`} replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
