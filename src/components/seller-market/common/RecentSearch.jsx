import React, { useContext, useEffect, useRef } from 'react';
import { Search, Pencil } from 'lucide-react';
import { SellerMarketContext } from '../../../context/seller-market/SellerMarketContext';

const RecentSearch = () => {
  const { 
    userItineraries, 
    itinerariesLoading, 
    itinerariesError, 
    getUserItineraries,
    getOptionsbyItineraryId,
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

  const handleItineraryClick = (itineraryId) => {
    getOptionsbyItineraryId(itineraryId);
  };

  const handleSearchClick = (e, itineraryId) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    getOptionsbyItineraryId(itineraryId);
  };

  const handleEditClick = (e, itineraryId) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    // Get itinerary details to prefill the search form
    getItineraryById(itineraryId);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-3 border-b border-gray-100">
        <h3 className="font-medium text-black text-sm">Recent Search</h3>
        <button className="text-black hover:text-gray-600 text-lg">×</button>
      </div>
      <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
        {itinerariesLoading ? (
          <div className="text-center py-2 text-sm text-black">Loading...</div>
        ) : itinerariesError ? (
          <div className="text-center py-2 text-sm text-red-500">Error loading searches</div>
        ) : userItineraries && userItineraries.length > 0 ? (
          userItineraries.map((itinerary) => (
            <div 
              key={itinerary.itineraryID} 
              className="flex items-start justify-between py-2 border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50"
              onClick={() => handleItineraryClick(itinerary.itineraryID)}
            >
              <div className="flex-1 pr-2">
                <p className="text-xs text-black leading-relaxed">{itinerary.itineraryText}</p>
              </div>
              <div className="flex items-center space-x-2 text-xs whitespace-nowrap">
                <button 
                  className="p-1 hover:bg-gray-100 rounded-full text-black"
                  onClick={(e) => handleEditClick(e, itinerary.itineraryID)}
                >
                  <Pencil size={14} />
                </button>
                <button 
                  className="p-1 hover:bg-gray-100 rounded-full text-black"
                  onClick={(e) => handleSearchClick(e, itinerary.itineraryID)}
                >
                  <Search size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-2 text-sm text-black">No recent searches</div>
        )}
      </div>
    </div>
  );
};

export default RecentSearch; 