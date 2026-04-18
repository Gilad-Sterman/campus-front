import api from './api';

// Simple cache to prevent duplicate API calls
const cache = {
  programs: null,
  universities: null,
  userApplications: null,
  /** GET /user-applications — MVP saved/applied list */
  savedUserApplications: null,
  applicationDocuments: null,
  applicationStatus: null,
  cacheTime: 5 * 60 * 1000 // 5 minutes
};

// Clear all cache (used on logout)
export const clearApplicationCache = () => {
  cache.programs = null;
  cache.universities = null;
  cache.userApplications = null;
  cache.savedUserApplications = null;
  cache.applicationDocuments = null;
  cache.applicationStatus = null;
};

// Application API functions
export const applicationApiService = {
  // Get user's applications
  async getUserApplications() {
    if (cache.userApplications && cache.userApplications.timestamp > Date.now() - cache.cacheTime) {
      return cache.userApplications.data;
    }
    try {
      const response = await api.get('/applications');
      cache.userApplications = {
        data: response.data,
        timestamp: Date.now()
      };
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Get specific application by ID
  async getApplicationById(id) {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  },

  // Create new application
  async createApplication(applicationData) {
    try {
      const response = await api.post('/applications', applicationData);
      // Clear cache when creating new application
      cache.userApplications = null;
      return response.data;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },

  // Update application
  async updateApplication(id, updateData) {
    try {
      const response = await api.put(`/applications/${id}`, updateData);
      // Clear cache when updating application
      cache.userApplications = null;
      return response.data;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  },

  // Delete application
  async deleteApplication(id) {
    try {
      const response = await api.delete(`/applications/${id}`);
      // Clear cache when deleting application
      cache.userApplications = null;
      return response.data;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },

  // Get application documents
  async getApplicationDocuments(applicationId) {
    try {
      const response = await api.get(`/applications/documents/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application documents:', error);
      throw error;
    }
  },

  // Upload document
  async uploadDocument(documentData) {
    try {
      const response = await api.post('/applications/documents', documentData);
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Update application basic info (Step 2)
  async updateApplicationInfo(applicationData) {
    try {
      const response = await api.patch('/applications/info', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error updating application info:', error);
      throw error;
    }
  },

  // Get application status for duplicate checking
  async getApplicationStatus(programId, universityId = null) {
    try {
      const params = { program_id: programId };
      if (universityId) {
        params.university_id = universityId;
      }
      const response = await api.get('/applications/status', { params });
      return response.data;
    } catch (error) {
      console.error('Error checking application status:', error);
      throw error;
    }
  },

  // Get universities with optional filters
  async getUniversities(filters = {}) {
    try {
      const response = await api.get('/universities', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching universities:', error);
      throw error;
    }
  },

  // Get programs with optional filters
  async getPrograms(filters = {}) {
    // Only cache if no filters are applied
    const cacheKey = Object.keys(filters).length === 0 ? 'programs' : null;
    
    if (cacheKey && cache[cacheKey] && cache[cacheKey].timestamp > Date.now() - cache.cacheTime) {
      return cache[cacheKey].data;
    }
    
    try {
      const response = await api.get('/programs', { params: filters });
      
      if (cacheKey) {
        cache[cacheKey] = {
          data: response.data,
          timestamp: Date.now()
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
  },

  // Get required documents for a program
  async getProgramRequiredDocuments(programId) {
    try {
      const response = await api.get(`/programs/${programId}/required-documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching program required documents:', error);
      throw error;
    }
  },

  /**
   * MVP "My Applications" — GET /user-applications (joined program + university).
   * @returns {Promise<{ success: boolean, data: array, count: number }>}
   */
  async getSavedUserApplications() {
    if (
      cache.savedUserApplications &&
      cache.savedUserApplications.timestamp > Date.now() - cache.cacheTime
    ) {
      return cache.savedUserApplications.data;
    }
    try {
      const response = await api.get('/user-applications');
      const body = response.data;
      cache.savedUserApplications = {
        data: body,
        timestamp: Date.now()
      };
      return body;
    } catch (error) {
      console.error('Error fetching saved user applications:', error);
      throw error;
    }
  },

  /**
   * MVP — POST /user-applications
   * @param {{ program_id: string, university_id: string }} payload
   */
  async addUserApplication(payload) {
    try {
      const response = await api.post('/user-applications', payload);
      cache.savedUserApplications = null;
      return response.data;
    } catch (error) {
      console.error('Error adding user application:', error);
      throw error;
    }
  },

  /**
   * MVP — PATCH /user-applications/:id (status saved|applied, optional external_link)
   */
  async patchUserApplication(id, updateData) {
    try {
      const response = await api.patch(`/user-applications/${id}`, updateData);
      cache.savedUserApplications = null;
      return response.data;
    } catch (error) {
      console.error('Error updating user application:', error);
      throw error;
    }
  }
};

export default applicationApiService;
