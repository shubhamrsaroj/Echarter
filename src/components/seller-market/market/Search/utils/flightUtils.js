/**
 * Utility functions for flight data handling
 */

/**
 * Creates standardized hover coordinates object from flight data
 * @param {Object} flightData - The flight data object
 * @returns {Object|null} - Standardized hover coordinates or null if invalid
 */
export const createHoverCoordinates = (flightData) => {
  if (!flightData) return null;
  
  // Check for direct lat/long properties first
  if (flightData.fromLat && flightData.fromLong && flightData.toLat && flightData.toLong) {
    return {
      fromLat: flightData.fromLat,
      fromLong: flightData.fromLong,
      toLat: flightData.toLat,
      toLong: flightData.toLong,
      fromCity: flightData.fromCity || flightData.from || 'Origin',
      toCity: flightData.toCity || flightData.to || 'Destination'
    };
  }
  
  // Check for nested coordinates objects
  if (flightData.fromCoordinates && flightData.toCoordinates) {
    return {
      fromLat: flightData.fromCoordinates.lat,
      fromLong: flightData.fromCoordinates.long,
      toLat: flightData.toCoordinates.lat,
      toLong: flightData.toCoordinates.long,
      fromCity: flightData.fromCity || flightData.from || 'Origin',
      toCity: flightData.toCity || flightData.to || 'Destination'
    };
  }
  
  return null;
};

/**
 * Formats a date string for display
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear().toString().substr(2)}`;
  } catch {
    return 'N/A';
  }
}; 