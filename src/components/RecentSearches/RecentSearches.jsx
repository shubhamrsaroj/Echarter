import React, { useState } from 'react';
import { useRecentItinerary } from '../../context/RecentItineraryContext/RecentItineraryContext';
import { Search, X } from 'lucide-react';

const RecentSearches = ({ onSelectItinerary }) => {
  const { recentItineraries, loading } = useRecentItinerary();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const handleSelectItinerary = (itinerary) => {
    // Prevent duplicate selections of the same itinerary
    if (selectedId === itinerary.itineraryID) {
      return;
    }
    
    setSelectedId(itinerary.itineraryID);
    if (onSelectItinerary) {
      onSelectItinerary(itinerary.itineraryText);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || loading || recentItineraries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-black w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-2xl ">Recent Search</h1>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-black hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3 max-h-[calc(80vh-100px)] overflow-y-auto ">
        {recentItineraries.map((itinerary) => (
          <div
            key={itinerary.itineraryID}
            className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-5 hover:bg-gray-200 border border-black"
          >
            <div className="text-sm text-black">{itinerary.itineraryText}</div>
            <button
              onClick={() => handleSelectItinerary(itinerary)}
              disabled={selectedId === itinerary.itineraryID}
              className={`flex flex-col items-center justify-center text-black ${
                selectedId === itinerary.itineraryID ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-600'
              }`}
            >
              <Search size={18} />
              <span className="text-xs mt-1">More Options</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;
