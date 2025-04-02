
import api from '../axios.config';

export const ItineraryService = {
  getItineraryByText: async (itineraryText) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.get(`/api/SinglePoint/GetItineraryByText?itineraryText=${encodeURIComponent(itineraryText)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getCompaniesByCategory: async (payload) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.get('/api/SinglePoint/GetCompaniesByCategory', { 
        params: payload 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};