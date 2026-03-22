import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  universities: [],
  universitiesLastFetched: null,
  universitiesCacheTTL: 15 * 60 * 1000, // 15 minutes in milliseconds
  programs: [],
  programsLastFetched: null,
  programsCacheTTL: 10 * 60 * 1000, // 10 minutes in milliseconds
  savedPrograms: [],
  applications: [],
  notifications: []
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Universities
    fetchUniversitiesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUniversitiesSuccess: (state, action) => {
      state.loading = false;
      state.universities = action.payload;
      state.universitiesLastFetched = Date.now();
    },
    fetchUniversitiesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Programs
    fetchProgramsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProgramsSuccess: (state, action) => {
      state.loading = false;
      state.programs = action.payload;
      state.programsLastFetched = Date.now();
    },
    fetchProgramsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Saved Programs
    fetchSavedProgramsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSavedProgramsSuccess: (state, action) => {
      state.loading = false;
      state.savedPrograms = action.payload;
    },
    fetchSavedProgramsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    saveProgram: (state, action) => {
      state.savedPrograms.push(action.payload);
    },
    removeProgram: (state, action) => {
      state.savedPrograms = state.savedPrograms.filter(
        program => program.id !== action.payload
      );
    },
    
    // Applications
    fetchApplicationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchApplicationsSuccess: (state, action) => {
      state.loading = false;
      state.applications = action.payload;
    },
    fetchApplicationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createApplication: (state, action) => {
      state.applications.push(action.payload);
    },
    updateApplication: (state, action) => {
      const index = state.applications.findIndex(app => app.id === action.payload.id);
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
    },
    deleteApplication: (state, action) => {
      state.applications = state.applications.filter(
        app => app.id !== action.payload
      );
    },
    
    // Notifications
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    // General
    clearAppError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchUniversitiesStart,
  fetchUniversitiesSuccess,
  fetchUniversitiesFailure,
  fetchProgramsStart,
  fetchProgramsSuccess,
  fetchProgramsFailure,
  fetchSavedProgramsStart,
  fetchSavedProgramsSuccess,
  fetchSavedProgramsFailure,
  saveProgram,
  removeProgram,
  fetchApplicationsStart,
  fetchApplicationsSuccess,
  fetchApplicationsFailure,
  createApplication,
  updateApplication,
  deleteApplication,
  addNotification,
  removeNotification,
  clearAppError
} = appSlice.actions;

export default appSlice.reducer;
