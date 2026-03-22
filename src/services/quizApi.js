import api from './api.js';

/**
 * Quiz API service for communicating with backend
 */
class QuizApiService {
  constructor() {
    // Use the centralized API instance instead of creating a new one
    this.api = api;
  }

  /**
   * Start anonymous quiz session
   */
  async startAnonymousQuiz() {
    try {
      const response = await this.api.post('/quiz/start');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to start quiz');
    }
  }

  /**
   * Save anonymous quiz answer
   */
  async saveAnonymousAnswer(sessionId, questionId, answer) {
    try {
      const response = await this.api.post('/quiz/answer', {
        sessionId,
        questionId,
        answer
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait before continuing.');
      }
      throw new Error(error.response?.data?.message || 'Failed to save answer');
    }
  }

  /**
   * Get anonymous quiz session
   */
  async getAnonymousQuiz(sessionId) {
    try {
      const response = await this.api.get(`/quiz/session/${sessionId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Session not found or expired
      }
      throw new Error(error.response?.data?.message || 'Failed to get quiz session');
    }
  }

  /**
   * Generate mini results for anonymous users
   */
  async generateMiniResults(payload) {
    try {
      const requestPayload = typeof payload === 'string'
        ? { sessionId: payload }
        : payload;

      const response = await this.api.post('/quiz/mini-results', requestPayload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate results');
    }
  }

  /**
   * Transfer anonymous quiz to user account
   * @param {string} sessionId - Anonymous session ID
   * @param {string} userId - User ID
   * @param {Object} userData - User data
   */
  async transferAnonymousQuiz(sessionId, userId, userData) {
    try {
      const response = await this.api.post('/quiz/transfer', {
        sessionId,
        userId,
        userData
      });
      return response.data;
    } catch (error) {
      console.error('Transfer anonymous quiz error:', error);
      throw new Error(error.response?.data?.message || 'Failed to transfer quiz');
    }
  }

  /**
   * Transfer anonymous quiz with conflict resolution
   * @param {string} sessionId - Anonymous session ID
   * @param {string} userId - User ID
   * @param {Object} userData - User data
   * @param {Object} quizData - Complete quiz data from localStorage
   */
  async transferAnonymousQuizWithConflicts(sessionId, userId, userData, quizData) {
    try {
      const response = await this.api.post('/quiz/transfer', {
        sessionId,
        userId,
        userData,
        resolveConflicts: true,
        quizData
      });
      return response.data;
    } catch (error) {
      console.error('Transfer anonymous quiz with conflicts error:', error);
      throw new Error(error.response?.data?.message || 'Failed to transfer quiz');
    }
  }

  /**
   * Save quiz progress for authenticated user
   * @param {Object} progressPayload - Progress payload
   * @param {string} token - Auth token
   */
  async saveProgress(progressPayload, token) {
    try {
      const response = await this.api.post('/quiz/progress', progressPayload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Save quiz progress error:', error);
      throw new Error(error.response?.data?.message || 'Failed to save progress');
    }
  }

  /**
   * Complete quiz from progress
   * @param {Array} answers - Final answers array
   * @param {string} token - Auth token
   */
  async completeFromProgress(answers, token) {
    try {
      const response = await this.api.post('/quiz/complete-progress', {
        answers
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Complete quiz from progress error:', error);
      throw new Error(error.response?.data?.message || 'Failed to complete quiz');
    }
  }

  /**
   * Get user's quiz state (for authenticated users)
   */
  async getUserQuizState(authToken) {
    try {
      const response = await this.api.get('/quiz/user-state', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(error.response?.data?.message || 'Failed to get quiz state');
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.api.get('/quiz/health');
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
const quizApi = new QuizApiService();

export default quizApi;
