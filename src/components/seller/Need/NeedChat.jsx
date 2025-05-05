import React, { useState, useEffect } from 'react';
import CommonChat from '../../common/CommonChat';
import NeedItinerary from './NeedItinerary';
import { useSellerContext } from '../../../context/seller/SellerContext';

const NeedChat = ({ chatData, onClose }) => {
  const { itineraries, fetchItinerary, loadingItinerary, itineraryError } = useSellerContext();
  const [showNeedItinerary, setShowNeedItinerary] = useState(false);
  const [needItineraryId, setNeedItineraryId] = useState(chatData?.itineraryId || null);

  // Initialize state when chatData changes
  useEffect(() => {
    if (chatData?.itineraryId) {
      setNeedItineraryId(chatData.itineraryId);
    }
  }, [chatData]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setShowNeedItinerary(false);
      setNeedItineraryId(null);
    };
  }, []);

  // Keep one logging statement for debugging
  useEffect(() => {
    console.log('NeedChat - chatData:', chatData);
  }, [chatData]);

  const handleItineraryClick = (itineraryId) => {
    console.log('NeedChat - handleItineraryClick called with:', itineraryId);
    setNeedItineraryId(itineraryId);
    setShowNeedItinerary(true);
    // Fetch itinerary data if needed
    if (itineraryId && (!itineraries[itineraryId] || !itineraries[itineraryId].itinerary)) {
      fetchItinerary(itineraryId);
    }
  };

  const handleCloseNeedItinerary = () => {
    setShowNeedItinerary(false);
  };

  return (
    <div className="h-[calc(90vh-8rem)] relative">
      <CommonChat 
        chatData={chatData}
        onClose={onClose}
        onItineraryClick={handleItineraryClick}
        itineraryData={needItineraryId ? itineraries[needItineraryId] : null}
        disableDefaultItinerary={true}
        itineraryType="need"
      />

      {/* Custom NeedItinerary Overlay */}
      {showNeedItinerary && needItineraryId && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-[90%] max-w-2xl max-h-[90vh] overflow-auto">
            <NeedItinerary
              itinerary={itineraries[needItineraryId] || {}}
              loading={loadingItinerary && (!itineraries[needItineraryId] || !itineraries[needItineraryId].itinerary)}
              error={itineraryError}
              onClose={handleCloseNeedItinerary}
              selectedItineraryId={needItineraryId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NeedChat;

