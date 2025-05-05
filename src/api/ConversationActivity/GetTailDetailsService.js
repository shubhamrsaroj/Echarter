// import api from '../axios.config';
// import { toast } from 'react-toastify';

// export const getTailDetailsById = async (id) => {
//   try {
//     if (!id) {
//       throw new Error('ID is required');
//     }

//     const response = await api.get(`/api/SinglePoint/GetTailDetailsById`, {
//       params: { id: 634 }
//     });
    
//     // Check if the response has data and is successful
//     if (response.data && response.data.success && response.data.statusCode === 200) {
//       return {
//         success: true,
//         data: response.data.data
//       };
//     }
    
//     // If API returns a specific error message, use it
//     if (response.data && response.data.message) {
//       toast.error(response.data.message);
//       throw new Error(response.data.message);
//     }
    
//     // Default error message
//     toast.error('Failed to fetch aircraft details');
//     throw new Error('Failed to fetch aircraft details');
    
//   } catch (error) {
//     console.error('Get tail details error:', error);
    
//     // Return structured error to prevent multiple error handling in UI
//     if (error.response) {
//       // The request was made and the server responded with a status code
//       // that falls out of the range of 2xx
//       const statusCode = error.response.status;
//       const errorMessage = error.response.data?.message || 
//                           (statusCode === 404 ? 'Aircraft details not found' : 
//                            'Failed to fetch aircraft details');
      
//       toast.error(errorMessage);
//       throw new Error(errorMessage);
//     } else if (error.request) {
//       // The request was made but no response was received
//       const errorMessage = 'No response from server. Please check your connection.';
//       toast.error(errorMessage);
//       throw new Error(errorMessage);
//     } else {
//       // Something happened in setting up the request that triggered an Error
//       toast.error(error.message || 'Error fetching aircraft details');
//       throw error;
//     }
//   }
// }; 

// export const updateConversationEquipment = async (conversationId, equipmentId) => {
//   try {
//     if (!conversationId || !equipmentId) {
//       throw new Error('Conversation ID and Equipment ID are required');
//     }

//     const response = await api.post(`/api/SinglePoint/UpdateConversation`, {
//       conversationID: conversationId,
//       equipmentID: equipmentId
//     });
    
//     // Check if the response has data and is successful
//     if (response.data && response.data.success && response.data.statusCode === 200) {
//       return {
//         success: true,
//         data: response.data.data
//       };
//     }
    
//     // If not successful, throw error with the message
//     throw new Error(response.data?.message || 'Failed to update conversation equipment');
    
//   } catch (error) {
//     console.error('Update conversation equipment error:', error);
    
//     let errorMessage;
    
//     if (error.response) {
//       errorMessage = error.response.data?.message || 'Failed to update conversation equipment';
//     } else if (error.request) {
//       errorMessage = 'No response from server. Please check your connection.';
//     } else {
//       errorMessage = error.message || 'Error updating conversation equipment';
//     }
    
//     toast.error(errorMessage);
//     throw new Error(errorMessage);
//   }
// }; 





import api from '../axios.config';
import { toast } from 'react-toastify';
import { tokenHandler } from '../../utils/tokenHandler';

export const getTailDetailsById = async (conversationId, sellerCompanyId) => {
  try {
    const token = tokenHandler.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const userData = tokenHandler.parseUserFromToken(token);
    if (!userData?.comId) {
      throw new Error('Invalid user data');
    }

    const response = await api.get(`/api/SinglePoint/GetTailDetailsById`, {
      params: { conversationId }
    });
    
    if (response.data?.success && (response.data?.statusCode === 200 || sellerCompanyId === userData.comId)) {
      return response.data;
    }
    
    throw new Error(response.data?.message || 'Request failed');
    
  } catch (error) {
    console.error('GetTailDetailsById:', error);
    throw error;
  }
};

export const updateConversationEquipment = async (conversationId, equipmentId) => {
  try {
    if (!conversationId || !equipmentId) {
      throw new Error('Conversation ID and Equipment ID are required');
    }

    const response = await api.post(`/api/SinglePoint/UpdateConversation`, {
      conversationID: conversationId,
      equipmentID: equipmentId
    });
    
    // Check if the response has data and is successful
    if (response.data && response.data.success && response.data.statusCode === 200) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    // If not successful, throw error with the message
    throw new Error(response.data?.message || 'Failed to update conversation equipment');
    
  } catch (error) {
    console.error('Update conversation equipment error:', error);
    
    let errorMessage;
    
    if (error.response) {
      errorMessage = error.response.data?.message || 'Failed to update conversation equipment';
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      errorMessage = error.message || 'Error updating conversation equipment';
    }
    
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}; 