import React, { useContext, useEffect, useState } from 'react';
import SearchDetailsForm from './Search/ItinerarySearch/SearchDetailsForm';
import BaseCard from './Search/ItinerarySearchDetails/BaseCard';
import MatchCard from './Search/ItinerarySearchDetails/MatchCard';
import DateAdjustment from './Search/ItinerarySearchDetails/DateAdjustment';
import RouteMap from '../common/RouteMap';
import { SellerMarketContext } from '../../../context/seller-market/SellerMarketContext';

const Search = () => {
  const { 
    optionsData, 
    optionsLoading, 
    optionsError, 
    addItinerary, 
    getOptionsbyItineraryId,
    selectedItineraryId
  } = useContext(SellerMarketContext);
  
  // State for map hover functionality
  const [hoveredFlightCoords, setHoveredFlightCoords] = useState(null);

  // If we have a selected itinerary ID but no options data, fetch it
  useEffect(() => {
    if (selectedItineraryId && !optionsData && !optionsLoading) {
      getOptionsbyItineraryId(selectedItineraryId);
    }
  }, [selectedItineraryId, optionsData, optionsLoading, getOptionsbyItineraryId]);

  const handleFormChange = async (formData) => {
    try {
      // Add the itinerary and get the response
      const response = await addItinerary(formData);
      
      if (response && response.itineraryId) {
        // If successful, immediately get options by itinerary ID
        await getOptionsbyItineraryId(response.itineraryId);
      }
    } catch (error) {
      console.error('Error handling form submission:', error);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <SearchDetailsForm onFormChange={handleFormChange} />
      
      {optionsLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="animate-pulse">Loading search results...</div>
        </div>
      )}
      
      {optionsError && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-red-500">Error: {optionsError.message}</div>
        </div>
      )}
      
      {!optionsLoading && !optionsError && optionsData && (
        <div className="flex flex-col md:flex-row gap-6 relative">
          {/* Left side - Cards */}
          <div className="w-full md:w-2/3 space-y-6">
            
            <MatchCard 
              match={optionsData.match} 
              setHoveredFlightCoords={setHoveredFlightCoords} 
            />
            <DateAdjustment adjustment={optionsData.dateAdjustment}
             setHoveredFlightCoords={setHoveredFlightCoords} 
             />
            <BaseCard itineraryData={optionsData} />
          </div>
          
          {/* Right side - Map (Sticky) */}
          <div className="w-full md:w-1/3">
            <div className="sticky top-4">
              <RouteMap 
                itineraryData={optionsData} 
                hoveredFlightCoords={hoveredFlightCoords} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search; 