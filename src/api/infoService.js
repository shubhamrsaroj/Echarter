import api from './axios.config';

// Store URLs in a cache to prevent duplicate requests
const infoCache = {};

export const getInfoContent = async (topic, category = 'info') => {
  // Create a cache key
  const cacheKey = `${topic}-${category}`;
  
  // Return cached value if available
  if (infoCache[cacheKey]) {
    return infoCache[cacheKey];
  }
  
  try {
    const response = await api.get('/api/SinglePoint/GetInfo', {
      params: {
        topic,
        category
      }
    });

    if (response.data.success) {
      let result;
      
      // For info category, return url as before
      if (category === 'info') {
        const url = response.data.data?.[0]?.url;
        if (url) {
          result = url;
        }
      }
      // For dropdown category, return the full data array
      else if (category === 'dropdown') {
        result = response.data.data;
      }
      // For reviewdecline category, return text
      else if (category === 'reviewdecline' && response.data.data?.text) {
        result = response.data.data.text;
      }
      
      if (result) {
        // Cache the result
        infoCache[cacheKey] = result;
        return result;
      }
    }
    throw new Error(response.data.message || 'No information available');
  } catch (error) {
    if (error.message) {
      throw error;
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch info content');
  }
}; 