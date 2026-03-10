import React from 'react';
import { Navigate } from 'react-router-dom';

export const RequireAdmin = ({ children }) => {
  const role = sessionStorage.getItem('auth_role');
  if (role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RequireAdmin;