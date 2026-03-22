import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      // Handle 401 Unauthorized - redirect to login or refresh token
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // You could dispatch a logout action here if needed
      }
      
      // Return a more user-friendly error message
      return Promise.reject({
        status: error.response.status,
        message: error.response.data.error || 'An error occurred. Please try again.'
      });
    }
    
    // Network errors
    return Promise.reject({
      message: 'Network error. Please check your connection.'
    });
  }
);

export default api;
