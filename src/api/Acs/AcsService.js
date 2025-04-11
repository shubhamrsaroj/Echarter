
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
        const { threadId, accessToken, acsUserId } = response.data.data;
        
        // Extract the message from the response if it exists
        const message = response.data.message ;
        
        const result = { 
          threadId, 
          acsUserId, 
          token: accessToken,
          message: message,
        };
        return result;
      }
      throw new Error('Failed to get chat thread');
    } catch (error) {
      console.error('Error in AcsService.getChatThread:', error);
      throw new Error(error.response?.data?.message || 'Failed to get chat thread');
    }
  },

  uploadFiles: async (files, folderName, config = {}) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await api.post('/api/SinglePoint/UploadFile', formData, {
        params: { folderName },
        headers: { 'Content-Type': 'multipart/form-data' },
        ...config
      });

      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Upload failed');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Upload failed');
    }
  },

};