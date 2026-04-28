import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import adminApi from '../services/adminApi';
import {
  selectFullDataset,
  selectPaginatedDataset,
  selectRecord,
  selectAnalytics,
  isCacheExpired,
  setFullDatasetLoading,
  setFullDatasetData,
  setFullDatasetError,
  setPaginatedDatasetLoading,
  setPaginatedDatasetPage,
  setPaginatedDatasetError,
  setRecordData,
  setAnalyticsData,
  invalidateRelatedData
} from '../store/slices/adminCacheSlice';
import {
  generatePaginatedCacheKey,
  generateAnalyticsCacheKey,
  generateRecordCacheKey,
  createDatasetFilter,
  sortItems,
  paginateItems,
  shouldRefreshCache
} from '../utils/adminCacheUtils';

/**
 * Custom hook for managing admin data with caching
 * Supports both full datasets (with frontend filtering) and paginated datasets
 */
export const useAdminCache = (config) => {
  const {
    datasetType,
    cacheType = 'full', // 'full', 'paginated', 'record', 'analytics'
    params = {},
    options = {}
  } = config;

  const dispatch = useDispatch();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Memoize cache keys to prevent unnecessary recalculations
  const cacheKey = useMemo(() => {
    switch (cacheType) {
      case 'paginated':
        return generatePaginatedCacheKey(
          params.page,
          params.limit,
          params.search,
          params.status,
          params.universityId,
          params.discipline
        );
      case 'record':
        return generateRecordCacheKey(datasetType, params.recordId);
      case 'analytics':
        return generateAnalyticsCacheKey(params.startDate, params.endDate);
      default:
        return null;
    }
  }, [cacheType, params.page, params.limit, params.search, params.status, params.universityId, params.discipline, params.recordId, params.startDate, params.endDate, datasetType]);

  // Memoize the selector function to prevent new references
  const selectorFn = useMemo(() => {
    return (state) => {
      switch (cacheType) {
        case 'full':
          return selectFullDataset(state, datasetType);
        case 'paginated':
          return selectPaginatedDataset(state, datasetType, cacheKey);
        case 'record':
          return selectRecord(state, 'userDetails', cacheKey);
        case 'analytics':
          return selectAnalytics(state, datasetType, cacheKey);
        default:
          return null;
      }
    };
  }, [cacheType, datasetType, cacheKey]);

  const cachedData = useSelector(selectorFn);

  // Determine if we need to fetch data
  const needsFetch = () => {
    if (options.forceRefresh) return true;

    // Prevent infinite loops: if we already have an error, don't automatically retry
    if (localError || cachedData?.error) return false;

    switch (cacheType) {
      case 'full':
        return !cachedData || isCacheExpired(cachedData.timestamp, datasetType);
      
      case 'paginated':
        return !cachedData?.page || isCacheExpired(cachedData.page.timestamp, datasetType);
      
      case 'record':
        return !cachedData || isCacheExpired(cachedData.timestamp, 'userDetails');
      
      case 'analytics':
        return !cachedData || isCacheExpired(cachedData.timestamp, datasetType);
      
      default:
        return true;
    }
  };

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!needsFetch() && !options.forceRefresh) return;

    try {
      setLocalLoading(true);
      setLocalError(null);

      let response;
      let data;

      switch (cacheType) {
        case 'full':
          dispatch(setFullDatasetLoading({ datasetType, loading: true }));
          
          switch (datasetType) {
            case 'universities':
              response = await adminApi.getUniversities({ limit: 1000 });
              data = response.data.universities || [];
              break;
            case 'programs':
              response = await adminApi.getPrograms({ limit: 1000 });
              data = response.data.programs || [];
              break;
            case 'staff':
              response = await adminApi.getStaff();
              data = response.data.data.staff || [];
              break;
            case 'invites':
              response = await adminApi.getStaffInvites();
              data = response.data.data.invites || [];
              break;
            case 'communityConfigs':
              response = await adminApi.getCommunityConfigs();
              data = response.data.configs || [];
              break;
            default:
              throw new Error(`Unknown full dataset type: ${datasetType}`);
          }
          
          dispatch(setFullDatasetData({ datasetType, data }));
          break;

        case 'paginated':
          const fetchCacheKey = generatePaginatedCacheKey(
            params.page,
            params.limit,
            params.search,
            params.status,
            params.universityId,
            params.discipline
          );
          
          dispatch(setPaginatedDatasetLoading({ datasetType, loading: true }));
          
          switch (datasetType) {
            case 'users':
              response = await adminApi.getUsers({
                page: params.page || 1,
                limit: params.limit || 20,
                search: params.search || '',
                status: params.status || ''
              });
              data = response.data.users || [];
              break;
            default:
              throw new Error(`Unknown paginated dataset type: ${datasetType}`);
          }
          
          dispatch(setPaginatedDatasetPage({
            datasetType,
            cacheKey: fetchCacheKey,
            data,
            total: response.data.total || 0
          }));
          break;

        case 'record':
          const recordKey = generateRecordCacheKey(datasetType, params.recordId);
          
          switch (datasetType) {
            case 'user':
              response = await adminApi.getUserById(params.recordId);
              data = response.data.data;
              break;
            default:
              throw new Error(`Unknown record type: ${datasetType}`);
          }
          
          dispatch(setRecordData({
            recordType: 'userDetails',
            recordId: recordKey,
            data
          }));
          break;

        case 'analytics':
          const analyticsKey = generateAnalyticsCacheKey(params.startDate, params.endDate);
          
          switch (datasetType) {
            case 'dashboardStats':
              response = await adminApi.getDashboardStats(params.startDate, params.endDate);
              data = response.data.data;
              break;
            default:
              throw new Error(`Unknown analytics type: ${datasetType}`);
          }
          
          dispatch(setAnalyticsData({
            analyticsType: datasetType,
            cacheKey: analyticsKey,
            data
          }));
          break;

        default:
          throw new Error(`Unknown cache type: ${cacheType}`);
      }

    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch data';
      setLocalError(errorMessage);
      
      switch (cacheType) {
        case 'full':
          dispatch(setFullDatasetError({ datasetType, error: errorMessage }));
          break;
        case 'paginated':
          dispatch(setPaginatedDatasetError({ datasetType, error: errorMessage }));
          break;
        default:
          // For records and analytics, we handle errors locally
          break;
      }
    } finally {
      setLocalLoading(false);
    }
  }, [datasetType, cacheType, params, options.forceRefresh, dispatch]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);

      let response;
      let data;

      switch (cacheType) {
        case 'full':
          dispatch(setFullDatasetLoading({ datasetType, loading: true }));
          
          switch (datasetType) {
            case 'universities':
              response = await adminApi.getUniversities({ limit: 1000 });
              data = response.data.universities || [];
              break;
            case 'programs':
              response = await adminApi.getPrograms({ limit: 1000 });
              data = response.data.programs || [];
              break;
            case 'staff':
              response = await adminApi.getStaff();
              data = response.data.data.staff || [];
              break;
            case 'invites':
              response = await adminApi.getStaffInvites();
              data = response.data.data.invites || [];
              break;
            case 'communityConfigs':
              response = await adminApi.getCommunityConfigs();
              data = response.data.configs || [];
              break;
            default:
              throw new Error(`Unknown full dataset type: ${datasetType}`);
          }
          
          dispatch(setFullDatasetData({ datasetType, data }));
          break;

        case 'paginated':
          const fetchCacheKey = generatePaginatedCacheKey(
            params.page,
            params.limit,
            params.search,
            params.status,
            params.universityId,
            params.discipline
          );
          
          dispatch(setPaginatedDatasetLoading({ datasetType, loading: true }));
          
          switch (datasetType) {
            case 'users':
              response = await adminApi.getUsers({
                page: params.page || 1,
                limit: params.limit || 20,
                search: params.search || '',
                status: params.status || ''
              });
              data = response.data.users || [];
              break;
            default:
              throw new Error(`Unknown paginated dataset type: ${datasetType}`);
          }
          
          dispatch(setPaginatedDatasetPage({
            datasetType,
            cacheKey: fetchCacheKey,
            data,
            total: response.data.total || 0
          }));
          break;

        case 'analytics':
          const analyticsKey = generateAnalyticsCacheKey(params.startDate, params.endDate);
          
          switch (datasetType) {
            case 'dashboardStats':
              response = await adminApi.getDashboardStats(params.startDate, params.endDate);
              data = response.data.data;
              break;
            default:
              throw new Error(`Unknown analytics dataset type: ${datasetType}`);
          }
          
          dispatch(setAnalyticsData({
            analyticsType: datasetType,
            cacheKey: analyticsKey,
            data
          }));
          break;

        default:
          // For other cache types, use the existing fetchData logic with force refresh
          const originalForceRefresh = options.forceRefresh;
          options.forceRefresh = true;
          await fetchData();
          options.forceRefresh = originalForceRefresh;
          return;
      }

    } catch (error) {
      const errorMessage = error.message || 'Failed to refresh data';
      setLocalError(errorMessage);
      
      if (cacheType === 'full') {
        dispatch(setFullDatasetError({ datasetType, error: errorMessage }));
      } else if (cacheType === 'paginated') {
        dispatch(setPaginatedDatasetError({ datasetType, error: errorMessage }));
      }
    } finally {
      setLocalLoading(false);
    }
  }, [datasetType, cacheType, dispatch, fetchData]);

  // Invalidate related cache after CRUD operations
  const invalidateCache = useCallback((operation, relatedDataType) => {
    dispatch(invalidateRelatedData({ operation, dataType: relatedDataType }));
  }, [dispatch]);

  // Get processed data with filtering/sorting for full datasets
  const getProcessedData = () => {
    if (cacheType !== 'full' || !cachedData?.items) {
      return cachedData;
    }

    const filter = createDatasetFilter(datasetType);
    let processedItems = filter(
      cachedData.items,
      params.search || '',
      {
        region: params.region,
        discipline: params.discipline,
        university_id: params.university_id,
        degree_level: params.degreeLevel,
        status: params.status,
        role: params.role
      }
    );

    // Apply sorting if specified
    if (params.sortField) {
      processedItems = sortItems(processedItems, params.sortField, params.sortDirection);
    }

    // Apply pagination for frontend pagination
    if (params.page && params.limit) {
      const paginatedResult = paginateItems(processedItems, params.page, params.limit);
      return {
        ...cachedData,
        items: paginatedResult.items,
        total: paginatedResult.total,
        totalPages: paginatedResult.totalPages,
        hasNext: paginatedResult.hasNext,
        hasPrev: paginatedResult.hasPrev,
        filteredTotal: processedItems.length // Total after filtering but before pagination
      };
    }

    return {
      ...cachedData,
      items: processedItems,
      total: processedItems.length
    };
  };

  // Return appropriate data structure based on cache type
  const getReturnData = () => {
    const isLoading = cachedData?.loading || localLoading;
    const error = cachedData?.error || localError;

    switch (cacheType) {
      case 'full':
        const processedData = getProcessedData();
        return {
          data: processedData?.items || [],
          total: processedData?.total || 0,
          filteredTotal: processedData?.filteredTotal,
          totalPages: processedData?.totalPages,
          hasNext: processedData?.hasNext,
          hasPrev: processedData?.hasPrev,
          loading: isLoading,
          error,
          timestamp: cachedData?.timestamp,
          refresh,
          invalidateCache
        };

      case 'paginated':
        return {
          data: cachedData?.page?.items || [],
          total: cachedData?.page?.total || 0,
          loading: isLoading,
          error,
          timestamp: cachedData?.page?.timestamp,
          refresh,
          invalidateCache
        };

      case 'record':
        return {
          data: cachedData?.data || null,
          loading: isLoading,
          error,
          timestamp: cachedData?.timestamp,
          refresh,
          invalidateCache
        };

      case 'analytics':
        return {
          data: cachedData?.data || null,
          loading: isLoading,
          error,
          timestamp: cachedData?.timestamp,
          refresh,
          invalidateCache
        };

      default:
        return {
          data: null,
          loading: false,
          error: 'Invalid cache type',
          refresh,
          invalidateCache
        };
    }
  };

  return getReturnData();
};

