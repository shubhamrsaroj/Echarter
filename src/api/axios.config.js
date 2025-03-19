import axios from 'axios';
import { tokenHandler } from '../utils/tokenHandler';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_X_API_KEY,
  },
});

api.interceptors.request.use(
  (config) => {
    const token = tokenHandler.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Get auth context for refreshing token
        const { AuthContext } = await import('../context/auth/AuthContext');
        const authContext = AuthContext._currentValue;

        if (authContext && typeof authContext.refreshAccessToken === 'function') {
          try {
            await authContext.refreshAccessToken();
            // Retry the original request with new token
            const token = tokenHandler.getToken();
            error.config.headers.Authorization = `Bearer ${token}`;
            return axios(error.config);
          } catch (refreshError) {
            // If refresh fails, redirect to login
            authContext.logout();
            return Promise.reject(refreshError);
          }
        } else {
          // No auth context or refresh function available
          tokenHandler.clearAllTokens();
          window.location.href = '/login';
        }
      } catch (contextError) {
        // Fallback if we can't get the context
        tokenHandler.clearAllTokens();
        window.location.href = '/login';
      }
    }
    
    const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ message: errorMessage, ...error.response });
  }
);

export default api;