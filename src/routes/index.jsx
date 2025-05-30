import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Page imports
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import RoleBasedLanding from '../pages/RoleBasedLanding';

import SearchInputPage from '../pages/CharterSearch/SearchInputPage';
import SearchDetailPage from '../pages/CharterSearch/SearchDetailPage';
import BaseDetailPage from '../pages/CharterSearch/BaseDetailPage';
import MatchDetailPage from '../pages/CharterSearch/MatchDetailPage';
import DateAdjustmentDetailPage from '../pages/CharterSearch/DateAdjustmentDetailPage';
import BrokerDetailPage from '../pages/CharterSearch/BrokerDetailPage';

import SellerMarketPage from '../pages/seller-market/SellerMarketPage';
import BuyerPage from '../pages/buyer/BuyerPage';

import UserProfilePage from '../pages/profile/UserProfilePage';

// Common Layout import
import CommonLayout from '../layouts/CommonLayout';

// Context providers
import { PipelineProvider } from '../context/seller-market/SellerMarketContext';
import { BuyerProvider } from '../context/buyer/BuyerContext';
import { SearchProvider } from '../context/CharterSearch/SearchContext';
import { UserDetailsProvider } from '../context/profile/UserDetailsContext';
import { tokenHandler } from '../utils/tokenHandler';

// Helper function to check if user has seller access
const hasSellerAccess = () => {
  const token = tokenHandler.getToken();
  const userData = token ? tokenHandler.parseUserFromToken(token) : null;
  
  const userRoles = (userData?.role || '').split(',').map(role => role.trim().toLowerCase());
  
  const result = userRoles.some(role => ['broker', 'operator'].includes(role.toLowerCase()));
  
  return result;
};

// Helper function to wrap routes with common layout and appropriate provider
const wrapWithProvider = (Provider, Component) => (
  <ProtectedRoute>
    <CommonLayout>
      <Provider>{Component}</Provider>
    </CommonLayout>
  </ProtectedRoute>
);

// Helper function to wrap routes with multiple providers
const wrapWithMultipleProviders = (Providers, Component) => (
  <ProtectedRoute>
    <CommonLayout>
      {/* eslint-disable-next-line no-unused-vars */}
      {Providers.reduce((acc, Provider) => (
        <Provider>{acc}</Provider>
      ), Component)}
    </CommonLayout>
  </ProtectedRoute>
);

export const routes = [
  // Public Routes
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/verify-otp", element: <VerifyOtpPage /> },

  // Protected Routes with search Provider - only for non-seller users
  { 
    path: "/search", 
    element: <ProtectedRoute>
      {() => {
        if (hasSellerAccess()) {
          return <Navigate to="/market" replace />;
        }
        return <CommonLayout><SearchProvider><SearchInputPage /></SearchProvider></CommonLayout>;
      }}
    </ProtectedRoute>
  },
  { 
    path: "/search-details", 
    element: <ProtectedRoute>
      {() => {
        if (hasSellerAccess()) {
          return <Navigate to="/market" replace />;
        }
        return <CommonLayout><SearchProvider><SearchDetailPage /></SearchProvider></CommonLayout>;
      }}
    </ProtectedRoute>
  },
  { 
    path: "/search/broker-details", 
    element: <ProtectedRoute>
      {() => {
        if (hasSellerAccess()) {
          return <Navigate to="/market" replace />;
        }
        return <CommonLayout><SearchProvider><BrokerDetailPage /></SearchProvider></CommonLayout>;
      }}
    </ProtectedRoute>
  },
  { 
    path: "/search/base-details", 
    element: <ProtectedRoute>
      {() => {
        if (hasSellerAccess()) {
          return <Navigate to="/market" replace />;
        }
        return <CommonLayout><SearchProvider><BaseDetailPage /></SearchProvider></CommonLayout>;
      }}
    </ProtectedRoute>
  },
  { 
    path: "/search/match-details", 
    element: <ProtectedRoute>
      {() => {
        if (hasSellerAccess()) {
          return <Navigate to="/market" replace />;
        }
        return <CommonLayout><SearchProvider><MatchDetailPage /></SearchProvider></CommonLayout>;
      }}
    </ProtectedRoute>
  },
  { 
    path: "/search/date-adjustment-details", 
    element: <ProtectedRoute>
      {() => {
        if (hasSellerAccess()) {
          return <Navigate to="/market" replace />;
        }
        return <CommonLayout><SearchProvider><DateAdjustmentDetailPage /></SearchProvider></CommonLayout>;
      }}
    </ProtectedRoute>
  },

  // Protected Routes with Seller Provider - only for seller users
  { 
    path: "/market", 
    element: <ProtectedRoute>
      {() => {
        if (!hasSellerAccess()) {
          return <Navigate to="/search" replace />;
        }
        return <CommonLayout><PipelineProvider><SellerMarketPage /></PipelineProvider></CommonLayout>;
      }}
    </ProtectedRoute>
  },

  // Protected Routes with both Buyer and Search Provider
  { path: "/conversation", element: wrapWithMultipleProviders([BuyerProvider, SearchProvider], <BuyerPage />) },

  // Protected Routes with User Details Provider
  { path: "/profile", element: wrapWithProvider(UserDetailsProvider, <UserProfilePage />) },

  // Redirect root based on role
  { path: "/", element: <ProtectedRoute><RoleBasedLanding /></ProtectedRoute> },

  // Catch all route
  { path: "*", element: <Navigate to="/" replace /> },
];

