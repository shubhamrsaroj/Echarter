import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from "react";
import { SellerService } from "../../api/seller/SellerService";
import { tokenHandler } from "../../utils/tokenHandler";

const SellerContext = createContext();

// Keep itinerary requests outside of the component to prevent re-renders
const pendingRequests = {};
const lastFetchTimestamps = {};
const CACHE_DURATION = 10000; // 10 seconds

// Create a request cache outside the component to prevent re-renders
const requestCache = {};

export const SellerProvider = ({ children }) => {
  const [haves, setHaves] = useState([]);
  const [deals, setDeals] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [itineraries, setItineraries] = useState({});
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [itineraryError, setItineraryError] = useState(null);
  const [showItinerary, setShowItinerary] = useState(null);
  
  // Add a ref to keep track of ongoing fetch requests
  const abortControllerRef = useRef(null);
  const pendingFetchHavesRef = useRef(false);
  const lastFetchHavesTimestamp = useRef(0);

  useEffect(() => {
    const token = tokenHandler.getToken();
    if (token) {
      const userData = tokenHandler.parseUserFromToken(token);
      setCurrentUser(userData);
    }
  }, []);

  const fetchNeeds = useCallback(async () => {
    if (!currentUser?.comId) return;

    setLoading(true);
    try {
      const data = await SellerService.getCompanyNeeds(currentUser.comId);
      setNeeds(Array.isArray(data.data?.needs) ? data.data.needs : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setNeeds([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchHaves = useCallback(async () => {
    if (!currentUser?.comId) return;

    // Check if we're already fetching or if we've fetched recently (within last 2 seconds)
    const now = Date.now();
    if (pendingFetchHavesRef.current || (now - lastFetchHavesTimestamp.current < 2000)) {
      return;
    }

    pendingFetchHavesRef.current = true;
    setLoading(true);
    
    try {
      const data = await SellerService.getCompanyHaves(currentUser.comId);
      if (!data || !data.data) {
        setHaves([]);
      } else {
        setHaves(Array.isArray(data.data?.haves) ? data.data.haves : []);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setHaves([]);
    } finally {
      setLoading(false);
      pendingFetchHavesRef.current = false;
      lastFetchHavesTimestamp.current = Date.now();
    }
  }, [currentUser]);

  const fetchDeals = useCallback(async () => {
    if (!currentUser?.comId) return;
    
    // Set loading state first, before any other operations
    setLoading(true);
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      const data = await SellerService.getCompanyDeals(signal);
      const dealsArray = Array.isArray(data?.data?.newResponse) ? data.data.newResponse : [];
      const enrichedDeals = dealsArray.map(deal => ({
        ...deal,
        acsUserId: data.data.acsUserId || null,
        accessToken: data.data.accessToken || null,
      }));
      setDeals(enrichedDeals);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setDeals([]);
      } else {
        // Don't clear loading state for aborted requests as
        // a new request will be made immediately
        return;
      }
    } finally {
      // Only set loading to false if the request wasn't aborted
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [currentUser]);

  const fetchItinerary = useCallback(async (idOrCompanyId, days) => {
   
    if (!idOrCompanyId) {
      return;
    }

    const isCompanyFetch = typeof days === 'number';
    const key = isCompanyFetch ? `company_${idOrCompanyId}` : idOrCompanyId;
    
    console.log('fetchItinerary starting:', { key, isCompanyFetch, requestCached: !!requestCache[key] });
    
    // Check if we have a pending request for this key
    if (requestCache[key]) {
      console.log('fetchItinerary: Request already in progress for', key);
      return;
    }
    
    // Mark this request as pending
    requestCache[key] = true;
    
    setShowItinerary(isCompanyFetch ? null : idOrCompanyId);
    setLoadingItinerary(true);
    setItineraryError(null);
    
    // Create a safety timeout to ensure loading state is reset
    const safetyTimeout = setTimeout(() => {
      console.log('fetchItinerary: Safety timeout reached, forcing loading off for', key);
      setLoadingItinerary(false);
      delete requestCache[key];
    }, 12000); // 12 seconds safety timeout

    try {
      console.log('fetchItinerary: Making API call for', key);
      const data = await SellerService.getItinerary(idOrCompanyId, days);
      console.log('fetchItinerary: API response for', key, data);
      
      // Immediately reset loading state on response
      setLoadingItinerary(false);
      
      if (data?.success && data?.statusCode === 200) {
        if (isCompanyFetch) {
          // New response structure for companyId and days
          const itineraryData = data.data.itineraries || [];
          console.log('fetchItinerary: Company fetch result with', itineraryData.length, 'itineraries');
         
          setItineraries(prev => ({
            ...prev,
            [key]: itineraryData,
          }));
        } else {
          // Original response structure for itineraryId
          const itineraryList = data?.data?.itineraries || [];
          const firstItinerary = itineraryList[0]?.itineraryResponseNewdata || {};
          const itineraryData = firstItinerary.itinerary || [];
          
          console.log('fetchItinerary: Individual itinerary fetch result', { 
            hasItineraryList: itineraryList.length > 0,
            hasFirstItinerary: !!firstItinerary,
            hasItineraryData: itineraryData.length > 0
          });
          
          setItineraries(prev => ({
            ...prev,
            [key]: {
              itinerary: itineraryData,
              tripCategory: firstItinerary.tripCategory,
              itineraryText: firstItinerary.itineraryText
            }
          }));
        }
        setItineraryError(null);
      } else {
        console.log('fetchItinerary: API call failed or returned non-success for', key);
        setItineraries(prev => ({
          ...prev,
          [key]: null,
        }));
        setItineraryError("Failed to fetch itinerary");
      }
    } catch (err) {
      console.error(`Error fetching itinerary for ${key}:`, err);
      setItineraryError(err.message || "Failed to fetch itinerary");
      setItineraries(prev => ({
        ...prev,
        [key]: null,
      }));
      
      // Ensure loading is set to false in case of error
      setLoadingItinerary(false);
    } finally {
      // Always update loading state regardless of success or failure
      console.log('fetchItinerary: Setting loadingItinerary to false for', key);
      setLoadingItinerary(false);
      
      // Clear the safety timeout
      clearTimeout(safetyTimeout);
      
      // Clear the request cache after a short delay to prevent immediately sequential duplicates
      setTimeout(() => {
        console.log('fetchItinerary: Clearing request cache for', key);
        delete requestCache[key];
      }, 2000); // 2 second delay
    }
  }, []);

  const createHaves = useCallback(async (text) => {
    setLoading(true);
    setPostSuccess(false);
    try {
      const response = await SellerService.createHaves(text);
      if (response?.success) {
        setPostSuccess(response?.message); // Use API message directly
        // Fetch updated haves immediately after successful creation
        await fetchHaves();
      }
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      setPostSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchHaves]);
  
  

  const deleteHave = useCallback(async (haveId) => {
    setLoading(true);
    setDeleteSuccess(false);
    setDeleteError(null);
    try {
      const response = await SellerService.deleteHave(haveId);
      if (response?.success) {
        // Update the local state immediately
        setHaves(prevHaves => prevHaves.filter(have => have.id !== haveId));
        setDeleteSuccess(response.message || "Successfully deleted!");
        setError(null);
        return { success: true, message: response.message };
      } else {
        throw new Error(response?.message || "Failed to delete item");
      }
    } catch (err) {
      setDeleteError(err.message || "Failed to delete item. Please try again.");
      setError(err.message);
      setDeleteSuccess(false);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversationWithReview = useCallback(async (conversationId, reviewData) => {
    if (!currentUser?.id || !currentUser?.comId) return;

    setLoading(true);
    setDeleteSuccess(false);
    try {
      const response = await SellerService.deleteConversation(
        conversationId,
        currentUser.id,
        currentUser.comId,
        {
          rating: reviewData.rating,
          feedback: reviewData.feedback,
          declineReason: reviewData.reason || reviewData.worked,
          isUserDeleting: true,
        }
      );

      setDeals(prevDeals =>
        prevDeals.filter(deal =>
          deal.conversationId !== conversationId &&
          deal.threadId !== conversationId &&
          deal.itineraryId !== conversationId
        )
      );

      setDeleteSuccess(response?.message || "Conversation deleted successfully!");
      setError(null);
      return response;
    } catch (err) {
      setDeleteError(err.message || "Failed to delete conversation. Please try again.");
      setError(err.message);
      setDeleteSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const resetSuccessMessages = useCallback(() => {
    setPostSuccess(false);
    setDeleteSuccess(false);
    setDeleteError(null);
  }, []);

  const resetItineraryState = useCallback(() => {
    console.log('resetItineraryState: Clearing all itinerary state and cache');
    setItineraries({});
    setLoadingItinerary(false);
    setItineraryError(null);
    setShowItinerary(null);
    
    // Clear all request cache entries
    Object.keys(requestCache).forEach(key => {
      delete requestCache[key];
    });
    
    // Also clear pendingRequests and timestamps
    Object.keys(pendingRequests).forEach(key => {
      delete pendingRequests[key];
    });
    Object.keys(lastFetchTimestamps).forEach(key => {
      delete lastFetchTimestamps[key];
    });
  }, []);

  const resetAllState = useCallback(() => {
    setHaves([]);
    setDeals([]);
    setNeeds([]);
    setLoading(false);
    setError(null);
    setPostSuccess(false);
    setDeleteSuccess(false);
    setDeleteError(null);
    setItineraries({});
    setLoadingItinerary(false);
    setItineraryError(null);
    setShowItinerary(null);
  }, []);

  // Make sure to add resetItineraryCache function to clear cache when needed
  const resetItineraryCache = useCallback(() => {
    Object.keys(pendingRequests).forEach(key => {
      delete pendingRequests[key];
    });
    Object.keys(lastFetchTimestamps).forEach(key => {
      delete lastFetchTimestamps[key];
    });
  }, []);

  return (
    <SellerContext.Provider
      value={{
        haves,
        setHaves,
        deals,
        setDeals,
        needs,
        setNeeds,
        loading,
        error,
        currentUser,
        postSuccess,
        deleteSuccess,
        deleteError,
        itineraries,
        loadingItinerary,
        itineraryError,
        showItinerary,
        fetchHaves,
        fetchDeals,
        fetchNeeds,
        fetchItinerary,
        createHaves,
        deleteHave,
        deleteConversationWithReview,
        resetSuccessMessages,
        resetItineraryState,
        resetAllState,
        resetItineraryCache,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
};

export const useSellerContext = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error("useSellerContext must be used within a SellerProvider");
  }
  return context;
};