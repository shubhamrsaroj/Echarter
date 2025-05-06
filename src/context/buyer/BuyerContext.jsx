import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from "react";
import { BuyerService } from "../../api/buyer/BuyerService";
import { tokenHandler } from "../../utils/tokenHandler";
import { toast } from "react-toastify";

const BuyerContext = createContext();

export const BuyerProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [deals, setDeals] = useState([]);
  const [itineraries, setItineraries] = useState({});
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [itineraryError, setItineraryError] = useState(null);
  const [showItinerary, setShowItinerary] = useState(null);
  
  // Fetch request tracking
  const fetchInProgress = useRef(false);
  const lastFetchTime = useRef(0);
  const MIN_FETCH_INTERVAL = 2000; // 2 seconds minimum between fetches

  useEffect(() => {
    const token = tokenHandler.getToken();
    if (token) {
      const userData = tokenHandler.parseUserFromToken(token);
      setCurrentUser(userData);
    }
  }, []);

  const fetchDeals = useCallback(async () => {
    // Skip if already loading or fetch in progress
    if (loading || fetchInProgress.current) return;
    
    // Check if we've fetched recently
    const now = Date.now();
    if (now - lastFetchTime.current < MIN_FETCH_INTERVAL) {
      console.log('Skipping fetch, too soon since last fetch');
      return;
    }
    
    fetchInProgress.current = true;
    setLoading(true);
    
    try {
      lastFetchTime.current = now;
      const data = await BuyerService.getCompanyDeals();
      const dealsArray = Array.isArray(data?.data?.newResponse) ? data.data.newResponse : [];
      const enrichedDeals = dealsArray.map(deal => ({
        ...deal,
        acsUserId: data.data.acsUserId || null,
        accessToken: data.data.accessToken || null,
      }));
      setDeals(enrichedDeals);
      setError(null);
    } catch (err) {
      setError(err.message);
      setDeals([]);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [loading]);

  const fetchItinerary = useCallback(async (itineraryId, showPanel = true) => {
    if (!itineraryId) {
      setShowItinerary(null);
      return;
    }
    
    // Only update showItinerary if showPanel is true
    if (showPanel) {
      setShowItinerary(itineraryId);
    }
    
    setLoadingItinerary(true);
    setItineraryError(null);
    
    try {
      const response = await BuyerService.getItinerary(itineraryId);
      if (response?.success && response?.statusCode === 200) {
        const itineraryList = response?.data?.itineraries || [];
        const firstItinerary = itineraryList[0]?.itineraryResponseNewdata || {};
        const itineraryData = firstItinerary.itinerary || [];
        
       

        setItineraries(prev => ({
          ...prev,
          [itineraryId]: {
            itineraryId: itineraryId,
            itinerary: itineraryData,
            tripCategory: firstItinerary.tripCategory,
            itineraryText: firstItinerary.itineraryText,
            needs: itineraryList[0]?.needs
          }
        }));
        setItineraryError(null);
      } else {
        setItineraries(prev => ({
          ...prev,
          [itineraryId]: null,
        }));
        setItineraryError("Failed to fetch itinerary");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch itinerary";
      setItineraryError(errorMessage);
      setItineraries(prev => ({
        ...prev,
        [itineraryId]: null,
      }));
      throw err;
    } finally {
      setLoadingItinerary(false);
    }
    
  }, []);

  

  const resetItineraryState = useCallback(() => {
    setItineraries({});
    setLoadingItinerary(false);
    setItineraryError(null);
    setShowItinerary(null);
  }, []);

  const deleteConversationWithReview = useCallback(async (reviewData) => {
    if (!currentUser?.id || !currentUser?.comId) return;

    setLoading(true);
    setDeleteSuccess(false);
    try {
      const response = await BuyerService.deleteConversation(
        {
          rating: reviewData.rating,
          feedback: reviewData.feedback,
          worked: reviewData.worked,
          conversationId: reviewData.conversationId,
          sellerCompanyId: reviewData.sellerCompanyId,
          path: reviewData.path || "Delete"
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to delete conversation");
      }

      setDeleteSuccess(true);
      setError(null);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete conversation";
      setDeleteError(errorMessage);
      setError(errorMessage);
      setDeleteSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateItineraryNeeds = useCallback(async (itineraryId, needsStatus, text = null) => {
    if (!itineraryId) return false;
    
    setLoading(true);
    try {
      const response = await BuyerService.updateItineraryNeeds(itineraryId, needsStatus, text);
      
      if (response?.success && response?.statusCode === 200) {
        // Update the local state to reflect the change
        setItineraries(prev => {
          if (!prev[itineraryId]) return prev;
          
          return {
            ...prev,
            [itineraryId]: {
              ...prev[itineraryId],
              needs: needsStatus,
              ...(text !== null && { itineraryText: text })
            }
          };
        });
        
        // Show success toast with the API response message
        toast.success(response.message || "Update successful", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return true;
      } else {
        throw new Error(response?.message || "Failed to update itinerary");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update itinerary";
      setError(errorMessage);
      // Show error toast with the API response message
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  



  const resetSuccessMessages = useCallback(() => {
    setDeleteSuccess(false);
    setDeleteError(null);
  }, []);

  const resetAllState = useCallback(() => {
    setLoading(false);
    setError(null);
    setDeleteSuccess(false);
    setDeleteError(null);
    resetItineraryState();
  }, [resetItineraryState]);

  return (
    <BuyerContext.Provider
      value={{
        loading,
        error,
        currentUser,
        deleteSuccess,
        deleteError,
        deals,
        deleteConversationWithReview,
        resetSuccessMessages,
        resetAllState,
        itineraries,
        loadingItinerary,
        itineraryError,
        showItinerary,
        fetchItinerary,
        resetItineraryState,
        fetchDeals,
        updateItineraryNeeds,
      }}
    >
      {children}
    </BuyerContext.Provider>
  );
};

export const useBuyerContext = () => {
  const context = useContext(BuyerContext);
  if (!context) {
    throw new Error("useBuyerContext must be used within a BuyerProvider");
  }
  return context;
}; 