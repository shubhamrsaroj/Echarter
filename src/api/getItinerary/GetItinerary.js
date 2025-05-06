import api from '../../api/axios.config';
import { tokenHandler } from '../../utils/tokenHandler';

/**
 * Get itinerary API function
 * @param {number} days - Number of days for the itinerary
 * @returns {Promise} - Promise with itinerary data including needs status
 */
export const getItinerary = async ({ days }) => {
  try {
    // Get token and extract user information
    const token = tokenHandler.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const userData = tokenHandler.parseUserFromToken(token);
    if (!userData) {
      throw new Error('Invalid user token');
    }
    
    // Get userId from token
    const userId = userData.id;
    
    // Build request parameters with only userId and days
    const params = { userId, days };
    
    // Use the configured api instance
    const response = await api.get('/api/singlePoint/GetItinerary', { params });
    
    // Ensure we have the needs status in the returned data
    // If the API doesn't include it, default to false
    const responseData = response.data;
    if (Array.isArray(responseData)) {
      // If it's an array of itineraries, ensure each has needs property
      return responseData.map(itinerary => ({
        ...itinerary,
        needs: itinerary.needs !== undefined ? itinerary.needs : false
      }));
    } else {
      // If it's a single itinerary object
      return {
        ...responseData,
        needs: responseData.needs !== undefined ? responseData.needs : false
      };
    }
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    throw error;
  }
};

/**
 * Update itinerary text and needs status
 * @param {string} itineraryId - The ID of the itinerary to update
 * @param {string} text - The updated itinerary text
 * @param {boolean} needs - The needs status flag
 * @returns {Promise} - Promise with the update response
 */
export const updateItinerary = async (itineraryId, text, needs = false) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const requestBody = {
      id: itineraryId,
      text: text,
      needs: needs
    };
    const response = await api.post('/api/SinglePoint/UpdateItinerary', requestBody);
    return response.data;
  } catch (error) {
    throw error;
  }
};
