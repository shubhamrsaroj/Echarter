import api from '../axios.config';

export const fileUploadService = {
  uploadFiles: async (files, folderName = 'easycharter', onProgress) => {
    const formData = new FormData();
    
    // Validate inputs
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }
    
    // Add files to form data
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await api.post('/api/SinglePoint/UploadFile', formData, {
        params: { 
          folderName,
          tier: 'cool' // Always use 'cool' as tier
        },
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });
      
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Upload failed with status: ' + response.status);
    } catch (error) {
      console.error('File upload error:', error);
      if (error.response?.status === 413) {
        throw new Error('Files too large. Please reduce file size and try again.');
      } else if (error.response?.status === 415) {
        throw new Error('Unsupported file type. Please try a different file format.');
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      throw new Error(error.response?.data?.message || 'Upload failed. Please try again later.');
    }
  },
  
  deleteFile: async (fileUrl) => {
    if (!fileUrl) {
      throw new Error('No file URL provided');
    }
    
    try {
      const response = await api.post('/api/SinglePoint/DeleteFile', null, {
        params: { fileUrl }
      });
      
      if (response.status === 200) {
        return true;
      }
      throw new Error('Delete failed with status: ' + response.status);
    } catch (error) {
      console.error('File delete error:', error);
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      } else if (error.response?.status === 404) {
        throw new Error('File not found or already deleted.');
      }
      throw new Error(error.response?.data?.message || 'Delete failed. Please try again later.');
    }
  },
  
  // Get list of files in a folder
  getFiles: async (folderName = 'easycharter') => {
    try {
      const response = await api.get('/api/SinglePoint/GetFiles', {
        params: { folderName }
      });
      
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Failed to retrieve files');
    } catch (error) {
      console.error('Get files error:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve files');
    }
  }
};

