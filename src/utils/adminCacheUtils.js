// Admin cache utility functions for generating cache keys and managing cache operations

/**
 * Generate cache key for paginated datasets
 * @param {number} page - Page number
 * @param {string} search - Search term
 * @param {string} status - Status filter
 * @param {string} universityId - University filter (for programs)
 * @param {string} discipline - Discipline filter (for programs)
 * @returns {string} - Cache key
 */
export const generatePaginatedCacheKey = (page = 1, search = '', status = '', universityId = '', discipline = '') => {
  const parts = [`page:${page}`];
  
  if (search) parts.push(`search:${search}`);
  if (status) parts.push(`status:${status}`);
  if (universityId) parts.push(`university:${universityId}`);
  if (discipline) parts.push(`discipline:${discipline}`);
  
  return parts.join(':');
};

/**
 * Generate cache key for analytics data
 * @param {string} startDate - Start date ISO string
 * @param {string} endDate - End date ISO string
 * @returns {string} - Cache key
 */
export const generateAnalyticsCacheKey = (startDate, endDate) => {
  const start = startDate.split('T')[0]; // Get date part only
  const end = endDate.split('T')[0];
  return `${start}:${end}`;
};

/**
 * Generate cache key for individual records
 * @param {string} recordType - Type of record (e.g., 'user')
 * @param {string|number} recordId - Record ID
 * @returns {string} - Cache key
 */
export const generateRecordCacheKey = (recordType, recordId) => {
  return `${recordType}:${recordId}`;
};

/**
 * Filter array of items based on search term
 * @param {Array} items - Array of items to filter
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} - Filtered items
 */
export const filterItemsBySearch = (items, searchTerm, searchFields = ['name']) => {
  if (!searchTerm || !searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase().trim();
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = getNestedValue(item, field);
      return value && value.toString().toLowerCase().includes(term);
    });
  });
};

/**
 * Filter array of items based on multiple filters
 * @param {Array} items - Array of items to filter
 * @param {Object} filters - Filter object with key-value pairs
 * @returns {Array} - Filtered items
 */
export const filterItemsByFilters = (items, filters = {}) => {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === '') return true; // Skip empty filters
      
      const itemValue = getNestedValue(item, key);
      
      // Handle different filter types
      if (typeof value === 'string') {
        // For university_id and other ID fields, do exact match
        if (key.includes('_id') || key === 'id') {
          return itemValue && itemValue.toString() === value;
        }
        // For other string fields, do partial match
        return itemValue && itemValue.toString().toLowerCase().includes(value.toLowerCase());
      }
      
      return itemValue === value;
    });
  });
};

/**
 * Get nested object value by dot notation
 * @param {Object} obj - Object to search in
 * @param {string} path - Dot notation path (e.g., 'user.profile.name')
 * @returns {any} - Value at path or undefined
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Sort array of items by field
 * @param {Array} items - Array of items to sort
 * @param {string} sortField - Field to sort by
 * @param {string} sortDirection - 'asc' or 'desc'
 * @returns {Array} - Sorted items
 */
export const sortItems = (items, sortField, sortDirection = 'asc') => {
  if (!sortField) return items;
  
  return [...items].sort((a, b) => {
    const aValue = getNestedValue(a, sortField);
    const bValue = getNestedValue(b, sortField);
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    // Default string comparison
    const comparison = String(aValue).localeCompare(String(bValue));
    return sortDirection === 'asc' ? comparison : -comparison;
  });
};

/**
 * Apply pagination to array of items
 * @param {Array} items - Array of items to paginate
 * @param {number} page - Current page (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} - Paginated result with items, total, and pagination info
 */
export const paginateItems = (items, page = 1, limit = 20) => {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Format cache age for display
 * @param {number} timestamp - Cache timestamp
 * @returns {string} - Formatted age string
 */
export const formatCacheAge = (timestamp) => {
  if (!timestamp) return 'No data';
  
  const ageInSeconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (ageInSeconds < 60) {
    return `${ageInSeconds}s ago`;
  }
  
  const ageInMinutes = Math.floor(ageInSeconds / 60);
  if (ageInMinutes < 60) {
    return `${ageInMinutes}m ago`;
  }
  
  const ageInHours = Math.floor(ageInMinutes / 60);
  return `${ageInHours}h ago`;
};

/**
 * Check if cache needs refresh based on user interaction
 * @param {number} timestamp - Cache timestamp
 * @param {number} ttl - Time to live in milliseconds
 * @param {boolean} forceRefresh - Force refresh regardless of TTL
 * @returns {boolean} - True if cache should be refreshed
 */
export const shouldRefreshCache = (timestamp, ttl, forceRefresh = false) => {
  if (forceRefresh) return true;
  if (!timestamp) return true;
  
  return Date.now() - timestamp > ttl;
};

/**
 * Debounce function for search input
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Create filter function for specific dataset type
 * @param {string} datasetType - Type of dataset (universities, programs, etc.)
 * @returns {Function} - Filter function for that dataset type
 */
export const createDatasetFilter = (datasetType) => {
  const filterConfigs = {
    universities: {
      searchFields: ['name', 'city', 'region'],
      filterFields: ['region', 'status']
    },
    programs: {
      searchFields: ['name', 'field', 'discipline'],
      filterFields: ['university_id', 'discipline', 'degree_level', 'status']
    },
    staff: {
      searchFields: ['first_name', 'last_name', 'email'],
      filterFields: ['role', 'status']
    },
    communityConfigs: {
      searchFields: ['discipline', 'region'],
      filterFields: ['discipline', 'region']
    }
  };
  
  const config = filterConfigs[datasetType] || { searchFields: ['name'], filterFields: [] };
  
  return (items, searchTerm = '', filters = {}) => {
    let filteredItems = items;
    
    // Apply search filter
    if (searchTerm) {
      filteredItems = filterItemsBySearch(filteredItems, searchTerm, config.searchFields);
    }
    
    // Apply other filters
    const relevantFilters = {};
    config.filterFields.forEach(field => {
      if (filters[field] !== undefined && filters[field] !== '') {
        relevantFilters[field] = filters[field];
      }
    });
    
    if (Object.keys(relevantFilters).length > 0) {
      filteredItems = filterItemsByFilters(filteredItems, relevantFilters);
    }
    
    return filteredItems;
  };
};
