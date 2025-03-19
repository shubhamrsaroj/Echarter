import api from './axios.config'

export const authApi = {
  signup: async (data) => await api.post("/api/Account/Signup", data),

  login: async (email) => await api.post("/api/Account/SignIn", { email }),

  validateSignupOtp: async (email, otp) =>
    await api.patch(
      `/api/Account/ValidateSignupOTP?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
    ),

  validateSigninOtp: async (email, otp) =>
    await api.patch(
      `/api/Account/ValidateSignInOTP?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
    ),

  resendOtp: async (email) =>
    await api.patch(`/api/Account/ResendOTP?email=${encodeURIComponent(email)}`),

 
  refreshToken: async (refreshToken) => {
    try {
      // Ensure your API endpoint is correct
     
        const response = await api.post("/api/Account/Request_Refresh_Token", 
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          // Don't send the auth header with this request
          skipAuthHeader: true,
        }
      );
      
      return response;
    } catch (error) {
      console.error('Refresh token API error:', error.message);
      // Don't swallow the error, let the caller handle it
      throw error;
    }
  },
};


