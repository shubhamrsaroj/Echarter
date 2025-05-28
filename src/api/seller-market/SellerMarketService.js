import api from '../axios.config';

export const SellerMarketService = {
  
  getAllAircraftTypesService: async () => {
    try {
      const response = await api.get('/api/Admin/GetallAircraftTypes');
      // Extract the data array from the response
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching aircraft types:', error);
      throw error;
    }
  },
  
  searchAirportByITAService: async (query) => {
    try {
      const response = await api.get(`/api/Markets/SearchAirportByITA_ICO_NAME_LOCATION`, {
        params: { globalInput: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching airports:', error);
      throw error;
    }
  },
  
  addItineraryService: async (itineraryData) => {
    try {
      const response = await api.post('/api/SinglePoint/AddItinerary', itineraryData);
      return response.data;
    } catch (error) {
      console.error('Error adding itinerary:', error);
      throw error;
    }
  },

  updateItineraryService: async (itineraryData) => {
    try {
      const response = await api.post('/api/SinglePoint/UpdateItinerary', itineraryData);
      return response.data;
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw error;
    }
  },


  getOptionsbyItineraryIdService: async (itineraryId) => {
    try {
      const response = await api.get(`/api/SinglePoint/GetOptionsByItineraryId?itineraryId=${itineraryId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting options by itinerary ID:', error);
      throw error;
    }
  },

  fetchUserDetails: async (userId) => {
    try {
      const response = await api.get(`/api/SinglePoint/GetUserDetailsById?Id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  getUserItineraries: async (userId, days = 7) => {
    try {
      const response = await api.get(`/api/singlePoint/GetItinerary?userId=${userId}&days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user itineraries:', error);
      throw error;
    }
  },

  getAllTasks: async () => {
    try {
      const response = await api.get('/api/SinglePoint/GetAllTask');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  
  addTask: async (taskData) => {
    try {
      const response = await api.post('/api/SinglePoint/AddTask', taskData);
      return response.data;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },
  
  updateTask: async (taskData) => {
    try {
      const response = await api.post('/api/SinglePoint/UpdateTask', taskData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },
  
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/api/SinglePoint/DeleteTask?Id=${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  
  getCompanyById: async (id) => {
    try {
      const response = await api.get(`/api/SinglePoint/GetCompaniesById?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  },

  getItineraryById: async (id) => {
    try {
      const response = await api.get(`/api/singlePoint/GetItinerary?Id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching itinerary details:', error);
      throw error;
    }
  },

  getCompaniesByCategory: async (payload) => {
    try {
      const response = await api.post('/api/SinglePoint/GetCompaniesByCategory', payload);
      return response.data;
    } catch (error) {
      console.error('Error fetching companies by category:', error);
      throw error;
    }
  },
};
