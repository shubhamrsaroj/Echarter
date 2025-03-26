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
      const response = await api.post(`/api/SinglePoint/CreateHaves`, null, // No request body
        { params: { text } } // Send 'text' as a query parameter
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  

};