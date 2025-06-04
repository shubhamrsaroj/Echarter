import { useState, useEffect, useContext, useRef } from 'react';
import { Plus, ChevronDown, User2, ListFilter } from 'lucide-react';
import PropTypes from 'prop-types';
import { SellerMarketContext } from '../../../../../context/seller-market/SellerMarketContext';
import DateAndTime from '../../../market/Search/ItinerarySearch/DateAndTime';
import AirpotSelector from '../../../market/Search/ItinerarySearch/AirpotSelector';
import TailTypeDropdown from './TailTypeDropdown';
import { getAvailabilityService } from '../../../../../api/GetInfo/GetInfo.service';

const PostForm = ({ onFormChange }) => {
  const { 
    airports,
    airportLoading,
    airportError,
    searchAirportByITA,
    toggleGooglePlaces,
    isGooglePlacesEnabled,
  } = useContext(SellerMarketContext);
  
  const [flightDetails, setFlightDetails] = useState([{
    id: 1,
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
    flightCategory: '',
    currency: '',
    price: '',
    comments: ''
  }]);
  const [availabilityCategory, setAvailabilityCategory] = useState('Availability');
  const [selectedTailType, setSelectedTailType] = useState('');
  const [isTailMode, setIsTailMode] = useState(true);
  
  const [availabilities, setAvailabilities] = useState([]);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState({
    availabilities: false
  });
  
  const dataProcessedRef = useRef(false);
  const [searchTerms, setSearchTerms] = useState({});
  
  // Add validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Add state for Places/Airport toggle
  const [usePlacesMode, setUsePlacesMode] = useState(isGooglePlacesEnabled);

  // Fetch availability categories on demand
  const fetchAvailability = async () => {
    if (dataFetched.availabilities) return;
    
    setIsLoading(true);
    try {
      const response = await getAvailabilityService();
      if (response.success && response.data) {
        const options = response.data.map(item => item.text);
        setAvailabilities(options);
        setDataFetched(prev => ({ ...prev, availabilities: true }));
      }
    } catch (error) {
      console.error('Error fetching availability options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvailabilityDropdown = async () => {
    const newState = !showAvailabilityDropdown;
    setShowAvailabilityDropdown(newState);
    
    if (newState) {
      await fetchAvailability();
    }
  };

  // Handle search change for airports
  const handleSearchChange = (id, e) => {
    const value = e.target.value;
    setSearchTerms(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Only perform airport search if value is long enough
    if (value.length >= 3) {
      searchAirportByITA(value);
    }
  };

  // Handle tail type selection
  const handleTailTypeSelect = (item) => {
    // Handle different formats based on whether it's a tail or type
    const displayValue = item.tail || item.name || '';
    setSelectedTailType(displayValue);
    
    // Clear validation error if it exists
    if (validationErrors.tailType) {
      setValidationErrors(prev => ({
        ...prev,
        tailType: false
      }));
    }
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
        flightCategory: '',
        currency: '',
        price: '',
        comments: ''
      };
      setFlightDetails([...flightDetails, newDetail]);
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

  const hasError = (detailId, fieldName) => {
    return validationErrors[detailId]?.[fieldName] === true;
  };

  // Simple validation function to use setValidationErrors
  const validateFields = () => {
    const errors = {};
    
    // Validate tail/type selection
    if (!selectedTailType) {
      errors.tailType = true;
    }
    
    flightDetails.forEach(detail => {
      errors[detail.id] = {};
      
      if (!detail.from) {
        errors[detail.id].from = true;
      }
      
      if (!detail.to) {
        errors[detail.id].to = true;
      }

      if (!detail.fromDateTime) {
        errors[detail.id].fromDateTime = true;
      }

      if (!detail.toDateTime) {
        errors[detail.id].toDateTime = true;
      }

      if (!detail.pax) {
        errors[detail.id].pax = true;
      }

      if (!detail.currency) {
        errors[detail.id].currency = true;
      }

      if (!detail.price) {
        errors[detail.id].price = true;
      }
    });
    
    setValidationErrors(errors);
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(detailErrors => 
      Object.values(detailErrors).some(error => error === true)
    ) || errors.tailType === true;
    
    // If no errors, prepare and notify form change
    if (!hasErrors) {
      prepareAndNotifyFormChange(flightDetails, true);
    }
  };

  const prepareAndNotifyFormChange = (updatedDetails = flightDetails, shouldSubmit = false) => {
    // Only prepare the data without submitting unless explicitly requested
    const itineraryData = {
      needs: false,
      aircraftcategory: availabilityCategory,
      tailType: selectedTailType, // Add selected tail or type
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
          currency: detail.currency || '',
          price: detail.price || '',
          comments: detail.comments || ''
        };

        return leg;
      })
    };

    // Only call onFormChange if shouldSubmit is true
    if (onFormChange && shouldSubmit) {
      onFormChange(itineraryData);
    }
  };

  const setAvailabilityCategoryWithNotify = (availability) => {
    setAvailabilityCategory(availability);
    setShowAvailabilityDropdown(false);
    
    // Clear search terms when switching modes
    setSearchTerms({});
  };

  // Add function to toggle Places/Airport mode
  const togglePlacesAirport = () => {
    const newMode = !usePlacesMode;
    setUsePlacesMode(newMode);
    toggleGooglePlaces(newMode);
  };

  // Add toggle function for tail/type mode
  const toggleTailTypeMode = () => {
    setIsTailMode(!isTailMode);
    setSelectedTailType('');
  };

  return (
    <div>
      <div className="relative ">
        <div className="flex flex-wrap justify-end items-center gap-4 mb-[-10px] z-10 relative">
          <button 
            className="px-6 py-2 bg-[#39B7FF] text-white rounded-md border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors w-[150px] hover:bg-[#2da8f0]"
            onClick={validateFields}
          >
            Post
          </button>
        </div>
        <div className="bg-[#f4f4f4] rounded-lg pt-8">
          <div className="px-6 pb-6">
            <div className="flex mb-1 items-center">
              <div className="w-[150px] mr-4">
                <div className="text-sm cursor-pointer flex items-center" onClick={toggleTailTypeMode}>
                  {isTailMode ? (
                    <span><span className="font-bold text-blue-600">Tail</span> / Type</span>
                  ) : (
                    <span>Tail / <span className="font-bold text-blue-600">Type</span></span>
                  )}
                  <span className="text-red-600 text-lg ml-1">*</span>
                </div>
              </div>
              <div className="w-[150px] mr-4">
                <div className="text-sm font-medium">
                  Availability
                  <span className="text-red-600 text-lg ml-1">*</span>
                </div>
              </div>
              <div className="w-[180px] mr-4">
                <div className="text-sm cursor-pointer flex items-center" onClick={togglePlacesAirport}>
                  {usePlacesMode ? (
                    <span><span className="font-bold text-blue-600">Places</span> / Airport</span>
                  ) : (
                    <span>Places / <span className="font-bold text-blue-600">Airport</span></span>
                  )}
                  <span className="text-red-600 text-lg ml-1">*</span>
                </div>
              </div>
              <div className="w-[180px] mr-4">
                <div className="text-sm cursor-pointer flex items-center" onClick={togglePlacesAirport}>
                  {usePlacesMode ? (
                    <span><span className="font-bold text-blue-600">Places</span> / Airport</span>
                  ) : (
                    <span>Places / <span className="font-bold text-blue-600">Airport</span></span>
                  )}
                  <span className="text-red-600 text-lg ml-1">*</span>
                </div>
              </div>
              <div className="w-[150px] mr-3">
                <div className="text-sm font-medium flex items-center">
                  Date From
                  <span className="text-red-600 text-lg ml-1">*</span>
                </div>
              </div>
              <div className="w-[150px] mr-3">
                <div className="text-sm font-medium flex items-center">
                  Date To
                  <span className="text-red-600 text-lg ml-1">*</span>
                </div>
              </div>
              <div className="w-[80px] mr-3">
                <div className="text-sm font-medium flex items-center">
                  Pax
                  <span className="text-red-600 text-lg ml-1">*</span>
                </div>
              </div>
              <div className="w-[80px] mr-3">
                <div className="text-sm font-medium">
                  Currency
                </div>
              </div>
              <div className="w-[80px]">
                <div className="text-sm font-medium">
                  Price
                </div>
              </div>
            </div>
            {flightDetails.map((detail) => (
              <div key={detail.id} className="mb-6">
                <div className="flex items-center">
                  {/* TailTypeDropdown - only show on first row */}
                  {detail.id === 1 && (
                    <div className="w-[150px] mr-4">
                      <TailTypeDropdown
                        selectedValue={selectedTailType}
                        onSelect={handleTailTypeSelect}
                        hasError={validationErrors.tailType}
                        isTailMode={isTailMode}
                      />
                    </div>
                  )}
                  {/* Add empty space for alignment on subsequent rows */}
                  {detail.id !== 1 && <div className="w-[150px] mr-4"></div>}
                  
                  <div className="w-[150px] mr-4 relative">
                    <button 
                      className={`px-2 py-2 border-2 ${validationErrors.availabilityCategory ? 'border-red-600 text-red-600' : 'border-black'} rounded-lg hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 flex items-center gap-2 w-full`}
                      onClick={handleAvailabilityDropdown}
                    >
                      <ListFilter className="w-4 h-4" />
                      {availabilityCategory}
                      <ChevronDown className="ml-1" size={16} />
                    </button>
                    {validationErrors.availabilityCategory && (
                      <div className="absolute left-0 -bottom-5 text-red-600 text-xs">Required field</div>
                    )}
                    
                    {showAvailabilityDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-[150px] bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {isLoading && !dataFetched.availabilities ? (
                          <div className="px-4 py-2 text-gray-500">Loading availability options...</div>
                        ) : availabilities.length > 0 ? (
                          availabilities.map((availability, index) => (
                            <div 
                              key={index} 
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                              onClick={() => setAvailabilityCategoryWithNotify(availability)}
                            >
                              {availability}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No availability options found</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-[180px] mr-4">
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
                  </div>
                  
                  <div className="w-[180px] mr-4">
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
                  </div>
                  
                  <div className="w-[150px] mr-4">
                    <DateAndTime
                      selected={detail.fromDateTime}
                      onChange={(date) => handleInputChange(detail.id, 'fromDateTime', date)}
                      placeholder="Date From"
                      hasError={hasError(detail.id, 'fromDateTime')}
                    />
                  </div>
                  
                  <div className="w-[150px] mr-4">
                    <DateAndTime
                      selected={detail.toDateTime}
                      onChange={(date) => handleInputChange(detail.id, 'toDateTime', date)}
                      placeholder="Date To"
                      hasError={hasError(detail.id, 'toDateTime')}
                    />
                  </div>
                  
                  <div className="w-[80px] mr-4">
                    <div className={`w-full border-2 ${hasError(detail.id, 'pax') ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}>
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
                  </div>
                  
                  <div className="w-[80px] mr-4">
                    <div className={`w-full border-2 ${hasError(detail.id, 'currency') ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}>
                      <input
                        type="text"
                        placeholder="Currency"
                        value={detail.currency}
                        onChange={(e) => handleInputChange(detail.id, 'currency', e.target.value)}
                        className="w-full border-none outline-none px-2 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
                      />
                    </div>
                  </div>
                  
                  <div className="w-[80px]">
                    <div className={`w-full border-2 ${hasError(detail.id, 'price') ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}>
                      <input
                        type="text"
                        placeholder="Price"
                        value={detail.price}
                        onChange={(e) => handleInputChange(detail.id, 'price', e.target.value)}
                        className="w-full border-none outline-none px-2 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
                      />
                    </div>
                  </div>
                  
                  {detail.id === flightDetails.length && (
                    <button 
                      onClick={addFlightDetail}
                      className="ml-2 p-1 bg-green-500 text-white hover:bg-green-600 rounded-full transition-colors"
                      title="Add another flight"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* Comments row below the main row */}
                <div className="flex items-center mt-2">
                  {/* Space before comments to align with Pax field */}
                  <div className="flex-grow" style={{ width: 'calc(150px + 180px + 180px + 150px + 150px)' }}></div>
                  <div className="w-[240px]"> {/* Combined width of Pax, Currency and Price (80px each) */}
                    <div className={`w-full border-2 border-black rounded bg-white text-black`}>
                      <textarea
                        placeholder="Comments"
                        value={detail.comments || ''}
                        onChange={(e) => handleInputChange(detail.id, 'comments', e.target.value)}
                        className="w-full border-none outline-none px-2 py-[0.375rem] text-sm bg-transparent placeholder-gray-500 resize-none"
                        rows="2"
                      />
                    </div>
                  </div>
                  <div style={{ width: '30px' }}></div> {/* Space for the add button on last row */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

PostForm.propTypes = {
  onFormChange: PropTypes.func
};

export default PostForm;
