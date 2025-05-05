import api from '../axios.config';

export const conversationService = {
  getConversationFiles: async (conversationId) => {
    try {
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }
      
      const response = await api.get(`/api/SinglePoint/GetConversationFiles`, {
        params: { conversationId }
      });
      
      // Check if the response has data and is successful
      if (response.data && response.data.success) {
        return response.data.data || { conversationFiles: [], companyPublicFiles: [] };
      }
      
      // If API returns a specific error message, use it
      if (response.data && response.data.message) {
        throw new Error(response.data.message);
      }
      
      // Default error message
      throw new Error('Failed to retrieve conversation files');
    } catch (error) {
      console.error('Get conversation files error:', error);
      
      // Return structured error to prevent multiple error handling in UI
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || 
                            (statusCode === 404 ? 'No files found for this conversation' : 
                            'Failed to retrieve conversation files');
        
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  },
  
  addConversationFiles: async (conversationId, fileUrls) => {
    try {
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }
      
      if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
        throw new Error('File URLs are required');
      }
      
      const formData = new FormData();
      formData.append('ConversationId', conversationId);
      
      // Add files as a JSON string array instead of individual form fields
      formData.append('files', JSON.stringify(fileUrls));
      
      const response = await api.post('/api/SinglePoint/AddConversationFiles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Check if the response has data and is successful
      if (response.data && response.data.success) {
        return response.data.data || { success: true };
      }
      
      // If API returns a specific error message, use it
      if (response.data && response.data.message) {
        throw new Error(response.data.message);
      }
      
      // Default error message
      throw new Error('Failed to add conversation files');
    } catch (error) {
      console.error('Add conversation files error:', error);
      
      // Return structured error to prevent multiple error handling in UI
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || 
                            (statusCode === 403 ? 'Permission denied to add files' :
                             statusCode === 413 ? 'Files too large' :
                             'Failed to add conversation files');
        
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  },
  
  deleteFiles: async (fileId) => {
    try {
      if (!fileId) {
        throw new Error('File ID is required');
      }
      
      const response = await api.delete(`/api/SinglePoint/DeleteFiles`, {
        params: { fileId }
      });
      
      // Check if the response has data and is successful
      if (response.data && response.data.success) {
        return response.data.data || { success: true };
      }
      
      // If API returns a specific error message, use it
      if (response.data && response.data.message) {
        throw new Error(response.data.message);
      }
      
      // Default error message
      throw new Error('Failed to delete file');
    } catch (error) {
      console.error('Delete file error:', error);
      
      // Return structured error to prevent multiple error handling in UI
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || 
                            (statusCode === 403 ? 'Permission denied to delete file' :
                             statusCode === 404 ? 'File not found' :
                             'Failed to delete file');
        
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  }
}; 