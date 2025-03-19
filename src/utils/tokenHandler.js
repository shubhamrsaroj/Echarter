import * as jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';

export const tokenHandler = {
  storeToken: (token) => {
    Cookies.set('auth_token', token, {
      expires: 7,
      secure: true,
      sameSite: 'Strict',
      path: '/',
    });
  },

  getToken: () => Cookies.get('auth_token'),

  clearToken: () => Cookies.remove('auth_token'),

  storeRefreshToken: (refreshToken) => {
    Cookies.set('refresh_token', refreshToken, {
      expires: 30,
      secure: true,
      sameSite: 'Strict',
      path: '/',
    });
  },

  getRefreshToken: () => Cookies.get('refresh_token'),

  clearRefreshToken: () => Cookies.remove('refresh_token'),

  clearAllTokens: () => {
    Cookies.remove('auth_token');
    Cookies.remove('refresh_token');
  },

  isTokenValid: () => {
    const token = Cookies.get('auth_token');
    if (!token) return false;

    try {
      const decoded = jwtDecode.jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime; // Check if token is not expired
    } catch (error) {
      console.error('Error validating token:', error.message, error.stack);
      return false;
    }
  },

  parseUserFromToken: (token) => {
    if (!token) {
      console.error('No token provided for parsing');
      return null;
    }

    try {
      const decoded = jwtDecode.jwtDecode(token);

      // Map the payload fields, handling possible variations in field names
      const userData = {
        id: decoded.UserId || decoded.userId || decoded.sub || decoded.id, // Handle different naming conventions
        name: decoded.Name || decoded.name || decoded.fullName || '',
        email: decoded.Email || decoded.email || '',
        role: decoded.Role || decoded.role || '',
        comId: decoded.ComId || decoded.comId || decoded.companyId || '',
        PhoneNumber: decoded.PhoneNumber || decoded.phoneNumber || decoded.phone || '',
        Currency: decoded.Currency || decoded.currency || '',
        IsPremium: decoded.IsPremium !== undefined ? decoded.IsPremium : false, // Default to false if not present
      };

      // Validate required fields
      if (!userData.id || !userData.email) {
        console.error('Missing required fields in JWT payload:', userData);
        return null;
      }

      return userData;
    } catch (error) {
      console.error('Error parsing token:', error.message, error.stack);
      return null;
    }
  },

  ensureValidToken: async () => {
    if (tokenHandler.isTokenValid()) return tokenHandler.getToken();
    throw new Error('Token invalid, refresh required'); // Let AuthContext handle refresh
  },
};