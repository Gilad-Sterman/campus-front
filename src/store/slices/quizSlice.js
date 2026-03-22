import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quizStorage from '../../services/quizStorage.js';
import quizApi from '../../services/quizApi.js';
import { getTotalQuestions, getVisibleQuestionIds, isQuizCompleteForAnswers } from '../../config/quizQuestions.js';

const buildResultsPayload = ({ sessionId, completedAt, totalAnswers, avgScore, insights, source }) => ({
  contractVersion: 'v1',
  sessionId,
  completedAt,
  totalAnswers,
  avgScore,
  insights,
  canGetFullReport: true,
  metadata: {
    source,
    generatedAt: new Date().toISOString(),
    canGetFullReport: true
  },
  stats: {
    totalAnswers,
    avgScore,
    completedAt
  },
  scoring: {
    riasec: {
      realistic: null,
      investigative: null,
      artistic: null,
      social: null,
      enterprising: null,
      conventional: null
    },
    bigFive: {
      openness: null,
      conscientiousness: null,
      extraversion: null,
      agreeableness: null,
      neuroticism: null
    },
    sections: {}
  }
});

// Async thunks for API calls
export const startQuiz = createAsyncThunk(
  'quiz/startQuiz',
  async (_, { rejectWithValue }) => {
    try {
      // Clear any existing session to start fresh
      quizStorage.clearSession();

      // Initialize new local session
      const localSession = quizStorage.initializeSession();

      // Sync with backend for analytics and get backend session ID
      try {
        const backendResponse = await quizApi.startAnonymousQuiz();
        // Use backend session ID if available
        if (backendResponse.data && backendResponse.data.sessionId) {
          localSession.sessionId = backendResponse.data.sessionId;
          quizStorage.saveSession(localSession);
        }
      } catch (error) {
        console.warn('Backend sync failed, continuing with local session:', error);
      }

      return localSession;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveAnswer = createAsyncThunk(
  'quiz/saveAnswer',
  async ({ questionId, answer }, { rejectWithValue }) => {
    try {
      const updatedSession = quizStorage.saveAnswer(questionId, answer);
      return {
        answers: updatedSession.answers,
        sessionId: updatedSession.sessionId,
        status: updatedSession.status
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New action to save progress to server for authenticated users
export const saveProgressToServer = createAsyncThunk(
  'quiz/saveProgressToServer',
  async ({ currentQuestion, currentQuestionId, answers, questionPath }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { isAuthenticated, user, token } = state.auth;

      if (!isAuthenticated || !user) {
        throw new Error('User not authenticated');
      }

      await quizApi.saveProgress({
        currentQuestion,
        currentQuestionId,
        answers,
        questionPath,
        totalQuestions: getTotalQuestions()
      }, token);
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Complete quiz for authenticated users
export const completeQuizFromProgress = createAsyncThunk(
  'quiz/completeQuizFromProgress',
  async (answers, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { isAuthenticated, user, token } = state.auth;

      if (!isAuthenticated || !user) {
        throw new Error('User not authenticated');
      }

      await quizApi.completeFromProgress(answers, token);
      
      // Return the completion data for the extraReducer
      return {
        status: 'completed',
        answers: answers,
        completedAt: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateResults = createAsyncThunk(
  'quiz/generateResults',
  async (_, { getState, rejectWithValue }) => {
    try {
      const session = quizStorage.getSession();
      if (!session) {
        throw new Error('No quiz session found');
      }

      const state = getState();
      const { sessionId } = state.quiz;
      const isUuidSessionId = typeof sessionId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);

      if (isUuidSessionId) {
        try {
          const backendResults = await quizApi.generateMiniResults({
            sessionId,
            answers: session.answers || [],
            completedAt: session.lastAnsweredAt || new Date().toISOString()
          });
          return backendResults.data;
        } catch (error) {
          console.warn('Backend results failed, using local generation:', error);
        }
      }

      // Generate basic results locally
      const visibleQuestionIds = getVisibleQuestionIds(session.answers || []);
      const totalQuestions = visibleQuestionIds.length || session.totalQuestions || getTotalQuestions();
      const isComplete = isQuizCompleteForAnswers(session.answers || []) || session.status === 'completed';
      if (!isComplete) {
        throw new Error('Quiz not completed - only ' + session.answers.length + ' answers found');
      }

      const answers = session.answers.map(a => a.answer);

      // Calculate average only for numeric answers (Likert scale 1-5)
      const numericValues = answers
        .map(val => Number(val))
        .filter(val => Number.isFinite(val) && val >= 1 && val <= 5 && typeof val === 'number');

      const avgScore = numericValues.length > 0
        ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
        : null;

      return buildResultsPayload({
        sessionId: session.sessionId,
        completedAt: session.lastAnsweredAt,
        totalAnswers: answers.length,
        avgScore: Math.round(avgScore * 10) / 10,
        insights: {
          summary: 'Your quiz has been completed! Sign up to get your full personalized report.',
          traits: ['Thoughtful', 'Engaged', 'Ready to learn'],
          recommendation: 'Explore programs that match your interests and goals.'
        },
        source: 'frontend_local_fallback'
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Quiz session data
  sessionId: null,
  currentQuestion: 1,
  totalQuestions: getTotalQuestions(),
  answers: [],
  status: 'not_started', // not_started, in_progress, completed

  // UI state
  isLoading: false,
  error: null,

  // Progress tracking
  progress: {
    current: 0,
    total: getTotalQuestions(),
    percentage: 0
  },

  // Results
  results: null,
  showResults: false,

  // Resume functionality
  canResume: false,
  resumeInfo: null
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    // Load existing session from localStorage
    loadSession: (state) => {
      const session = quizStorage.getSession();
      if (session) {
        state.sessionId = session.sessionId;
        state.currentQuestion = session.currentQuestion;
        state.totalQuestions = session.totalQuestions || getTotalQuestions();
        state.answers = session.answers;
        state.status = session.status;
        state.progress = quizStorage.getProgress();
        state.canResume = quizStorage.canResume();
        state.resumeInfo = quizStorage.getResumeInfo();
      }
    },

    // Navigate to specific question
    goToQuestion: (state, action) => {
      const questionId = action.payload;
      const totalQuestions = getTotalQuestions();
      if (questionId >= 1 && questionId <= totalQuestions) {
        state.currentQuestion = questionId;

        // Update localStorage session to keep everything in sync
        const session = quizStorage.getSession();
        if (session) {
          const path = Array.isArray(session.questionPath) ? [...session.questionPath] : [];
          if (path[path.length - 1] !== questionId) {
            path.push(questionId);
          }

          const updatedSession = {
            ...session,
            currentQuestion: questionId,
            currentQuestionId: questionId,
            totalQuestions,
            questionPath: path
          };
          quizStorage.saveSession(updatedSession);
        }

        // Update progress to reflect current question
        state.progress = quizStorage.getProgress();
      }
    },

    // Clear error state
    clearError: (state) => {
      state.error = null;
    },

    // Reset quiz (for testing)
    resetQuiz: (state) => {
      quizStorage.clearSession();
      return { ...initialState };
    },

    // Show/hide results
    setShowResults: (state, action) => {
      state.showResults = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      // Start Quiz
      .addCase(startQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessionId = action.payload.sessionId;
        state.currentQuestion = action.payload.currentQuestion;
        state.totalQuestions = action.payload.totalQuestions || getTotalQuestions();
        state.status = 'in_progress';
        state.progress = quizStorage.getProgress();
      })
      .addCase(startQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Save Answer
      .addCase(saveAnswer.pending, (state) => {
        state.error = null;
      })
      .addCase(saveAnswer.fulfilled, (state, action) => {
        state.answers = action.payload.answers;
        // Don't auto-advance currentQuestion - let navigation handle it
        state.status = action.payload.status || state.status;
        state.progress = quizStorage.getProgress();
      })
      .addCase(saveAnswer.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Generate Results
      .addCase(generateResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
        state.showResults = true;
      })
      .addCase(generateResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  loadSession,
  goToQuestion,
  clearError,
  resetQuiz,
  setShowResults
} = quizSlice.actions;

export default quizSlice.reducer;
