import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { BuyerService } from "../../api/buyer/BuyerService";
import { tokenHandler } from "../../utils/tokenHandler";

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

  useEffect(() => {
    const token = tokenHandler.getToken();
    if (token) {
      const userData = tokenHandler.parseUserFromToken(token);
      setCurrentUser(userData);
    }
  }, []);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
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
    }
  }, []);

  const fetchItinerary = useCallback(async (itineraryId) => {
    if (!itineraryId) {
      setShowItinerary(null);
      return;
    }
    
    setShowItinerary(itineraryId);
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
            itinerary: itineraryData,
            tripCategory: firstItinerary.tripCategory,
            itineraryText: firstItinerary.itineraryText
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
        currentUser.id,
        currentUser.comId,
        {
          rating: reviewData.rating,
          feedback: reviewData.feedback,
          worked: reviewData.worked,
          conversationId: reviewData.conversationId
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