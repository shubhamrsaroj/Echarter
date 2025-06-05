import { useState, useEffect, useContext, useRef } from 'react';
import { Trash2, ArrowUpDown, ChevronDown,  Clock} from 'lucide-react';
import PropTypes from 'prop-types';
import { SellerMarketContext } from '../../../../../context/seller-market/SellerMarketContext';
import AirpotSelector from './AirpotSelector';
import FlightDetailsTooltip from './FlightDetailsTooltip';
import { getTripCategoryService, getEquipmentService } from '../../../../../api/GetInfo/GetInfo.service';
import { calculateDistance, calculateFlightTime, calculateDateTimes } from './SearchCalculations';
import { calculateTooltipFlightData, updateTooltipTimes, formatUTCOffset } from './tooltipCalculations';

// Import PrimeReact components
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber'; 
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';

// Create a wrapper component for DateAndTime using PrimeReact Calendar
const CalendarDateTimeWrapper = ({ selected, onChange, placeholder, hasError }) => {
  return (
    <Calendar 
      value={selected} 
      onChange={(e) => onChange(e.value)} 
      showTime 
      hourFormat="12"
      placeholder={placeholder}
      position="bottom"
      className={`w-full ${hasError ? 'p-invalid' : ''}`}
      pt={{
        input: { className: 'h-full w-full' },
        root: { className: 'w-full' }
      }}
      style={{ height: '42px', width: '100%' }}
      inputStyle={{ height: '42px', width: '100%' }}
      manualInput={true}
    />
  );
};

CalendarDateTimeWrapper.propTypes = {
  selected: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  hasError: PropTypes.bool
};

