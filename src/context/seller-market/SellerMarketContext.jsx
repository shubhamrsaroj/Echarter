import { createContext, useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SellerMarketService } from '../../api/seller-market/SellerMarketService';
import { tokenHandler } from '../../utils/tokenHandler';

export const SellerMarketContext = createContext();

export const PipelineProvider = ({ children }) => {
  const [optionsData, setOptionsData] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(null);
  const [selectedItineraryId, setSelectedItineraryId] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [currentUserCode] = useState('');
  const [userLoading] = useState(true);
  const [isGooglePlacesEnabled, setIsGooglePlacesEnabled] = useState(false);
  
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [aircraftLoading, setAircraftLoading] = useState(false);
  const [aircraftError, setAircraftError] = useState(null);
  
  // Add state for company tails
  const [companyTails, setCompanyTails] = useState([]);
  const [companyTailsLoading, setCompanyTailsLoading] = useState(false);
  const [companyTailsError, setCompanyTailsError] = useState(null);
  
  // Add state for aircraft types details
  const [aircraftTypesDetails, setAircraftTypesDetails] = useState([]);
  const [aircraftTypesDetailsLoading, setAircraftTypesDetailsLoading] = useState(false);
  const [aircraftTypesDetailsError, setAircraftTypesDetailsError] = useState(null);
  
  const [airports, setAirports] = useState([]);
  const [airportLoading, setAirportLoading] = useState(false);
  const [airportError, setAirportError] = useState(null);

  // Add states for user itineraries
  const [userItineraries, setUserItineraries] = useState([]);
  const [itinerariesLoading, setItinerariesLoading] = useState(false);
  const [itinerariesError, setItinerariesError] = useState(null);

  // Add states for tasks
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  // Add states for company data
  const [companyData, setCompanyData] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState(null);
  const [userCodes, setUserCodes] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [teamUserInfo, setTeamUserInfo] = useState([]);
  const [selectedReviews, setSelectedReviews] = useState([]);
  
  // Add state for selected itinerary details
  const [selectedItineraryDetails, setSelectedItineraryDetails] = useState(null);
  const [itineraryDetailsLoading, setItineraryDetailsLoading] = useState(false);
  const [itineraryDetailsError, setItineraryDetailsError] = useState(null);

  // Add state for search form prefill data
  const [searchFormPrefillData, setSearchFormPrefillData] = useState(null);

  // Add state for companies by category
  const [companiesByCategory, setCompaniesByCategory] = useState([]);
  const [companiesByCategoryLoading, setCompaniesByCategoryLoading] = useState(false);
  const [companiesByCategoryError, setCompaniesByCategoryError] = useState(null);

  // Add state for company haves
  const [companyHaves, setCompanyHaves] = useState([]);
  const [companyHavesLoading, setCompanyHavesLoading] = useState(false);
  const [companyHavesError, setCompanyHavesError] = useState(null);

  const pendingRequestId = useRef(null);
  const requestTimeoutRef = useRef(null);

  // Get company ID from token on initial load
  useEffect(() => {
    const token = tokenHandler.getToken();
    const userData = token ? tokenHandler.parseUserFromToken(token) : null;
    if (userData && userData.comId) {
      setCompanyId(userData.comId);
    }
  }, []);

  // Fetch company data when companyId is available
  useEffect(() => {
    if (companyId) {
      getCompanyById(companyId);
    }
  }, [companyId]);

  // Add method to get all company tails
  const getAllCompanyTails = useCallback(async () => {
    if (!companyId) {
      // Try to get companyId from token
      const token = tokenHandler.getToken();
      const userData = token ? tokenHandler.parseUserFromToken(token) : null;
      if (!userData || !userData.comId) {
        setCompanyTailsError('Company ID not found');
        return [];
      }
    }
    
    setCompanyTailsLoading(true);
    setCompanyTailsError(null);
    try {
      const data = await SellerMarketService.getCompanyTails(companyId);
      setCompanyTails(data);
      return data;
    } catch (err) {
      setCompanyTailsError(err.message || 'Failed to fetch company tails');
      return [];
    } finally {
      setCompanyTailsLoading(false);
    }
  }, [companyId]);
  
  // Add method to get all aircraft types details
  const getAllAircraftTypesDetails = useCallback(async () => {
    setAircraftTypesDetailsLoading(true);
    setAircraftTypesDetailsError(null);
    try {
      const response = await SellerMarketService.getAllAircraftTypesDetails();
      console.log("API Response for Aircraft Types:", response);
      // Ensure we set an array even if the response is not what we expected
      setAircraftTypesDetails(Array.isArray(response) ? response : []);
      return response;
    } catch (err) {
      setAircraftTypesDetailsError(err.message || 'Failed to fetch aircraft types details');
      setAircraftTypesDetails([]);
      return [];
    } finally {
      setAircraftTypesDetailsLoading(false);
    }
  }, []);

  const getAllAircraftTypes = async () => {
    setAircraftLoading(true);
    setAircraftError(null);
    try {
      const data = await SellerMarketService.getAllAircraftTypesService();
      setAircraftTypes(data);
      return data;
    } catch (err) {
      setAircraftError(err.message || 'Failed to fetch aircraft types');
      return [];
    } finally {
      setAircraftLoading(false);
    }
  };

  const searchAirportByITA = async (query) => {
    if (!query || query.length < 3) return [];
    
    setAirportLoading(true);
    setAirportError(null);
    try {
      const data = await SellerMarketService.searchAirportByITAService(query);
      setAirports(data);
      return data;
    } catch (err) {
      setAirportError(err.message || 'Failed to search airports');
      return [];
    } finally {
      setAirportLoading(false);
    }
  };

  const addItinerary = async (itineraryData) => {
    try {
      const response = await SellerMarketService.addItineraryService(itineraryData);
      if (response.success && response.data) {
        // Return the response with the itineraryId to ensure it's available for subsequent calls
        return {
          ...response.data,
          itineraryId: response.data.id // Extract the ID from the response data
        };
      }
      return null;
    } catch (error) {
      console.error('Error adding itinerary:', error);
      return null;
    }
  };

  const updateItinerary = async (itineraryData) => {
    try {
      const response = await SellerMarketService.updateItineraryService(itineraryData);
      
      // Return the response with the itineraryId to ensure it's available for subsequent calls
      if (response.success) {
        return {
          ...response,
          itineraryId: itineraryData.id // Return the itineraryId from the input data
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error updating itinerary:', error);
      return null;
    }
  };

  const getOptionsbyItineraryId = useCallback(async (itineraryId) => {
    if (!itineraryId) return null;
    
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }
    
    if (pendingRequestId.current === itineraryId && optionsLoading) {
      return null;
    }
    return new Promise((resolve) => {
      requestTimeoutRef.current = setTimeout(async () => {
        setOptionsLoading(true);
        setOptionsError(null);
        pendingRequestId.current = itineraryId;
        setSelectedItineraryId(itineraryId);
        
        try {
          const response = await SellerMarketService.getOptionsbyItineraryIdService(itineraryId);
          
          if (response.success && response.data) {
            const flights = response.data.itineraryResponseNewdata?.itinerary?.map((leg) => ({
              from: leg.departurePlace,
              to: leg.arrivalPlace,
              fromCoordinates: { 
                lat: leg.dep_lat || leg.departureLatitude, 
                long: leg.dep_long || leg.departureLongitude 
              },
              toCoordinates: { 
                lat: leg.arrv_lat || leg.arrivalLatitude, 
                long: leg.arrv_long || leg.arrivalLongitude 
              },
              fromCity: leg.dep_place || leg.departurePlace,
              toCity: leg.arrv_place || leg.arrivalPlace,
              distance: leg.distance,
              flightCategory: leg.flight_cat,
              legNumber: leg.leg_number,
              pax: leg.pax,
              date: leg.date,
            })) || [];
  
            const newOptionsData = { ...response.data, flights };
            setOptionsData(newOptionsData);
            resolve(newOptionsData);
          } else {
            const error = {
              message: response.data?.message || response.message || 'No options found for this itinerary',
              statusCode: response.statusCode
            };
            setOptionsError(error);
            resolve(null);
          }
        } catch (error) {
          const errorMessage = error.message || 'An error occurred while fetching options';
          setOptionsError({ message: errorMessage });
          resolve(null);
        } finally {
          setOptionsLoading(false);
          pendingRequestId.current = null;
        }
      }, 100);
    });
  }, []);
  
  const cleanup = useCallback(() => {
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }
    setOptionsData(null);
    setOptionsError(null);
    setOptionsLoading(false);
    setSelectedItineraryId(null);
    pendingRequestId.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []);

  // Add toggleGooglePlaces function
  const toggleGooglePlaces = useCallback((enabled) => {
    setIsGooglePlacesEnabled(enabled);
  }, []);

  // Add getUserItineraries function
  const getUserItineraries = useCallback(async (days = 7) => {
    setItinerariesLoading(true);
    setItinerariesError(null);
    
    try {
      const token = tokenHandler.getToken();
      const userData = token ? tokenHandler.parseUserFromToken(token) : null;
      
      if (!userData || !userData.id) {
        throw new Error("User ID not found in token");
      }
      
      const response = await SellerMarketService.getUserItineraries(userData.id, days);
      
      if (response.success && response.data && response.data.itineraries) {
        setUserItineraries(response.data.itineraries);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user itineraries');
      }
    } catch (err) {
      setItinerariesError(err.message || 'Failed to fetch user itineraries');
      return null;
    } finally {
      setItinerariesLoading(false);
    }
  }, []);

  // Add getAllTasks function
  const getAllTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    
    try {
      const response = await SellerMarketService.getAllTasks();
      
      if (response.success && response.data && response.data.companies) {
        setTasks(response.data.companies);
        return response;
      } else {
        throw new Error(response.message || 'Failed to load tasks data');
      }
    } catch (err) {
      setTasksError(err.message || 'Error fetching tasks');
      console.error(err);
      return null;
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Add addTask function
  const addTask = useCallback(async (taskData) => {
    try {
      const response = await SellerMarketService.addTask(taskData);
      
      if (response.success) {
        // Refresh the task list
        await getAllTasks();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add task');
      }
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  }, [getAllTasks]);

  // Add getCompanyById function
  const getCompanyById = useCallback(async (id) => {
    if (!id) return null;
    
    setCompanyLoading(true);
    setCompanyError(null);
    
    try {
      const response = await SellerMarketService.getCompanyById(id);
      
      if (response.success && response.data) {
        setCompanyData(response.data);
        
        // Extract userCodes and IDs from userInfo
        if (response.data.userInfo && Array.isArray(response.data.userInfo)) {
          setTeamUserInfo(response.data.userInfo);
          const userCodeData = response.data.userInfo
            .map(user => {
              // If userCode is null, use firstName instead
              const userCode = user.userCode || user.firstName;
              if (!userCode) return null;
              
              return {
                id: user.id,
                userCode: userCode
              };
            })
            .filter(item => item !== null); // Filter out any null values
          
          setUserCodes(userCodeData);
        }
        
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch company data');
      }
    } catch (err) {
      setCompanyError(err.message || 'Error fetching company data');
      console.error(err);
      return null;
    } finally {
      setCompanyLoading(false);
    }
  }, []);

  // Add getItineraryById function
  const getItineraryById = useCallback(async (id) => {
    if (!id) return null;
    
    setItineraryDetailsLoading(true);
    setItineraryDetailsError(null);
    
    try {
      const response = await SellerMarketService.getItineraryById(id);
      
      if (response.success && response.data) {
        setSelectedItineraryDetails(response.data);
        
        // Process the itinerary data for prefilling the search form
        if (response.data.itineraries && response.data.itineraries.length > 0) {
          const itineraryItem = response.data.itineraries[0];
          const itineraryData = itineraryItem.itineraryResponseNewdata;
          
          if (itineraryData) {
            // Prepare data for prefilling the search form
            const prefillData = {
              itineraryId: id,
              tripCategory: itineraryData.tripCategory || 'Passenger',
              equipmentCategory: itineraryData.aircraftCategory || 'Equipment',
              flightDetails: itineraryData.itinerary.map(leg => {
                // Convert ISO date strings to Date objects
                const departureDate = new Date(leg.date);
                const arrivalDate = new Date(leg.arrivalDate);
                
                return {
                  id: leg.legNumber || 1,
                  from: leg.departurePlace,
                  fromPlace: leg.departurePlace,
                  fromDateTime: departureDate,
                  fromCoordinates: { 
                    lat: leg.departureLatitude || 0, 
                    long: leg.departureLongitude || 0 
                  },
                  fromShiftMins: leg.departureShiftmin || 330,
                  to: leg.arrivalPlace,
                  toPlace: leg.arrivalPlace,
                  toDateTime: arrivalDate,
                  toCoordinates: { 
                    lat: leg.arrivalLatitude || 0, 
                    long: leg.arrivalLongitude || 0 
                  },
                  toShiftMins: leg.arrivalShiftmin || 330,
                  pax: leg.pax || 0,
                  flightCategory: leg.flightCategory || 'Domestic',
                  distance: leg.distance || 0
                };
              })
            };
            
            setSearchFormPrefillData(prefillData);
          }
        }
        
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch itinerary details');
      }
    } catch (err) {
      setItineraryDetailsError(err.message || 'Error fetching itinerary details');
      console.error(err);
      return null;
    } finally {
      setItineraryDetailsLoading(false);
    }
  }, []);

  // Add function to clear search form prefill data
  const clearSearchFormPrefillData = useCallback(() => {
    setSearchFormPrefillData(null);
  }, []);

  // Add deleteTask function
  const deleteTask = useCallback(async (taskId) => {
    try {
      const response = await SellerMarketService.deleteTask(taskId);
      
      if (response.success) {
        // Refresh the task list after successful deletion
        await getAllTasks();
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [getAllTasks]);

  // Add updateTask function
  const updateTask = useCallback(async (taskData) => {
    try {
      // Get company ID from token
      const token = tokenHandler.getToken();
      const userData = token ? tokenHandler.parseUserFromToken(token) : null;
      const companyId = userData?.comId;
      
      if (!companyId) {
        throw new Error("Company ID not found in token");
      }
      
      // Add company ID to task data
      const updatedTaskData = {
        ...taskData,
        ownerCom: companyId
      };
      
      const response = await SellerMarketService.updateTask(updatedTaskData);
      
      if (response.success) {
        // Refresh the task list after successful update
        await getAllTasks();
        return response;
      } else {
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  }, [getAllTasks]);

  // Add getCompaniesByCategory function
  const getCompaniesByCategory = useCallback(async (payload) => {
    // For match and dateAdjustment paths, check for ids
    if ((payload.path === "match" || payload.path === "dateAdjustment") && 
        (!payload.ids || payload.ids.length === 0)) {
      return null;
    }
    
    // For base path, check for required parameters
    if (payload.path === "base" && (!payload.category || !payload.fromCoordinates || !payload.toCoordinates)) {
      return null;
    }
    
    setCompaniesByCategoryLoading(true);
    setCompaniesByCategoryError(null);
    
    try {
      const response = await SellerMarketService.getCompaniesByCategory(payload);
      
      if (response.success && response.data) {
        setCompaniesByCategory(response.data || []);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch companies by category');
      }
    } catch (err) {
      setCompaniesByCategoryError(err.message || 'Error fetching companies by category');
      console.error(err);
      return null;
    } finally {
      setCompaniesByCategoryLoading(false);
    }
  }, []);

  // Add getAllCompanyHaves function
  const getAllCompanyHaves = useCallback(async (companyId) => {
    if (!companyId) {
      // If no companyId is provided, try to get it from the token
      const token = tokenHandler.getToken();
      const userData = token ? tokenHandler.parseUserFromToken(token) : null;
      companyId = userData?.comId;
      
      if (!companyId) {
        throw new Error("Company ID not found");
      }
    }
    
    setCompanyHavesLoading(true);
    setCompanyHavesError(null);
    
    try {
      const response = await SellerMarketService.getAllCompanyHaves(companyId);
      
      if (response.success && response.data) {
        setCompanyHaves(response.data.haves || []);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch company haves');
      }
    } catch (err) {
      setCompanyHavesError(err.message || 'Error fetching company haves');
      console.error(err);
      return null;
    } finally {
      setCompanyHavesLoading(false);
    }
  }, []);

  // Add deleteHave function
  const deleteHave = useCallback(async (haveId) => {
    try {
      const response = await SellerMarketService.deleteHave(haveId);
      
      if (response.success) {
        // Refresh the haves list after successful deletion
        await getAllCompanyHaves(companyId);
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete have');
      }
    } catch (err) {
      console.error('Error deleting have:', err);
      throw err;
    }
  }, [getAllCompanyHaves, companyId]);

  const getTrustScoreInfo = useCallback(async () => {
    try {
      const response = await SellerMarketService.getTrustScoreInfo(
        "trustscore",
        "article"
      );

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const url = response.data[0].url;
        if (url) {
          window.open(url, "_blank");
          return;
        }
      }

      throw new Error("No URL returned from the API");
    } catch (err) {
      console.error("Error fetching trust score info:", err);
    }
  }, []);

  // Added getReviews
  const getReviews = useCallback(async (id) => {
    try {
      const response = await SellerMarketService.getReviews(id);
  
      if (response && response.data) {
        setSelectedReviews(response.data); 
        return response.data;
      } else {
        throw new Error(response.message || "Failed to get Reviews");
      }
    } catch (err) {
      console.error("Error fetching Reviews:", err);
      throw err;
    }
  }, []);

  return (
    <SellerMarketContext.Provider value={{ 
      needsRefresh,
      setNeedsRefresh,
      aircraftTypes,
      aircraftLoading,
      aircraftError,
      getAllAircraftTypes,
      
      // Add new values for company tails
      companyTails,
      companyTailsLoading,
      companyTailsError,
      getAllCompanyTails,
      
      // Add new values for aircraft types details
      aircraftTypesDetails,
      aircraftTypesDetailsLoading,
      aircraftTypesDetailsError,
      getAllAircraftTypesDetails,
      
      airports,
      airportLoading,
      airportError,
      searchAirportByITA,
      addItinerary,
      updateItinerary,
      optionsData,
      optionsLoading,
      optionsError,
      getOptionsbyItineraryId,
      selectedItineraryId,
      setSelectedItineraryId,
      cleanup,
      currentUserCode,
      userLoading,
      isGooglePlacesEnabled,
      toggleGooglePlaces,
      userItineraries,
      itinerariesLoading,
      itinerariesError,
      getUserItineraries,
      tasks,
      tasksLoading,
      tasksError,
      getAllTasks,
      addTask,
      updateTask,
      deleteTask,
      companyData,
      companyLoading,
      companyError,
      getCompanyById,
      userCodes,
      companyId,
      getItineraryById,
      selectedItineraryDetails,
      itineraryDetailsLoading,
      itineraryDetailsError,
      searchFormPrefillData,
      clearSearchFormPrefillData,
      companiesByCategory,
      companiesByCategoryLoading,
      companiesByCategoryError,
      getCompaniesByCategory,
      companyHaves,
      companyHavesLoading,
      companyHavesError,
      getAllCompanyHaves,
      deleteHave,
      getReviews,
      getTrustScoreInfo,
      teamUserInfo,
      selectedReviews
    }}>
      {children}
    </SellerMarketContext.Provider>
  );
};

PipelineProvider.propTypes = {
  children: PropTypes.node.isRequired,
};