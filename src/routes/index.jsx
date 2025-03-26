
// src/routes/index.jsx
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

import UserProfilePage from '../pages/profile/UserProfilePage';
import BaseDetailPage from '../pages/itinerary/BaseDetailPage';
import MatchDetailPage from '../pages/itinerary/MatchDetailPage';
import DateAdjustmentDetailPage from '../pages/itinerary/DateAdjustmentDetailPage'
import BrokerDetailPage from '../pages/itinerary/BrokerDetailPage'




import SellerPage from '../pages/seller/SellerPage'


// Layout imports
import ItineraryInputLayout from '../layouts/ItineraryInputLayout';
import UserProfileLayout from '../layouts/UserProfileLayout';


import SellerLayout from '../layouts/SellerLayout'



import { SellerProvider } from '../context/seller/SellerContext';
import { ItineraryProvider } from '../context/itinerary/ItineraryContext';
import { UserDetailsProvider } from '../context/profile/UserDetailsContext';

export const routes = [
  // Public Routes
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/verify-otp", element: <VerifyOtpPage /> },

  // Protected Routes with Itinerary Layout
  {
    path: "/itinerary",
    element: (
      <ProtectedRouteWithLayout layout={ItineraryInputLayout}>
        <ItineraryProvider>
          <ItineraryInputPage />
        </ItineraryProvider>
      </ProtectedRouteWithLayout>
    ),
  },


 // Protected Routes with Itinerary Layout
 {
  path: "/itinerary-details",
  element: (
    <ProtectedRouteWithLayout layout={ItineraryInputLayout}>
      <ItineraryProvider>
        <ItineraryDetailPage />
      </ItineraryProvider>
    </ProtectedRouteWithLayout>
  ),
},



  
//Broker Details Page
{
  path: "/itinerary/broker-details",
  element: (
    <ProtectedRouteWithLayout layout={ItineraryInputLayout}>
      <ItineraryProvider>
        <BrokerDetailPage/>
      </ItineraryProvider>
    </ProtectedRouteWithLayout>
  ),
},





  //Base Details Page
  {
    path: "/itinerary/base-details",
    element: (
      <ProtectedRouteWithLayout layout={ItineraryInputLayout}>
        <ItineraryProvider>
          <BaseDetailPage/>
        </ItineraryProvider>
      </ProtectedRouteWithLayout>
    ),
  },

   // Match Details Page
   {
    path: "/itinerary/match-details",
    element: (
      <ProtectedRouteWithLayout layout={ItineraryInputLayout}>
        <ItineraryProvider>
          <MatchDetailPage/>
        </ItineraryProvider>
      </ProtectedRouteWithLayout>
    ),
  },

  //DateAdjustmentDetailPage
  {
    path: "/itinerary/date-adjustment-details",
    element: (
      <ProtectedRouteWithLayout layout={ItineraryInputLayout}>
        <ItineraryProvider>
          <DateAdjustmentDetailPage/>
        </ItineraryProvider>
      </ProtectedRouteWithLayout>
    ),
  },



  // Protected Routes with conversation Layout
 {
  path: "/seller",
  element: (
    <ProtectedRouteWithLayout layout={SellerLayout}>
<SellerProvider>
        <SellerPage />
        </SellerProvider>
    </ProtectedRouteWithLayout>
  ),
},



  // Protected Routes with User Profile Layout
  {
    path: "/profile",
    element: (
      <ProtectedRouteWithLayout layout={UserProfileLayout}>
        <UserDetailsProvider>
          <UserProfilePage />
        </UserDetailsProvider>
      </ProtectedRouteWithLayout>
    ),
  },

  // Redirect root to dashboard
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Navigate to="/itinerary" replace />
      </ProtectedRoute>
    ),
  },

  // Catch all route
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];