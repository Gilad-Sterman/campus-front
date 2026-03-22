// Cache utility functions for managing data freshness

/**
 * Check if cached data is still valid based on TTL
 * @param {number} lastFetched - Timestamp when data was last fetched
 * @param {number} ttl - Time to live in milliseconds
 * @returns {boolean} - True if cache is still valid
 */
export const isCacheValid = (lastFetched, ttl) => {
  if (!lastFetched) return false;
  const timeSinceLastFetch = Date.now() - lastFetched;
  return timeSinceLastFetch < ttl;
};

/**
 * Get human-readable time since last cache update
 * @param {number} lastFetched - Timestamp when data was last fetched
 * @returns {string} - Human-readable time difference
 */
export const getTimeSinceLastFetch = (lastFetched) => {
  if (!lastFetched) return 'Never';
  
  const timeDiff = Date.now() - lastFetched;
  const minutes = Math.floor(timeDiff / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
};

/**
 * Cache configuration constants
 */
export const CACHE_CONFIG = {
  UNIVERSITIES_TTL: 15 * 60 * 1000, // 15 minutes
  PROGRAMS_TTL: 10 * 60 * 1000,     // 10 minutes
  SAVED_PROGRAMS_TTL: 5 * 60 * 1000, // 5 minutes
  APPLICATIONS_TTL: 2 * 60 * 1000,   // 2 minutes
};

/**
 * Local storage cache keys
 */
export const CACHE_KEYS = {
  UNIVERSITIES: 'campus_israel_universities',
  PROGRAMS: 'campus_israel_programs',
  UNIVERSITIES_TIMESTAMP: 'campus_israel_universities_timestamp',
  PROGRAMS_TIMESTAMP: 'campus_israel_programs_timestamp'
};

/**
 * Save data to localStorage with timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export const saveToLocalCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_timestamp`, Date.now().toString());
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

/**
 * Get data from localStorage if still valid
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in milliseconds
 * @returns {any|null} - Cached data or null if invalid/expired
 */
export const getFromLocalCache = (key, ttl) => {
  try {
    const data = localStorage.getItem(key);
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    
    if (!data || !timestamp) return null;
    
    const lastFetched = parseInt(timestamp);
    if (!isCacheValid(lastFetched, ttl)) {
      // Clean up expired cache
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
      return null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.warn('Failed to get from localStorage:', error);
    return null;
  }
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearLocalCache = (key) => {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

/**
 * Clear all app caches
 */
export const clearAllCaches = () => {
  Object.values(CACHE_KEYS).forEach(key => {
    clearLocalCache(key);
  });
};
