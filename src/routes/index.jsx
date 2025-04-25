import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Page imports
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';

import SearchInputPage from '../pages/CharterSearch/SearchInputPage';
import SearchDetailPage from '../pages/CharterSearch/SearchDetailPage';
import BaseDetailPage from '../pages/CharterSearch/BaseDetailPage';
import MatchDetailPage from '../pages/CharterSearch/MatchDetailPage';
import DateAdjustmentDetailPage from '../pages/CharterSearch/DateAdjustmentDetailPage';
import BrokerDetailPage from '../pages/CharterSearch/BrokerDetailPage';

import SellerPage from '../pages/seller/SellerPage';
import BuyerPage from '../pages/buyer/BuyerPage';



import UserProfilePage from '../pages/profile/UserProfilePage';

// Common Layout import
import CommonLayout from '../layouts/CommonLayout';

// Context providers
import { SellerProvider } from '../context/seller/SellerContext';
import { BuyerProvider } from '../context/buyer/BuyerContext';

import { SearchProvider } from '../context/CharterSearch/SearchContext';
import { UserDetailsProvider } from '../context/profile/UserDetailsContext';

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

  // Protected Routes with search Provider
  { path: "/search", element: wrapWithProvider(SearchProvider, <SearchInputPage />) },
  { path: "/search-details", element: wrapWithProvider(SearchProvider, <SearchDetailPage />) },
  { path: "/search/broker-details", element: wrapWithProvider(SearchProvider, <BrokerDetailPage />) },
  { path: "/search/base-details", element: wrapWithProvider(SearchProvider, <BaseDetailPage />) },
  { path: "/search/match-details", element: wrapWithProvider(SearchProvider, <MatchDetailPage />) },
  { path: "/search/date-adjustment-details", element: wrapWithProvider(SearchProvider, <DateAdjustmentDetailPage />) },

  // Protected Routes with Seller Provider
  { path: "/seller", element: wrapWithProvider(SellerProvider, <SellerPage />) },

  // Protected Routes with both Buyer and Search Provider
  { path: "/conversation", element: wrapWithMultipleProviders([BuyerProvider, SearchProvider], <BuyerPage />) },



  // Protected Routes with User Details Provider
  { path: "/profile", element: wrapWithProvider(UserDetailsProvider, <UserProfilePage />) },

  // Redirect root to search
  { path: "/", element: <ProtectedRoute><Navigate to="/search" replace /></ProtectedRoute> },

  // Catch all route
  { path: "*", element: <Navigate to="/" replace /> },
];

