import React, { useContext, useEffect, useRef } from 'react';
import { SellerMarketContext } from '../../../context/seller-market/SellerMarketContext';

const RecentSearch = ({ standalone = false, onCloseModal }) => {
  const { 
    userItineraries,
    itinerariesLoading,
    itinerariesError,
    getUserItineraries,
    getItineraryById
  } = useContext(SellerMarketContext);
  
  // Use a ref to track if data has been loaded already
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    // Only fetch data if it hasn't been loaded yet or if there's an error
    if (!dataLoadedRef.current && !itinerariesLoading && (!userItineraries || userItineraries.length === 0 || itinerariesError)) {
      getUserItineraries(7); // Get itineraries for the last 7 days
      dataLoadedRef.current = true;
    }
  }, [getUserItineraries, userItineraries, itinerariesLoading, itinerariesError]);

  const handleEditClick = (e, itineraryId) => {
    e.stopPropagation(); // Prevent any potential event bubbling
    // Get itinerary details to prefill the search form
    getItineraryById(itineraryId);
    
    // Close the modal if onCloseModal prop is provided
    if (onCloseModal) {
      onCloseModal();
    }
  };

  const Content = () => (
    <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
      {itinerariesLoading ? (
        <div className="text-center py-2 text-sm text-black">Loading...</div>
      ) : itinerariesError ? (
        <div className="text-center py-2 text-sm text-red-500">Error loading searches</div>
      ) : userItineraries && userItineraries.length > 0 ? (
        userItineraries.map((itinerary) => (
          <div 
            key={itinerary.itineraryID}
            className="flex items-start justify-between py-2 border-b border-gray-50 last:border-b-0"
          >
            <div className="flex-1 pr-2">
              <p className="text-sm text-black leading-relaxed">{itinerary.itineraryText}</p>
            </div>
            <div className="flex items-center space-x-2 text-xs whitespace-nowrap">
              <button 
                className="p-1 hover:bg-gray-100 rounded-full text-black"
                onClick={(e) => handleEditClick(e, itinerary.itineraryID)}
              >
                <i className="pi pi-copy" style={{ fontSize: '20px' }}></i>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-2 text-sm text-black">No recent searches</div>
      )}
    </div>
  );

  // If this is a standalone component (used in Search), return just the content
  if (standalone) {
    return <Content />;
  }

  // Otherwise return the full component with header (used in sidebar)
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-3 border-b border-gray-100">
        <h3 className="font-medium text-black text-sm">Recent Search</h3>
        <button className="text-black hover:text-gray-600 text-lg">×</button>
      </div>
      <Content />
    </div>
  );
};

export default RecentSearch;