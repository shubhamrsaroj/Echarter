import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Polyline, Marker, useLoadScript, OverlayView } from '@react-google-maps/api';

const RouteMap = ({ itineraryData, hoveredFlightCoords }) => {
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

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  const mapContainerStyle = {
    width: '100%',
    height: '280px',
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
  });

  // Create city labels using custom overlays for the hovered path
  const createHoveredCityLabel = useCallback((position, city) => {
    if (!map || !window.google) return null;
    
    const label = document.createElement('div');
    label.className = 'city-label';
    label.style.position = 'absolute';
    label.style.backgroundColor = '#FF6200';
    label.style.color = '#FFFFFF';
    label.style.fontSize = '12px';
    label.style.fontWeight = '500';
    label.style.padding = '3px 8px';
    label.style.borderRadius = '2px';
    label.style.whiteSpace = 'nowrap';
    label.style.textAlign = 'center';
    label.style.userSelect = 'none';
    label.textContent = city;
    
    const overlay = new window.google.maps.OverlayView();
    overlay.onAdd = function() {
      const panes = this.getPanes();
      panes.overlayMouseTarget.appendChild(label);
    };
    
    overlay.draw = function() {
      const projection = this.getProjection();
      const point = projection.fromLatLngToDivPixel(position);
      if (point) {
        label.style.left = point.x + 'px';
        label.style.top = (point.y - 30) + 'px';
        label.style.transform = 'translateX(-50%)';
      }
    };
    
    overlay.onRemove = function() {
      if (label.parentNode) {
        label.parentNode.removeChild(label);
      }
    };
    
    overlay.setMap(map);
    return overlay;
  }, [map]);

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

    const fromCity = hoveredFlightCoords.fromCity || 'Origin';
    const toCity = hoveredFlightCoords.toCity || 'Destination';

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
        strokeWeight: 4,
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
      
      // Add city labels to the hovered markers
      const fromLabel = createHoveredCityLabel(fromCoords, fromCity);
      const toLabel = createHoveredCityLabel(toCoords, toCity);
      
      hoveredFromLabelRef.current = fromLabel;
      hoveredToLabelRef.current = toLabel;
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
  }, [hoveredFlightCoords, calculateCurvedPath, map, createHoveredCityLabel]);

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
    <div className="bg-white rounded-lg border border-black p-4 w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Itinerary Route</h2>
      <div className="relative rounded-md overflow-hidden">
        <GoogleMap
          key={`map-${flightPaths.length}-${hoveredPath ? JSON.stringify(hoveredPath.from) + JSON.stringify(hoveredPath.to) : 'nohover'}`}
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

export default RouteMap;