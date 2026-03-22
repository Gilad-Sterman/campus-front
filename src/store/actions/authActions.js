import authApi from '../../services/authApi.js';
import quizApi from '../../services/quizApi.js';
import quizStorage from '../../services/quizStorage.js';
import { clearApplicationCache } from '../../services/applicationApi.js';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutSuccess,
  registerStart,
  registerSuccess,
  registerFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure
} from '../reducers/authReducer';
import { resetQuiz } from '../reducers/quizReducer';
import { clearAllCache } from '../slices/adminCacheSlice';

// Helper function to transfer quiz after successful auth with smart conflict resolution
const transferQuizIfExists = async (userId, userData, token) => {
  try {
    // Check if there's a quiz in localStorage
    const session = quizStorage.getSession();
    
    if (session) {
      const localAnswerCount = session.answers ? session.answers.length : 0;
      
      // Get current server quiz state first (with token)
      let serverQuizState = null;
      let serverAnswerCount = 0;
      
      try {
        serverQuizState = await quizApi.getUserQuizState(token);
        serverAnswerCount = serverQuizState?.data?.answers ? serverQuizState.data.answers.length : 0;
      } catch (error) {
        // If we can't get server state, assume no server quiz exists
        console.warn('Could not fetch server quiz state, assuming no server quiz:', error);
        serverAnswerCount = 0;
      }
      
      // Smart conflict resolution: choose the quiz with more progress
      if (serverAnswerCount > 0 && localAnswerCount > 0) {
        if (localAnswerCount > serverAnswerCount) {
          // Local quiz has more progress - transfer it
          const quizData = {
            sessionId: session.sessionId,
            answers: session.answers, // Send full answer objects
            status: session.status,
            currentQuestion: session.currentQuestion,
            currentQuestionId: session.currentQuestionId,
            questionPath: session.questionPath || [],
            totalQuestions: session.totalQuestions
          };
          
          const result = await quizApi.transferAnonymousQuizWithConflicts(quizData.sessionId, userId, userData, quizData);
          return { ...result, conflictResolution: 'local_chosen', localAnswers: localAnswerCount, serverAnswers: serverAnswerCount };
        } else {
          // Server quiz has more or equal progress - keep server data
          quizStorage.clearSession(); // Clear local data
          return { transferred: false, wasCompleted: false, canResume: true, conflictResolution: 'server_chosen', localAnswers: localAnswerCount, serverAnswers: serverAnswerCount };
        }
      } else if (localAnswerCount > 0) {
        // Only local quiz exists - transfer it
        const quizData = {
          sessionId: session.sessionId,
          answers: session.answers, // Send full answer objects
          status: session.status,
          currentQuestion: session.currentQuestion,
          currentQuestionId: session.currentQuestionId,
          questionPath: session.questionPath || [],
          totalQuestions: session.totalQuestions
        };
        
        const result = await quizApi.transferAnonymousQuizWithConflicts(quizData.sessionId, userId, userData, quizData);
        return { ...result, conflictResolution: 'local_only' };
      } else {
        // Local quiz exists but no answers - clear it and use server
        quizStorage.clearSession();
        return { transferred: false, wasCompleted: false, canResume: serverAnswerCount > 0, conflictResolution: 'server_only' };
      }
    }
    return { transferred: false, wasCompleted: false, canResume: false };
  } catch (error) {
    console.error('Quiz transfer failed:', error);
    // Don't throw error - auth was successful, quiz transfer is optional
    return { transferred: false, wasCompleted: false, canResume: false };
  }
};

// Login user
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(loginStart());
    
    const response = await authApi.login({
      email,
      password
    });
    
    // After successful login, try to transfer quiz
    const quizTransferResult = await transferQuizIfExists(response.user.id, response.user, response.token);
    
    // Check if user has completed quiz in database
    let userQuizState = null;
    try {
      userQuizState = await quizApi.getUserQuizState(response.token);
    } catch (error) {
      console.error('Failed to fetch user quiz state:', error);
    }
    
    dispatch(loginSuccess({
      user: response.user,
      token: response.token,
      quizState: userQuizState,
      quizTransferResult
    }));
    return { ...response, quizState: userQuizState, quizTransferResult };
  } catch (error) {
    const errorMessage = error.message || 'Login failed. Please try again.';
    dispatch(loginFailure(errorMessage));
    throw error;
  }
};

// Register user
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(registerStart());
    
    const response = await authApi.register(userData);
    
    // After successful registration, try to transfer quiz
    const quizTransferResult = await transferQuizIfExists(response.user.id, response.user, response.token);
    
    // Check if user has completed quiz in database (should be true after transfer)
    let userQuizState = null;
    try {
      userQuizState = await quizApi.getUserQuizState(response.token);
    } catch (error) {
      console.error('Failed to fetch user quiz state after registration:', error);
    }
    
    dispatch(registerSuccess({
      user: response.user,
      token: response.token,
      quizState: userQuizState,
      quizTransferResult
    }));
    return { ...response, quizState: userQuizState, quizTransferResult };
  } catch (error) {
    const errorMessage = error.message || 'Registration failed. Please try again.';
    dispatch(registerFailure(errorMessage));
    throw error;
  }
};

// Logout user
export const logout = () => async (dispatch) => {
  try {
    await authApi.logout();
    
    // Clear quiz localStorage since user progress is now saved to server
    quizStorage.clearSession();
    
    // Clear Redux quiz state (answers array, etc.)
    dispatch(resetQuiz());
    
    // Clear admin cache on logout
    dispatch(clearAllCache());
    
    // Clear application cache on logout
    clearApplicationCache();
    
    // Clear pending application data from sessionStorage
    sessionStorage.removeItem('pendingApplicationData');
    
    dispatch(logoutSuccess());
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if logout fails, clear local state and localStorage
    quizStorage.clearSession();
    dispatch(resetQuiz());
    dispatch(clearAllCache());
    clearApplicationCache();
    sessionStorage.removeItem('pendingApplicationData');
    dispatch(logoutSuccess());
  }
};

// Get current user
export const getCurrentUser = () => async (dispatch) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return dispatch(logoutSuccess());
  }
  
  try {
    dispatch(loginStart());
    
    const response = await authApi.getProfile();
    
    // Also fetch quiz state on app rehydration
    let userQuizState = null;
    try {
      userQuizState = await quizApi.getUserQuizState(token);
    } catch (error) {
      console.error('Failed to fetch user quiz state on rehydration:', error);
    }
    
    dispatch(loginSuccess({
      user: response.user,
      token,
      quizState: userQuizState,
      quizTransferResult: null
    }));
    
    return response.user;
  } catch (error) {
    dispatch(logoutSuccess());
    localStorage.removeItem('token');
    throw error;
  }
};

// Update user profile
export const updateProfile = (profileData) => async (dispatch) => {
  try {
    dispatch(updateProfileStart());
    
    const response = await authApi.updateProfile(profileData);
    
    dispatch(updateProfileSuccess(response.user));
    return response.user;
  } catch (error) {
    const errorMessage = error.message || 'Profile update failed. Please try again.';
    dispatch(updateProfileFailure(errorMessage));
    throw error;
  }
};
