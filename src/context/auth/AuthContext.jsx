import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../../api/auth.api';
import { tokenHandler } from '../../utils/tokenHandler';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    const token = tokenHandler.getToken();
    if (token && tokenHandler.isTokenValid()) {
      const userData = tokenHandler.parseUserFromToken(token);
      if (userData) {
        setUser(userData);
      }
    }
    setLoading(false);
  };

  const signup = async (data) => {
    try {
      const response = await authApi.signup(data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await authApi.resendOtp(email);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async (email, otp, isSignin = false) => {
    try {
      const apiMethod = isSignin ? authApi.validateSigninOtp : authApi.validateSignupOtp;
      const response = await apiMethod(email, otp);
      
      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data;
        
        // Store both tokens
        tokenHandler.storeToken(accessToken);
        tokenHandler.storeRefreshToken(refreshToken);
        
        // Avoid logging tokens in production
        console.log('Token storage successful during verifyOtp');
        
        const userData = tokenHandler.parseUserFromToken(accessToken);
        if (userData) {
          setUser(userData);
        }
      }
      
      return response.data.success;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };
  
  const login = async (email) => {
    try {
      const response = await authApi.login(email);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = tokenHandler.getRefreshToken();
      if (!refreshToken) {
        console.error('No refresh token available in cookies');
        throw new Error('No refresh token available');
      }
      
      console.log('Attempting token refresh...');
      const response = await authApi.refreshToken(refreshToken);
      
      // Debug response
      console.log('Refresh API response structure:', 
        Object.keys(response || {}).join(', '), 
        Object.keys(response?.data || {}).join(', ')
      );
      
      // Check for error response - this seems to be where your issue is
      if (!response.data.success) {
        const errorMsg = response.data.message || 'Unknown error';
        console.error('Refresh token API failed:', errorMsg);
        throw new Error(`Failed to refresh token: ${errorMsg}`);
      }
      
      // If we get here, we have a success response
      // Check data structure
      const { accessToken, refreshToken: newRefreshToken } = response.data.data || {};
      
      if (!accessToken || !newRefreshToken) {
        console.error('Missing tokens in API response. Fields available:', 
          Object.keys(response.data.data || {}).join(', ')
        );
        throw new Error('Invalid token response: Missing tokens');
      }
      
      // Store the tokens
      tokenHandler.storeToken(accessToken);
      tokenHandler.storeRefreshToken(newRefreshToken);
      
      // Parse and validate user data
      const userData = tokenHandler.parseUserFromToken(accessToken);
      if (!userData) {
        throw new Error('Failed to parse user data from new token');
      }
      
      setUser(userData);
      console.log('Token refresh successful');
      return accessToken;
    } catch (error) {
      // If there was an error in the API call itself (network error, etc.)
      if (!error.response) {
        console.error('Network error during token refresh:', error.message);
        throw new Error('Network error during token refresh');
      }
      
      // If we got an error response from the API
      if (error.response) {
        console.error('API error response:', error.response.status, error.response.data);
        const errorMsg = error.response.data?.message || 'Server error';
        throw new Error(`Failed to refresh token: ${errorMsg}`);
      }
      
      // If it's our own thrown error, just pass it along
      console.error('Token refresh error:', error.message);
      throw error;
    }
  };

  const logout = () => {
    tokenHandler.clearAllTokens();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        login,
        verifyOtp,
        resendOtp,
        refreshAccessToken,
        logout,
        loading,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};