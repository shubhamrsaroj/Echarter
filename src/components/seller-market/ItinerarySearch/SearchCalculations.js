// Calculate distance between two lat/long coordinates in nautical miles
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance); // Round to nearest nautical mile
  };
  
  // Calculate UTC times for departure and arrival
  export const calculateUTCTimes = (fromDateTime, toDateTime, flightTimeStr, fromShiftMins, toShiftMins, fromTz, toTz) => {
    if (!fromDateTime || !toDateTime || !flightTimeStr || flightTimeStr === '-- hrs') {
      return { arrivalUTC: null, departureUTC: null, departureLocal: null, arrivalLocal: null };
    }
    
    // Parse flight time string (format: "H:MM hrs")
    const flightTimeParts = flightTimeStr.replace(' hrs', '').split(':');
    const flightTimeHours = parseInt(flightTimeParts[0], 10);
    const flightTimeMinutes = parseInt(flightTimeParts[1], 10);
    const flightTimeMs = (flightTimeHours * 60 + flightTimeMinutes) * 60 * 1000;
    
    // Use shift minutes from airport data or default to 30 minutes if not provided
    const fromShiftMs = (fromShiftMins !== undefined ? fromShiftMins : 30) * 60 * 1000;
    const toShiftMs = (toShiftMins !== undefined ? toShiftMins : 30) * 60 * 1000;
    
    // Calculate arrival UTC = ArrivalDateTime - shift minutes of arrival airport
    const arrivalUTC = new Date(toDateTime.getTime() - toShiftMs);
    
    // Calculate departure UTC = Arrival UTC - Flight Time
    const departureUTC = new Date(arrivalUTC.getTime() - flightTimeMs);
    
    // Calculate departure local = Departure UTC + shift minutes of departure airport
    const departureLocal = new Date(departureUTC.getTime() + fromShiftMs);
    
    // Calculate arrival local = Arrival UTC + shift minutes of arrival airport
    const arrivalLocal = new Date(arrivalUTC.getTime() + toShiftMs);
    
    return { 
      arrivalUTC, 
      departureUTC,
      departureLocal,
      arrivalLocal,
      fromTz,
      toTz
    };
  };
  
  // Calculate flight time based on distance, aircraft consumption and SLP
  export const calculateFlightTime = (distance, cons, slp) => {
    // Default values if aircraft data is missing
    const consumption = cons || 0;
    const sectorLengthParameter = slp || 0;
    
    // Calculate total flight time in hours (distance * consumption rate + fixed time parameter)
    const flightTimeHours = (distance * consumption) + sectorLengthParameter;
    
    // Convert to hours and minutes
    const hours = Math.floor(flightTimeHours);
    const minutes = Math.round((flightTimeHours - hours) * 60);
    
    return `${hours}:${minutes.toString().padStart(2, '0')} hrs`;
  };
  
  // Format flight time from "H:MM hrs" to "H:MM" for editing
  export const formatFlightTime = (flightTime) => {
    if (flightTime === '-- hrs' || !flightTime) return '';
    
    try {
      // Handle case when flightTime is already in HH:MM format
      if (!flightTime.includes(' hrs')) {
        // Validate the format with regex (should match H:MM or HH:MM)
        if (/^\d{1,2}:\d{2}$/.test(flightTime)) {
          return flightTime;
        }
        return '';
      }
      
      return flightTime.replace(' hrs', '');
    } catch (error) {
      console.error('Error formatting flight time:', error);
      return '';
    }
  };
  
  // Parse flight time string and return milliseconds
  export const parseFlightTimeToMs = (flightTimeStr) => {
    if (!flightTimeStr || flightTimeStr === '-- hrs') return 0;
    
    try {
      const flightTimeParts = flightTimeStr.replace(' hrs', '').split(':');
      
      // Ensure we have valid parts
      if (flightTimeParts.length !== 2) return 0;
      
      const flightTimeHours = parseInt(flightTimeParts[0], 10) || 0;
      const flightTimeMinutes = parseInt(flightTimeParts[1], 10) || 0;
      
      // Make sure the values are valid numbers
      if (isNaN(flightTimeHours) || isNaN(flightTimeMinutes)) return 0;
      
      return (flightTimeHours * 60 + flightTimeMinutes) * 60 * 1000;
    } catch (error) {
      console.error('Error parsing flight time:', error);
      return 0;
    }
  };
  
  // Calculate departure/arrival times based on one date and flight time
  export const calculateDateTimes = (date, flightTimeStr, isFromDate = true, fromShiftMins, toShiftMins, fromTz, toTz) => {
    if (!date || !flightTimeStr || flightTimeStr === '-- hrs') {
      return {
        fromDateTime: isFromDate ? date : null,
        toDateTime: isFromDate ? null : date,
        departureUTC: null,
        arrivalUTC: null,
        departureLocal: null,
        arrivalLocal: null,
        fromTz: null,
        toTz: null
      };
    }
    
    const flightTimeMs = parseFlightTimeToMs(flightTimeStr);
    
    // Use shift minutes from airport data or default to 30 minutes if not provided
    const fromShiftMs = (fromShiftMins !== undefined ? fromShiftMins : 30) * 60 * 1000;
    const toShiftMs = (toShiftMins !== undefined ? toShiftMins : 30) * 60 * 1000;
    
    let fromDateTime, toDateTime, departureUTC, arrivalUTC, departureLocal, arrivalLocal;
    
    if (isFromDate) {
      // If setting departure date, calculate arrival date
      fromDateTime = date;
      departureUTC = new Date(date.getTime() - fromShiftMs); // Local to UTC
      arrivalUTC = new Date(departureUTC.getTime() + flightTimeMs);
      toDateTime = new Date(arrivalUTC.getTime() + toShiftMs); // UTC to local
      departureLocal = date;
      arrivalLocal = toDateTime;
    } else {
      // If setting arrival date, calculate departure date
      toDateTime = date;
      arrivalUTC = new Date(date.getTime() - toShiftMs); // Local to UTC
      departureUTC = new Date(arrivalUTC.getTime() - flightTimeMs);
      fromDateTime = new Date(departureUTC.getTime() + fromShiftMs); // UTC to local
      departureLocal = fromDateTime;
      arrivalLocal = date;
    }
    
    return {
      fromDateTime,
      toDateTime,
      departureUTC,
      arrivalUTC,
      departureLocal,
      arrivalLocal,
      fromTz,
      toTz
    };
  }; 