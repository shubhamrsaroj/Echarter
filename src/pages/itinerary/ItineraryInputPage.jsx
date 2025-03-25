import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItinerary } from '../../context/itinerary/ItineraryContext';
import ItineraryInput from '../../components/Itinerary/Itinerary/ItineraryInput';
import ErrorPrompt from '../../components/Itinerary/ItineraryDetails/ErrorPrompt';

const ItineraryInputPage = () => {
  const { loading, error, getItineraryByText } = useItinerary();
  const [showError, setShowError] = useState(true);
  const navigate = useNavigate();

  const handleItinerarySearch = async (itineraryText) => {
    try {
      // Reset error visibility on new search
      setShowError(true);

      // Await the itinerary fetch
      const result = await getItineraryByText(itineraryText);
      
      // Strict check to prevent navigation if ANY error exists
      // This includes checking both context error and potential result issues
      if (!error && result && result.data) {
        navigate('/itinerary-details');
      }
    } catch (err) {
      console.error('Failed to fetch itinerary:', err);
      // Explicitly prevent navigation on any error
      return;
    }
  };

  return (
    <div>
      <div className="container mx-auto p-6 relative">
        {/* Error Handling - Positioned Top Right */}
        {error && showError && (
          <div className="absolute top-0 right-0 p-4 z-50">
            <ErrorPrompt error={error} onClose={() => setShowError(false)} />
          </div>
        )}

        {/* Itinerary Input Component */}
        <ItineraryInput onSearch={handleItinerarySearch} />

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryInputPage;