import React, { useRef } from 'react';
import AircraftCard from './AircraftCard';
import { Button } from 'primereact/button';

const AircraftList = ({ aircraft, title = 'Fleet', onQuoteRequest }) => {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button 
            icon="pi pi-chevron-left" 
            className="p-button-rounded p-button-outlined"
            onClick={scrollLeft}
            aria-label="Scroll left"
          />
          <Button 
            icon="pi pi-chevron-right" 
            className="p-button-rounded p-button-outlined"
            onClick={scrollRight}
            aria-label="Scroll right"
          />
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        {aircraft && aircraft.length > 0 ? (
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar"
            style={{ scrollBehavior: 'smooth' }}
          >
            {aircraft.map((plane, index) => (
              <div key={plane.id || index} className="min-w-[300px] md:min-w-[320px]">
                <AircraftCard 
                  aircraft={plane} 
                  onQuoteRequest={onQuoteRequest} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">No aircraft available</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AircraftList; 