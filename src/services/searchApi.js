import api from './api';

// Simple cache to prevent duplicate API calls
const cache = {
  searchResults: null,
  domains: null,
  programDetails: {},
  cacheTime: 5 * 60 * 1000 // 5 minutes
};

// Search API functions
export const searchApiService = {
  // Search programs for intro page
  async searchPrograms(query = '', options = {}) {
    try {
      const params = {};
      if (query) params.q = query;
      if (options.limit) params.limit = options.limit;
      if (options.university_id) params.university_id = options.university_id;
      if (options.status) params.status = options.status;

      const response = await api.get('/search/programs', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching programs:', error);
      throw error;
    }
  },

  // Search programs within a specific domain
  async searchProgramsByDomain(domain, query = '', options = {}) {
    try {
      const params = {};
      if (query) params.q = query;
      if (options.limit) params.limit = options.limit;

      const response = await api.get(`/search/domains/${encodeURIComponent(domain)}/programs`, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching programs by domain:', error);
      throw error;
    }
  },

  // Get detailed program information
  async getProgramDetails(programId) {
    // Check cache first
    if (cache.programDetails[programId] && 
        cache.programDetails[programId].timestamp > Date.now() - cache.cacheTime) {
      return cache.programDetails[programId].data;
    }

    try {
      const response = await api.get(`/search/programs/${programId}`);
      
      // Cache the result
      cache.programDetails[programId] = {
        data: response.data,
        timestamp: Date.now()
      };
      
      return response.data;
    } catch (error) {
      console.error('Error fetching program details:', error);
      throw error;
    }
  },

  // Get all available domains with program counts
  async getDomains() {
    // Check cache first
    if (cache.domains && cache.domains.timestamp > Date.now() - cache.cacheTime) {
      return cache.domains.data;
    }

    try {
      const response = await api.get('/search/domains');
      
      // Cache the result
      cache.domains = {
        data: response.data,
        timestamp: Date.now()
      };
      
      return response.data;
    } catch (error) {
      console.error('Error fetching domains:', error);
      throw error;
    }
  }
};

export default searchApiService;
