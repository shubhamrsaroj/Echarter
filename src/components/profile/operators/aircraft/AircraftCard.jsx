import React from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

const AircraftCard = ({ aircraft, onQuoteRequest }) => {
  const { 
    type, 
    aircraft_type_name,
    tail, 
    tailNumber, 
    seats,
    tail_max_pax, 
    image,
    blur
  } = aircraft;

  // Display aircraft type name safely
  const displayTypeName = () => {
    if (blur) {
      return <div className="bg-gray-200 h-7 w-32 rounded mb-2"></div>;
    }
    return <h3 className="text-xl font-medium text-gray-800 mb-2">{aircraft_type_name || type || 'Aircraft Type'}</h3>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Aircraft Image */}
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        {image ? (
          <img 
            src={image} 
            alt={`${type} aircraft`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <i className="pi pi-image text-gray-300 text-5xl"></i>
          </div>
        )}
      </div>
      
      {/* Aircraft Details */}
      <div className="p-4">
        {displayTypeName()}
        <div className="flex flex-wrap gap-2">
          <Tag value={tail || 'Tail'} className="bg-green-500 text-white font-medium text-xs" />
          <div className="flex items-center bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
            <i className="pi pi-users mr-1"></i>
            <span>{tail_max_pax || seats || 6}</span>
          </div>
        </div>
        
        {/* Quote Button */}
        <Button 
          label="Get a Quote" 
          icon="pi pi-plus" 
          className="mt-4 p-button-sm bg-indigo-700 hover:bg-indigo-800 border-none w-full"
          onClick={() => onQuoteRequest(aircraft)}
        />
      </div>
    </div>
  );
};

export default AircraftCard; 