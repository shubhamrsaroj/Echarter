import { 
  calculateDistance, 
  calculateUTCTimes, 
  calculateFlightTime, 
  formatFlightTime,
  calculateDateTimes,
  parseFlightTimeToMs
} from './SearchCalculations';

/**
 * Convert shift minutes to UTC offset string
 * @param {number} shiftMins - Shift minutes (e.g. 330 for UTC+5:30)
 * @returns {string} Formatted UTC offset (e.g. "UTC+05:30")
 */
export const formatUTCOffset = (shiftMins) => {
  if (shiftMins === undefined || shiftMins === null) return 'UTC+00:00';
  
  const hours = Math.floor(Math.abs(shiftMins) / 60);
  const minutes = Math.abs(shiftMins) % 60;
  const sign = shiftMins >= 0 ? '+' : '-';
  
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Update flight times and dates in the tooltip
 * @param {Object} detail - Current flight detail
 * @param {Date} fromDateTime - Departure date and time
 * @param {Date} toDateTime - Arrival date and time
 * @param {string} flightTime - Flight time in format "H:MM hrs"
 * @param {Object} [aircraftData] - Selected aircraft data (optional)
 * @returns {Object} Updated flight detail with recalculated times
 */
export const updateTooltipTimes = (detail, fromDateTime, toDateTime, flightTime, aircraftData) => {
  const updatedDetail = { ...detail };

  // Always update flight time if provided
  if (flightTime) {
    updatedDetail.flightTime = flightTime;
  }
  
  // Update aircraft data if provided
  if (aircraftData) {
    updatedDetail.aircraftData = aircraftData;
  }

  // If we have departure time and flight time, calculate arrival time
  if (fromDateTime && flightTime && flightTime !== '-- hrs' && /^\d{1,2}:\d{2} hrs$/.test(flightTime)) {
    const { 
      toDateTime: calculatedToDateTime,
      departureUTC,
      arrivalUTC,
      departureLocal,
      arrivalLocal
    } = calculateDateTimes(
      fromDateTime,
      flightTime,
      true, // isFromDate = true (calculating from departure)
      detail.fromShiftMins || 330,
      detail.toShiftMins || 330,
      detail.fromTz,
      detail.toTz
    );

    updatedDetail.fromDateTime = fromDateTime;
    updatedDetail.toDateTime = calculatedToDateTime;
    updatedDetail.departureUTC = departureUTC;
    updatedDetail.arrivalUTC = arrivalUTC;
    updatedDetail.departureLocal = departureLocal;
    updatedDetail.arrivalLocal = arrivalLocal;
    updatedDetail.fromTz = formatUTCOffset(detail.fromShiftMins);
    updatedDetail.toTz = formatUTCOffset(detail.toShiftMins);
  }
  // If we have arrival time and flight time, calculate departure time
  else if (toDateTime && flightTime && flightTime !== '-- hrs' && /^\d{1,2}:\d{2} hrs$/.test(flightTime)) {
    const {
      fromDateTime: calculatedFromDateTime,
      departureUTC,
      arrivalUTC,
      departureLocal,
      arrivalLocal
    } = calculateDateTimes(
      toDateTime,
      flightTime,
      false, // isFromDate = false (calculating from arrival)
      detail.fromShiftMins || 330,
      detail.toShiftMins || 330,
      detail.fromTz,
      detail.toTz
    );

    updatedDetail.fromDateTime = calculatedFromDateTime;
    updatedDetail.toDateTime = toDateTime;
    updatedDetail.departureUTC = departureUTC;
    updatedDetail.arrivalUTC = arrivalUTC;
    updatedDetail.departureLocal = departureLocal;
    updatedDetail.arrivalLocal = arrivalLocal;
    updatedDetail.fromTz = formatUTCOffset(detail.fromShiftMins);
    updatedDetail.toTz = formatUTCOffset(detail.toShiftMins);
  }
  // If we have both dates, calculate flight time (if not manually set)
  else if (fromDateTime && toDateTime && (!flightTime || flightTime === '-- hrs')) {
    const { 
      arrivalUTC, 
      departureUTC, 
      departureLocal, 
      arrivalLocal
    } = calculateUTCTimes(
      fromDateTime,
      toDateTime,
      flightTime,
      detail.fromShiftMins || 330,
      detail.toShiftMins || 330,
      detail.fromTz,
      detail.toTz
    );

    updatedDetail.fromDateTime = fromDateTime;
    updatedDetail.toDateTime = toDateTime;
    updatedDetail.departureUTC = departureUTC;
    updatedDetail.arrivalUTC = arrivalUTC;
    updatedDetail.departureLocal = departureLocal;
    updatedDetail.arrivalLocal = arrivalLocal;
    updatedDetail.fromTz = formatUTCOffset(detail.fromShiftMins);
    updatedDetail.toTz = formatUTCOffset(detail.toShiftMins);
  }

  return updatedDetail;
};

/**
 * Calculate flight time based on coordinates and aircraft data
 * @param {Object} fromCoords - Departure coordinates {lat, long}
 * @param {Object} toCoords - Arrival coordinates {lat, long}
 * @param {Object} aircraft - Aircraft data with consumption rate (optional)
 * @returns {Object} Distance and flight time
 */
export const calculateTooltipFlightData = (fromCoords, toCoords, aircraft = null) => {
  if (!fromCoords || !toCoords) {
    return {
      distance: '-- nm',
      flightTime: '-- hrs'
    };
  }

  // Calculate distance regardless of aircraft
  const distanceValue = calculateDistance(
    fromCoords.lat,
    fromCoords.long,
    toCoords.lat,
    toCoords.long
  );
  const distance = `${distanceValue} nm`;

  // Only calculate flight time if aircraft data is provided
  let flightTime = '-- hrs';
  if (aircraft && (aircraft.cons !== null || aircraft.slp !== null)) {
    flightTime = calculateFlightTime(distanceValue, aircraft.cons, aircraft.slp);
  }

  return {
    distance,
    flightTime
  };
};

/**
 * Format flight time for display in tooltip
 * @param {string} flightTime - Flight time in format "H:MM hrs"
 * @returns {string} Formatted flight time
 */
export const formatTooltipFlightTime = (flightTime) => {
  return formatFlightTime(flightTime);
};

/**
 * Parse flight time string to milliseconds for tooltip calculations
 * @param {string} flightTime - Flight time in format "H:MM hrs"
 * @returns {number} Flight time in milliseconds
 */
export const parseTooltipFlightTime = (flightTime) => {
  return parseFlightTimeToMs(flightTime);
}; 