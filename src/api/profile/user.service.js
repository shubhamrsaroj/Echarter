
import { tokenHandler } from '../../utils/tokenHandler';
import api from '../axios.config';

export const userService = {
  async getUserDetailsById(id) {
    try {
      const response = await api.get(`/api/SinglePoint/GetUserDetailsById`, {
        params: { Id: id }
      });
      return response.data.data.userInfo;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  async updateUserProfile(profileData) {
    try {
      const response = await api.post(`/api/SinglePoint/UpdateUserProfile`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async sendMobileVerificationOTP(phoneNo) {
    try {
      const response = await api.patch(`/api/Account/MobileVerification?phoneNo=${encodeURIComponent(phoneNo)}`);
      return response.data;
    } catch (error) {
      console.error('Error sending mobile verification OTP:', error);
      throw error;
    }
  },

  async verifyMobileOTP(phoneNo, otp) {
    try {
      const response = await api.patch(`/api/Account/MobileVerification?phoneNo=${encodeURIComponent(phoneNo)}&otp=${encodeURIComponent(otp)}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying mobile OTP:', error);
      throw error;
    }
  },

  // Fetch company by ID
  getCompanyById: async () => {
    try {
      // Retrieve token and user data safely
      const token = tokenHandler.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      const userData = tokenHandler.parseUserFromToken(token);
      if (!userData || !userData.comId) {
        throw new Error("Company ID not found in user token");
      }
  
      // Fetch company details
      const response = await api.get("/api/SinglePoint/GetCompaniesById", {
        params: { id: userData.comId },
      });
  
      // Validate response structure
      if (response.data?.success && response.data.data) {
        return response.data.data; // Return the company object directly
      } else {
        throw new Error("Invalid response format or no company data available");
      }
    } catch (error) {
      console.error("Failed to fetch company:", error.message);
      throw error;
    }
  },
  

};