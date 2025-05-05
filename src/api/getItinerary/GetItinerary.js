import api from '../../api/axios.config';
import { tokenHandler } from '../../utils/tokenHandler';

/**
 * Get itinerary API function
 * @param {number} days - Number of days for the itinerary
 * @returns {Promise} - Promise with itinerary data
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
    
    return response.data;
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    throw error;
  }
};

export const updateItinerary = async (itineraryId, text) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const requestBody = {
      id: itineraryId,
      text: text
    };
    const response = await api.post('/api/SinglePoint/UpdateItinerary', requestBody);
    return response.data;
  } catch (error) {
    throw error;
  }
};
