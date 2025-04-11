import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { SellerService } from "../../api/seller/SellerService";
import { tokenHandler } from "../../utils/tokenHandler";

const SellerContext = createContext();

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
    }
  }, [currentUser]);

  const fetchDeals = useCallback(async () => {
    if (!currentUser?.comId) return;

    setLoading(true);
    try {
      const data = await SellerService.getCompanyDeals();
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
  }, [currentUser]);

  const fetchItinerary = useCallback(async (idOrCompanyId, days) => {
    if (!idOrCompanyId) return;

    const isCompanyFetch = typeof days === 'number';
    const key = isCompanyFetch ? `company_${idOrCompanyId}` : idOrCompanyId;

    setShowItinerary(isCompanyFetch ? null : idOrCompanyId);
    setLoadingItinerary(true);
    setItineraryError(null);

    try {
      const data = await SellerService.getItinerary(idOrCompanyId, days);
      if (data?.success && data?.statusCode === 200) {
        let itineraryData;
        if (isCompanyFetch) {
          // New response structure for companyId and days
          itineraryData = data.data.itineraries || [];
        } else {
          // Original response structure for itineraryId
          const itineraryList = data?.data?.itineraries || [];
          const firstItinerary = itineraryList[0]?.itineraryResponseNewdata || {};
          itineraryData = firstItinerary.itinerary || [];
          
          // Add tripCategory and itineraryText to the context
          setItineraries(prev => ({
            ...prev,
            [key]: {
              itinerary: itineraryData,
              tripCategory: firstItinerary.tripCategory,
              itineraryText: firstItinerary.itineraryText
            }
          }));
          setItineraryError(null);
          return;
        }
        setItineraries(prev => ({
          ...prev,
          [key]: itineraryData,
        }));
        setItineraryError(null);
      } else {
        setItineraries(prev => ({
          ...prev,
          [key]: null,
        }));
        setItineraryError("Failed to fetch itinerary");
      }
    } catch (err) {
      setItineraryError(err.message || "Failed to fetch itinerary");
      setItineraries(prev => ({
        ...prev,
        [key]: null,
      }));
    } finally {
      setLoadingItinerary(false);
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
    setItineraries({});
    setLoadingItinerary(false);
    setItineraryError(null);
    setShowItinerary(null);
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