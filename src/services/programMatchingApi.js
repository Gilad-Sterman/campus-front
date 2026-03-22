import api from './api.js';

/**
 * Program Matching API service for communicating with backend
 */
class ProgramMatchingApiService {
  constructor() {
    // Use the centralized API instance
    this.api = api;
  }

  /**
   * Match programs for a student based on their quiz results
   * @param {Object} studentProfile - Student's quiz results and preferences
   * @returns {Promise<Object>} Matched programs response
   */
  async matchPrograms(studentProfile) {
    try {
      const response = await this.api.post('/program-matching/match', {
        studentProfile
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to match programs');
    }
  }

  /**
   * Get test matching data (for development)
   * @returns {Promise<Object>} Test matching response
   */
  async getTestMatching() {
    try {
      const response = await this.api.get('/program-matching/match/test');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to get test matching data');
    }
  }
}

// Create and export a singleton instance
const programMatchingApi = new ProgramMatchingApiService();
export default programMatchingApi;
