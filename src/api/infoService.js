import api from './axios.config';

export const getInfoContent = async (topic, category = 'info') => {
  try {
    const response = await api.get('/api/SinglePoint//GetInfo', {
      params: {
        topic,
        category
      }
    });

    if (response.data.success) {
      // For info category, return url as before
      if (category === 'info') {
        const url = response.data.data?.[0]?.url;
        if (url) {
          return url;
        }
      }
      // For dropdown category, return the full data object
      if (category === 'dropdown') {
        return response.data.data;
      }
      // For reviewdecline category, return text
      if (category === 'reviewdecline' && response.data.data?.text) {
        return response.data.data.text;
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