import api from '../axios.config';

export const countryService = {
  /**
   * Fetch all available countries with their details
   * @returns {Promise} Promise with country data
   */
  getAllCountries: async () => {
    try {
      const response = await api.get('/api/SinglePoint/GetAllCountryDetails');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }
}; 