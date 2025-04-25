import React, { createContext, useState, useContext, useEffect } from 'react';
import { SearchService } from '../../api/CharterSearch/SearchService';
import { useNavigate } from 'react-router-dom';

const ItineraryContext = createContext();

export const useSearch = () => useContext(ItineraryContext);

export const SearchProvider = ({ children }) => {
  const [itineraryData, setItineraryData] = useState(() => {
    const saved = localStorage.getItem('itineraryData');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState(() => {
    const saved = localStorage.getItem('selectedCompanyDetails');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentFlight, setCurrentFlight] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBaseOption, setSelectedBaseOption] = useState(null);

  const navigate = useNavigate();

  // Sync itineraryData and selectedCompanyDetails with localStorage
  useEffect(() => {
    if (itineraryData) {
      localStorage.setItem('itineraryData', JSON.stringify(itineraryData));
    }
  }, [itineraryData]);

  useEffect(() => {
    if (selectedCompanyDetails) {
      localStorage.setItem('selectedCompanyDetails', JSON.stringify(selectedCompanyDetails));
    }
  }, [selectedCompanyDetails]);

  const getItineraryByText = async (itineraryText) => {
    try {
      setLoading(true);
      setError(null);
      setItineraryData(null);

      const response = await SearchService.getItineraryByText(itineraryText);

      if (response.success) {
        const flights = response.data.itineraryResponseNewdata.itinerary.map((leg) => ({
          from: leg.dep_place,
          to: leg.arrv_place,
          fromCoordinates: { lat: leg.dep_lat, long: leg.dep_long },
          toCoordinates: { lat: leg.arrv_lat, long: leg.arrv_long },
        }));

        const newItineraryData = { ...response.data, flights };
        setItineraryData(newItineraryData);
        return newItineraryData;
      } else {
        setError(
          response.data && typeof response.data === 'object'
            ? response.data
            : { message: response.message || 'No found any Itinerary', statusCode: response.statusCode }
        );
        return response.data;
      }
    } catch (error) {
      setError({ message: error.message || 'An error occurred while fetching itinerary' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCompaniesByCategory = async (baseOption, flight, page = 1, size = 5) => {
    navigate('/search/base-details');
    try {
      setLoading(true);
      setError(null);

      setCurrentCategory(baseOption.category);
      setCurrentFlight(flight);

      const pax = itineraryData?.itineraryResponseNewdata?.pax || '';
      const maxLeg = itineraryData?.itineraryResponseNewdata?.maxLeg || '';

      const payload = {
        path: 'base',
        fromCoordinates: `${flight.fromCoordinates.lat},${flight.fromCoordinates.long}`,
        toCoordinates: `${flight.toCoordinates.lat},${flight.toCoordinates.long}`,
        category: baseOption.category,
        pax,
        maxLeg,
        pageNumber: page,
        pageSize: size,
        seenPrice: baseOption.price,
        seenCurrency: baseOption.currency,
      };

      const response = await SearchService.getCompaniesByCategory(payload);

      if (response.success) {
        const companies = response.data.companies || response.data;
        setSelectedCompanyDetails(companies);
        setCurrentPage(page);
        setPageSize(size);

        const totalCompanies = response.data.totalCompanies || (companies.length < size ? companies.length : size * page + 1);
        setTotalCount(totalCompanies);
        
        // Limit to a maximum of 6 pages
        const calculatedPages = Math.ceil(totalCompanies / size);
        setTotalPages(Math.min(calculatedPages, 6));
      } else {
        setError(response.message || 'Failed to get company details');
      }
      return response.data;
    } catch (error) {
      setError(error.message || 'An error occurred while fetching company details');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCompaniesByMatch = async (itineraryData) => {
    navigate('/search/match-details');
    try {
      setLoading(true);
      setError(null);

      const ids = itineraryData?.match?.ids ?? [];
      const payload = {
        path: 'match',
        itineraryId: itineraryData?.itineraryId,
        ids: ids
      };

      const response = await SearchService.getCompaniesByCategory(payload);

      if (response.success) {
        const companies = response.data || [];
        setSelectedCompanyDetails(companies);
        return response.data;
      } else {
        setError(response.message || 'Failed to get matching companies');
      }
      return response.data;
    } catch (error) {
      setError(error.message || 'An error occurred while fetching matching companies');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCompaniesByDateAdjustment = async (itineraryData) => {
    navigate('/search/date-adjustment-details');
    try {
      setLoading(true);
      setError(null);

      const ids = itineraryData?.dateAdjustment?.ids ?? [];
      const payload = {
        path: 'dateAdjustment',
        itineraryId: itineraryData?.itineraryId,
        ids: ids
      };

      const response = await SearchService.getCompaniesByCategory(payload);

      if (response.success) {
        const companies = response.data || [];
        setSelectedCompanyDetails(companies);
        return response.data;
      } else {
        setError(response.message || 'Failed to get date adjustment companies');
      }
      return response.data;
    } catch (error) {
      setError(error.message || 'An error occurred while fetching date adjustment companies');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCompaniesByBroker = async (itineraryData) => {
    navigate('/search/broker-details');
    try {
      setLoading(true);
      setError(null);

      const ids = itineraryData?.broker?.ids ?? [];
      const payload = {
        path: 'broker',
        itineraryId: itineraryData?.itineraryId,
        ids: ids
      };

      const response = await SearchService.getCompaniesByCategory(payload);

      if (response.success) {
        const companies = response.data || [];
        setSelectedCompanyDetails(companies);
        return response.data;
      } else {
        setError(response.message || 'Failed to get broker companies');
      }
      return response.data;
    } catch (error) {
      setError(error.message || 'An error occurred while fetching broker companies');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePage = async (newPage, newPageSize = pageSize) => {
    if (!currentFlight || !currentCategory) return;
    try {
      setLoading(true);
      const baseOption = { category: currentCategory };
      await getCompaniesByCategory(baseOption, currentFlight, newPage, newPageSize);
    } catch (error) {
      setError(error.message || 'Failed to change page');
    } finally {
      setLoading(false);
    }
  };

  const resetItineraryState = () => {
    setItineraryData(null);
    setSelectedCompanyDetails(null);
    setCurrentPage(1);
    setPageSize(5);
    setCurrentCategory('');
    setCurrentFlight(null);
    setTotalCount(0);
    setTotalPages(1);
    setSelectedBaseOption(null);
    setError(null);
    setLoading(false);
    localStorage.removeItem('itineraryData');
    localStorage.removeItem('selectedCompanyDetails');
    localStorage.removeItem('SelectedBaseOption');
  };

  const getOptionsByItineraryId = async (itineraryId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SearchService.getOptionsByItineraryId(itineraryId);
      
      if (response.success) {
        // Process flights data for the map
        const flights = response.data.itineraryResponseNewdata.itinerary.map((leg) => ({
          from: leg.dep_place,
          to: leg.arrv_place,
          fromCoordinates: { lat: leg.dep_lat, long: leg.dep_long },
          toCoordinates: { lat: leg.arrv_lat, long: leg.arrv_long },
        }));

        const newItineraryData = { ...response.data, flights };
        setItineraryData(newItineraryData);
        return newItineraryData;
      } else {
        setError(
          response.data && typeof response.data === 'object'
            ? response.data
            : { message: response.message || 'No options found for this itinerary', statusCode: response.statusCode }
        );
        return response.data;
      }
    } catch (error) {
      setError({ message: error.message || 'An error occurred while fetching options' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    itineraryData,
    setItineraryData, 
    loading,
    error,
    selectedCompanyDetails,
    currentPage,
    pageSize,
    currentCategory,
    totalCount,
    totalPages,
    selectedBaseOption,
    setSelectedBaseOption,
    getItineraryByText,
    getCompaniesByCategory,
    getCompaniesByMatch,
    getCompaniesByDateAdjustment,
    getCompaniesByBroker,
    changePage,
    setPageSize,
    setLoading,
    resetItineraryState,
    getOptionsByItineraryId,
  };

  return <ItineraryContext.Provider value={value}>{children}</ItineraryContext.Provider>;
};