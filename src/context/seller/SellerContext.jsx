import React, { createContext, useState, useContext, useCallback } from 'react';
import { SellerService } from '../../api/seller/SellerService';

// Create the context
const SellerContext = createContext();

// Create a provider component
export const SellerProvider = ({ children }) => {
  const [haves, setHaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchHaves = useCallback(async (companyId) => {
    setLoading(true);
    try {
      const data = await SellerService.getCompanyHaves(companyId);
      setHaves(Array.isArray(data.data?.haves) ? data.data.haves : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setHaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createHaves = useCallback(async (text) => {
    setLoading(true);
    setPostSuccess(false);
    try {
      const response = await SellerService.createHaves(text);
      setPostSuccess(response?.data?.message || "Post created successfully!");
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      setPostSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteHave = useCallback(async (haveId) => {
    setLoading(true);
    setDeleteSuccess(false);
    try {
      const response = await SellerService.deleteHave(haveId);
      
      // Remove the deleted item from the haves array
      setHaves(prevHaves => prevHaves.filter(have => have.id !== haveId));
      
      // Set success message from API response
      setDeleteSuccess(response.message || "Successfully deleted!");
      setError(null);
      
      return response;
    } catch (err) {
      setError(err.message);
      setDeleteSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset success messages
  const resetSuccessMessages = useCallback(() => {
    setPostSuccess(false);
    setDeleteSuccess(false);
  }, []);

  return (
    <SellerContext.Provider value={{
      haves,
      loading,
      error,
      postSuccess,
      deleteSuccess,
      fetchHaves,
      createHaves,
      deleteHave,
      resetSuccessMessages
    }}>
      {children}
    </SellerContext.Provider>
  );
};

// Custom hook to use the seller context
export const useSellerContext = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSellerContext must be used within a SellerProvider');
  }
  return context;
};