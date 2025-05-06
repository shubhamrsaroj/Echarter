import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getItinerary, updateItinerary } from '../../api/getItinerary/GetItinerary';
import { toast } from 'react-toastify';

const RecentItineraryContext = createContext();

export const useRecentItinerary = () => useContext(RecentItineraryContext);

export const RecentItineraryProvider = ({ children }) => {
  const [recentItineraries, setRecentItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false); // 🔒 Prevent double API calls

  const fetchRecentItineraries = async (days = 4) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getItinerary({ days });
      if (response.success && response.data?.itineraries) {
        setRecentItineraries(response.data.itineraries);
      } else {
        setError('Failed to fetch recent itineraries');
      }
    } catch (err) {
      setError(err.message || 'An error occurred fetching itineraries');
    } finally {
      setLoading(false);
    }
  };

  const updateItineraryText = async (itineraryId, text, needs = false) => {
    setUpdating(true);
    try {
      const response = await updateItinerary(itineraryId, text, needs);
      
      if (response?.success) {
        // Update the local state to reflect both text and needs changes
        setRecentItineraries(prev => 
          prev.map(itinerary => 
            itinerary.itineraryID === itineraryId 
              ? { ...itinerary, itineraryText: text, needs: needs }
              : itinerary
          )
        );
        
        // Show success toast
        toast.success(response.message || "Update successful", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return true;
      } else {
        throw new Error(response?.message || "Failed to update itinerary");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to update itinerary";
      setError(errorMessage);
      // Show error toast
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchRecentItineraries();
      hasFetched.current = true;
    }
  }, []);

  return (
    <RecentItineraryContext.Provider
      value={{
        recentItineraries,
        loading,
        updating,
        error,
        fetchRecentItineraries,
        updateItineraryText,
      }}
    >
      {children}
    </RecentItineraryContext.Provider>
  );
};
