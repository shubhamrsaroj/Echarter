import React, { createContext, useState, useContext, useCallback } from 'react';
import { userService } from '../../api/profile/user.service';
import { tokenHandler } from '../../utils/tokenHandler';

const UserDetailsContext = createContext({
  userDetails: null,
  company: null,
  loading: false,
  error: null,
  fetchUserDetails: async () => {},
  updateUserDetails: async () => {},
  fetchCompanyDetails: async () => {},
  clearUserDetails: () => {},
});

export const UserDetailsProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = tokenHandler.getToken();
      if (!token || !tokenHandler.isTokenValid()) {
        throw new Error('No valid authentication token found');
      }

      const user = tokenHandler.parseUserFromToken(token);
      if (!user || !user.id) {
        throw new Error('Unable to extract user ID from token');
      }

      const details = await userService.getUserDetailsById(user.id);
      setUserDetails(details);
      return details; // Return the details for use in components
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setError(error.message);
      setUserDetails(null);
      throw error; // Propagate the error for toast handling
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserDetails = useCallback(async (updatedData) => {
    setLoading(true);
    setError(null);

    try {
      const token = tokenHandler.getToken();
      if (!token || !tokenHandler.isTokenValid()) {
        throw new Error('No valid authentication token found');
      }

      const user = tokenHandler.parseUserFromToken(token);
      if (!user || !user.id) {
        throw new Error('Unable to extract user ID from token');
      }

      const profileUpdatePayload = {
        id: user.id,
        ...updatedData,
      };

      const updatedDetails = await userService.updateUserProfile(profileUpdatePayload);

      // Update local state with the server response
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        ...updatedDetails.data, // Use the updated data from the server response
      }));

      return updatedDetails; // Return the full response for toast messages
    } catch (error) {
      console.error('Failed to update user details:', error);
      setError(error.message);
      throw error; // Propagate the error for toast handling
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanyDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const companyData = await userService.getCompanyById();
      setCompany(companyData);
      return companyData;
    } catch (error) {
      console.error('Failed to fetch company details:', error);
      setError(error.message);
      setCompany(null);
      throw error; // Propagate the error for toast handling
    } finally {
      setLoading(false);
    }
  }, []);

  const clearUserDetails = useCallback(() => {
    setUserDetails(null);
    setCompany(null);
    setError(null);
  }, []);

  return (
    <UserDetailsContext.Provider
      value={{
        userDetails,
        company,
        loading,
        error,
        fetchUserDetails,
        updateUserDetails,
        fetchCompanyDetails,
        clearUserDetails,
      }}
    >
      {children}
    </UserDetailsContext.Provider>
  );
};

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext);
  if (!context) {
    throw new Error('useUserDetails must be used within a UserDetailsProvider');
  }
  return context;
};