import api from '../axios.config';
import axios from 'axios';

// Track active requests to prevent duplicates
const activeRequests = {};

export const SellerService = {
  getCompanyHaves: async (companyId) => {
    const requestKey = `getCompanyHaves_${companyId}`;
    
    // If there's already an active request for this companyId, return it
    if (activeRequests[requestKey]) {
      return activeRequests[requestKey];
    }
    
    // Create a new request promise
    const requestPromise = (async () => {
      try {
        const response = await api.get(`/api/SinglePoint/GetAllCompanyHaves`, {
          params: { companyId }
        });
        return response.data;
      // eslint-disable-next-line no-useless-catch
      } catch (error) {
        throw error;
      } finally {
        // Remove from active requests after a short delay to prevent immediate duplicate calls
        setTimeout(() => {
          delete activeRequests[requestKey];
        }, 1000);
      }
    })();
    
    // Store the promise in activeRequests
    activeRequests[requestKey] = requestPromise;
    
    // Return the promise
    return requestPromise;
  },

  createHaves: async (text) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.post(`/api/SinglePoint/CreateHaves`, { text }); 
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  

  deleteHave: async (haveId) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.delete(`/api/SinglePoint/DeleteHaves`, {
        params: { Id: haveId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCompanyDeals: async (signal) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.get(`/api/SinglePoint/GetCompanyDeals`, {
        params: { 
          IsBuyer: false,
          IsSeller: true,
          Days: 7
        },
        signal
      });
      return response.data;
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || error.message === 'canceled' || axios.isCancel(error)) {
        const abortError = new Error('Request aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }
      throw error;
    }
  },

  getItinerary: async (param1, param2) => {
    // eslint-disable-next-line no-useless-catch
    try {
      let params = {};
      if (typeof param1 === 'string' && !param2) {
        // Case 1: param1 is itineraryId (original usage)
        params = { Id: param1 };
      } else if (typeof param1 === 'string' && typeof param2 === 'number') {
        // Case 2: param1 is companyId, param2 is days
        params = { companyId: param1, days: param2 };
      } else {
        throw new Error("Invalid parameters for getItinerary");
      }

      const response = await api.get(`/api/SinglePoint/GetItinerary`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteConversation: async (conversationId, userId, companyId, reviewData) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const requestBody = {
        conversationID: conversationId,
        reviewFor: userId,
        path: reviewData.isDecline ? "decline" : "Delete",
        rating: reviewData.rating || 0,
        feedBack: reviewData.feedback || "",
      };

      // For delete path
      if (!reviewData.isDecline) {
        requestBody.dealDone = reviewData.worked || false;
      } else {
        // For decline path
        requestBody.declineReason = reviewData.reason || "";
      }

      const { data: response } = await api.delete('/api/SinglePoint/DeleteConversation', {
        data: requestBody
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
};