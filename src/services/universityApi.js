import api from './api';

// University API functions using the shared api instance

// University API functions
export const universityApiService = {
  // Get all universities
  async getAllUniversities(includeStats = false) {
    try {
      const params = includeStats ? { stats: 'true' } : {};
      const response = await api.get('/universities', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching universities:', error);
      throw error;
    }
  },

  // Get university by ID
  async getUniversityById(id) {
    try {
      const response = await api.get(`/universities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching university:', error);
      throw error;
    }
  },

  // Get universities with cost data for Cost Calculator
  async getUniversitiesWithCosts() {
    try {
      const response = await api.get('/universities/costs');
      return response.data;
    } catch (error) {
      console.error('Error fetching universities with costs:', error);
      throw error;
    }
  },

  // Get travel costs by region
  async getTravelCosts() {
    try {
      const response = await api.get('/universities/travel-costs');
      return response.data;
    } catch (error) {
      console.error('Error fetching travel costs:', error);
      throw error;
    }
  }
};

export default universityApiService;
