/**
 * Flight routes component for Have data
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import * as haveData from './map-data/have.json';

const MAX_ENTRIES = 350;

const HaveMaps = ({ isVisible = true }) => {
    const [map, setMap] = useState(null);
    const [flightPaths, setFlightPaths] = useState([]);
    const [error, _setError] = useState(null);

    const polylineRefs = useRef([]);
    const markerRefs = useRef([]);
    
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    const mapContainerStyle = {
        width: '100%',
        height: '500px',
    };

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey,
        googleMapsApiClientId: 'have-maps-client',
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

    // Process have data with useMemo to avoid recalculations
    const processedHaveData = useMemo(() => {
        // Only process a limited number of entries
        const limitedHaves = haveData.haves.slice(0, MAX_ENTRIES);
        const paths = [];

        limitedHaves.forEach((have, i) => {
            const fromCoords = {
                lat: have.fromLat,
                lng: have.fromLong
            };

            const toCoords = {
                lat: have.toLat,
                lng: have.toLong
            };

            if (
                isNaN(fromCoords.lat) ||
                isNaN(fromCoords.lng) ||
                isNaN(toCoords.lat) ||
                isNaN(toCoords.lng)
            ) {
                return;
            }

            paths.push({
                points: calculateCurvedPath(fromCoords, toCoords),
                from: fromCoords,
                to: toCoords,
                fromCode: `${have.fromCity} (${have.fromIcao})`,
                toCode: `${have.toCity} (${have.toIcao})`,
                fromDescription: `Aircraft: ${have.acType}, Seats: ${have.seats}, Date: ${new Date(have.dateFrom).toLocaleDateString()}`,
                toDescription: `Aircraft: ${have.acType}, Seats: ${have.seats}, Date: ${new Date(have.dateTo).toLocaleDateString()}`,
                index: i,
            });
        });

        return paths;
    }, [calculateCurvedPath]);

    useEffect(() => {
        if (isLoaded) {
            setFlightPaths(processedHaveData);
        }
    }, [isLoaded, processedHaveData]);

    const onMapLoad = useCallback((mapInstance) => {
        setMap(mapInstance);

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

        // Clear previous polylines
        polylineRefs.current.forEach(line => {
            if (line) line.setMap(null);
        });
        polylineRefs.current = [];

        // Clear previous markers
        markerRefs.current.forEach(marker => {
            if (marker) marker.setMap(null);
        });
        markerRefs.current = [];

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

            // Create info window for the from marker
            const fromInfoWindow = new window.google.maps.InfoWindow({
                content: `<div><strong>${path.fromCode}</strong><br/>${path.fromDescription}</div>`,
            });
            
            // Create info window for the to marker
            const toInfoWindow = new window.google.maps.InfoWindow({
                content: `<div><strong>${path.toCode}</strong><br/>${path.toDescription}</div>`,
            });

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
            
            // Add click listener for from marker
            fromMarker.addListener('click', () => {
                fromInfoWindow.open(map, fromMarker);
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
            
            // Add click listener for to marker
            toMarker.addListener('click', () => {
                toInfoWindow.open(map, toMarker);
            });

            // Store markers in separate ref
            markerRefs.current.push(fromMarker, toMarker);
        });
    }, [map, flightPaths]);

    // Cleanup effect to properly handle unmounting
    useEffect(() => {
        return () => {
            // Clear all map objects when component unmounts
            if (polylineRefs.current) {
                polylineRefs.current.forEach(line => {
                    if (line) line.setMap(null);
                });
            }
            if (markerRefs.current) {
                markerRefs.current.forEach(marker => {
                    if (marker) marker.setMap(null);
                });
            }
            setMap(null);
        };
    }, []);

    // Only render the map when the component is visible
    if (!isVisible) {
        return null;
    }

    if (loadError || error) return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 w-full">
            <div className="h-[500px] flex items-center justify-center text-gray-600 font-medium">
                {loadError || error || "Error loading map"}
            </div>
        </div>
    );
    return (
        <main>
           
                <div className="relative rounded-md overflow-hidden">
                    <GoogleMap
                        key={`map-${flightPaths.length}`}
                        mapContainerStyle={mapContainerStyle}
                        zoom={3}
                        center={{ lat: 40.703700, lng: -40.714776 }}
                        onLoad={onMapLoad}
                        options={{
                            zoomControl: true,
                            fullscreenControl: true,
                            minZoom: 2,
                            restriction: {
                                latLngBounds: {
                                    north: 85,
                                    south: -85,
                                    east: 180,
                                    west: -180
                                },
                                strictBounds: true
                            },
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
        </main>
    );
};

export default HaveMaps;