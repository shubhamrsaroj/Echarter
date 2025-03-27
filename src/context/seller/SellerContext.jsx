import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { SellerService } from '../../api/seller/SellerService';
import { tokenHandler } from '../../utils/tokenHandler';

const SellerContext = createContext();

export const SellerProvider = ({ children }) => {
  const [haves, setHaves] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize user data from token on context creation
  useEffect(() => {
    const token = tokenHandler.getToken();
    if (token) {
      const userData = tokenHandler.parseUserFromToken(token);
      setCurrentUser(userData);
    }
  }, []);

  const fetchHaves = useCallback(async () => {
    if (!currentUser?.comId) return;

    setLoading(true);
    try {
      const data = await SellerService.getCompanyHaves(currentUser.comId);
      setHaves(Array.isArray(data.data?.haves) ? data.data.haves : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setHaves([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchDeals = useCallback(async () => {
    if (!currentUser?.comId) return;

    setLoading(true);
    try {
      const data = await SellerService.getCompanyDeals(currentUser.comId);
      setDeals(Array.isArray(data.data) ? data.data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

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
      setHaves(prevHaves => prevHaves.filter(have => have.id !== haveId));
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

  const resetSuccessMessages = useCallback(() => {
    setPostSuccess(false);
    setDeleteSuccess(false);
  }, []);

  return (
    <SellerContext.Provider value={{
      haves,
      deals,
      loading,
      error,
      currentUser,
      postSuccess,
      deleteSuccess,
      fetchHaves,
      fetchDeals,
      createHaves,
      deleteHave,
      resetSuccessMessages
    }}>
      {children}
    </SellerContext.Provider>
  );
};

export const useSellerContext = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSellerContext must be used within a SellerProvider');
  }
  return context;
};