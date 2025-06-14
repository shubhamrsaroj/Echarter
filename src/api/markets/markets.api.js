import api from '../axios.config';

/**
 * Fetches available charter flights from the Markets API
 * @param {number} pageNo - The page number to fetch (default: 1)
 * @returns {Promise<Array>} - Promise that resolves to array of availability data
 */
export const getAvailabilities = async (pageNo = 1) => {
  try {
    const response = await api.get(`/api/Markets/GetAvailabilities`, {
      params: { PageNo: pageNo },
      headers: {
        'X-Api-Key': 'instacharter@2025', // Using the API key directly
        // Authorization header will be added by axios interceptor
      }
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch availabilities');
    }
  } catch (error) {
    console.error('Error fetching availabilities:', error);
    throw error;
  }
};

/**
 * Example of how to use the getAvailabilities function in a Wix page:
 * 
 * import { getAvailabilities } from '@src/api/markets/markets.api.js';
 * 
 * $w.onReady(function () {
 *   // Make sure user is logged in and has a valid token
 *   if (localStorage.getItem('auth_token')) {
 *     $w('#loadingIndicator').show();
 *     
 *     getAvailabilities(1)
 *       .then(availabilities => {
 *         // Process the data
 *         console.log('Availabilities:', availabilities);
 *         
 *         // Populate your UI elements
 *         $w('#repeater').data = availabilities;
 *       })
 *       .catch(error => {
 *         console.error('Failed to load availabilities:', error);
 *         $w('#errorMessage').text = 'Failed to load availabilities. Please try again.';
 *         $w('#errorMessage').show();
 *       })
 *       .finally(() => {
 *         $w('#loadingIndicator').hide();
 *       });
 *   } else {
 *     // Redirect to login
 *     window.location.href = '/login';
 *   }
 * });
 */ 