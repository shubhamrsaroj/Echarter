import React, { createContext, useState, useContext, useCallback } from "react";
import { userService } from "../../api/profile/user.service";
import { tokenHandler } from "../../utils/tokenHandler";

const UserDetailsContext = createContext({
  userDetails: null,
  company: null,
  companyList: null,
  loading: false,
  error: null,
  fetchUserDetails: async () => {},
  updateUserDetails: async () => {},
  fetchCompanyDetails: async () => {},
  searchCompanies: async () => {},
  clearUserDetails: () => {},
  checkAdminAccess: () => {},
});

export const UserDetailsProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [error, setError] = useState(null);

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = tokenHandler.getToken();
      if (!token || !tokenHandler.isTokenValid()) {
        throw new Error("No valid authentication token found");
      }

      const user = tokenHandler.parseUserFromToken(token);
      if (!user || !user.id) {
        throw new Error("Unable to extract user ID from token");
      }

      const details = await userService.getUserDetailsById(user.id);
      setUserDetails(details);
      return details; // Return the details for use in components
    } catch (error) {
      console.error("Failed to fetch user details:", error);
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
        throw new Error("No valid authentication token found");
      }

      // Ensure we have a valid ID in the payload
      if (!updatedData.id) {
        const user = tokenHandler.parseUserFromToken(token);
        if (!user || !user.id) {
          throw new Error("Unable to extract user ID from token");
        }
        updatedData.id = user.id;
      }

      console.log('Sending update profile request with data:', updatedData);
      
      // Send the update request with the properly formatted payload
      const response = await userService.updateUserProfile(updatedData);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to update user profile");
      }

      console.log('Profile update response:', response);

      // Update local state with the updated data
      setUserDetails((prevDetails) => {
        // Create a new object with the previous details as base
        const newDetails = { ...prevDetails };
        
        // Handle address specially to ensure it's properly updated
        if (updatedData.address) {
          if (!newDetails.fullAddress) {
            newDetails.fullAddress = {};
          }
          newDetails.fullAddress.address = updatedData.address;
        }
        
        // Handle country specially to ensure it's properly updated
        if (updatedData.country) {
          if (!newDetails.fullAddress) {
            newDetails.fullAddress = {};
          }
          newDetails.fullAddress.country = updatedData.country;
          newDetails.country = updatedData.country;
        }
        
        // Update all other fields
        return {
          ...newDetails,
          ...updatedData,
        };
      });

      return response;
    } catch (error) {
      console.error("Failed to update user details:", error);
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
      console.error("Failed to fetch company details:", error);
      setError(error.message);
      setCompany(null);
      throw error; // Propagate the error for toast handling
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCompanies = useCallback(async (searchParams) => {
    setLoading(true);
    setError(null);

    try {
      const companies = await userService.searchCompanies(searchParams);

      // Normalize the response: get companies list from `companies.data` or fallback
      const normalizedCompanies = Array.isArray(companies?.data)
        ? companies.data
        : Array.isArray(companies)
        ? companies
        : [];

      setCompanyList(normalizedCompanies);

      return normalizedCompanies;
    } catch (error) {
      setError(error.message);
      setCompanyList([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCompany = useCallback(async (companyData) => {
    setLoading(true);
    setError(null);

    try {
      // Check if user has permission to add a company
      const token = tokenHandler.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const userData = tokenHandler.parseUserFromToken(token);
      console.log("User data from token:", userData);
      
      // Check if the user has a role that can add companies
      // This is just a check - the backend will make the final authorization decision
      if (!userData || (!userData.Role && !userData.role)) {
        console.warn("User role information is missing from the token");
      }
      
      const response = await userService.addCompany(companyData);
      
      // Refresh company list after adding a new company
      if (response && response.success) {
        await fetchCompanyDetails();
      }
      
      return response;
    } catch (error) {
      console.error("Failed to add company:", error);
      setError(error.message);
      throw error; // Propagate the error for toast handling
    } finally {
      setLoading(false);
    }
  }, [fetchCompanyDetails]);

  const clearUserDetails = useCallback(() => {
    setUserDetails(null);
    setCompany(null);
    setError(null);
  }, []);

  const checkAdminAccess = useCallback(() => {
    return tokenHandler.hasRole('admin');
  }, []);

  return (
    <UserDetailsContext.Provider
      value={{
        userDetails,
        company,
        companyList,
        loading,
        error,
        fetchUserDetails,
        updateUserDetails,
        fetchCompanyDetails,
        clearUserDetails,
        searchCompanies,
        addCompany,
        checkAdminAccess,
      }}
    >
      {children}
    </UserDetailsContext.Provider>
  );
};

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext);
  if (!context) {
    throw new Error("useUserDetails must be used within a UserDetailsProvider");
  }
  return context;
};
