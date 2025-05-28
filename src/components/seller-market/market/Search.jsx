import React, { useContext, useEffect } from 'react';
import SearchDetailsForm from '../ItinerarySearch/SearchDetailsForm';
import BaseCard from '../ItinerarySearchDetails/BaseCard';
import MatchCard from '../ItinerarySearchDetails/MatchCard';
import DateAdjustment from '../ItinerarySearchDetails/DateAdjustment';
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
          <div className="w-full md:w-1/2 space-y-6">
            <BaseCard itineraryData={optionsData} />
            <MatchCard match={optionsData.match} />
            <DateAdjustment adjustment={optionsData.dateAdjustment} />
          </div>
          
          {/* Right side - Map (Sticky) */}
          <div className="w-full md:w-1/2">
            <div className="sticky top-4">
              <RouteMap itineraryData={optionsData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search; 