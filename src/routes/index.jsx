import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

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
import BuyerPage from '../pages/buyer/BuyerPage';

import ChatPage from '../pages/Chat/ChatPage';

import UserProfilePage from '../pages/profile/UserProfilePage';

// Common Layout import
import CommonLayout from '../layouts/CommonLayout';

// Context providers
import { SellerProvider } from '../context/seller/SellerContext';
import { BuyerProvider } from '../context/buyer/BuyerContext';

import { ItineraryProvider } from '../context/itinerary/ItineraryContext';
import { UserDetailsProvider } from '../context/profile/UserDetailsContext';

// Helper function to wrap routes with common layout and appropriate provider
const wrapWithProvider = (Provider, Component) => (
  <ProtectedRoute>
    <CommonLayout>
      <Provider>{Component}</Provider>
    </CommonLayout>
  </ProtectedRoute>
);

export const routes = [
  // Public Routes
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/verify-otp", element: <VerifyOtpPage /> },

  // Protected Routes with Itinerary Provider
  { path: "/itinerary", element: wrapWithProvider(ItineraryProvider, <ItineraryInputPage />) },
  { path: "/itinerary-details", element: wrapWithProvider(ItineraryProvider, <ItineraryDetailPage />) },
  { path: "/itinerary/broker-details", element: wrapWithProvider(ItineraryProvider, <BrokerDetailPage />) },
  { path: "/itinerary/base-details", element: wrapWithProvider(ItineraryProvider, <BaseDetailPage />) },
  { path: "/itinerary/match-details", element: wrapWithProvider(ItineraryProvider, <MatchDetailPage />) },
  { path: "/itinerary/date-adjustment-details", element: wrapWithProvider(ItineraryProvider, <DateAdjustmentDetailPage />) },

  // Protected Routes with Seller Provider
  { path: "/seller", element: wrapWithProvider(SellerProvider, <SellerPage />) },
  

  // Protected Routes with buyer Provider
  { path: "/conversation", element: wrapWithProvider(BuyerProvider, <BuyerPage  />) },

   { path: "/chat", element: wrapWithProvider(React.Fragment, <ChatPage  />) },

  // Protected Routes with User Details Provider
  { path: "/profile", element: wrapWithProvider(UserDetailsProvider, <UserProfilePage />) },

  // Redirect root to itinerary
  { path: "/", element: <ProtectedRoute><Navigate to="/itinerary" replace /></ProtectedRoute> },

  // Catch all route
  { path: "*", element: <Navigate to="/" replace /> },
];

