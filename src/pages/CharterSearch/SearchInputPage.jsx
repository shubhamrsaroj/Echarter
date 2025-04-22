import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/CharterSearch/SearchContext';
import { RecentItineraryProvider } from '../../context/RecentItineraryContext/RecentItineraryContext';
import SearchInput from '../../components/CharterSearch/Search/SearchInput';
import RecentSearches from '../../components/RecentSearches/RecentSearches';
import ErrorPrompt from '../../components/CharterSearch/SearchDetails/ErrorPrompt';
import LoadingOverlay from '../../components/common/LoadingOverlay';

const SearchInputPage = () => {
  const { loading, error, getItineraryByText } = useSearch();
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  
  const handleItinerarySearch = async (itineraryText) => {
    setShowError(false); // Reset error state on new search
    try {
      const response = await getItineraryByText(itineraryText);
      if (response?.itineraryResponseNewdata?.itinerary) {
        navigate('/search-details');
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
    <RecentItineraryProvider>
      <div className="container mx-auto p-6 relative">
        {/* Error Handling */}
        {showError && error && (
          <div className="fixed top-4 right-4 p-4 z-50">
            <ErrorPrompt error={error} onClose={() => setShowError(false)} />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row">
          {/* Itinerary Input Component */}
          <div className="flex-1 mb-6 md:mb-0 md:mr-6">
            <SearchInput onSearch={handleItinerarySearch} disabled={loading} />
          </div>
          
          {/* Recent Searches Component */}
          <div className="md:w-[450px]">
            <RecentSearches onSelectItinerary={handleItinerarySearch} />
          </div>
        </div>
     
        {/*  Loading Indicator */}
        {loading && <LoadingOverlay />}
      </div>
    </RecentItineraryProvider>
  );
};

export default SearchInputPage;