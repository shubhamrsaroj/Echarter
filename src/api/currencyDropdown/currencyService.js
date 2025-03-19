// src/services/currencyService.js
import api from '../axios.config';

export const currencyService = {
  /**
   * Fetch all available currencies
   * @returns {Promise} Promise with currency data
   */
  getAllCurrencies: async () => {
    try {
      const response = await api.get('/api/Markets/GetAllCurrencyInfo');
      return response.data;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  },
  
  /**
   * Convert amount from one currency to another
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @param {number} amount - Amount to convert
   * @returns {Promise} Promise with conversion result
   */
  convertCurrency: async (fromCurrency, toCurrency, amount) => {
    try {
      const response = await api.get(`/api/Markets/ConvertCurrency`, {
        params: { fromCurrency, toCurrency, amount }
      });
      return response.data;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }
};