
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Centralized check for authentication
  // This should be the single source of truth for your app's auth state
  const isAuthenticated = !!localStorage.getItem('token');

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;