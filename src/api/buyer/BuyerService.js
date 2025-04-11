import api from '../axios.config';

export const BuyerService = {
  // New DeleteConversation endpoint
  deleteConversation: async (userId, companyId, declineData) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const requestBody = {
        reviewFor: userId,
        path:  "Delete" ,
        rating: declineData.rating, // Do not default to 0
        feedBack: declineData.feedback, // Do not default to ""
        conversationId: declineData.conversationId
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

}