// Convenience hooks for specific data types
export const useUniversities = (params = {}, options = {}) => {
  return useAdminCache({
    datasetType: 'universities',
    cacheType: 'full',
    params,
    options
  });
};

export const usePrograms = (params = {}, options = {}) => {
  return useAdminCache({
    datasetType: 'programs',
    cacheType: 'full',
    params,
    options
  });
};

export const useUsers = (params = {}, options = {}) => {
  return useAdminCache({
    datasetType: 'users',
    cacheType: 'paginated',
    params,
    options
  });
};

export const useStaff = (params = {}, options = {}) => {
  return useAdminCache({
    datasetType: 'staff',
    cacheType: 'full',
    params,
    options
  });
};

export const useStaffInvites = (params = {}, options = {}) => {
  return useAdminCache({
    datasetType: 'invites',
    cacheType: 'full',
    params,
    options
  });
};

export const useCommunityConfigs = (params = {}, options = {}) => {
  return useAdminCache({
    datasetType: 'communityConfigs',
    cacheType: 'full',
    params,
    options
  });
};

export const useUserDetails = (userId, options = {}) => {
  return useAdminCache({
    datasetType: 'user',
    cacheType: 'record',
    params: { recordId: userId },
    options
  });
};

export const useDashboardStats = (startDate, endDate, options = {}) => {
  return useAdminCache({
    datasetType: 'dashboardStats',
    cacheType: 'analytics',
    params: { startDate, endDate },
    options
  });
};
