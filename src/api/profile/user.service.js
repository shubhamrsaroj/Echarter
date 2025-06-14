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

      console.log('User details API response:', response.data);

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
        throw new Error("Profile data and user ID are required to update the profile");
      }
      
      // Ensure all required fields are present and format the data correctly for the API
      const requiredFields = {
        id: profileData.id,
        name: profileData.name || "",
        email: profileData.email || "",
        phoneNo: profileData.phoneNo || "",
        // Extract address from fullAddress if it exists, or use the direct address field
        address: profileData.address || (profileData.fullAddress ? profileData.fullAddress.address : ""),
        Share: profileData.Share !== undefined ? profileData.Share : 0,
        country: profileData.country || (profileData.fullAddress ? profileData.fullAddress.country : ""),
        currency: profileData.currency || "",
        timeZone: profileData.timeZone !== undefined ? profileData.timeZone : 0,
        profileImage: profileData.profileImage || "",
        companyId: profileData.companyId !== undefined ? profileData.companyId : null,
        userCode: profileData.userCode !== undefined ? profileData.userCode : null,
        planId: profileData.planId !== undefined ? profileData.planId : null,
        // Add missing required fields
        shareContact: profileData.shareContact !== undefined ? profileData.shareContact : true,
        isPublicContact: profileData.isPublicContact !== undefined ? profileData.isPublicContact : true
      };
      
      // Remove fullAddress if it exists to avoid sending nested structure
      delete requiredFields.fullAddress;
      
      console.log('Sending update profile request with data:', requiredFields);

      const response = await api.post(
        `/api/SinglePoint/UpdateUserProfile`,
        requiredFields
      );

      console.log('Update profile response:', response);

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

  async uploadProfileImage(file) {
    try {
      if (!file) {
        throw new Error("File is required to upload profile image");
      }

      const formData = new FormData();
      formData.append('files', file);

      console.log('Uploading profile image:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const response = await api.post('/api/SinglePoint/UploadFile', formData, {
        params: { 
          folderName: 'pichvaram',
          tier: 'tier'
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload response:', response);

      if (response && response.data) {
        if (response.status === 200) {
          console.log('Upload successful, returning data:', response.data);
          return response.data;
        } else {
          console.error('Unexpected response status:', response.status);
          throw new Error(`Upload failed with status: ${response.status}`);
        }
      } else {
        console.error('Empty response data:', response);
        throw new Error("Empty response from upload API");
      }
    } catch (error) {
      console.error("Error uploading profile image:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      if (error.response?.status === 413) {
        throw new Error('File too large. Please reduce file size and try again.');
      } else if (error.response?.status === 415) {
        throw new Error('Unsupported file type. Please try a different file format.');
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      
      throw new Error(error.response?.data?.message || 'Upload failed. Please try again later.');
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
    
  async addCompany(companyData) {
    try {
      console.log('Adding new company with data:', companyData);
      
      // Log the current authentication state
      const token = tokenHandler.getToken();
      const tokenValid = tokenHandler.isTokenValid();
      const userData = token ? tokenHandler.parseUserFromToken(token) : null;
      
      console.log('Authentication state:', {
        hasToken: !!token,
        tokenValid,
        userRole: userData?.Role,
        userEmail: userData?.Email,
        comId: userData?.ComId
      });
      
      // Make the API call with detailed logging
      const response = await api.post('/api/SinglePoint/AddCompanies', companyData);
      
      console.log('Add company response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      if (response.data?.success) {
        return response.data;
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to add company: Invalid response format"
        );
      }
    } catch (error) {
      console.error("Error adding company:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add company"
      );
    }
  }
}
