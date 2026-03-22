import api from '../../services/api';
import {
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
  addNotification
} from '../reducers/appReducer';

// API URL is now handled by the api service

// Universities with caching
export const fetchUniversities = (forceRefresh = false) => async (dispatch, getState) => {
  try {
    const state = getState();
    const { universities, universitiesLastFetched, universitiesCacheTTL } = state.app;
    
    // Check if we have cached data and it's still valid
    if (!forceRefresh && universities.length > 0 && universitiesLastFetched) {
      const timeSinceLastFetch = Date.now() - universitiesLastFetched;
      if (timeSinceLastFetch < universitiesCacheTTL) {
        // Return cached data without making API call
        return universities;
      }
    }
    
    dispatch(fetchUniversitiesStart());
    
    const response = await api.get('/universities');
    
    // Extract the universities array from response.data.data
    dispatch(fetchUniversitiesSuccess(response.data.data));
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to fetch universities. Please try again.';
    dispatch(fetchUniversitiesFailure(errorMessage));
    throw error;
  }
};

export const getUniversityDetails = (id) => async (dispatch) => {
  try {
    const response = await api.get(`/universities/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Public university details (for university details page)
export const getPublicUniversityDetails = (id) => async (dispatch) => {
  try {
    const response = await api.get(`/universities/details/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Israeli universities only (for carousel)
export const fetchIsraeliUniversities = (forceRefresh = false) => async (dispatch, getState) => {
  try {
    const state = getState();
    const { universities, universitiesLastFetched, universitiesCacheTTL } = state.app;
    
    // Check if we have cached data and it's still valid
    if (!forceRefresh && universities.length > 0 && universitiesLastFetched) {
      const timeSinceLastFetch = Date.now() - universitiesLastFetched;
      if (timeSinceLastFetch < universitiesCacheTTL) {
        // Return cached Israeli universities only
        const israeliUniversities = universities.filter(uni => uni.region !== 'United States');
        return israeliUniversities;
      }
    }
    
    dispatch(fetchUniversitiesStart());
    
    // Use the public costs endpoint which doesn't require authentication
    const response = await api.get('/universities/costs');
    
    // Store all universities in cache for other functions to use
    const allUniversities = response.data.data;
    dispatch(fetchUniversitiesSuccess(allUniversities));
    
    // Filter and return only Israeli universities (exclude US universities)
    const israeliUniversities = allUniversities.filter(uni => !uni.isUS);
    return israeliUniversities;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to fetch Israeli universities. Please try again.';
    dispatch(fetchUniversitiesFailure(errorMessage));
    throw error;
  }
};

// Programs with caching
export const fetchPrograms = (filters = {}, forceRefresh = false) => async (dispatch, getState) => {
  try {
    const state = getState();
    const { programs, programsLastFetched, programsCacheTTL } = state.app;
    
    // Only use cache if no filters are applied (for basic program list)
    const hasFilters = Object.keys(filters).some(key => filters[key]);
    
    if (!forceRefresh && !hasFilters && programs.length > 0 && programsLastFetched) {
      const timeSinceLastFetch = Date.now() - programsLastFetched;
      if (timeSinceLastFetch < programsCacheTTL) {
        // Return cached data without making API call
        return programs;
      }
    }
    
    dispatch(fetchProgramsStart());
    
    // Convert filters to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await api.get(`/programs?${queryParams.toString()}`);
    
    dispatch(fetchProgramsSuccess(response.data.data));
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to fetch programs. Please try again.';
    dispatch(fetchProgramsFailure(errorMessage));
    throw error;
  }
};

export const getProgramDetails = (id) => async (dispatch) => {
  try {
    const response = await api.get(`/programs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Saved Programs
export const fetchSavedPrograms = () => async (dispatch, getState) => {
  try {
    dispatch(fetchSavedProgramsStart());
    
    const { token } = getState().auth;
    
    const response = await api.get('/programs/saved');
    
    dispatch(fetchSavedProgramsSuccess(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to fetch saved programs. Please try again.';
    dispatch(fetchSavedProgramsFailure(errorMessage));
    throw error;
  }
};

export const saveProgramToProfile = (programId) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    
    const response = await api.post(`/programs/${programId}/save`, {});
    
    dispatch(saveProgram(response.data));
    dispatch(addNotification({
      type: 'success',
      message: 'Program saved successfully!'
    }));
    
    return response.data;
  } catch (error) {
    dispatch(addNotification({
      type: 'error',
      message: 'Failed to save program. Please try again.'
    }));
    throw error;
  }
};

export const removeSavedProgram = (programId) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    
    await api.delete(`/programs/${programId}/save`);
    
    dispatch(removeProgram(programId));
    dispatch(addNotification({
      type: 'success',
      message: 'Program removed from saved list.'
    }));
  } catch (error) {
    dispatch(addNotification({
      type: 'error',
      message: 'Failed to remove program. Please try again.'
    }));
    throw error;
  }
};

// Applications
export const fetchApplications = () => async (dispatch, getState) => {
  try {
    dispatch(fetchApplicationsStart());
    
    const { token } = getState().auth;
    
    const response = await api.get('/applications');
    
    dispatch(fetchApplicationsSuccess(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to fetch applications. Please try again.';
    dispatch(fetchApplicationsFailure(errorMessage));
    throw error;
  }
};

export const createNewApplication = (applicationData) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    
    const response = await api.post('/applications', applicationData);
    
    dispatch(createApplication(response.data));
    dispatch(addNotification({
      type: 'success',
      message: 'Application created successfully!'
    }));
    
    return response.data;
  } catch (error) {
    dispatch(addNotification({
      type: 'error',
      message: 'Failed to create application. Please try again.'
    }));
    throw error;
  }
};

export const updateExistingApplication = (id, applicationData) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    
    const response = await api.put(`/applications/${id}`, applicationData);
    
    dispatch(updateApplication(response.data));
    dispatch(addNotification({
      type: 'success',
      message: 'Application updated successfully!'
    }));
    
    return response.data;
  } catch (error) {
    dispatch(addNotification({
      type: 'error',
      message: 'Failed to update application. Please try again.'
    }));
    throw error;
  }
};

export const deleteExistingApplication = (id) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    
    await api.delete(`/applications/${id}`);
    
    dispatch(deleteApplication(id));
    dispatch(addNotification({
      type: 'success',
      message: 'Application deleted successfully!'
    }));
  } catch (error) {
    dispatch(addNotification({
      type: 'error',
      message: 'Failed to delete application. Please try again.'
    }));
    throw error;
  }
};

export const logApplicationRedirect = (id) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    
    const response = await api.post(`/applications/${id}/redirect`, {});
    
    dispatch(updateApplication(response.data));
    return response.data;
  } catch (error) {
    console.error('Failed to log redirect:', error);
    // We don't show an error notification for this background operation
  }
};

export const confirmApplicationCompleted = (id) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    
    const response = await api.post(`/applications/${id}/confirm`, {});
    
    dispatch(updateApplication(response.data));
    dispatch(addNotification({
      type: 'success',
      message: 'Application confirmed as completed!'
    }));
    
    return response.data;
  } catch (error) {
    dispatch(addNotification({
      type: 'error',
      message: 'Failed to confirm application. Please try again.'
    }));
    throw error;
  }
};
