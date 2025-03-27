import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ProtectedRouteWithLayout } from './ProtectedRouteWithLayout';

// Page imports
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';

import ItineraryInputPage from '../pages/itinerary/ItineraryInputPage';
import ItineraryDetailPage from '../pages/itinerary/ItineraryDetailPage';
import BaseDetailPage from '../pages/itinerary/BaseDetailPage';
import MatchDetailPage from '../pages/itinerary/MatchDetailPage';
import DateAdjustmentDetailPage from '../pages/itinerary/DateAdjustmentDetailPage';
import BrokerDetailPage from '../pages/itinerary/BrokerDetailPage';

import SellerPage from '../pages/seller/SellerPage';
import UserProfilePage from '../pages/profile/UserProfilePage';

// Layout imports
import ItineraryInputLayout from '../layouts/ItineraryInputLayout';
import SellerLayout from '../layouts/SellerLayout';
import UserProfileLayout from '../layouts/UserProfileLayout';

// Context providers
import { SellerProvider } from '../context/seller/SellerContext';
import { ItineraryProvider } from '../context/itinerary/ItineraryContext';
import { UserDetailsProvider } from '../context/profile/UserDetailsContext';

// Helper function to wrap routes with layout and provider
const wrapWithProvider = (Layout, Provider, Component) => (
  <ProtectedRouteWithLayout layout={Layout}>
    <Provider>{Component}</Provider>
  </ProtectedRouteWithLayout>
);

export const routes = [
  // Public Routes
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/verify-otp", element: <VerifyOtpPage /> },

  // Protected Routes with Itinerary Layout
  { path: "/itinerary", element: wrapWithProvider(ItineraryInputLayout, ItineraryProvider, <ItineraryInputPage />) },
  { path: "/itinerary-details", element: wrapWithProvider(ItineraryInputLayout, ItineraryProvider, <ItineraryDetailPage />) },
  { path: "/itinerary/broker-details", element: wrapWithProvider(ItineraryInputLayout, ItineraryProvider, <BrokerDetailPage />) },
  { path: "/itinerary/base-details", element: wrapWithProvider(ItineraryInputLayout, ItineraryProvider, <BaseDetailPage />) },
  { path: "/itinerary/match-details", element: wrapWithProvider(ItineraryInputLayout, ItineraryProvider, <MatchDetailPage />) },
  { path: "/itinerary/date-adjustment-details", element: wrapWithProvider(ItineraryInputLayout, ItineraryProvider, <DateAdjustmentDetailPage />) },

  // Protected Routes with Seller Layout
  { path: "/seller", element: wrapWithProvider(SellerLayout, SellerProvider, <SellerPage />) },

  // Protected Routes with User Profile Layout
  { path: "/profile", element: wrapWithProvider(UserProfileLayout, UserDetailsProvider, <UserProfilePage />) },

  // Redirect root to itinerary
  { path: "/", element: <ProtectedRoute><Navigate to="/itinerary" replace /></ProtectedRoute> },

  // Catch all route
  { path: "*", element: <Navigate to="/" replace /> },
];
