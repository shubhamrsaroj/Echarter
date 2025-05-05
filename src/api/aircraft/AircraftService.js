import api from '../axios.config';

export const AircraftService = {
  /**
   * Get all available aircraft for a seller company
   * @param {string} sellerCompanyId - The ID of the seller company
   * @returns {Promise} Promise with all available aircraft
   */
  getAllAircraft: async (sellerCompanyId) => {
    try {
      if (!sellerCompanyId) {
        throw new Error('Seller company ID is required');
      }

      const response = await api.get('/api/SinglePoint/GetCompaniesById', {
        params: { Id: sellerCompanyId }
      });
      
      if (response.data?.success && response.data.data?.tailInfo) {
        // Format the aircraft data for dropdown
        return response.data.data.tailInfo.map(aircraft => ({
          id: aircraft.id,
          typeId: aircraft.typeId,
          tail: aircraft.tail,
          aircraftTypeName: aircraft.aircraft_Type_Name,
          label: `${aircraft.tail} (${aircraft.aircraft_Type_Name})`,
          value: aircraft.id
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching all aircraft:', error);
      throw error;
    }
  }
}; 