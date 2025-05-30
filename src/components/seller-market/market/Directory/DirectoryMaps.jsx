/**
 * Flight routes sample - Simplified with markers only
 */
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { MapsComponent, Inject, LayersDirective, LayerDirective, Marker, MapsTooltip, MarkersDirective, MarkerDirective, Zoom } from '@syncfusion/ej2-react-maps';
import * as data1 from './map-data/curved-datasource.json';
import * as worldMap from './map-data/world-map.json';

const SAMPLE_CSS = `
    .control-fluid {
		padding: 0px !important;
        border-radius: 10px;
    }
`;

const DirectoryMaps = ({ onLoad, isVisible = true }) => {
    const mapRef = useRef(null);
    const mapInitializedRef = useRef(false);
    const [centerPosition, setCenterPosition] = useState({ 
        latitude: 30.41078179084589, 
        longitude: 90.52734374999999 
    });
    const [zoomFactor, setZoomFactor] = useState(3.5);

    // Transform the data to match the expected format
    const processedData = data1.array?.map(item => ({
        name: item.name,
        latitude: item.lat,
        longitude: item.long,
        city: item.city,
        country: item.country,
        roles: item.roles
    })) || [];

    let shapeSettings = {
        fill: '#f5f5f5',
        border: { width: 0.4, color: 'black' }
    };

    // Effect to handle visibility changes
    useEffect(() => {
        // This prevents unnecessary re-renders when the tab isn't visible
        if (!isVisible && mapRef.current) {
            // Map is already initialized but not currently visible
            return;
        }
    }, [isVisible]);

    useEffect(() => {
        if (navigator.geolocation && !mapInitializedRef.current) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenterPosition({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setZoomFactor(5);
                },
                (error) => {
                    console.error("Error getting location:", error.message);
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, []);

    const onMapsLoad = () => {
        let maps = document.getElementById('maps');
        if (maps) {
            maps.setAttribute('title', '');
        }
        
        if (!mapInitializedRef.current) {
            mapInitializedRef.current = true;
            if (onLoad) onLoad();
        }
    };

    const load = () => {
        // Empty function
    };

    const mapContainerStyle = {
        width: '100%',
        height: '500px',
    };

    return (
        <main>
           
                <div className="relative rounded-md overflow-hidden" style={mapContainerStyle}>
                    <style>{SAMPLE_CSS}</style>
                    <MapsComponent 
                        id="maps" 
                        ref={mapRef}
                        loaded={onMapsLoad} 
                        load={load} 
                        centerPosition={centerPosition} 
                        zoomSettings={{ enable: true, zoomFactor: zoomFactor }} 
                        mapsArea={{ background: '#76b6c4' }}
                        height="100%"
                        width="100%"
                    >
                        <Inject services={[Marker, MapsTooltip, Zoom]}/>
                        <LayersDirective>
                            <LayerDirective 
                                shapeData={worldMap} 
                                shapeSettings={shapeSettings}
                            >
                                <MarkersDirective>
                                    <MarkerDirective 
                                        visible={true} 
                                        shape='Circle' 
                                        fill='white' 
                                        width={4} 
                                        animationDuration={0} 
                                        border={{ color: 'black', width: 1 }} 
                                        dataSource={processedData} 
                                        tooltipSettings={{
                                            visible: true,
                                            valuePath: 'name',
                                            format: '${name}<br/>${city}, ${country}<br/>${roles}'
                                        }} 
                                    />
                                </MarkersDirective>
                            </LayerDirective>
                        </LayersDirective>
                    </MapsComponent>
                </div>
        </main>
    );
};

export default DirectoryMaps;