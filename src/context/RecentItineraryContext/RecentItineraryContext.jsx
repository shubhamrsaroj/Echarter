import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getItinerary } from '../../api/getItinerary/GetItinerary';

const RecentItineraryContext = createContext();

export const useRecentItinerary = () => useContext(RecentItineraryContext);

export const RecentItineraryProvider = ({ children }) => {
  const [recentItineraries, setRecentItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false); // 🔒 Prevent double API calls

  const fetchRecentItineraries = async (days = 10) => {
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
        error,
        fetchRecentItineraries,
      }}
    >
      {children}
    </RecentItineraryContext.Provider>
  );
};
