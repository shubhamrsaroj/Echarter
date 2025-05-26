import React from 'react';
import { Navigate } from 'react-router-dom';
import { tokenHandler } from '../utils/tokenHandler';

const RoleBasedLanding = () => {
  // Get user role from token
  const token = tokenHandler.getToken();
  const userData = token ? tokenHandler.parseUserFromToken(token) : null;
  const userRoles = (userData?.role || '').split(',').map(role => role.trim());
  const hasSellerAccess = userRoles.some(role => ['Broker', 'Operator'].includes(role));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate page based on role
  return <Navigate to={hasSellerAccess ? "/market" : "/search"} replace />;
};

export default RoleBasedLanding; 