const SearchDetailsForm = ({ onFormChange, onShowRecentSearches }) => {
  const { 
    airports,
    airportLoading,
    airportError,
    searchAirportByITA,
    toggleGooglePlaces,
    isGooglePlacesEnabled,
    getAllAircraftTypes,
    searchFormPrefillData,
    clearSearchFormPrefillData,
    updateItinerary,
    getOptionsbyItineraryId
  } = useContext(SellerMarketContext);
  
  
  const [flightDetails, setFlightDetails] = useState([{
    id: 1,
    from: '',
    fromDateTime: null,
    to: '',
    pax: '',
    fromPlace: '',
    fromCountry: '',
    toPlace: '',
    toCountry: '',
    fromCoordinates: { lat: 0, long: 0 },
    toCoordinates: { lat: 0, long: 0 },
    fromShiftMins: 0,
    toShiftMins: 0,
    flightCategory: ''
  }]);
  const [tripCategory, setTripCategory] = useState('Select');
  const [equipmentCategory, setEquipmentCategory] = useState('Select');
  
  const [categories, setCategories] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState({
    categories: false,
    equipments: false
  });
  
  const dataProcessedRef = useRef(false);
  const [searchTerms, setSearchTerms] = useState({});
  
  // Add validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  const [showTooltip, setShowTooltip] = useState(null);
  const [selectedAircraft, setSelectedAircraft] = useState({});
  const [showAircraftDropdown, setShowAircraftDropdown] = useState(null);
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [aircraftLoading, setAircraftLoading] = useState(false);
  const [aircraftError, setAircraftError] = useState(null);
  const tooltipRef = useRef(null);

  // Add state for date time mode
  const [dateTimeMode, setDateTimeMode] = useState({
    1: 'departure' // Set default mode for the first flight detail
  });

  // Add state for Places/Airport toggle
  const [usePlacesMode, setUsePlacesMode] = useState(isGooglePlacesEnabled);
  // Add state for using arrival time
  const [useArrivalTime, setUseArrivalTime] = useState(false);

  // Add state for itineraryId
  const [itineraryId, setItineraryId] = useState(null);

  // Add state for searching
  const [isSearching, setIsSearching] = useState(false);

  // Fetch aircraft types when needed
  const fetchAircraftTypes = async () => {
    if (aircraftTypes.length > 0) return;
    
    setAircraftLoading(true);
    try {
      const data = await getAllAircraftTypes();
      if (data) {
        setAircraftTypes(data);
      }
    } catch (error) {
      setAircraftError(error.message);
      console.error('Error fetching aircraft types:', error);
    } finally {
      setAircraftLoading(false);
    }
  };

  const handleClockClick = (detailId) => {
    setShowTooltip(showTooltip === detailId ? null : detailId);
    // Fetch aircraft types when opening the tooltip
    if (showTooltip !== detailId) {
      fetchAircraftTypes();
      
      // If we have a flight detail with this ID
      const detail = flightDetails.find(d => d.id === detailId);
      if (detail) {
        // Make sure we have the correct mode set
        if (!dateTimeMode[detailId]) {
          setDateTimeMode(prev => ({
            ...prev,
            [detailId]: 'departure' // Default to departure mode if not set
          }));
        }
        
        // If we have aircraft data and coordinates, recalculate times based on current mode
        if (detail.aircraftData && detail.fromCoordinates && detail.toCoordinates) {
          const mode = dateTimeMode[detailId] || 'departure';
          const { flightTime } = calculateTooltipFlightData(
            detail.fromCoordinates, 
            detail.toCoordinates, 
            detail.aircraftData
          );
          
          // Update times based on mode
          if (mode === 'departure' && detail.fromDateTime) {
            const updatedDetail = updateTooltipTimes(
              detail,
              detail.fromDateTime,
              null,
              flightTime,
              detail.aircraftData
            );
            
            // Update the flight details with the calculated data
            setFlightDetails(prevDetails => 
              prevDetails.map(d => d.id === detailId ? updatedDetail : d)
            );
          } else if (mode === 'arrival' && detail.toDateTime) {
            const updatedDetail = updateTooltipTimes(
              detail,
              null,
              detail.toDateTime,
              flightTime,
              detail.aircraftData
            );
            
            // Update the flight details with the calculated data
            setFlightDetails(prevDetails => 
              prevDetails.map(d => d.id === detailId ? updatedDetail : d)
            );
          }
        }
      }
    }
  };

  const handleAircraftDropdown = (id) => {
    setShowAircraftDropdown(showAircraftDropdown === id ? null : id);
    // Fetch aircraft types when opening the dropdown
    if (showAircraftDropdown !== id) {
      fetchAircraftTypes();
    }
  };

  const handleAircraftSelect = (id, aircraft) => {
    // Update selected aircraft state
    setSelectedAircraft(prev => ({
      ...prev,
      [id]: aircraft.name
    }));

    // Update flight details with aircraft info and recalculate times
    setFlightDetails(prevDetails => 
      prevDetails.map(detail => {
        if (detail.id === id) {
          const updatedDetail = { 
            ...detail, 
            aircraft: aircraft.name,
            aircraftId: aircraft.id,
            aircraft_type: aircraft.name,
            aircraftData: aircraft
          };

          // Recalculate distance and flight time if we have coordinates
          if (updatedDetail.fromCoordinates && updatedDetail.toCoordinates) {
            const { distance, flightTime } = calculateDistanceAndFlightTime(
              updatedDetail.fromCoordinates,
              updatedDetail.toCoordinates,
              aircraft
            );
            updatedDetail.distance = distance;
            updatedDetail.flightTime = flightTime;

            // If we have departure time, calculate arrival time
            if (updatedDetail.fromDateTime && flightTime !== '-- hrs') {
              const { 
                toDateTime,
                departureUTC,
                arrivalUTC,
                departureLocal,
                arrivalLocal,
                fromTz,
                toTz
              } = calculateDateTimes(
                updatedDetail.fromDateTime,
                flightTime,
                true,
                updatedDetail.fromShiftMins || 330,
                updatedDetail.toShiftMins || 330,
                updatedDetail.fromTz,
                updatedDetail.toTz
              );
              
              updatedDetail.toDateTime = toDateTime;
              updatedDetail.departureUTC = departureUTC;
              updatedDetail.arrivalUTC = arrivalUTC;
              updatedDetail.departureLocal = departureLocal;
              updatedDetail.arrivalLocal = arrivalLocal;
              updatedDetail.fromTz = fromTz;
              updatedDetail.toTz = toTz;
            }
          }
          
          return updatedDetail;
        }
        return detail;
      })
    );

    // Close dropdown
    setShowAircraftDropdown(null);
  };

  const handleTimeChange = (detailId, field, time, updatedDetail) => {
    const updatedDetails = flightDetails.map(detail => {
      if (detail.id === detailId) {
        // If we received an updatedDetail from the tooltip, use that
        if (updatedDetail) {
          return updatedDetail;
        }
        // Otherwise just update the specific field
        return {
          ...detail,
          [field]: time
        };
      }
      return detail;
    });
    setFlightDetails(updatedDetails);
    prepareAndNotifyFormChange(updatedDetails);
  };

  // Fetch trip categories on demand
  const fetchCategories = async () => {
    if (dataFetched.categories) return;
    
    setIsLoading(true);
    try {
      const response = await getTripCategoryService();
      if (response.success && response.data) {
        const options = response.data.map(item => item.text);
        setCategories(options);
        setDataFetched(prev => ({ ...prev, categories: true }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch equipment categories on demand
  const fetchEquipment = async () => {
    if (dataFetched.equipments) return;
    
    setIsLoading(true);
    try {
      const response = await getEquipmentService();
      if (response.success && response.data) {
        const options = response.data.map(item => item.text);
        setEquipments(options);
        setDataFetched(prev => ({ ...prev, equipments: true }));
      }
    } catch (error) {
      console.error('Error fetching equipment options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryDropdown = () => {
    fetchCategories();
  };

  const handleEquipmentDropdown = () => {
    fetchEquipment();
  };

  // Handle search change for airports
  const handleSearchChange = (id, e) => {
    const value = e.target.value;
    setSearchTerms(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Only perform airport search if value is at least 3 characters and not in Google Places mode
    if (value.length >= 3 && !isGooglePlacesEnabled) {
      searchAirportByITA(value);
    }
  };

  // Add useEffect to fetch categories and equipment on component mount
  useEffect(() => {
    // Fetch categories and equipment options on component mount
    fetchCategories();
    fetchEquipment();
  }, []);

  // Add this function after the handleInputChange function
  const calculateDistanceAndFlightTime = (fromCoords, toCoords, aircraftData) => {
    if (!fromCoords || !toCoords) return { distance: '-- nm', flightTime: '-- hrs' };
    
    const distance = calculateDistance(
      fromCoords.lat,
      fromCoords.long,
      toCoords.lat,
      toCoords.long
    );

    let flightTime = '-- hrs';
    if (aircraftData && (aircraftData.cons !== null || aircraftData.slp !== null)) {
      flightTime = calculateFlightTime(distance, aircraftData.cons, aircraftData.slp);
    }

    return {
      distance: `${distance} nm`,
      flightTime
    };
  };

  // Update the onSelectAirport function
  const onSelectAirport = (id, airport) => {
    const flightId = parseInt(id.toString().split('_')[0]);
    const fieldType = id.toString().includes('_from') ? 'from' : 'to';
    
    // Get shift minutes and timezone from airport data
    // Use default value for shiftMins (330 for UTC+5:30) if not provided, especially for Google Places
    const shiftMins = airport.shiftMins !== undefined ? airport.shiftMins : 330;
    
    // Create coordinates object from the API response
    const coordinates = { 
      lat: airport.lat || airport.geometry?.location?.lat() || 0,
      long: airport.long || airport.geometry?.location?.lng() || 0 
    };
    
    const updatedDetails = flightDetails.map(detail => {
      if (detail.id === flightId) {
        const currentCountry = airport.country || 'India';
        const otherFieldType = fieldType === 'from' ? 'to' : 'from';
        const otherCountry = detail[`${otherFieldType}Country`] || '';

        const updatedDetail = { 
          ...detail, 
          [fieldType]: airport.airportName || airport.name || '',
          [`${fieldType}Code`]: airport.iata || '',
          [`${fieldType}iata`]: airport.iata || '',
          [`${fieldType}Coordinates`]: coordinates,
          [`${fieldType}ShiftMins`]: shiftMins,
          [`${fieldType}Country`]: currentCountry,
          [`${fieldType}Place`]: airport.airportName || airport.formatted_address || airport.name || '',
          [`${fieldType}State`]: airport.state || '',
          [`${fieldType}Tz`]: formatUTCOffset(shiftMins),
          country: currentCountry
        };

        if (currentCountry && otherCountry) {
          updatedDetail.flightCategory = currentCountry.trim().toLowerCase() === otherCountry.trim().toLowerCase() 
            ? 'Domestic' 
            : 'International';
        }

        // Calculate distance if we have both coordinates
        const fromCoords = fieldType === 'from' ? coordinates : detail.fromCoordinates;
        const toCoords = fieldType === 'to' ? coordinates : detail.toCoordinates;
        
        if (fromCoords && toCoords) {
          const { distance } = calculateTooltipFlightData(fromCoords, toCoords);
          updatedDetail.distance = distance;

          // Only calculate flight time if we have aircraft data
          if (detail.aircraftData) {
            const { flightTime } = calculateTooltipFlightData(fromCoords, toCoords, detail.aircraftData);
            updatedDetail.flightTime = flightTime;

            // If we have departure time and flight time, calculate arrival time
            if (updatedDetail.fromDateTime && flightTime !== '-- hrs') {
              const { 
                toDateTime,
                departureUTC,
                arrivalUTC,
                departureLocal,
                arrivalLocal
              } = calculateDateTimes(
                updatedDetail.fromDateTime,
                flightTime,
                true,
                updatedDetail.fromShiftMins,
                updatedDetail.toShiftMins
              );
              
              updatedDetail.toDateTime = toDateTime;
              updatedDetail.departureUTC = departureUTC;
              updatedDetail.arrivalUTC = arrivalUTC;
              updatedDetail.departureLocal = departureLocal;
              updatedDetail.arrivalLocal = arrivalLocal;
            }
          }
        }
        
        return updatedDetail;
      }
      return detail;
    });
    
    setFlightDetails(updatedDetails);
    
    // Prepare and notify form change immediately after updating flight details
    prepareAndNotifyFormChange(updatedDetails);
  };

  useEffect(() => {
    dataProcessedRef.current = false;
  }, []);

  // Add useEffect to handle prefill data
  useEffect(() => {
    if (searchFormPrefillData) {
      // Fetch categories and equipment options immediately when prefill data is received
      fetchCategories();
      fetchEquipment();
      
      // Set trip category
      if (searchFormPrefillData.tripCategory) {
        setTripCategory(searchFormPrefillData.tripCategory);
      }
      
      // Set equipment category
      if (searchFormPrefillData.equipmentCategory) {
        setEquipmentCategory(searchFormPrefillData.equipmentCategory);
      }
      
      // Set flight details
      if (searchFormPrefillData.flightDetails && searchFormPrefillData.flightDetails.length > 0) {
        setFlightDetails(searchFormPrefillData.flightDetails);
        
        // Initialize date time mode for each flight detail
        const newDateTimeMode = {};
        searchFormPrefillData.flightDetails.forEach(detail => {
          newDateTimeMode[detail.id] = 'departure';
        });
        setDateTimeMode(newDateTimeMode);
      }
      
      // Store itineraryId if available
      if (searchFormPrefillData.itineraryId) {
        setItineraryId(searchFormPrefillData.itineraryId);
      }
      
      // Clear the prefill data after using it
      clearSearchFormPrefillData();
    }
  }, [searchFormPrefillData, clearSearchFormPrefillData]);

  // Add useEffect to keep usePlacesMode in sync with isGooglePlacesEnabled
  useEffect(() => {
    setUsePlacesMode(isGooglePlacesEnabled);
  }, [isGooglePlacesEnabled]);

  const addFlightDetail = () => {
    if (flightDetails.length > 0) {
      const newId = flightDetails.length + 1;
      const newDetail = {
        id: newId,
        from: '',
        fromDateTime: null,
        to: '',
        toDateTime: null,
        pax: '',
        fromPlace: '',
        fromCountry: '',
        toPlace: '',
        toCountry: '',
        fromCoordinates: { lat: 0, long: 0 },
        toCoordinates: { lat: 0, long: 0 },
        fromShiftMins: 0,
        toShiftMins: 0,
        fromTz: null,
        toTz: null,
        flightCategory: ''
      };
      setFlightDetails([...flightDetails, newDetail]);
      
      // Set default date time mode for new flight detail
      setDateTimeMode(prev => ({
        ...prev,
        [newId]: 'departure'
      }));
    }
  };

  const removeFlightDetail = (id) => {
    // Only remove if there's more than one flight detail
    if (flightDetails.length > 1) {
      setFlightDetails(flightDetails.filter(detail => detail.id !== id));
    }
  };

  const handleInputChange = (id, field, value) => {
    const updatedDetails = flightDetails.map(detail => {
      if (detail.id === id) {
        // Preserve existing coordinates when updating other fields
        const updatedDetail = { 
          ...detail, 
          [field]: value,
          fromCoordinates: detail.fromCoordinates || { lat: 0, long: 0 },
          toCoordinates: detail.toCoordinates || { lat: 0, long: 0 }
        };
        return updatedDetail;
      }
      return detail;
    });
    setFlightDetails(updatedDetails);
    
    if (onFormChange) {
      prepareAndNotifyFormChange(updatedDetails);
    }
  };

  const duplicateAndReverse = (id) => {
    const detailToDuplicate = flightDetails.find(detail => detail.id === id);
    if (!detailToDuplicate) return;
    
    // Check if a return flight already exists for this route
    const returnAlreadyExists = flightDetails.some(detail => 
      detail.from === detailToDuplicate.to && 
      detail.to === detailToDuplicate.from
    );
    
    // If return already exists, don't add another one
    if (returnAlreadyExists) return;
    
    const newId = Math.max(...flightDetails.map(d => d.id)) + 1;
    const newDetail = {
      ...detailToDuplicate,
      id: newId,
      from: detailToDuplicate.to,
      to: detailToDuplicate.from,
      fromDateTime: detailToDuplicate.toDateTime,
      toDateTime: detailToDuplicate.fromDateTime,
      fromPlace: detailToDuplicate.toPlace,
      toPlace: detailToDuplicate.fromPlace,
      fromCountry: detailToDuplicate.toCountry,
      toCountry: detailToDuplicate.fromCountry,
      fromCoordinates: detailToDuplicate.toCoordinates,
      toCoordinates: detailToDuplicate.fromCoordinates,
      fromShiftMins: detailToDuplicate.toShiftMins,
      toShiftMins: detailToDuplicate.fromShiftMins,
      fromTz: detailToDuplicate.toTz,
      toTz: detailToDuplicate.fromTz,
      flightCategory: detailToDuplicate.flightCategory
    };
    
    setFlightDetails([...flightDetails, newDetail]);
    
    // Set default date time mode for the new flight detail
    setDateTimeMode(prev => ({
      ...prev,
      [newId]: 'departure'
    }));
  };

  const hasError = (detailId, fieldName) => {
    return validationErrors[detailId]?.[fieldName] === true;
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Trip category is no longer required per client request
    // if (tripCategory === 'Select') {
    //   errors.tripCategory = true;
    //   isValid = false;
    // }
    
    // Equipment category is no longer required per client request
    // if (equipmentCategory === 'Select') {
    //   errors.equipmentCategory = true;
    //   isValid = false;
    // }
    
    flightDetails.forEach(detail => {
      errors[detail.id] = {};
      
      if (!detail.from) {
        errors[detail.id].from = true;
        isValid = false;
      }
      
      if (!detail.to) {
        errors[detail.id].to = true;
        isValid = false;
      }
      
      // Check for date time based on useArrivalTime setting
      if (useArrivalTime && !detail.toDateTime) {
        errors[detail.id].toDateTime = true;
        isValid = false;
      } else if (!useArrivalTime && !detail.fromDateTime) {
        errors[detail.id].fromDateTime = true;
        isValid = false;
      }
      
      if (tripCategory === 'Passenger' && (!detail.pax || isNaN(parseInt(detail.pax)))) {
        errors[detail.id].pax = true;
        isValid = false;
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Set searching state to true
    setIsSearching(true);
    
    // Prepare form data for notification
    const itineraryData = prepareItineraryData();
    
    try {
      // If we have an itineraryId, update the existing itinerary
      if (itineraryId) {
        try {
          // Add the itineraryId to the payload
          const updatePayload = {
            ...itineraryData,
            id: itineraryId
          };
          
          // Call updateItinerary
          const response = await updateItinerary(updatePayload);
          
          if (response) {
            // After updating, immediately fetch the options for this itinerary
            await getOptionsbyItineraryId(itineraryId);
          }
        } catch (error) {
          console.error('Error updating itinerary:', error);
        }
      } else {
        // If no itineraryId, just notify the parent component
        if (onFormChange) {
          onFormChange(itineraryData);
        }
      }
    } finally {
      // Set searching state back to false when search completes
      setTimeout(() => setIsSearching(false), 800); // Adding slight delay to ensure UI feedback is noticeable
    }
  };

  const prepareItineraryData = () => {
    const itineraryData = {
      needs: false,
      tripcategory: tripCategory,
      aircraftcategory: equipmentCategory,
      pipelineId: 0,
      itinerary: flightDetails.map(detail => {
        // Create the leg object matching the exact required structure
        const leg = {
          pax: parseInt(detail.pax) || 0,
          date: detail.fromDateTime?.toISOString()?.replace('.000Z', '.0000000Z') || new Date().toISOString().replace('.000Z', '.0000000Z'),
          departurePlace: detail.fromPlace || detail.from,
          departureShiftmin: detail.fromShiftMins || 330,
          departureLat: detail.fromCoordinates?.lat || 0,
          departureLong: detail.fromCoordinates?.long || 0,
          arrivalPlace: detail.toPlace || detail.to,
          arrivalShiftmin: detail.toShiftMins || 330,
          arrivalDate: detail.toDateTime?.toISOString()?.replace('.000Z', '.0000000Z') || detail.fromDateTime?.toISOString()?.replace('.000Z', '.0000000Z') || new Date().toISOString().replace('.000Z', '.0000000Z'),
          arrivalLat: detail.toCoordinates?.lat || 0,
          arrivalLong: detail.toCoordinates?.long || 0,
          flightCategory: detail.flightCategory || 
            (detail.fromCountry === detail.toCountry ? 'Domestic' : 'International'),
          legNumber: detail.id,
        };

        return leg;
      })
    };

    return itineraryData;
  };

  const prepareAndNotifyFormChange = (updatedDetails = flightDetails, shouldSubmit = false) => {
    // Only prepare the data without submitting unless explicitly requested
    const itineraryData = {
      needs: false,
      tripcategory: tripCategory,
      aircraftcategory: equipmentCategory,
      pipelineId: 0,
      itinerary: updatedDetails.map(detail => {
        // Create the leg object matching the exact required structure
        const leg = {
          pax: parseInt(detail.pax) || 0,
          date: detail.fromDateTime?.toISOString()?.replace('.000Z', '.0000000Z') || new Date().toISOString().replace('.000Z', '.0000000Z'),
          departurePlace: detail.fromPlace || detail.from,
          departureShiftmin: detail.fromShiftMins || 330,
          departureLat: detail.fromCoordinates?.lat || 0,
          departureLong: detail.fromCoordinates?.long || 0,
          arrivalPlace: detail.toPlace || detail.to,
          arrivalShiftmin: detail.toShiftMins || 330,
          arrivalDate: detail.toDateTime?.toISOString()?.replace('.000Z', '.0000000Z') || detail.fromDateTime?.toISOString()?.replace('.000Z', '.0000000Z') || new Date().toISOString().replace('.000Z', '.0000000Z'),
          arrivalLat: detail.toCoordinates?.lat || 0,
          arrivalLong: detail.toCoordinates?.long || 0,
          flightCategory: detail.flightCategory || 
            (detail.fromCountry === detail.toCountry ? 'Domestic' : 'International'),
          legNumber: detail.id,
        };

        return leg;
      })
    };

    // Only call onFormChange if shouldSubmit is true
    if (onFormChange && shouldSubmit) {
      onFormChange(itineraryData);
    }
  };

  const setTripCategoryWithNotify = (category) => {
    setTripCategory(category);
  };

  const setEquipmentCategoryWithNotify = (equipment) => {
    setEquipmentCategory(equipment);
    
    // Clear search terms when switching modes
    setSearchTerms({});
  };

  // Add function to get the current date time based on mode
  const getCurrentDateTime = (detail) => {
    const mode = dateTimeMode[detail.id] || 'departure';
    return mode === 'departure' ? detail.fromDateTime : detail.toDateTime;
  };

  // Add function to handle date time change based on mode
  const handleDateTimeChange = (id, date) => {
    const mode = dateTimeMode[id] || 'departure';
    const field = mode === 'departure' ? 'fromDateTime' : 'toDateTime';
    
    // Find the current detail
    const detail = flightDetails.find(d => d.id === id);
    if (!detail) {
      handleInputChange(id, field, date);
      return;
    }
    
    // Update the primary field first
    handleInputChange(id, field, date);
    
    // If we have aircraft data and flight time, calculate the other date/time
    if (detail.aircraftData && detail.flightTime && detail.flightTime !== '-- hrs') {
      // Get the updated detail after the primary field was updated
      const updatedDetail = flightDetails.find(d => d.id === id);
      if (!updatedDetail) return;
      
      // Calculate the other date time based on mode
      const calculatedDetail = updateTooltipTimes(
        updatedDetail,
        mode === 'departure' ? date : null,
        mode === 'arrival' ? date : null,
        updatedDetail.flightTime,
        updatedDetail.aircraftData
      );
      
      // Update both date times in the flight details
      setFlightDetails(prevDetails =>
        prevDetails.map(d => {
          if (d.id === id) {
            return {
              ...d,
              fromDateTime: calculatedDetail.fromDateTime,
              toDateTime: calculatedDetail.toDateTime
            };
          }
          return d;
        })
      );
    }
  };

  // Toggle Places/Airport mode
  const togglePlacesAirport = () => {
    const newMode = !usePlacesMode;
    setUsePlacesMode(newMode);
    toggleGooglePlaces(newMode);
  };

  // Toggle arrival time mode
  const toggleArrivalTime = () => {
    setUseArrivalTime(!useArrivalTime);
    // Update date time mode for all flight details
    if (!useArrivalTime) {
      const newDateTimeMode = {};
      flightDetails.forEach(detail => {
        newDateTimeMode[detail.id] = 'arrival';
      });
      setDateTimeMode(newDateTimeMode);
    } else {
      const newDateTimeMode = {};
      flightDetails.forEach(detail => {
        newDateTimeMode[detail.id] = 'departure';
      });
      setDateTimeMode(newDateTimeMode);
    }
  };

  // Transform categories and equipments for PrimeReact dropdown
  const categoryOptions = categories.map(cat => ({ label: cat, value: cat }));
  const equipmentOptions = equipments.map(eq => ({ label: eq, value: eq }));

  return (
    <div className="bg-white">
      <div className="grid grid-cols-12 gap-6">
        {/* Top row with dropdowns and checkboxes */}
        <div className=" bg-[#f4f4f4] col-span-12 flex flex-wrap items-center mb-6 p-6">
          {/* Checkboxes on the left */}
          <div className="flex space-x-6 mr-6">
            <div className="flex items-center">
              <Checkbox
                inputId="usePlaces"
                checked={usePlacesMode}
                onChange={() => togglePlacesAirport()}
              />
              <label htmlFor="usePlaces" className="ml-3 text-sm font-medium">Use Places</label>
            </div>

            <div className="flex items-center">
              <Checkbox
                inputId="useArrivalTime"
                checked={useArrivalTime}
                onChange={() => toggleArrivalTime()}
              />
              <label htmlFor="useArrivalTime" className="ml-3 text-sm font-medium">Use Arrival Time</label>
            </div>
          </div>
          
          {/* Category dropdowns in the middle */}
          <div className="flex-1 flex space-x-12">
            <div className="flex flex-col" style={{ width: '280px' }}>
              <label className="block text-sm font-medium mb-2">Trip Category</label>
              <Dropdown
                value={tripCategory}
                options={categories.length > 0 ? 
                  (tripCategory === 'Select' ? 
                    [{ label: 'Select', value: 'Select' }, ...categoryOptions] : 
                    categoryOptions) : 
                  [{ label: 'Select', value: 'Select' }]
                }
                onChange={(e) => setTripCategoryWithNotify(e.value)}
                placeholder="Select"
                className="w-full"
                onShow={handleCategoryDropdown}
              />
            </div>

            <div className="flex flex-col" style={{ width: '280px' }}>
              <label className="block text-sm font-medium mb-2">Preferred Aircraft Category</label>
              <Dropdown
                value={equipmentCategory}
                options={equipments.length > 0 ? 
                  (equipmentCategory === 'Select' ? 
                    [{ label: 'Select', value: 'Select' }, ...equipmentOptions] : 
                    equipmentOptions) : 
                  [{ label: 'Select', value: 'Select' }]
                }
                onChange={(e) => setEquipmentCategoryWithNotify(e.value)}
                placeholder="Select"
                className="w-full"
                onShow={handleEquipmentDropdown}
              />
            </div>
          </div>
          
          {/* Recent Search button on the right */}
          <div className="relative -left-14 flex">
            <Button
              label="Recent Search"
              onClick={onShowRecentSearches}
              style={{ 
                width: '140px', 
                height: '42px', 
                whiteSpace: 'nowrap',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#5486f3',
                border: 'none'
              }}
            />
          </div>
        </div>

        {/* EEF3FE background flight details section - Updated to match image layout */}
        <div className="col-span-12 -mt-10">
          <div className="bg-[#EEF3FE] p-6">
            {/* Header row */}
            <div className="flex mb-3 px-2">
              <div className="w-[250px] mr-10">
                <div className="text-sm font-medium text-gray-700">From <span className="text-red-500">*</span></div>
              </div>
              <div className="w-[250px] mr-10">
                <div className="text-sm font-medium text-gray-700">To <span className="text-red-500">*</span></div>
              </div>
              <div className="w-[250px] mr-10">
                <div className="text-sm font-medium text-gray-700">
                  {useArrivalTime ? "Arrival Date & Time" : "Departure Date & Time"} <span className="text-red-500">*</span>
                </div>
              </div>
              <div className="w-[150px] mr-10">
                <div className="text-sm font-medium text-gray-700">Passengers</div>
              </div>
              <div className="flex-1"></div>
            </div>

            {/* Flight details */}
            {flightDetails.map((detail) => (
              <div key={detail.id} className="mb-4 flex items-center">
                <div className="w-[250px] mr-10">
                  <AirpotSelector
                    id={`${detail.id}_from`}
                    selectedAirport={detail.from}
                    searchTerm={searchTerms[`${detail.id}_from`] || ''}
                    handleSearchChange={(e) => handleSearchChange(`${detail.id}_from`, e)}
                    airports={airports}
                    airportLoading={airportLoading}
                    airportError={airportError}
                    onSelectAirport={onSelectAirport}
                    placeholder="Search"
                    hasError={hasError(detail.id, 'from')}
                    height="42px"
                  />
                </div>
                <div className="w-[250px] mr-10">
                  <AirpotSelector
                    id={`${detail.id}_to`}
                    selectedAirport={detail.to}
                    searchTerm={searchTerms[`${detail.id}_to`] || ''}
                    handleSearchChange={(e) => handleSearchChange(`${detail.id}_to`, e)}
                    airports={airports}
                    airportLoading={airportLoading}
                    airportError={airportError}
                    onSelectAirport={onSelectAirport}
                    placeholder="Search"
                    hasError={hasError(detail.id, 'to')}
                    height="42px"
                  />
                </div>
                <div className="w-[250px] mr-10 relative">
                  <CalendarDateTimeWrapper
                    selected={getCurrentDateTime(detail)}
                    onChange={(date) => handleDateTimeChange(detail.id, date)}
                    placeholder="Date Time"
                    hasError={hasError(detail.id, useArrivalTime ? 'toDateTime' : 'fromDateTime')}
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                  {hasError(detail.id, useArrivalTime ? 'toDateTime' : 'fromDateTime') && (
                    <div className="text-red-600 text-xs mt-1">Required field</div>
                  )}
                </div>
                <div className="w-[140px] mr-10">
                  <InputNumber
                    placeholder="Pax"
                    value={detail.pax ? parseInt(detail.pax) : null}
                    onValueChange={(e) => handleInputChange(detail.id, 'pax', e.value?.toString() || '')}
                    className={`w-full ${hasError(detail.id, 'pax') ? 'p-error' : ''}`}
                    mode="decimal"
                    min={1}
                    max={100}
                    showButtons
                    inputStyle={{ width: '100%', height: '42px' }}
                    pt={{
                      input: { className: 'h-full w-full' },
                      root: { className: 'w-full' }
                    }}
                  />
                  {hasError(detail.id, 'pax') && (
                    <div className="text-red-600 text-xs mt-1">Required field</div>
                  )}
                </div>
                <div className="flex items-center space-x-4 mr-10">
                  <button 
                    className="w-8 h-8 flex items-center justify-center"
                    onClick={addFlightDetail}
                    title="Add Flight"
                  >
                    <i className="pi pi-plus-circle text-black w-5 h-5"></i>
                  </button>
                  <button 
                    className="w-8 h-8 flex items-center justify-center"
                    onClick={() => duplicateAndReverse(detail.id)}
                    title="Sync"
                  >
                    <ArrowUpDown className="w-5 h-5 text-black" />
                  </button>
                  <button 
                    className="w-8 h-8 flex items-center justify-center"
                    onClick={() => removeFlightDetail(detail.id)}
                    title="Remove Flight"
                  >
                    <Trash2 className="w-5 h-5 text-red-500 " />
                  </button>
                  <button 
                    className="w-8 h-8 flex items-center justify-center relative"
                    onClick={() => handleClockClick(detail.id)}
                    title="Time Details"
                  >
                    <Clock className="w-5 h-5 text-black" />
                    
                    {showTooltip === detail.id && (
                      <FlightDetailsTooltip
                        tooltipRef={tooltipRef}
                        detailId={detail.id}
                        selectedAircraft={selectedAircraft[detail.id]}
                        showAircraftDropdown={showAircraftDropdown === detail.id}
                        handleAircraftDropdown={handleAircraftDropdown}
                        aircraftTypes={aircraftTypes}
                        aircraftLoading={aircraftLoading}
                        aircraftError={aircraftError}
                        onSelectAircraft={handleAircraftSelect}
                        fromDateTime={detail.fromDateTime}
                        toDateTime={detail.toDateTime}
                        onTimeChange={handleTimeChange}
                        detail={detail}
                        dateTimeMode={dateTimeMode[detail.id]}
                      />
                    )}
                  </button>
                </div>
                <div>
                  <Button
                    label={isSearching ? "Searching..." : "Search"}
                    className={`custom-search-btn ${isSearching ? 'bg-blue-500' : 'bg-green-500'} text-white hover:${isSearching ? 'bg-blue-600' : 'bg-green-600'} rounded flex items-center justify-center`}
                    style={{ 
                      width: '100px', 
                      height: '42px',
                      outline: 'none',
                      boxShadow: 'none',
                      border: 'none'
                    }}
                    onClick={handleSave}
                    disabled={isSearching}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

SearchDetailsForm.propTypes = {
  onFormChange: PropTypes.func,
  onShowRecentSearches: PropTypes.func
};

export default SearchDetailsForm;