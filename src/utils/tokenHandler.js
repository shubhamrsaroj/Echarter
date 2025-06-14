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

      // Get the role value and normalize it
      const roleValue = decoded.Role || decoded.role || '';
      const normalizedRole = roleValue
        .split(',')
        .map(r => r.trim())
        .filter(r => r) // Remove empty strings
        .join(',');

      // Map the payload fields, handling possible variations in field names
      const userData = {
        id: decoded.UserId || decoded.userId || decoded.sub || decoded.id, // Handle different naming conventions
        name: decoded.Name || decoded.name || decoded.fullName || '',
        email: decoded.Email || decoded.email || '',
        role: normalizedRole, // Use the normalized role string
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

  getCompanyId: () => {
    const token = Cookies.get('auth_token');
    if (!token) {
      console.error('No token available to extract company ID');
      return null;
    }

    try {
      const decoded = jwtDecode.jwtDecode(token);
      const companyId = decoded.ComId || decoded.comId || decoded.companyId || '';
      
      if (!companyId) {
        console.error('Company ID not found in token');
        return 2757; // Fallback to default company ID for testing
      }
      
      return companyId;
    } catch (error) {
      console.error('Error extracting company ID from token:', error.message, error.stack);
      return 2757; // Fallback to default company ID for testing
    }
  },

  hasRole: (role) => {
    const token = Cookies.get('auth_token');
    if (!token) {
      console.error('No token available to check role');
      return false;
    }

    try {
      const userData = tokenHandler.parseUserFromToken(token);
      if (!userData || !userData.role) {
        return false;
      }
      
      // Convert both to lowercase and check if the user's role contains the specified role
      const userRoles = userData.role.toLowerCase();
      const checkRole = role.toLowerCase();
      
      return userRoles.includes(checkRole);
    } catch (error) {
      console.error('Error checking user role:', error.message, error.stack);
      return false;
    }
  },

  ensureValidToken: async () => {
    if (tokenHandler.isTokenValid()) return tokenHandler.getToken();
    throw new Error('Token invalid, refresh required'); // Let AuthContext handle refresh
  },
};