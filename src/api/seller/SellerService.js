import api from '../axios.config';

export const SellerService = {
  getCompanyHaves: async (companyId) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.get(`/api/SinglePoint/GetAllCompanyHaves`, {
        params: { companyId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
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

  getCompanyDeals: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.get(`/api/SinglePoint/GetCompanyDeals`, {
        params: { 
          IsBuyer: false,
          IsSeller: true,
          Days: 7
        }
      });
      return response.data;
    } catch (error) {
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

  deleteConversation: async (conversationId, userId, companyId, declineData) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const requestBody = {
        conversationID: conversationId,
        reviewFor: userId,
        path: declineData.declineReason === true || declineData.declineReason === false ? "Delete" : "decline",
        rating: declineData.rating,
        feedBack: declineData.feedback,
      };
  
      if (declineData.declineReason === true || declineData.declineReason === false) {
        requestBody.dealDone = declineData.declineReason;
      } else {
        requestBody.declineReason = declineData.declineReason;
      }
  
      const response = await api.delete('/api/SinglePoint/DeleteConversation', {
        data: requestBody
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};