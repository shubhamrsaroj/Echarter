import PropTypes from 'prop-types';
import { useState, useContext, useCallback, useEffect, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { SellerMarketContext } from '../../../../../context/seller-market/SellerMarketContext';
import { AutoComplete } from 'primereact/autocomplete';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const AirpotSelector = ({ 
  id, 
  selectedAirport, 
  searchTerm, 
  handleSearchChange, 
  airports, 
  airportLoading, 
  airportError,
  onSelectAirport,
  placeholder,
  hasError,
  height
}) => {
  const [sessionToken, setSessionToken] = useState(null);
  const [displayValue, setDisplayValue] = useState(selectedAirport || '');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [hasSelected, setHasSelected] = useState(!!selectedAirport);
  const { isGooglePlacesEnabled } = useContext(SellerMarketContext);
  const autoCompleteRef = useRef(null);
  const userTypingRef = useRef(false);
  
  // Determine if this is a "from" or "to" field based on the id
  const isFromField = id.toString().includes('_from');

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });
  
  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
    }
  }, [isLoaded]);

  // Update display value when selectedAirport changes
  useEffect(() => {
    setDisplayValue(selectedAirport || '');
    // Set hasSelected based on whether selectedAirport has a value
    setHasSelected(!!selectedAirport);
  }, [selectedAirport]);

  // Direct reaction to airports prop changes - ONLY show dropdown if user is actively typing
  useEffect(() => {
    if (!isGooglePlacesEnabled && airports && currentQuery && !hasSelected) {
      // Extract airport data, handling both array and object formats
      const airportData = Array.isArray(airports) ? airports : 
                         (airports.data ? airports.data : []);
      
      if (airportData.length > 0) {
        // Case insensitive search
        const queryLower = currentQuery.toLowerCase();
        
        // Filter with priority to ICAO codes
        const filteredAirports = airportData.filter(airport => {
          // Check for exact ICAO match
          if (airport.icao && airport.icao.toLowerCase() === queryLower) {
            return true;
          }
          
          // Check for exact IATA match
          if (airport.iata && airport.iata.toLowerCase() === queryLower) {
            return true;
          }
          
          // Check for partial ICAO match
          if (airport.icao && airport.icao.toLowerCase().includes(queryLower)) {
            return true;
          }
          
          // Check for partial IATA match
          if (airport.iata && airport.iata.toLowerCase().includes(queryLower)) {
            return true;
          }
          
          // Check city name
          if (airport.city && airport.city.toLowerCase().includes(queryLower)) {
            return true;
          }
          
          // Check airport name
          if (airport.airportName && airport.airportName.toLowerCase().includes(queryLower)) {
            return true;
          }
          
          return false;
        });
        
        // Sort results with priority to exact matches
        filteredAirports.sort((a, b) => {
          // Exact ICAO match gets highest priority
          if (a.icao && a.icao.toLowerCase() === queryLower) return -1;
          if (b.icao && b.icao.toLowerCase() === queryLower) return 1;
          
          // Exact IATA match gets next priority
          if (a.iata && a.iata.toLowerCase() === queryLower) return -1;
          if (b.iata && b.iata.toLowerCase() === queryLower) return 1;
          
          return 0;
        });
        
        if (filteredAirports.length > 0) {
          // Update the filtered suggestions
          setFilteredSuggestions(filteredAirports);
          
          // Show dropdown if we have results and user is typing
          if (userTypingRef.current && autoCompleteRef.current) {
            setTimeout(() => {
              try {
                autoCompleteRef.current.show();
              } catch {
                // Error handling without console.error
              }
            }, 0);
          }
        }
      }
    }
  }, [airports, isGooglePlacesEnabled, currentQuery, hasSelected]);

  const getPlaceDetails = useCallback((placeId) => {
    if (!window.google) return null;

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    return new Promise((resolve, reject) => {
      service.getDetails({
        placeId: placeId,
        fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id', 'utc_offset'],
        sessionToken: sessionToken
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error('Failed to get place details'));
        }
      });
    });
  }, [sessionToken]);

  const processPlace = useCallback((place) => {
    if (!place || !place.geometry) {
      return;
    }

    // Extract address components
    const addressComponents = place.address_components || [];
    
    // Get the most specific name first
    const locality = addressComponents.find(c => c.types.includes('sublocality_level_1'))?.long_name
      || addressComponents.find(c => c.types.includes('locality'))?.long_name
      || '';
    
    const city = addressComponents.find(c => c.types.includes('locality'))?.long_name
      || addressComponents.find(c => c.types.includes('administrative_area_level_2'))?.long_name
      || '';
      
    const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
    const country = addressComponents.find(c => c.types.includes('country'))?.long_name || 'India';

    // Check if it's an airport
    const isAirport = place.name.toLowerCase().includes('airport') || 
                     place.formatted_address.toLowerCase().includes('airport');

    // Create a display name that includes important location details
    const displayName = [
      place.name,
      city && city !== place.name ? city : '',
      state && state !== city ? state : '',
      country === 'India' ? '' : country
    ].filter(Boolean).join(', ');

    const placeData = {
      ...place,
      airportName: displayName,
      iata: isAirport ? place.name.match(/\(([^)]+)\)/)?.[1] || '' : '',
      city: city || locality || place.name,
      state: state,
      country: country,
      formatted_address: place.formatted_address,
      utc_offset: place.utc_offset || 330,
      utc_offset_minutes: place.utc_offset_minutes,
      shiftMins: place.utc_offset || place.utc_offset_minutes,
      geometry: place.geometry,
      name: place.name,
      lat: place.geometry.location.lat(),
      long: place.geometry.location.lng()
    };

    setDisplayValue(displayName);
    setHasSelected(true);
    userTypingRef.current = false;
    onSelectAirport(id, placeData);
    
    // Close dropdown if it's open
    if (autoCompleteRef.current) {
      autoCompleteRef.current.hide();
    }
    
    // Generate a new session token after successful selection
    if (window.google?.maps?.places) {
      setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
    }
  }, [id, onSelectAirport]);

  const handleAirportSearch = (event) => {
    const query = event.query;
    
    // Always set userTypingRef to true when user is typing in the search box
    userTypingRef.current = true;
    setCurrentQuery(query);
    
    // Only reset hasSelected if the user is typing a new query
    if (query && query !== displayValue) {
      setHasSelected(false);
    }
    
    // Update the search term in the parent component
    if (handleSearchChange) {
      handleSearchChange({ target: { value: query } });
    }
    
    // Clear suggestions if query is too short
    if (!query || query.length < 2) {
      setFilteredSuggestions([]);
      return;
    }
    
    // Get airport data safely, whether the input is an array or an object with a data property
    const airportData = Array.isArray(airports) ? airports : airports?.data || [];
    
    // Filter airports based on the query
    if (!isGooglePlacesEnabled && airportData.length > 0) {
      const lowercaseQuery = query.toLowerCase();
      const filtered = airportData.filter(airport => 
        (airport.iata && airport.iata.toLowerCase().includes(lowercaseQuery)) ||
        (airport.icao && airport.icao.toLowerCase().includes(lowercaseQuery)) ||
        (airport.city && airport.city.toLowerCase().includes(lowercaseQuery)) ||
        (airport.airportName && airport.airportName.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const handleGooglePlaceSearch = async (event) => {
    const query = event.query;
    
    // Always set userTypingRef to true when user is typing in the search box
    userTypingRef.current = true;
    setCurrentQuery(query);
    
    // Only reset hasSelected if the user is typing a new query
    if (query && query !== displayValue) {
      setHasSelected(false);
    }
    
    if (!query || query.length < 2 || !isLoaded || !window.google || !window.google.maps || !window.google.maps.places) {
      setFilteredSuggestions([]);
      return;
    }
    
    try {
      const predictions = await new Promise((resolve) => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({
          input: query,
          types: ['(cities)'], // Restrict to only cities
          sessionToken: sessionToken
        }, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(predictions);
          } else {
            resolve([]);
          }
        });
      });
      
      setFilteredSuggestions(predictions);
    } catch {
      // Error handling without console.error
      setFilteredSuggestions([]);
    }
  };

  const handlePlaceSelect = async (event) => {
    const selectedPlace = event.value;
    
    if (!selectedPlace || !selectedPlace.place_id) return;
    
    try {
      const placeDetails = await getPlaceDetails(selectedPlace.place_id);
      if (placeDetails) {
        processPlace(placeDetails);
        // Close dropdown after selection
        if (autoCompleteRef.current) {
          autoCompleteRef.current.hide();
        }
      }
    } catch {
      // Error handling without console.error
    }
  };

  const handleAirportSelect = (event) => {
    const airport = event.value;
    if (airport) {
      setHasSelected(true);
      userTypingRef.current = false;
      onSelectAirport(id, airport);
      // Close dropdown after selection
      if (autoCompleteRef.current) {
        autoCompleteRef.current.hide();
      }
    }
  };

  // Handle blur event to ensure dropdown doesn't show when clicking away and back
  const handleBlur = () => {
    userTypingRef.current = false;
  };

  // Handle focus - show dropdown if there are suggestions and user is typing
  const handleFocus = () => {
    // Never show dropdown on focus if we already have a selection
    if (hasSelected || displayValue) {
      return;
    }

    // Show dropdown if we have suggestions and user is actively typing
    if (filteredSuggestions.length > 0 && currentQuery && currentQuery.length >= 2) {
      userTypingRef.current = true;
      if (autoCompleteRef.current) {
        setTimeout(() => {
          try {
            autoCompleteRef.current.show();
          } catch {
            // Error handling without console.error
          }
        }, 0);
      }
    }
  };

  // Helper function to format airport item in dropdown
  const airportItemTemplate = (airport) => {
    // Create a more comprehensive display for airports
    const iataDisplay = airport.iata ? `(${airport.iata})` : '';
    
    // Format the city and country
    const cityCountry = airport.city && airport.country 
      ? `${airport.city}, ${airport.country}` 
      : airport.city || airport.country || '';
    
    return (
      <div className="flex flex-col py-1">
        <div className="font-medium">
          {airport.airportName || airport.name} {iataDisplay}
        </div>
        <div className="text-xs text-gray-600 flex justify-between">
          <span>{cityCountry}</span>
        </div>
      </div>
    );
  };

  const googlePlaceItemTemplate = (prediction) => {
    // Extract just the main city/place name from the prediction
    // For airports, we'll still show the full name
    const isAirport = prediction.description && 
      (prediction.description.toLowerCase().includes('airport') || 
       (prediction.structured_formatting?.main_text && 
        prediction.structured_formatting.main_text.toLowerCase().includes('airport')));
    
    if (isAirport) {
      // For airports, keep the full description
      return (
        <div>
          <div className="font-medium">{prediction.description || prediction.structured_formatting?.main_text}</div>
        </div>
      );
    } else {
      // For non-airports, just show the main text (city name)
      const mainText = prediction.structured_formatting?.main_text || 
                      prediction.description?.split(',')[0] || 
                      prediction.description;
      
      return (
        <div>
          <div className="font-medium">{mainText}</div>
        </div>
      );
    }
  };

  // Define custom styles with height if provided
  const customStyles = height ? { height, width: '100%' } : { width: '100%' };
  const customInputStyles = height ? { height: '100%', width: '100%' } : { width: '100%' };

  if (isGooglePlacesEnabled) {
    if (!GOOGLE_MAPS_API_KEY) {
      return (
        <div className="relative">
          <div 
            className={`w-full border-2 ${hasError ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}
            style={customStyles}
          >
            <div className="flex items-center h-full">
              <i className="pi pi-map-marker text-gray-600 ml-3"></i>
              <input 
                className="w-full border-none outline-none px-3 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
                placeholder="Google Maps API key is missing"
                disabled
                style={customInputStyles}
              />
            </div>
          </div>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="relative">
          <div 
            className={`w-full border-2 ${hasError ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}
            style={customStyles}
          >
            <div className="flex items-center h-full">
              <i className="pi pi-map-marker text-gray-600 ml-3"></i>
              <input 
                className="w-full border-none outline-none px-3 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
                placeholder="Error loading Google Maps"
                disabled
                style={customInputStyles}
              />
            </div>
          </div>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="relative">
          <div 
            className={`w-full border-2 ${hasError ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}
            style={customStyles}
          >
            <div className="flex items-center h-full">
              <i className="pi pi-map-marker text-gray-600 ml-3"></i>
              <input 
                className="w-full border-none outline-none px-3 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
                placeholder="Loading Google Maps..."
                disabled
                style={customInputStyles}
              />
            </div>
          </div>
        </div>
      );
    }

    // PrimeReact AutoComplete with Google Places
    return (
      <div className="relative w-full">
        <span className={`p-input-icon-left w-full ${hasError ? 'p-error' : ''}`}>
          <i className={`pi ${isFromField ? 'pi-send' : 'pi-map-marker'}`}></i>
          <AutoComplete
            ref={autoCompleteRef}
            value={displayValue}
            suggestions={filteredSuggestions}
            completeMethod={handleGooglePlaceSearch}
            onChange={(e) => {
              setDisplayValue(e.value);
              if (e.value === '') {
                setHasSelected(false);
                userTypingRef.current = true;
              } else if (displayValue && e.value === displayValue) {
                // If the value hasn't changed and we already have a display value,
                // maintain the selected state
                setHasSelected(true);
                userTypingRef.current = false;
              }
            }}
            onSelect={handlePlaceSelect}
            field="description"
            itemTemplate={googlePlaceItemTemplate}
            placeholder={placeholder || "Search for airports..."}
            className={`w-full ${hasError ? 'p-invalid' : ''}`}
            style={customStyles}
            inputStyle={customInputStyles}
            pt={{
              root: { className: 'h-full w-full' },
              input: { className: 'h-full w-full' },
              container: { className: 'h-full w-full' },
              dropdownButton: { className: 'bg-transparent' }
            }}
            minLength={2}
            delay={300}
            onFocus={handleFocus}
            onBlur={handleBlur}
            dropdown
          />
        </span>
        {hasError && (
          <div className="text-red-600 text-xs mt-1">Required field</div>
        )}
      </div>
    );
  }

  // PrimeReact AutoComplete with custom airport data
  return (
    <div className="relative w-full">
      <span className={`p-input-icon-left w-full ${hasError ? 'p-error' : ''}`}>
        <i className={`pi ${isFromField ? 'pi-send' : 'pi-map-marker'}`}></i>
        <AutoComplete
          ref={autoCompleteRef}
          value={displayValue || searchTerm}
          suggestions={filteredSuggestions}
          completeMethod={handleAirportSearch}
          onChange={(e) => {
            setDisplayValue(e.value);
            if (e.value === '') {
              setHasSelected(false);
              userTypingRef.current = true;
            } else if (displayValue && e.value === displayValue) {
              // If the value hasn't changed and we already have a display value,
              // maintain the selected state
              setHasSelected(true);
              userTypingRef.current = false;
            }
            if (handleSearchChange) {
              handleSearchChange({ target: { value: e.value } });
            }
          }}
          onSelect={handleAirportSelect}
          field="airportName"
          itemTemplate={airportItemTemplate}
          placeholder={placeholder || "Search airport..."}
          className={`w-full ${hasError ? 'p-invalid' : ''}`}
          loading={airportLoading ? "true" : undefined}
          style={customStyles}
          inputStyle={customInputStyles}
          pt={{
            root: { className: 'h-full w-full' },
            input: { className: 'h-full w-full' },
            container: { className: 'h-full w-full' },
            dropdownButton: { className: 'bg-transparent' }
          }}
          minLength={2}
          delay={300}
          forceSelection={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          dropdown
          appendTo="self"
        />
      </span>
      {hasError && (
        <div className="text-red-600 text-xs mt-1">Required field</div>
      )}
      {airportError && (
        <div className="text-red-600 text-xs mt-1">Error loading airports</div>
      )}
    </div>
  );
};

AirpotSelector.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  selectedAirport: PropTypes.string,
  searchTerm: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  airports: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({
      airportName: PropTypes.string,
      iata: PropTypes.string,
      city: PropTypes.string,
      country: PropTypes.string
    })),
    PropTypes.shape({
      data: PropTypes.arrayOf(PropTypes.shape({
        airportName: PropTypes.string,
        iata: PropTypes.string,
        city: PropTypes.string,
        country: PropTypes.string
      }))
    })
  ]),
  airportLoading: PropTypes.bool,
  airportError: PropTypes.any,
  onSelectAirport: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  hasError: PropTypes.bool,
  height: PropTypes.string
};

export default AirpotSelector;