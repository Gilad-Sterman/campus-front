import api from '../../services/api';
import {
  fetchQuestionsStart,
  fetchQuestionsSuccess,
  fetchQuestionsFailure,
  saveSessionId,
  fetchResultsStart,
  fetchResultsSuccess,
  fetchResultsFailure
} from '../reducers/quizReducer';

// API URL is now handled by the api service

// Fetch quiz questions
export const fetchQuestions = () => async (dispatch) => {
  try {
    dispatch(fetchQuestionsStart());
    
    const response = await api.get('/quiz/questions');
    
    dispatch(fetchQuestionsSuccess(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to fetch quiz questions. Please try again.';
    dispatch(fetchQuestionsFailure(errorMessage));
    throw error;
  }
};

// Save anonymous quiz state
export const saveAnonymousQuizState = (answers, currentQuestion) => async (dispatch, getState) => {
  try {
    const { sessionId } = getState().quiz;
    
    const payload = {
      answers,
      currentQuestion,
      sessionId
    };
    
    const response = await api.post('/quiz/anonymous', payload);
    
    // If this is the first time saving, store the session ID
    if (!sessionId) {
      dispatch(saveSessionId(response.data.sessionId));
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to save quiz state:', error);
    // We don't want to show an error to the user for this background operation
    // But we might want to log it or handle it in some way
  }
};

// Resume anonymous quiz
export const resumeAnonymousQuiz = (sessionId) => async (dispatch) => {
  try {
    dispatch(fetchQuestionsStart());
    
    const response = await api.get(`/quiz/anonymous/${sessionId}`);
    
    // Update questions and answers in the store
    dispatch(fetchQuestionsSuccess(response.data.questions));
    
    // You might want to dispatch additional actions to restore the quiz state
    // such as setting the current question and answers
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to resume quiz. Please start a new one.';
    dispatch(fetchQuestionsFailure(errorMessage));
    throw error;
  }
};

// Get mini insights (pre-signup)
export const getMiniInsights = (answers) => async (dispatch) => {
  try {
    dispatch(fetchResultsStart());
    
    const response = await api.post('/quiz/insights', { answers });
    
    dispatch(fetchResultsSuccess(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to get insights. Please try again.';
    dispatch(fetchResultsFailure(errorMessage));
    throw error;
  }
};

// Get full quiz results (authenticated)
export const getFullResults = () => async (dispatch, getState) => {
  try {
    dispatch(fetchResultsStart());
    
    const { token } = getState().auth;
    
    const response = await api.get('/quiz/results');
    
    dispatch(fetchResultsSuccess(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to get quiz results. Please try again.';
    dispatch(fetchResultsFailure(errorMessage));
    throw error;
  }
};
