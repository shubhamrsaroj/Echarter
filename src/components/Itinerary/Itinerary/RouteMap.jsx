import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Polyline, Marker, useLoadScript,OverlayView  } from '@react-google-maps/api';

const RouteMap = ({ itineraryData, hoveredFlightCoords }) => {
  const [map, setMap] = useState(null);
  const [flightPaths, setFlightPaths] = useState([]);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const hoveredPathRef = useRef(null);
  const hoveredFromMarkerRef = useRef(null);
  const hoveredToMarkerRef = useRef(null);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
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
      return [];
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

        newBounds.extend(new window.google.maps.LatLng(fromCoords.lat, fromCoords.lng));
        newBounds.extend(new window.google.maps.LatLng(toCoords.lat, toCoords.lng));

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

      if (map && newBounds) {
        map.fitBounds(newBounds, { padding: { top: 30, right: 30, bottom: 30, left: 30 } });
      }
    } catch (error) {
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

    if (hoveredFlightCoords) {
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
      setHoveredPath({
        points: pathPoints,
        from: fromCoords,
        to: toCoords,
        fromCode: hoveredFlightCoords.fromCity,
        toCode: hoveredFlightCoords.toCity,
      });
    } else {
      setHoveredPath(null);
    }
  }, [hoveredFlightCoords, calculateCurvedPath]);

  const onMapLoad = useCallback((mapInstance) => {
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
          key={hoveredPath ? `map-hovered-${JSON.stringify(hoveredPath.from)}-${JSON.stringify(hoveredPath.to)}` : 'map-default'}
          mapContainerStyle={mapContainerStyle}
          zoom={4}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
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
          {flightPaths.map((path) => (
            <React.Fragment key={path.index}>
              <Polyline
                path={path.points}
                options={{
                  strokeColor: '#000000',
                  strokeWeight: 2,
                  strokeOpacity: 0.8,
                  geodesic: false,
                  icons: [
                    {
                      icon: {
                        path: window.google?.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 3,
                        fillColor: '#000000',
                        fillOpacity: 1,
                        strokeColor: '#000000',
                        strokeWeight: 1,
                      },
                      offset: '50%',
                      repeat: null,
                    },
                  ],
                }}
              />
              {/* Only render the default marker if this path is NOT the hovered path */}
              {(!hoveredPath || 
                (JSON.stringify(hoveredPath.from) !== JSON.stringify(path.from) && 
                 JSON.stringify(hoveredPath.to) !== JSON.stringify(path.to))) && (
                <>
                  <Marker
                    position={path.from}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 5,
                      fillColor: '#000000',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
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
                      strokeWeight: 2,
                    }}
                   
                  />
                </>
              )}
            </React.Fragment>
          ))}

{hoveredPath && (
        <React.Fragment key={`hovered-path-${JSON.stringify(hoveredPath.from)}-${JSON.stringify(hoveredPath.to)}`}>
          {/* Polyline for the path */}
          <Polyline
            path={hoveredPath.points}
            options={{
              strokeColor: "#FF6200",
              strokeWeight: 3,
              strokeOpacity: 1,
              geodesic: false,
              icons: [
                {
                  icon: {
                    path: window.google?.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 4,
                    fillColor: "#FF6200",
                    fillOpacity: 1,
                    strokeColor: "#FF6200",
                    strokeWeight: 1,
                  },
                  offset: "50%",
                  repeat: null,
                },
              ],
            }}
            onLoad={(polyline) => {
              hoveredPathRef.current = polyline;
            }}
          />

          {/* From Marker */}
          <Marker
            position={hoveredPath.from}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 5,
              fillColor: "#FF6200",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
            title={hoveredPath.fromCode}
            onLoad={(marker) => {
              hoveredFromMarkerRef.current = marker;
            }}
          />
          <OverlayView
            position={hoveredPath.from}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div style={{
              position: "absolute",
              transform: "translate(-50%, -150%)",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#FF6200",
              backgroundColor: "white",
              padding: "2px 5px",
              borderRadius: "4px",
              border: "1px solid #FF6200",
              whiteSpace: "nowrap"
            }}>
              {hoveredPath.fromCode}
            </div>
          </OverlayView>

          {/* To Marker */}
          <Marker
            position={hoveredPath.to}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 5,
              fillColor: "#FF6200",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
            title={hoveredPath.toCode}
            onLoad={(marker) => {
              hoveredToMarkerRef.current = marker;
            }}
          />
          <OverlayView
            position={hoveredPath.to}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div style={{
              position: "absolute",
              transform: "translate(-100%, -40%)",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#FF6200",
              backgroundColor: "white",
              padding: "2px 5px",
              borderRadius: "4px",
              border: "1px solid #FF6200",
              whiteSpace: "nowrap"
            }}>
              {hoveredPath.toCode}
            </div>
          </OverlayView>
        </React.Fragment>
      )}
    </GoogleMap>
      </div>
    </div>
  );
};

export default RouteMap;