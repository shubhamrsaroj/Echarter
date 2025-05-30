import api from '../axios.config';

export const getTripCategoryService = async () => {
  const response = await api.get('/api/SinglePoint/GetInfo', {
    params: {
      topic: 'TripCategory',
      category: 'dropdown'
    }
  });
  return response.data;
};

export const getEquipmentService = async () => {
  const response = await api.get('/api/SinglePoint/GetInfo', {
    params: {
      topic: 'EqptCat',
      category: 'dropdown'
    }
  });
  return response.data;
};

export const getAvailabilityService = async () => {
  const response = await api.get('/api/SinglePoint/GetInfo', {
    params: {
      topic: 'availability',
      category: 'dropdown'
    }
  });
  return response.data;
};

export const getCrmCategoriesService = async () => {
  const response = await api.get('/api/SinglePoint/GetInfo', {
    params: {
      topic: 'CrmCategory',
      category: 'dropdown'
    }
  });
  return response.data;
};

export const getPeopleCategoriesService = async () => {
  const response = await api.get('/api/SinglePoint/GetInfo', {
    params: {
      topic: 'PeopleCategory',
      category: 'dropdown'
    }
  });
  return response.data;
};

export const getCrewSubcategoriesService = async () => {
  const response = await api.get('/api/SinglePoint/GetInfo', {
    params: {
      topic: 'CrewCategory',
      category: 'dropdown'
    }
  });
  return response.data;
}; 