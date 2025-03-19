

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
  }
};