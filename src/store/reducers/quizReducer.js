import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  questions: [],
  currentQuestion: 0,
  answers: Array(30).fill(null), // Initialize with 30 null answers
  loading: false,
  error: null,
  quizCompleted: false,
  results: null,
  sessionId: localStorage.getItem('quizSessionId') || null
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    fetchQuestionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchQuestionsSuccess: (state, action) => {
      state.loading = false;
      state.questions = action.payload;
    },
    fetchQuestionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
    },
    saveAnswer: (state, action) => {
      const { questionIndex, answer } = action.payload;
      state.answers[questionIndex] = answer;
    },
    saveSessionId: (state, action) => {
      state.sessionId = action.payload;
      localStorage.setItem('quizSessionId', action.payload);
    },
    completeQuiz: (state) => {
      state.quizCompleted = true;
    },
    fetchResultsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchResultsSuccess: (state, action) => {
      state.loading = false;
      state.results = action.payload;
    },
    fetchResultsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetQuiz: (state) => {
      state.currentQuestion = 0;
      state.answers = Array(30).fill(null);
      state.quizCompleted = false;
      state.results = null;
    },
    clearQuizError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchQuestionsStart,
  fetchQuestionsSuccess,
  fetchQuestionsFailure,
  setCurrentQuestion,
  saveAnswer,
  saveSessionId,
  completeQuiz,
  fetchResultsStart,
  fetchResultsSuccess,
  fetchResultsFailure,
  resetQuiz,
  clearQuizError
} = quizSlice.actions;

export default quizSlice.reducer;
