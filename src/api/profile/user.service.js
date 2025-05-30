// import { tokenHandler } from '../../utils/tokenHandler';
// import api from '../axios.config';

// export const userService = {
//   async getUserDetailsById(id) {
//     try {
//       const response = await api.get(`/api/SinglePoint/GetUserDetailsById`, {
//         params: { Id: id }
//       });
//       return response.data.data.userInfo;
//     } catch (error) {
//       console.error('Error fetching user details:', error);
//       throw error;
//     }
//   },

//   async updateUserProfile(profileData) {
//     try {
//       const response = await api.post(`/api/SinglePoint/UpdateUserProfile`, profileData);
//       return response.data;
//     } catch (error) {
//       console.error('Error updating user profile:', error);
//       throw error;
//     }
//   },

//   async sendMobileVerificationOTP(phoneNo) {
//     try {
//       const response = await api.patch(`/api/Account/MobileVerification?phoneNo=${encodeURIComponent(phoneNo)}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error sending mobile verification OTP:', error);
//       throw error;
//     }
//   },

//   async verifyMobileOTP(phoneNo, otp) {
//     try {
//       const response = await api.patch(`/api/Account/MobileVerification?phoneNo=${encodeURIComponent(phoneNo)}&otp=${encodeURIComponent(otp)}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error verifying mobile OTP:', error);
//       throw error;
//     }
//   },

//   // Fetch company by ID
//   getCompanyById: async () => {
//     try {
//       // Retrieve token and user data safely
//       const token = tokenHandler.getToken();
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const userData = tokenHandler.parseUserFromToken(token);
//       if (!userData || !userData.comId) {
//         throw new Error("Company ID not found in user token");
//       }

//       // Fetch company details
//       const response = await api.get("/api/SinglePoint/GetCompaniesById", {
//         params: { id: userData.comId },
//       });

//       // Validate response structure
//       if (response.data?.success && response.data.data) {
//         return response.data.data; // Return the company object directly
//       } else {
//         throw new Error("Invalid response format or no company data available");
//       }
//     } catch (error) {
//       console.error("Failed to fetch company:", error.message);
//       throw error;
//     }
//   },

// };

import { tokenHandler } from "../../utils/tokenHandler";
import api from "../axios.config";

export const userService = {
  async getUserDetailsById(id) {
    try {
      if (!id) {
        throw new Error("User ID is required to fetch user details");
      }

      const response = await api.get(`/api/SinglePoint/GetUserDetailsById`, {
        params: { Id: id },
      });

      if (response.data?.success && response.data.data?.userInfo) {
        return response.data.data.userInfo;
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to fetch user details: Invalid response format"
        );
      }
    } catch (error) {
      console.error("Error fetching user details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch user details"
      );
    }
  },

  async updateUserProfile(profileData) {
    try {
      if (!profileData || !profileData.id) {
        throw new Error(
          "Profile data and user ID are required to update the profile"
        );
      }

      const response = await api.post(
        `/api/SinglePoint/UpdateUserProfile`,
        profileData
      );

      if (response.data?.success) {
        return response.data;
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to update user profile: Invalid response format"
        );
      }
    } catch (error) {
      console.error("Error updating user profile:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update user profile"
      );
    }
  },

  async sendMobileVerificationOTP(phoneNo) {
    try {
      if (!phoneNo) {
        throw new Error("Phone number is required to send verification OTP");
      }

      const response = await api.patch(
        `/api/Account/MobileVerification?phoneNo=${encodeURIComponent(phoneNo)}`
      );

      if (response.data?.success) {
        return response.data;
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to send mobile verification OTP: Invalid response format"
        );
      }
    } catch (error) {
      console.error("Error sending mobile verification OTP:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to send mobile verification OTP"
      );
    }
  },

  async verifyMobileOTP(phoneNo, otp) {
    try {
      if (!phoneNo || !otp) {
        throw new Error("Phone number and OTP are required to verify");
      }

      const response = await api.patch(
        `/api/Account/MobileVerification?phoneNo=${encodeURIComponent(
          phoneNo
        )}&otp=${encodeURIComponent(otp)}`
      );

      if (response.data?.success) {
        return response.data;
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to verify mobile OTP: Invalid response format"
        );
      }
    } catch (error) {
      console.error("Error verifying mobile OTP:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to verify mobile OTP"
      );
    }
  },

  async getCompanyById() {
    try {
      const token = tokenHandler.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const userData = tokenHandler.parseUserFromToken(token);
      if (!userData || !userData.comId) {
        throw new Error("Company ID not found in user token");
      }

      const response = await api.get("/api/SinglePoint/GetCompaniesById", {
        params: { id: userData.comId },
      });

      if (response.data?.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to fetch company details: Invalid response format"
        );
      }
    } catch (error) {
      console.error("Failed to fetch company:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch company details"
      );
    }
  },

  async searchCompanies({ comName = comName }) {
    const response = await api.get(`/api/SinglePoint/SearchCompanies`, {
      params: { comName },
    });

    if (response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Invalid response from API");
    }
  },
};
