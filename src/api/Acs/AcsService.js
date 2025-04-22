import api from '../axios.config';

export const AcsService = {
  isTokenValid: (token) => {
    if (!token) return false;
    
    try {
      // Extract the payload from JWT token (format: header.payload.signature)
      const base64Url = token.split('.')[1];
      if (!base64Url) return false;
      
      // Convert base64url to base64
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Decode the payload
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      // Check if token is expired
      // exp is in seconds, Date.now() is in milliseconds
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log('ACS token expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  },

  getChatThread: async ({ itineraryId, companyId, needs, isBuyer, source, conversationId }) => {
    const payload = {
      itineraryId,
      companyId,
      needs,
      IsBuyer: isBuyer,
      source,
      conversationId,
    };
    
    try {
      console.log('AcsService.getChatThread payload:', payload);
      const response = await api.post('/api/SinglePoint/CreateAcsThread', null, {
        params: payload,
      });
      
      if (response.status === 200 && response.data.success) {
        const { threadId, accessToken, acsUserId, channel } = response.data.data;
        
        // Get the success message from response
        const message = response.data.data.message || response.data.message;
        
        const result = { 
          threadId, 
          acsUserId, 
          token: accessToken,
          channel,
          message: message,
        };
        return result;
      }
      // If status is 200 but success is false, throw error with the response message
      throw new Error(response.data.message || 'Failed to get chat thread');
    } catch (error) {
      console.error('Error in AcsService.getChatThread:', error);
      // If it's an API error response, use its message, otherwise use the error message or default
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  getRefreshedAcsToken: async () => {
    try {
      console.log('AcsService.getRefreshedAcsToken - getting fresh token');
      const response = await api.get(`/api/SinglePoint/GetRefreshedAcsToken`);
      
      if (response.status === 200 && response.data.success) {
        const { userId, acsUserId, accessToken } = response.data.data;
        
        return { 
          userId, 
          acsUserId, 
          token: accessToken,
        };
      }
      throw new Error(response.data.message || 'Failed to refresh ACS token');
    } catch (error) {
      console.error('Error in AcsService.getRefreshedAcsToken:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
};
