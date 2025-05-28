import { useState, useEffect, useContext, useRef } from 'react';
import { Plus, Trash2, ArrowUpDown, MoreHorizontal, ChevronDown, Loader2, Clock, User2, ListFilter } from 'lucide-react';
import PropTypes from 'prop-types';
import { SellerMarketContext } from '../../../context/seller-market/SellerMarketContext';
import DateAndTime from './DateAndTime';
import AirpotSelector from './AirpotSelector';
import FlightDetailsTooltip from './FlightDetailsTooltip';
import { getTripCategoryService, getEquipmentService } from '../../../api/GetInfo/GetInfo.service';
import { calculateDistance, calculateFlightTime, calculateDateTimes } from './SearchCalculations';
import { calculateTooltipFlightData, updateTooltipTimes } from './tooltipCalculations';

const SearchDetailsForm = ({ onFormChange }) => {
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
  const [tripCategory, setTripCategory] = useState('Trip Category');
  const [equipmentCategory, setEquipmentCategory] = useState('Equipment');
  
  const [categories, setCategories] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Add state for itineraryId
  const [itineraryId, setItineraryId] = useState(null);

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

  const handleCategoryDropdown = async () => {
    const newState = !showCategoryDropdown;
    setShowCategoryDropdown(newState);
    
    if (newState) {
      await fetchCategories();
    }
  };

  const handleEquipmentDropdown = async () => {
    const newState = !showEquipmentDropdown;
    setShowEquipmentDropdown(newState);
    
    if (newState) {
      await fetchEquipment();
    }
  };

  // Handle search change for airports
  const handleSearchChange = (id, e) => {
    const value = e.target.value;
    setSearchTerms(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Only perform airport search if value is long enough and not in helicopter mode
    if (value.length >= 2 && !isGooglePlacesEnabled) {
      searchAirportByITA(value);
    }
  };

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
    const shiftMins = airport.shiftMins;
    
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
      // Set trip category
      if (searchFormPrefillData.tripCategory) {
        setTripCategory(searchFormPrefillData.tripCategory);
      }
      
      // Set equipment category
      if (searchFormPrefillData.equipmentCategory) {
        setEquipmentCategory(searchFormPrefillData.equipmentCategory);
        
        // Toggle Google Places if Helicopter is selected
        const isHelicopter = searchFormPrefillData.equipmentCategory === 'Helicopter';
        toggleGooglePlaces(isHelicopter);
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
  }, [searchFormPrefillData, toggleGooglePlaces, clearSearchFormPrefillData]);

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
    setFlightDetails(flightDetails.filter(detail => detail.id !== id));
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
    
    if (tripCategory === 'Trip Category') {
      errors.tripCategory = true;
      isValid = false;
    }
    
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
    
    // Prepare form data for notification
    const itineraryData = prepareItineraryData();
    
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
    setShowCategoryDropdown(false);
  };

  const setEquipmentCategoryWithNotify = (equipment) => {
    setEquipmentCategory(equipment);
    setShowEquipmentDropdown(false);
    
    // Clear search terms when switching modes
    setSearchTerms({});
    
    // Toggle Google Places when Helicopter is selected
    const isHelicopter = equipment === 'Helicopter';
    toggleGooglePlaces(isHelicopter);
    setUsePlacesMode(isHelicopter);
  };

  // Add function to toggle date time mode
  const toggleDateTimeMode = (id) => {
    // Get the current detail
    const detail = flightDetails.find(d => d.id === id);
    if (!detail) return;
    
    // Get the current mode
    const currentMode = dateTimeMode[id] || 'departure';
    const newMode = currentMode === 'departure' ? 'arrival' : 'departure';
    
    // Update the mode
    setDateTimeMode(prev => ({
      ...prev,
      [id]: newMode
    }));
    
    // If we have aircraft data, flight time, and both dates are set,
    // we don't need to recalculate anything
    if (detail.aircraftData && 
        detail.flightTime && 
        detail.flightTime !== '-- hrs' && 
        detail.fromDateTime && 
        detail.toDateTime) {
      return;
    }
    
    // If we have aircraft data and flight time, and one of the dates is set,
    // calculate the other date
    if (detail.aircraftData && 
        detail.flightTime && 
        detail.flightTime !== '-- hrs') {
      
      // If switching to arrival mode and we have departure date
      if (newMode === 'arrival' && detail.fromDateTime) {
        const calculatedDetail = updateTooltipTimes(
          detail,
          detail.fromDateTime,
          null,
          detail.flightTime,
          detail.aircraftData
        );
        
        // Update the flight details
        setFlightDetails(prevDetails =>
          prevDetails.map(d => {
            if (d.id === id) {
              return {
                ...d,
                toDateTime: calculatedDetail.toDateTime
              };
            }
            return d;
          })
        );
      }
      // If switching to departure mode and we have arrival date
      else if (newMode === 'departure' && detail.toDateTime) {
        const calculatedDetail = updateTooltipTimes(
          detail,
          null,
          detail.toDateTime,
          detail.flightTime,
          detail.aircraftData
        );
        
        // Update the flight details
        setFlightDetails(prevDetails =>
          prevDetails.map(d => {
            if (d.id === id) {
              return {
                ...d,
                fromDateTime: calculatedDetail.fromDateTime
              };
            }
            return d;
          })
        );
      }
    }
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

  // Add function to toggle Places/Airport mode
  const togglePlacesAirport = () => {
    const newMode = !usePlacesMode;
    setUsePlacesMode(newMode);
    toggleGooglePlaces(newMode);
  };

  return (
    <div>
      <div className="relative -mt-6">
        <div className="flex flex-wrap justify-end items-center gap-4 mb-[-10px] z-10 relative">
          <div className="relative">
            <button 
              className={`px-4 py-2 border-2 ${validationErrors.tripCategory ? 'border-red-600 text-red-600' : 'border-black'} rounded-lg hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 flex items-center gap-2`}
              onClick={handleCategoryDropdown}
            >
              <ListFilter className="w-4 h-4" />
              {tripCategory}
              <ChevronDown className="ml-2" size={18} />
            </button>
            <span className="text-red-600 text-lg absolute -top-4 right-0">*</span>
            {validationErrors.tripCategory && (
              <div className="absolute left-0 -bottom-5 text-red-600 text-xs">Required field</div>
            )}
            
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {isLoading && !dataFetched.categories ? (
                  <div className="px-4 py-2 text-gray-500">Loading categories...</div>
                ) : categories.length > 0 ? (
                  categories.map((category, index) => (
                    <div 
                      key={index} 
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => setTripCategoryWithNotify(category)}
                    >
                      {category}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No categories found</div>
                )}
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              className={`px-4 py-2 border-2 ${validationErrors.equipmentCategory ? 'border-red-600 text-red-600' : 'border-black'} rounded-lg hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 flex items-center gap-2`}
              onClick={handleEquipmentDropdown}
            >
              <ListFilter className="w-4 h-4" />
              {equipmentCategory}
              <ChevronDown className="ml-2" size={18} />
            </button>
            {validationErrors.equipmentCategory && (
              <div className="absolute left-0 -bottom-5 text-red-600 text-xs">Required field</div>
            )}
            
            {showEquipmentDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {isLoading && !dataFetched.equipments ? (
                  <div className="px-4 py-2 text-gray-500">Loading equipment options...</div>
                ) : equipments.length > 0 ? (
                  equipments.map((equipment, index) => (
                    <div 
                      key={index} 
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => setEquipmentCategoryWithNotify(equipment)}
                    >
                      {equipment}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No equipment options found</div>
                )}
              </div>
            )}
          </div>
          
          <button 
            className="px-6 py-2 bg-[#39B7FF] text-white rounded-md border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors w-[150px] hover:bg-[#2da8f0]"
            onClick={handleSave}
          >
            Search
          </button>
        </div>
        <div className="bg-[#f4f4f4] rounded-lg pt-8">
          <div className="px-6 pb-6">
            <div className="flex mb-1">
              <div className="w-[250px]">
                <div className="text-sm font-medium">
                  <span className="cursor-pointer" onClick={togglePlacesAirport}>
                    {usePlacesMode ? (
                      <span><span className="font-bold text-blue-600">Places</span> / Airport</span>
                    ) : (
                      <span>Places / <span className="font-bold text-blue-600">Airport</span></span>
                    )}
                  </span>
                </div>
              </div>
              <div className="w-[250px] ml-4">
                {/* Empty space for alignment */}
              </div>
              <div className="w-56 ml-4">
                {/* Empty space for alignment */}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium">Pax</div>
              </div>
            </div>
            {flightDetails.map((detail) => (
              <div key={detail.id} className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-[250px]">
                    <AirpotSelector
                      id={`${detail.id}_from`}
                      selectedAirport={detail.from}
                      searchTerm={searchTerms[`${detail.id}_from`] || ''}
                      handleSearchChange={(e) => handleSearchChange(`${detail.id}_from`, e)}
                      airports={airports}
                      airportLoading={airportLoading}
                      airportError={airportError}
                      onSelectAirport={onSelectAirport}
                      placeholder="From"
                      hasError={hasError(detail.id, 'from')}
                    />
                    <span className="text-red-600 text-lg absolute -top-4 right-0">*</span>
                  </div>
                  <div className="relative w-[250px]">
                    <AirpotSelector
                      id={`${detail.id}_to`}
                      selectedAirport={detail.to}
                      searchTerm={searchTerms[`${detail.id}_to`] || ''}
                      handleSearchChange={(e) => handleSearchChange(`${detail.id}_to`, e)}
                      airports={airports}
                      airportLoading={airportLoading}
                      airportError={airportError}
                      onSelectAirport={onSelectAirport}
                      placeholder="To"
                      hasError={hasError(detail.id, 'to')}
                    />
                    <span className="text-red-600 text-lg absolute -top-4 right-0">*</span>
                  </div>
                                      <div className="relative w-56">
                      <div className="text-sm font-medium absolute -top-6">
                        <span 
                          className="cursor-pointer" 
                          onClick={() => toggleDateTimeMode(detail.id)}
                        >
                          {dateTimeMode[detail.id] === 'departure' ? (
                            <span><span className="font-bold text-blue-600">Departure</span> / Arrival</span>
                          ) : (
                            <span>Departure / <span className="font-bold text-blue-600">Arrival</span></span>
                          )}
                        </span>
                      </div>
                      <DateAndTime
                        selected={getCurrentDateTime(detail)}
                        onChange={(date) => handleDateTimeChange(detail.id, date)}
                        placeholder={`${dateTimeMode[detail.id] === 'departure' ? 'Departure' : 'Arrival'} Date & Time`}
                        hasError={hasError(detail.id, dateTimeMode[detail.id] === 'departure' ? 'fromDateTime' : 'toDateTime')}
                      />
                    </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className={`w-[100px] border-2 ${hasError(detail.id, 'pax') ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}>
                        <div className="flex items-center h-[36px]">
                          <div className="flex items-center justify-center ml-2">
                            <User2 className="w-5 h-5 text-gray-600" />
                          </div>
                          <input
                            type="text"
                            placeholder="Pax"
                            value={detail.pax}
                            onChange={(e) => handleInputChange(detail.id, 'pax', e.target.value)}
                            className="w-full border-none outline-none px-2 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
                          />
                        </div>
                      </div>
                      {tripCategory === 'Passenger' && <span className="text-red-600 text-lg absolute -top-4 right-0">*</span>}
                      {hasError(detail.id, 'pax') && (
                        <div className="text-red-600 text-xs mt-1">Required</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <button 
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
                          onClick={() => handleClockClick(detail.id)}
                        >
                          <Clock className="w-5 h-5" />
                        </button>
                        
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
                      </div>
                      <button 
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
                        onClick={() => duplicateAndReverse(detail.id)}
                      >
                        <ArrowUpDown className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={addFlightDetail}
                        className="p-1 bg-green-500 text-white hover:bg-green-600 rounded-full transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => removeFlightDetail(detail.id)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 text-black hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
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
  onFormChange: PropTypes.func
};

export default SearchDetailsForm;