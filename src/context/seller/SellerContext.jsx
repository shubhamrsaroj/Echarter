// import React, { createContext, useState, useContext, useCallback } from 'react';
// import { SellerService } from '../../api/seller/SellerService';


// // Create the context
// const SellerContext = createContext();

// // Create a provider component
// export const SellerProvider = ({ children }) => {
//   const [haves, setHaves] = useState([]); // Initialize as an empty array

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchHaves = useCallback(async (companyId) => {
//     setLoading(true);
//     try {
//       const data = await SellerService.getCompanyHaves(companyId);
//       console.log("API Response:", data); // Debugging line
//       setHaves(Array.isArray(data.data?.haves) ? data.data.haves : []);
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       setHaves([]); // Ensure haves is an empty array on error
//     } finally {
//       setLoading(false);
//     }
//   }, []);
  
//   return (
//     <SellerContext.Provider value={{ 
//       haves, 
//       loading, 
//       error, 
//       fetchHaves
//     }}>
//       {children}
//     </SellerContext.Provider>
//   );
// };

// // Custom hook to use the seller context
// export const useSellerContext = () => {
//   const context = useContext(SellerContext);
//   if (!context) {
//     throw new Error('useSellerContext must be used within a SellerProvider');
//   }
//   return context;
// };







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
      console.log("Create Haves Response:", response);
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

  return (
    <SellerContext.Provider value={{ 
      haves, 
      loading, 
      error, 
      postSuccess,
      fetchHaves, 
      createHaves 
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