import { createSlice, createSelector } from '@reduxjs/toolkit';

// TTL configurations (in milliseconds)
const TTL_CONFIG = {
  // Small datasets - longer TTL since they change less frequently
  universities: 10 * 60 * 1000,      // 10 minutes
  programs: 8 * 60 * 1000,           // 8 minutes
  staff: 5 * 60 * 1000,              // 5 minutes
  invites: 3 * 60 * 1000,            // 3 minutes
  communityConfigs: 10 * 60 * 1000,  // 10 minutes
  
  // Large datasets - shorter TTL since they change more frequently
  users: 2 * 60 * 1000,              // 2 minutes
  userDetails: 5 * 60 * 1000,        // 5 minutes
  
  // Analytics data - shortest TTL for real-time feel
  dashboardStats: 1 * 60 * 1000      // 1 minute
};

const initialState = {
  // Small datasets - full data cached with frontend filtering
  fullDatasets: {
    universities: {
      items: [],
      timestamp: null,
      loading: false,
      error: null
    },
    programs: {
      items: [],
      timestamp: null,
      loading: false,
      error: null
    },
    staff: {
      items: [],
      timestamp: null,
      loading: false,
      error: null
    },
    invites: {
      items: [],
      timestamp: null,
      loading: false,
      error: null
    },
    communityConfigs: {
      items: [],
      timestamp: null,
      loading: false,
      error: null
    }
  },
  
  // Large datasets - paginated with backend filtering
  paginatedDatasets: {
    users: {
      pages: {}, // Key format: 'page:1:search:john:status:active'
      loading: false,
      error: null
    }
  },
  
  // Individual records
  records: {
    userDetails: {} // Key format: 'user:123'
  },
  
  // Time-based analytics data
  analytics: {
    dashboardStats: {} // Key format: '2024-01-01:2024-01-07'
  }
};

const adminCacheSlice = createSlice({
  name: 'adminCache',
  initialState,
  reducers: {
    // Full dataset actions
    setFullDatasetLoading: (state, action) => {
      const { datasetType, loading } = action.payload;
      if (state.fullDatasets[datasetType]) {
        state.fullDatasets[datasetType].loading = loading;
        if (loading) {
          state.fullDatasets[datasetType].error = null;
        }
      }
    },
    
    setFullDatasetData: (state, action) => {
      const { datasetType, data } = action.payload;
      if (state.fullDatasets[datasetType]) {
        state.fullDatasets[datasetType].items = data;
        state.fullDatasets[datasetType].timestamp = Date.now();
        state.fullDatasets[datasetType].loading = false;
        state.fullDatasets[datasetType].error = null;
      }
    },
    
    setFullDatasetError: (state, action) => {
      const { datasetType, error } = action.payload;
      if (state.fullDatasets[datasetType]) {
        state.fullDatasets[datasetType].error = error;
        state.fullDatasets[datasetType].loading = false;
      }
    },
    
    // Paginated dataset actions
    setPaginatedDatasetLoading: (state, action) => {
      const { datasetType, loading } = action.payload;
      if (state.paginatedDatasets[datasetType]) {
        state.paginatedDatasets[datasetType].loading = loading;
        if (loading) {
          state.paginatedDatasets[datasetType].error = null;
        }
      }
    },
    
    setPaginatedDatasetPage: (state, action) => {
      const { datasetType, cacheKey, data, total } = action.payload;
      if (state.paginatedDatasets[datasetType]) {
        state.paginatedDatasets[datasetType].pages[cacheKey] = {
          items: data,
          total,
          timestamp: Date.now()
        };
        state.paginatedDatasets[datasetType].loading = false;
        state.paginatedDatasets[datasetType].error = null;
      }
    },
    
    setPaginatedDatasetError: (state, action) => {
      const { datasetType, error } = action.payload;
      if (state.paginatedDatasets[datasetType]) {
        state.paginatedDatasets[datasetType].error = error;
        state.paginatedDatasets[datasetType].loading = false;
      }
    },
    
    // Individual record actions
    setRecordLoading: (state, action) => {
      const { recordType, recordId, loading } = action.payload;
      // We'll handle loading state in components for individual records
    },
    
    setRecordData: (state, action) => {
      const { recordType, recordId, data } = action.payload;
      if (state.records[recordType]) {
        state.records[recordType][recordId] = {
          data,
          timestamp: Date.now()
        };
      }
    },
    
    // Analytics actions
    setAnalyticsData: (state, action) => {
      const { analyticsType, cacheKey, data } = action.payload;
      if (state.analytics[analyticsType]) {
        state.analytics[analyticsType][cacheKey] = {
          data,
          timestamp: Date.now()
        };
      }
    },
    
    // Cache invalidation actions
    invalidateFullDataset: (state, action) => {
      const { datasetType } = action.payload;
      if (state.fullDatasets[datasetType]) {
        state.fullDatasets[datasetType].timestamp = null;
        state.fullDatasets[datasetType].items = [];
      }
    },
    
    invalidatePaginatedDataset: (state, action) => {
      const { datasetType } = action.payload;
      if (state.paginatedDatasets[datasetType]) {
        state.paginatedDatasets[datasetType].pages = {};
      }
    },
    
    invalidateRecord: (state, action) => {
      const { recordType, recordId } = action.payload;
      if (state.records[recordType] && state.records[recordType][recordId]) {
        delete state.records[recordType][recordId];
      }
    },
    
    invalidateAnalytics: (state, action) => {
      const { analyticsType, cacheKey } = action.payload;
      if (state.analytics[analyticsType]) {
        if (cacheKey) {
          delete state.analytics[analyticsType][cacheKey];
        } else {
          state.analytics[analyticsType] = {};
        }
      }
    },
    
    // Bulk invalidation for CRUD operations
    invalidateRelatedData: (state, action) => {
      const { operation, dataType } = action.payload;
      
      switch (dataType) {
        case 'university':
          // University changes affect universities and programs
          state.fullDatasets.universities.timestamp = null;
          state.fullDatasets.programs.timestamp = null;
          state.analytics.dashboardStats = {};
          break;
          
        case 'program':
          // Program changes affect programs and dashboard
          state.fullDatasets.programs.timestamp = null;
          state.analytics.dashboardStats = {};
          break;
          
        case 'user':
          // User changes affect users and dashboard
          state.paginatedDatasets.users.pages = {};
          state.analytics.dashboardStats = {};
          break;
          
        case 'staff':
          // Staff changes affect staff and invites
          state.fullDatasets.staff.timestamp = null;
          state.fullDatasets.invites.timestamp = null;
          break;
          
        case 'community':
          // Community changes affect community configs
          state.fullDatasets.communityConfigs.timestamp = null;
          break;
      }
    },
    
    // Manual refresh - clear all cache
    clearAllCache: (state) => {
      // Reset all timestamps to force fresh data
      Object.keys(state.fullDatasets).forEach(key => {
        state.fullDatasets[key].timestamp = null;
        state.fullDatasets[key].items = [];
      });
      
      Object.keys(state.paginatedDatasets).forEach(key => {
        state.paginatedDatasets[key].pages = {};
      });
      
      Object.keys(state.records).forEach(key => {
        state.records[key] = {};
      });
      
      Object.keys(state.analytics).forEach(key => {
        state.analytics[key] = {};
      });
    }
  }
});

