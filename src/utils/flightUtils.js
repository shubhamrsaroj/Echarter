// Utility functions for flight data handling

/**
 * Check if an item was created within the last 12 hours
 * @param {string} createdDate - ISO date string
 * @returns {boolean} - True if created within last 12 hours
 */
export const isNew = (createdDate) => {
  if (!createdDate) return false;
  try {
    const created = new Date(createdDate);
    // Check if the date is valid
    if (isNaN(created.getTime())) return false;
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff <= 12;
  } catch (error) {
    console.error("Error parsing date:", error);
    return false;
  }
};

/**
 * Create hover coordinates object for map display
 * @param {Object} flightData - Flight data object
 * @returns {Object|null} - Coordinates object or null if invalid data
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
 * Handle mouse enter for map hover functionality
 * @param {Object} flightData - Flight data object
 * @param {Function} setHoveredFlightCoords - State setter function
 */
export const handleMouseEnter = (flightData, setHoveredFlightCoords) => {
  if (!setHoveredFlightCoords) return;
  
  const coords = createHoverCoordinates(flightData);
  if (coords) {
    setHoveredFlightCoords(coords);
  }
};

/**
 * Handle mouse leave for map hover functionality
 * @param {Function} setHoveredFlightCoords - State setter function
 */
export const handleMouseLeave = (setHoveredFlightCoords) => {
  if (setHoveredFlightCoords) {
    setHoveredFlightCoords(null);
  }
}; 