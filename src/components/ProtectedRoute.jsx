import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { token, roles } = useSelector(state => state.auth);
  const location = useLocation();

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin required but user is not admin
  if (requireAdmin && !(Array.isArray(roles) && roles.includes('ROLE_ADMIN'))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
