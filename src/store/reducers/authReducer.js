import { createSlice } from '@reduxjs/toolkit';
import { saveProgressToServer, completeQuizFromProgress } from '../slices/quizSlice.js';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: localStorage.getItem('token') || null,
  quizState: null,
  quizTransferResult: null,
  isInitialized: false // Track if initial auth check has completed
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.quizState = action.payload.quizState;
      state.quizTransferResult = action.payload.quizTransferResult;
      state.error = null;
      state.isInitialized = true;

      // Store token in localStorage
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isInitialized = true;
    },
    logoutSuccess: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.quizState = null;
      state.quizTransferResult = null;
      state.error = null;
      state.isInitialized = true;
      localStorage.removeItem('token');
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.quizState = action.payload.quizState;
      state.quizTransferResult = action.payload.quizTransferResult;
      state.isInitialized = true;
      localStorage.setItem('token', action.payload.token);
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isInitialized = true;
    },
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.user = { ...state.user, ...action.payload };
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Sync auth.quizState when saveProgressToServer succeeds
      .addCase(saveProgressToServer.fulfilled, (state, action) => {
        // Update auth.quizState to reflect current progress
        if (state.quizState?.data) {
          state.quizState.data = {
            ...state.quizState.data,
            status: 'in_progress',
            currentQuestion: action.meta.arg.currentQuestion,
            currentQuestionId: action.meta.arg.currentQuestionId,
            answers: action.meta.arg.answers,
            questionPath: action.meta.arg.questionPath,
            totalQuestions: action.meta.arg.totalQuestions
          };
        }
      })
      // Sync auth.quizState when quiz is completed
      .addCase(completeQuizFromProgress.fulfilled, (state, action) => {
        // Update auth.quizState to reflect completed status
        if (state.quizState?.data) {
          state.quizState.data = {
            ...state.quizState.data,
            status: 'completed',
            answers: action.payload.answers,
            completedAt: action.payload.completedAt
          };
        }
      });
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutSuccess,
  registerStart,
  registerSuccess,
  registerFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  clearError
} = authSlice.actions;

export default authSlice.reducer;
