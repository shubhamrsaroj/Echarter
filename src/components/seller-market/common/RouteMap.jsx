import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import PropTypes from 'prop-types';

const RouteMap = ({ itineraryData, hoveredFlightCoords, tailMarkers }) => {
  const [map, setMap] = useState(null);
  const [flightPaths, setFlightPaths] = useState([]);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const hoveredPathRef = useRef(null);
  const hoveredFromMarkerRef = useRef(null);
  const hoveredToMarkerRef = useRef(null);
  const hoveredFromLabelRef = useRef(null);
  const hoveredToLabelRef = useRef(null);
  const polylineRefs = useRef([]);
  const tailMarkerRefs = useRef([]);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  const mapContainerStyle = {
    width: '100%',
    height: '280px',
    margin: '0',
    padding: '0',
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
  });

  const calculateCurvedPath = useCallback((start, end) => {
    try {
      if (isNaN(start.lat) || isNaN(start.lng) || isNaN(end.lat) || isNaN(end.lng)) {
        return [start, end];
      }

      const steps = 32;
      const midPoint = {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2,
      };

      const dx = end.lat - start.lat;
      const dy = end.lng - start.lng;
      const straightDistance = Math.sqrt(dx * dx + dy * dy);
      const curveHeight = straightDistance * 0.1;

      const perpX = -dy;
      const perpY = dx;
      const length = Math.sqrt(perpX * perpX + perpY * perpY);

      if (length === 0 || !isFinite(length)) {
        return [start, end];
      }

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
    } catch {
      return [start, end];
    }
  }, []);

  const processFlightPaths = useCallback(() => {
    if (!itineraryData?.flights?.length) {
      return;
    }

    try {
      if (!window.google) {
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

        if (
          isNaN(fromCoords.lat) ||
          isNaN(fromCoords.lng) ||
          isNaN(toCoords.lat) ||
          isNaN(toCoords.lng)
        ) {
          return;
        }

        newBounds.extend(new window.google.maps.LatLng(fromCoords.lat, fromCoords.lng));
        newBounds.extend(new window.google.maps.LatLng(toCoords.lat, toCoords.lng));

        const pathPoints = calculateCurvedPath(fromCoords, toCoords);

        if (!pathPoints || pathPoints.length === 0) {
          return;
        }

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

      if (map && newBounds) {
        map.fitBounds(newBounds, { padding: { top: 30, right: 30, bottom: 30, left: 30 } });
      }
    } catch {
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

  useEffect(() => {
    if (!hoveredFlightCoords) {
      if (hoveredPathRef.current) {
        hoveredPathRef.current.setMap(null);
        hoveredPathRef.current = null;
      }
      if (hoveredFromMarkerRef.current) {
        hoveredFromMarkerRef.current.setMap(null);
        hoveredFromMarkerRef.current = null;
      }
      if (hoveredToMarkerRef.current) {
        hoveredToMarkerRef.current.setMap(null);
        hoveredToMarkerRef.current = null;
      }
      if (hoveredFromLabelRef.current) {
        hoveredFromLabelRef.current.setMap(null);
        hoveredFromLabelRef.current = null;
      }
      if (hoveredToLabelRef.current) {
        hoveredToLabelRef.current.setMap(null);
        hoveredToLabelRef.current = null;
      }
      setHoveredPath(null);
      return;
    }

    const fromCoords = {
      lat: Number(hoveredFlightCoords.fromLat),
      lng: Number(hoveredFlightCoords.fromLong),
    };
    const toCoords = {
      lat: Number(hoveredFlightCoords.toLat),
      lng: Number(hoveredFlightCoords.toLong),
    };

    if (
      isNaN(fromCoords.lat) ||
      isNaN(fromCoords.lng) ||
      isNaN(toCoords.lat) ||
      isNaN(toCoords.lng)
    ) {
      setHoveredPath(null);
      return;
    }

    const pathPoints = calculateCurvedPath(fromCoords, toCoords);

    if (!pathPoints || pathPoints.length === 0) {
      setHoveredPath(null);
      return;
    }

    if (hoveredPathRef.current) {
      hoveredPathRef.current.setMap(null);
      hoveredPathRef.current = null;
    }
    if (hoveredFromMarkerRef.current) {
      hoveredFromMarkerRef.current.setMap(null);
      hoveredFromMarkerRef.current = null;
    }
    if (hoveredToMarkerRef.current) {
      hoveredToMarkerRef.current.setMap(null);
      hoveredToMarkerRef.current = null;
    }
    if (hoveredFromLabelRef.current) {
      hoveredFromLabelRef.current.setMap(null);
      hoveredFromLabelRef.current = null;
    }
    if (hoveredToLabelRef.current) {
      hoveredToLabelRef.current.setMap(null);
      hoveredToLabelRef.current = null;
    }

    setHoveredPath({
      points: pathPoints,
      from: fromCoords,
      to: toCoords,
      fromCode: hoveredFlightCoords.fromCity,
      toCode: hoveredFlightCoords.toCity,
    });

    if (map && window.google) {
      const hoverPolyline = new window.google.maps.Polyline({
        path: pathPoints,
        strokeColor: '#FF6200',
        strokeWeight: 1.8,
        strokeOpacity: 1.0,
        zIndex: 20,
        map: map,
        icons: [{
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: '#FF6200',
            fillOpacity: 1,
            strokeColor: '#FF6200',
            strokeWeight: 1,
          },
          offset: '50%',
        }]
      });
      hoveredPathRef.current = hoverPolyline;

      const fromMarker = new window.google.maps.Marker({
        position: fromCoords,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#FF6200',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 30,
        title: hoveredFlightCoords.fromCity,
      });
      hoveredFromMarkerRef.current = fromMarker;

      const toMarker = new window.google.maps.Marker({
        position: toCoords,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#FF6200',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 30,
        title: hoveredFlightCoords.toCity,
      });
      hoveredToMarkerRef.current = toMarker;
      
      // Remove city labels - don't create them on hover
      hoveredFromLabelRef.current = null;
      hoveredToLabelRef.current = null;
    }

    return () => {
      if (hoveredPathRef.current) {
        hoveredPathRef.current.setMap(null);
        hoveredPathRef.current = null;
      }
      if (hoveredFromMarkerRef.current) {
        hoveredFromMarkerRef.current.setMap(null);
        hoveredFromMarkerRef.current = null;
      }
      if (hoveredToMarkerRef.current) {
        hoveredToMarkerRef.current.setMap(null);
        hoveredToMarkerRef.current = null;
      }
      if (hoveredFromLabelRef.current) {
        hoveredFromLabelRef.current.setMap(null);
        hoveredFromLabelRef.current = null;
      }
      if (hoveredToLabelRef.current) {
        hoveredToLabelRef.current.setMap(null);
        hoveredToLabelRef.current = null;
      }
    };
  }, [hoveredFlightCoords, calculateCurvedPath, map]);

  // Effect for handling tail markers
  useEffect(() => {
    // Clear any existing tail markers
    tailMarkerRefs.current.forEach(marker => {
      if (marker) marker.setMap(null);
    });
    tailMarkerRefs.current = [];
    
    // If no map or no tail markers data, return early
    if (!map || !window.google || !tailMarkers || !tailMarkers.length) return;
    
    // Create bounds object to fit map if needed
    const newBounds = flightPaths.length > 0 ? null : new window.google.maps.LatLngBounds();
    
    // Add new markers for each tail
    tailMarkers.forEach(tail => {
      if (!tail.latitude || !tail.longitude) return;
      
      const tailPosition = {
        lat: Number(tail.latitude),
        lng: Number(tail.longitude)
      };
      
      if (isNaN(tailPosition.lat) || isNaN(tailPosition.lng)) return;
      
      // Create marker
      const tailMarker = new window.google.maps.Marker({
        position: tailPosition,
        map: map,
        zIndex: 25,
        title: `${tail.tail} (${tail.aircraft_Type_Name || 'Aircraft'})`,
      });
      
      // Add info window with details - compact layout with no padding
      const infoContent = `
        <div style="margin: 0; padding: 4px; max-width: 200px; line-height: 1.2;">
          <div style="font-weight: bold; color: #007bff;">${tail.tail}</div>
          <div>${tail.aircraft_Type_Name || ''}</div>
          ${tail.tail_Max_Pax ? `<div>Max Pax: ${tail.tail_Max_Pax}</div>` : ''}
          ${tail.tailCategory ? `<div>Category: ${tail.tailCategory}</div>` : ''}
        </div>
      `;
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
        pixelOffset: new window.google.maps.Size(0, -5),
        disableAutoPan: false
      });
      
      tailMarker.addListener('click', () => {
        infoWindow.open(map, tailMarker);
      });
      
      // Store reference to marker
      tailMarkerRefs.current.push(tailMarker);
      
      // Add to bounds if needed
      if (newBounds) {
        newBounds.extend(tailPosition);
      }
    });
    
    // If we created new bounds and have markers, fit the map to them
    if (newBounds && tailMarkerRefs.current.length > 0) {
      map.fitBounds(newBounds, { padding: { top: 30, right: 30, bottom: 30, left: 30 } });
    }
  }, [tailMarkers, map, flightPaths]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    setIsLoading(false);

    if (flightPaths.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      flightPaths.forEach(path => {
        bounds.extend(new window.google.maps.LatLng(path.from.lat, path.from.lng));
        bounds.extend(new window.google.maps.LatLng(path.to.lat, path.to.lng));
      });
      mapInstance.fitBounds(bounds);
    }
  }, [flightPaths]);

  useEffect(() => {
    if (!map || !window.google || !flightPaths.length) return;

    polylineRefs.current.forEach(line => {
      if (line) line.setMap(null);
    });
    polylineRefs.current = [];

    flightPaths.forEach(path => {
      const polyline = new window.google.maps.Polyline({
        path: path.points,
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 1.8,
        map: map,
        zIndex: 1,
        icons: [{
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            fillColor: '#000000',
            fillOpacity: 1,
            strokeColor: '#000000',
            strokeWeight: 1,
          },
          offset: '50%',
        }],
      });

      polylineRefs.current.push(polyline);

      const fromMarker = new window.google.maps.Marker({
        position: path.from,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#000000',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        zIndex: 2,
        title: path.fromCode,
      });

      const toMarker = new window.google.maps.Marker({
        position: path.to,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#000000',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        zIndex: 2,
        title: path.toCode,
      });

      polylineRefs.current.push(fromMarker, toMarker);
    });
  }, [map, flightPaths]);

  // Custom info window styles - to be injected into the DOM
  useEffect(() => {
    // Add custom CSS to fix info window padding
    const styleId = "map-info-window-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .gm-style-iw {
          padding: 0 !important; 
        }
        .gm-style-iw-d {
          overflow: hidden !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .gm-style-iw-c {
          padding: 0 !important;
          margin: 0 !important;
        }
        .gm-style-iw-t {
          margin: 0 !important;
        }
        .gm-ui-hover-effect {
          top: 0 !important;
          right: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Clean up the style when component unmounts
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
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
    <div className="bg-white rounded-lg border border-gray-200 p-0 w-full">
      <div className="relative rounded-md overflow-hidden">
        <GoogleMap
          key={`map-${flightPaths.length}-${hoveredPath ? JSON.stringify(hoveredPath.from) + JSON.stringify(hoveredPath.to) : 'nohover'}-${tailMarkers ? tailMarkers.length : 0}`}
          mapContainerStyle={mapContainerStyle}
          zoom={4}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#000000' }],
              },
              {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#000000' }, { weight: 0.5 }],
              },
              {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#f5f5f5' }],
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#76b6c4' }],
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#dddddd' }],
              },
              {
                featureType: 'poi',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'transit',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
        </GoogleMap>
      </div>
    </div>
  );
};

// PropTypes validation to fix linting issues
RouteMap.propTypes = {
  itineraryData: PropTypes.shape({
    flights: PropTypes.arrayOf(
      PropTypes.shape({
        from: PropTypes.string,
        to: PropTypes.string,
        fromCoordinates: PropTypes.shape({
          lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
          long: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        }),
        toCoordinates: PropTypes.shape({
          lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
          long: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        })
      })
    )
  }),
  hoveredFlightCoords: PropTypes.shape({
    fromLat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    fromLong: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    toLat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    toLong: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    fromCity: PropTypes.string,
    toCity: PropTypes.string
  }),
  tailMarkers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      tail: PropTypes.string,
      aircraft_Type_Name: PropTypes.string,
      tail_Max_Pax: PropTypes.number,
      tailCategory: PropTypes.string,
      base: PropTypes.string,
      latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
  )
};

export default RouteMap;