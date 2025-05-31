import { Search, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useContext, useCallback, useEffect } from 'react';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import { SellerMarketContext } from '../../../../../context/seller-market/SellerMarketContext';

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
  hasError
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [displayValue, setDisplayValue] = useState(selectedAirport || '');
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

  const handlePlaceSelect = useCallback(async () => {
    if (!autocomplete) {
      return;
    }

    try {
      const place = autocomplete.getPlace();

      if (!place || !place.place_id) {
        // If we don't have full place details, try to get them
        const predictions = await new Promise((resolve) => {
          const service = new window.google.maps.places.AutocompleteService();
          service.getPlacePredictions({
            input: searchTerm,
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

        if (predictions && predictions.length > 0) {
          const details = await getPlaceDetails(predictions[0].place_id);
          if (details) {
            processPlace(details);
          }
        }
        return;
      }

      processPlace(place);

    } catch {
      // Silently handle error
    }
  }, [autocomplete, searchTerm, sessionToken, getPlaceDetails]);

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
    setIsSearching(false);
    
    // Generate a new session token after successful selection
    if (window.google?.maps?.places) {
      setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
    }
  }, [id, onSelectAirport]);

  const handleAutocompleteLoad = useCallback((auto) => {
    setAutocomplete(auto);
  }, []);

  // Helper function to format airport display in dropdown
  const formatAirportDisplay = (airport) => {
    const cityCountry = airport.city && airport.country 
      ? `${airport.city}, ${airport.country}` 
      : airport.city || airport.country || '';
    
    return (
      <div>
        <div className="font-medium">{airport.airportName} ({airport.iata})</div>
        {cityCountry && <div className="text-xs text-gray-600">{cityCountry}</div>}
      </div>
    );
  };

  // Get airport data safely, whether the input is an array or an object with a data property
  const airportData = Array.isArray(airports) ? airports : airports?.data || [];

  if (isGooglePlacesEnabled) {
    if (!GOOGLE_MAPS_API_KEY) {
      return (
        <div className="relative">
          <div className={`w-full border-2 ${hasError ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}>
            <div className="flex items-center h-[36px]">
              <IconComponent className={`w-4 h-4 text-gray-600 ml-3`} />
              <input 
                className="w-full border-none outline-none px-3 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
                placeholder="Google Maps API key is missing"
                disabled
              />
            </div>
          </div>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="relative">
          <div className={`w-full border-2 ${hasError ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}>
            <div className="flex items-center h-[36px]">
              <IconComponent className={`w-4 h-4 text-gray-600 ml-3`} />
              <input 
                className="w-full border-none outline-none px-3 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
                placeholder="Error loading Google Maps"
                disabled
              />
            </div>
          </div>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="relative">
          <div className={`w-full border-2 ${hasError ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}>
            <div className="flex items-center h-[36px]">
              <IconComponent className={`w-4 h-4 text-gray-600 ml-3`} />
              <input 
                className="w-full border-none outline-none px-3 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
                placeholder="Loading Google Maps..."
                disabled
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className={`w-full border-2 ${hasError ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}>
          <Autocomplete
            onLoad={handleAutocompleteLoad}
            onPlaceChanged={handlePlaceSelect}
            options={{
              types: ['establishment', 'geocode'],
              fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id', 'utc_offset'],
              sessionToken: sessionToken
            }}
          >
            <div className="flex items-center h-[36px]">
              <IconComponent className={`w-4 h-4 text-gray-600 ml-3`} />
              <input
                type="text"
                className="w-full border-none outline-none px-3 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
                placeholder={placeholder || "Search for airports..."}
                value={displayValue}
                onChange={(e) => {
                  setDisplayValue(e.target.value);
                  if (handleSearchChange) {
                    handleSearchChange(e);
                  }
                }}
                onFocus={() => setIsSearching(true)}
              />
            </div>
          </Autocomplete>
        </div>
        {hasError && (
          <div className="text-red-600 text-xs mt-1">Required field</div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`w-full border-2 ${hasError ? 'border-red-600 bg-red-50' : 'border-black'} rounded bg-white text-black`}>
        <div className="flex items-center h-[36px]">
          <IconComponent className="w-4 h-4 text-gray-600 ml-3" />
          {!isSearching && selectedAirport ? (
            <div 
              className="w-full cursor-text truncate px-3 py-[0.375rem] text-sm"
              onClick={() => setIsSearching(true)}
            >
              {selectedAirport}
            </div>
          ) : (
            <input 
              className="w-full border-none outline-none px-3 py-[0.375rem] text-sm bg-transparent placeholder-gray-500"
              placeholder={placeholder || "Search airport..."}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setIsSearching(true)}
              onBlur={(e) => {
                setTimeout(() => {
                  if (!e.relatedTarget?.closest('.airport-suggestions')) {
                    setIsSearching(false);
                  }
                }, 200);
              }}
            />
          )}
        </div>
      </div>
      {hasError && (
        <div className="text-red-600 text-xs mt-1">Required field</div>
      )}
      {(isSearching && (searchTerm.length >= 3 || airportLoading || airportError)) && (
        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border-2 border-black rounded shadow-lg airport-suggestions">
          {airportLoading ? (
            <div className="p-2 text-center">Loading...</div>
          ) : airportError ? (
            <div className="p-2 text-center text-red-500">Error loading airports</div>
          ) : (
            airportData.length > 0 ? (
              airportData.map((airport, index) => (
                <div 
                  key={index} 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onSelectAirport(id, airport);
                    setIsSearching(false);
                  }}
                  tabIndex={0}
                >
                  {formatAirportDisplay(airport)}
                </div>
              ))
            ) : (
              <div className="p-2 text-center">No airports found</div>
            )
          )}
        </div>
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
  hasError: PropTypes.bool
};

export default AirpotSelector;