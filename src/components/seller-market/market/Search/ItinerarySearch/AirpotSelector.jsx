import { PlaneTakeoff, PlaneLanding } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useContext, useCallback, useEffect } from 'react';
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
  const { isGooglePlacesEnabled } = useContext(SellerMarketContext);
  
  // Determine if this is a "from" or "to" field based on the id
  const isFromField = id.toString().includes('_from');
  const IconComponent = isFromField ? PlaneTakeoff : PlaneLanding;

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
  }, [selectedAirport]);

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
      shiftMins: place.utc_offset || place.utc_offset_minutes ,
      geometry: place.geometry,
      name: place.name,
      lat: place.geometry.location.lat(),
      long: place.geometry.location.lng()
    };

    setDisplayValue(displayName);
    onSelectAirport(id, placeData);
    
    // Generate a new session token after successful selection
    if (window.google?.maps?.places) {
      setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
    }
  }, [id, onSelectAirport]);

  const handleGooglePlaceSearch = async (event) => {
    const query = event.query;
    
    if (!query || query.length < 2 || !isLoaded || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }
    
    try {
      const predictions = await new Promise((resolve) => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({
          input: query,
          types: ['establishment', 'geocode'],
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
    } catch (error) {
      console.error('Error fetching place predictions:', error);
    }
  };

  const handlePlaceSelect = async (event) => {
    const selectedPlace = event.value;
    
    if (!selectedPlace || !selectedPlace.place_id) return;
    
    try {
      const placeDetails = await getPlaceDetails(selectedPlace.place_id);
      if (placeDetails) {
        processPlace(placeDetails);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const handleAirportSearch = (event) => {
    const query = event.query;
    
    // Update the search term in the parent component
    if (handleSearchChange) {
      handleSearchChange({ target: { value: query } });
    }
    
    // Get airport data safely, whether the input is an array or an object with a data property
    const airportData = Array.isArray(airports) ? airports : airports?.data || [];
    
    // Filter airports based on the query
    if (query.length >= 2 && !isGooglePlacesEnabled) {
      setFilteredSuggestions(airportData);
    } else {
      setFilteredSuggestions([]);
    }
  };
  
  const handleAirportSelect = (event) => {
    const airport = event.value;
    if (airport) {
      onSelectAirport(id, airport);
    }
  };

  // Helper function to format airport item in dropdown
  const airportItemTemplate = (airport) => {
    const cityCountry = airport.city && airport.country 
      ? `${airport.city}, ${airport.country}` 
      : airport.city || airport.country || '';
    
    return (
      <div>
        <div className="font-medium">{airport.airportName || airport.name} {airport.iata ? `(${airport.iata})` : ''}</div>
        {cityCountry && <div className="text-xs text-gray-600">{cityCountry}</div>}
      </div>
    );
  };

  const googlePlaceItemTemplate = (prediction) => {
    return (
      <div>
        <div className="font-medium">{prediction.description || prediction.structured_formatting?.main_text}</div>
        {prediction.structured_formatting?.secondary_text && (
          <div className="text-xs text-gray-600">{prediction.structured_formatting.secondary_text}</div>
        )}
      </div>
    );
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
              <IconComponent className={`w-4 h-4 text-gray-600 ml-3`} />
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
              <IconComponent className={`w-4 h-4 text-gray-600 ml-3`} />
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
              <IconComponent className={`w-4 h-4 text-gray-600 ml-3`} />
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
          <IconComponent className="pi-icon-left" />
          <AutoComplete
            value={displayValue}
            suggestions={filteredSuggestions}
            completeMethod={handleGooglePlaceSearch}
            onChange={(e) => setDisplayValue(e.value)}
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
              container: { className: 'h-full w-full' }
            }}
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
        <IconComponent className="pi-icon-left" />
        <AutoComplete
          value={displayValue || searchTerm}
          suggestions={filteredSuggestions}
          completeMethod={handleAirportSearch}
          onChange={(e) => {
            setDisplayValue(e.value);
            if (handleSearchChange) {
              handleSearchChange({ target: { value: e.value } });
            }
          }}
          onSelect={handleAirportSelect}
          field="airportName"
          itemTemplate={airportItemTemplate}
          placeholder={placeholder || "Search airport..."}
          className={`w-full ${hasError ? 'p-invalid' : ''}`}
          loading={airportLoading ? airportLoading.toString() : undefined}
          style={customStyles}
          inputStyle={customInputStyles}
          pt={{
            root: { className: 'h-full w-full' },
            input: { className: 'h-full w-full' },
            container: { className: 'h-full w-full' }
          }}
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