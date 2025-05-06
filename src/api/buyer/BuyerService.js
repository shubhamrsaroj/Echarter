import api from '../axios.config';

export const BuyerService = {
  // New DeleteConversation endpoint
  deleteConversation: async (declineData) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const requestBody = {
        reviewFor: String(declineData.sellerCompanyId),
        path: declineData.path,
        rating: declineData.rating, // Do not default to 0
        feedBack: declineData.feedback, // Do not default to ""
        conversationId: declineData.conversationId,

      };
      const response = await api.delete('/api/SinglePoint/DeleteConversation', {
        data: requestBody
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Itinerary endpoint
  getItinerary: async (Id) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.get(`/api/SinglePoint/GetItinerary` , {
        params: { Id }
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
          IsBuyer: true,
          IsSeller: null,
          Days: 30,
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Update Itinerary needs endpoint
  updateItineraryNeeds: async (itineraryId, needsStatus, text) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const requestBody = {
        id: itineraryId,
        needs: needsStatus,
        text: text
      };
      const response = await api.post('/api/SinglePoint/UpdateItinerary', requestBody);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

}