// Base selectors
const selectAdminCache = (state) => state.adminCache;
const selectFullDatasets = (state) => state.adminCache.fullDatasets;
const selectPaginatedDatasets = (state) => state.adminCache.paginatedDatasets;
const selectRecords = (state) => state.adminCache.records;
const selectAnalyticsBase = (state) => state.adminCache.analytics;

// Memoized selectors
export const selectFullDataset = createSelector(
  [selectFullDatasets, (state, datasetType) => datasetType],
  (fullDatasets, datasetType) => {
    return fullDatasets[datasetType] || { items: [], timestamp: null, loading: false, error: null };
  }
);

export const selectPaginatedDataset = createSelector(
  [selectPaginatedDatasets, (state, datasetType) => datasetType, (state, datasetType, cacheKey) => cacheKey],
  (paginatedDatasets, datasetType, cacheKey) => {
    const dataset = paginatedDatasets[datasetType];
    if (!dataset) return null;
    
    return {
      page: dataset.pages[cacheKey] || null,
      loading: dataset.loading,
      error: dataset.error
    };
  }
);

export const selectRecord = createSelector(
  [selectRecords, (state, recordType) => recordType, (state, recordType, recordId) => recordId],
  (records, recordType, recordId) => {
    return records[recordType]?.[recordId] || null;
  }
);

export const selectAnalytics = createSelector(
  [selectAnalyticsBase, (state, analyticsType) => analyticsType, (state, analyticsType, cacheKey) => cacheKey],
  (analytics, analyticsType, cacheKey) => {
    return analytics[analyticsType]?.[cacheKey] || null;
  }
);

// Cache validation helpers
export const isCacheExpired = (timestamp, datasetType) => {
  if (!timestamp) return true;
  const ttl = TTL_CONFIG[datasetType] || TTL_CONFIG.users; // Default TTL
  return Date.now() - timestamp > ttl;
};

export const getCacheAge = (timestamp) => {
  if (!timestamp) return null;
  return Math.floor((Date.now() - timestamp) / 1000); // Age in seconds
};

export const {
  setFullDatasetLoading,
  setFullDatasetData,
  setFullDatasetError,
  setPaginatedDatasetLoading,
  setPaginatedDatasetPage,
  setPaginatedDatasetError,
  setRecordData,
  setAnalyticsData,
  invalidateFullDataset,
  invalidatePaginatedDataset,
  invalidateRecord,
  invalidateAnalytics,
  invalidateRelatedData,
  clearAllCache
} = adminCacheSlice.actions;

export default adminCacheSlice.reducer;
