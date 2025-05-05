import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/CharterSearch/SearchContext';
import { RecentItineraryProvider } from '../../context/RecentItineraryContext/RecentItineraryContext';
import SearchInput from '../../components/CharterSearch/Search/SearchInput';
import RecentSearches from '../../components/RecentSearches/RecentSearches';
import ErrorPrompt from '../../components/CharterSearch/SearchDetails/ErrorPrompt';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { pushNotificationService } from '../../api/Acs/pushNotificationService';
import { tokenHandler } from '../../utils/tokenHandler';
import { toast } from 'react-toastify';

const SearchInputPage = () => {
  const { loading, error, getItineraryByText, getOptionsByItineraryId } = useSearch();
  const [showError, setShowError] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  const navigate = useNavigate();
  


  useEffect(() => {
    const registerForPushNotifications = async () => {
      // Check if user is authenticated
      const token = tokenHandler.getToken();
      if (!token) {
        console.log('User not authenticated, skipping push registration');
        return;
      }

      try {
        // Register service worker
        const swRegistration = await pushNotificationService.registerServiceWorker();
        // console.log('Service worker registered successfully');
        
        // Get push subscription
        const subscription = await pushNotificationService.getSubscription(swRegistration);
  
        // Register device with backend
        const result = await pushNotificationService.registerDevice(subscription);
        // console.log('Device registration result:', result);
        
        if (result.status === 'skipped' || result.status === 'cached') {
          // console.log('Device registration handled:', result.message);
        } else {
          console.log('Device registered successfully');
          toast.success('Push notifications enabled', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } catch (error) {
        console.error('Push notification registration failed:', error);
        toast.error('Failed to setup push notifications: ' + (error.message || 'Unknown error'), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };

    registerForPushNotifications();
  }, []);



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

  const handleRecentItinerarySelect = async (itineraryId) => {
    setShowError(false);
    try {
      const response = await getOptionsByItineraryId(itineraryId);
      if (response?.itineraryResponseNewdata?.itinerary) {
        navigate('/search-details');
      } else {
        setShowError(true);
      }
    } catch (err) {
      console.error('Failed to fetch itinerary options:', err);
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
            <SearchInput 
              onSearch={handleItinerarySearch} 
              disabled={loading}
              showRecentSearches={showRecentSearches}
              onToggleRecentSearches={() => setShowRecentSearches(!showRecentSearches)}
            />
          </div>
          
          {/* Recent Searches Component */}
          <div className="md:w-[450px]">
            {showRecentSearches && (
              <RecentSearches 
                onSelectItinerary={handleRecentItinerarySelect}
                onClose={() => setShowRecentSearches(false)}
              />
            )}
          </div>
        </div>
     
        {/*  Loading Indicator */}
        {loading && <LoadingOverlay />}
      </div>
    </RecentItineraryProvider>
  );
};

export default SearchInputPage;