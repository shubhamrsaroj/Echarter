import React, { useState, useEffect, useCallback } from 'react';
import {
  GoogleMap,
  Polyline,
  Marker,
  useLoadScript,
} from '@react-google-maps/api';

const RouteMap = ({ itineraryData }) => {
  const [map, setMap] = useState(null);
  const [flightPaths, setFlightPaths] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  const mapContainerStyle = {
    width: '100%',
    height: '300px', // Slightly increased height for better visibility
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
  });

  const calculateCurvedPath = useCallback((start, end) => {
    try {
      const steps = 32;
      const midPoint = {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2,
      };

      const dx = end.lat - start.lat;
      const dy = end.lng - start.lng;
      const straightDistance = Math.sqrt(dx * dx + dy * dy);
      
      // Adjusting curve height for more elegant arcs
      const curveHeight = straightDistance * 0.15;

      const perpX = -dy;
      const perpY = dx;
      const length = Math.sqrt(perpX * perpX + perpY * perpY);
      const controlPoint = {
        lat: midPoint.lat + (perpX / length) * curveHeight,
        lng: midPoint.lng + (perpY / length) * curveHeight,
      };

      const pathPoints = Array.from({ length: steps + 1 }, (_, i) => {
        const t = i / steps;
        return {
          lat:
            Math.pow(1 - t, 2) * start.lat +
            2 * (1 - t) * t * controlPoint.lat +
            Math.pow(t, 2) * end.lat,
          lng:
            Math.pow(1 - t, 2) * start.lng +
            2 * (1 - t) * t * controlPoint.lng +
            Math.pow(t, 2) * end.lng,
        };
      });

      return pathPoints;
    } catch (error) {
      console.error('Error in calculateCurvedPath:', error);
      return [];
    }
  }, []);

  const processFlightPaths = useCallback(() => {
    if (!itineraryData?.flights?.length) {
      console.log('No flight data available');
      return;
    }

    try {
      if (!window.google) {
        console.error('Google Maps not loaded');
        setError('Google Maps failed to load');
        return;
      }

      const newBounds = new window.google.maps.LatLngBounds();
      const paths = [];

      itineraryData.flights.forEach((flight, i) => {
        if (
          !flight.fromCoordinates?.lat ||
          !flight.fromCoordinates?.long ||
          !flight.toCoordinates?.lat ||
          !flight.toCoordinates?.long
        ) {
          console.error('Invalid coordinates for flight:', flight);
          return;
        }

        const fromCoords = {
          lat: Number(flight.fromCoordinates.lat),
          lng: Number(flight.fromCoordinates.long),
        };

        const toCoords = {
          lat: Number(flight.toCoordinates.lat),
          lng: Number(flight.toCoordinates.long),
        };

        newBounds.extend(
          new window.google.maps.LatLng(fromCoords.lat, fromCoords.lng)
        );
        newBounds.extend(
          new window.google.maps.LatLng(toCoords.lat, toCoords.lng)
        );

        const pathPoints = calculateCurvedPath(fromCoords, toCoords);

        paths.push({
          points: pathPoints,
          from: fromCoords,
          to: toCoords,
          fromCode: flight.from || 'FROM',
          toCode: flight.to || 'TO',
          index: i,
        });
      });

      setFlightPaths(paths);
      setBounds(newBounds);

      // Add padding to the bounds for better aesthetics
      if (map && newBounds) {
        map.fitBounds(newBounds, { padding: { top: 30, right: 30, bottom: 30, left: 30 } });
      }
    } catch (error) {
      console.error('Error processing flight paths:', error);
      setError('Error processing flight data');
    } finally {
      setIsLoading(false);
    }
  }, [itineraryData, map, calculateCurvedPath]);

  useEffect(() => {
    if (isLoaded && itineraryData?.flights?.length) {
      processFlightPaths();
    }
  }, [isLoaded, itineraryData, processFlightPaths]);

  const onMapLoad = useCallback((mapInstance) => {
    console.log('Map loaded');
    setMap(mapInstance);
    setIsLoading(false);
  }, []);

  if (loadError || error) return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 w-full">
      <div className="h-[300px] flex items-center justify-center text-gray-600 font-medium">
        {loadError || error}
      </div>
    </div>
  );

  if (!isLoaded || isLoading) return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 w-full">
      <div className="h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-pulse rounded-full h-12 w-12 border-4 border-t-black border-r-gray-200 border-b-gray-200 border-l-gray-200"></div>
          <p className="mt-3 text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    </div>
  );

  if (!itineraryData?.flights?.length) return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 w-full">
      <div className="h-[300px] flex items-center justify-center text-gray-600 font-medium">
        No flight route data available
      </div>
    </div>
  );


  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Flight Route</h2>
      <div className="relative rounded-md overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={4}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#000000" }]
              },
              {
                featureType: "administrative",
                elementType: "geometry.stroke",
                stylers: [{ color: "#000000" }, { weight: 0.5 }]
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }]
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#76b6c4" }]
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#dddddd" }]
              },
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "transit",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {flightPaths.map((path) => (
            <React.Fragment key={path.index}>  
              <Polyline
                path={path.points}
                options={{
                  strokeColor: '#000000',
                  strokeWeight: 2,
                  strokeOpacity: 0.8,
                  geodesic: false,
                  icons: [{
                    icon: {
                      path: window.google?.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                      scale: 3,
                      fillColor: '#000000',
                      fillOpacity: 1,
                      strokeColor: '#000000',
                      strokeWeight: 1,
                    },
                    offset: '50%',
                    repeat: null 
                  }]
                }}
              />
              {/* Add markers for airports with custom styling */}
              <Marker
                position={path.from}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 5,
                  fillColor: '#000000',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2
                }}
                title={path.fromCode}
                label={{
                  text: path.fromCode,
                  color: '#000000',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              />
              <Marker
                position={path.to}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 5,
                  fillColor: '#000000',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2
                }}
                title={path.toCode}
                label={{
                  text: path.toCode,
                  color: '#000000',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              />
            </React.Fragment>
          ))}
        </GoogleMap>
      </div>
    </div>
  );
};

export default RouteMap;