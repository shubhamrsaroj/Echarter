
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItinerary } from '../../context/itinerary/ItineraryContext';
import ItineraryInput from '../../components/Itinerary/Itinerary/ItineraryInput';
import ErrorPrompt from '../../components/Itinerary/ItineraryDetails/ErrorPrompt';
import AILoadingIndicator from '../../components/Itinerary/common/AILoadingIndicator';

const ItineraryInputPage = () => {
  const { loading, error, getItineraryByText } = useItinerary();
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  
  const handleItinerarySearch = async (itineraryText) => {
    setShowError(false); // Reset error state on new search
    try {
      const response = await getItineraryByText(itineraryText);
      if (response?.itineraryResponseNewdata?.itinerary) {
        navigate('/itinerary-details');
      } else {
        setShowError(true);
      }
    } catch (err) {
      console.error('Failed to fetch itinerary:', err);
      setShowError(true);
    }
  };

  // Sync showError with the global error state when loading is done
  useEffect(() => {
    if (!loading && error) {
      setShowError(true);
    }
  }, [error, loading]);

  return (
    <div className="container mx-auto p-6 relative">
      {/* Error Handling */}
      {showError && error && (
        <div className="fixed top-4 right-4 p-4 z-50">
          <ErrorPrompt error={error} onClose={() => setShowError(false)} />
        </div>
      )}

      {/* Itinerary Input Component */}
      <ItineraryInput onSearch={handleItinerarySearch} disabled={loading} />

      {/* AI Loading Indicator */}
      {loading && <AILoadingIndicator />}
    </div>
  );
};

export default ItineraryInputPage;