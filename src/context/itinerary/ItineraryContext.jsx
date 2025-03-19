import React, { createContext, useState, useContext, useEffect } from 'react';
import { ItineraryService } from '../../api/itinerary/ItineraryService';
import { useNavigate, useLocation } from 'react-router-dom';

const ItineraryContext = createContext();

export const useItinerary = () => useContext(ItineraryContext);

export const ItineraryProvider = ({ children }) => {
  const [itineraryData, setItineraryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentFlight, setCurrentFlight] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const getItineraryByText = async (itineraryText) => {
    try {
      setLoading(true);
      setError(null);
      setItineraryData(null);

      const response = await ItineraryService.getItineraryByText(itineraryText);

      if (response.success) {
        const flights = response.data.itineraryResponseNewdata.itinerary.map((leg) => ({
          from: leg.dep_place,
          to: leg.arrv_place,
          fromCoordinates: {
            lat: leg.dep_lat,
            long: leg.dep_long,
          },
          toCoordinates: {
            lat: leg.arrv_lat,
            long: leg.arrv_long,
          },
        }));

        setItineraryData({
          ...response.data,
          flights,
        });
      } else {
        setError(response.message || 'Failed to get itinerary');
      }
      return response.data;
    } catch (error) {
      setError(error.message || 'An error occurred while fetching itinerary');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCompaniesByCategory = async (baseOption, flight, page = 1, size = 20) => {
    navigate('/itinerary/base-details');
    
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
        pax: pax,
        maxLeg: maxLeg,
        pageNumber: page,
        pageSize: size,
        seenPrice: baseOption.price,
        seenCurrency: baseOption.currency
      };
      
      const response = await ItineraryService.getCompaniesByCategory(payload);

      if (response.success) {
        const companies = response.data.companies || response.data;
        setSelectedCompanyDetails(companies);
        setCurrentPage(page);
        setPageSize(size);

        const totalCompanies = response.data.totalCompanies || (companies.length < size ? companies.length : size * page + 1);
        const calculatedTotalPages = Math.ceil(totalCompanies / size);

        setTotalCount(totalCompanies);
        setTotalPages(calculatedTotalPages);
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
    navigate('/itinerary/match-details');

    try {
      setLoading(true);
      setError(null);

      const ids = itineraryData?.match?.ids ?? [];
      const payload = {
        path: 'match',
        itineraryId: itineraryData?.itineraryId,
      };
      ids.forEach((id, index) => {
        payload[`Ids[${index}]`] = id;
      });

      const response = await ItineraryService.getCompaniesByCategory(payload);

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
    navigate('/itinerary/date-adjustment-details');

    try {
      setLoading(true);
      setError(null);

      const ids = itineraryData?.dateAdjustment?.ids ?? [];

      const payload = {
        path: 'dateAdjustment',
        itineraryId: itineraryData?.itineraryId,
      };
      ids.forEach((id, index) => {
        payload[`Ids[${index}]`] = id;
      });

      const response = await ItineraryService.getCompaniesByCategory(payload);

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
    navigate('/itinerary/broker-details');

    try {
      setLoading(true);
      setError(null);

      const ids = itineraryData?.broker?.ids ?? [];
      const payload = {
        path: 'broker',
        itineraryId: itineraryData?.itineraryId,
      };
      
      ids.forEach((id, index) => {
        payload[`Ids[${index}]`] = id;
      });

      const response = await ItineraryService.getCompaniesByCategory(payload);

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
    if (!currentFlight || !currentCategory) {
      return;
    }

    try {
      setLoading(true);

      const baseOption = {
        category: currentCategory,
      };

      await getCompaniesByCategory(baseOption, currentFlight, newPage, newPageSize);
    } catch (error) {
      setError(error.message || 'Failed to change page');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    itineraryData,
    loading,
    error,
    selectedCompanyDetails,
    currentPage,
    pageSize,
    currentCategory,
    totalCount,
    totalPages,
    getItineraryByText,
    getCompaniesByCategory,
    getCompaniesByMatch,
    getCompaniesByDateAdjustment,
    getCompaniesByBroker,
    changePage,
    setPageSize,
  };

  return <ItineraryContext.Provider value={value}>{children}</ItineraryContext.Provider>;
};










