import api from '../axios.config';
import { toast } from 'react-toastify';
import { tokenHandler } from '../../utils/tokenHandler';

export const getTailDetailsById = async (conversationId, sellerCompanyId) => {
  let userCompanyMatchesSeller = false;
  let userData = null;
  
  try {
    // Get token and parse user data
    const token = tokenHandler.getToken();
    
    if (token) {
      try {
        // Try to parse user data, but don't throw if it fails
        userData = tokenHandler.parseUserFromToken(token);
        
        // Check if user company matches seller company if we have valid userData
        if (userData?.comId && sellerCompanyId) {
          userCompanyMatchesSeller = String(userData.comId) === String(sellerCompanyId);
        }
      } catch {
        // Continue execution even if token parsing fails
      }
    }

    // Always try to call the API first regardless of token status
    const response = await api.get(`/api/SinglePoint/GetTailDetailsById`, {
      params: { conversationId }
    });
    
    // Check if the API response is successful (status 200)
    if (response.data?.success && response.data?.statusCode === 200) {
      // Make sure the data field is always defined, even if null
      return {
        ...response.data,
        data: response.data.data || null
      };
    }
    
    // If API response is not 200, then check if user company matches seller company
    if (userCompanyMatchesSeller) {
      return {
        success: true,
        statusCode: 200,
        data: null,
        message: 'No aircraft data found, but you can add your own'
      };
    }
    
    // If neither condition is met, throw an error
    throw new Error(response.data?.message || 'Request failed');
  } catch (error) {
    // For ANY errors, check if user company matches seller company
    if (userCompanyMatchesSeller) {
      return {
        success: true,
        statusCode: 200,
        data: null,
        message: 'No aircraft data found, but you can add your own'
      };
    }
    
    // Only throw the error if user company doesn't match seller company
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