import api from '../axios.config';

export const AcsService = {
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

  validateAndRefreshToken: async (token, createdDate) => {
    try {
      // Check if more than 1 hour has passed since creation
      const creationTime = new Date(createdDate).getTime();
      const currentTime = new Date().getTime();
      const oneHourInMs = 60 * 60 * 1000;
      const isExpired = (currentTime - creationTime) > oneHourInMs;

      // If less than an hour has passed, token is still valid
      if (!isExpired) {
        return {
          isValid: true,
          token: token
        };
      }

      // If more than an hour, refresh the token
      const response = await api.get('/api/SinglePoint/GetRefreshedAcsToken', {
        params: { token }
      });

      if (response.status === 200 && response.data.success) {
        const { accessToken, acsUserId } = response.data.data;
        return {
          isValid: true,
          token: accessToken,
          acsUserId
        };
      }
      return { isValid: false };
    } catch (error) {
      console.error('Error in AcsService.validateAndRefreshToken:', error);
      return { isValid: false, error: error.message };
    }
  },
};