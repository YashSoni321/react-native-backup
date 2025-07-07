import {useCallback} from 'react';
import {
  updateInterceptorConfig,
  forceHideApiLoading,
  isApiLoading,
  getActiveRequestCount,
  isLoadingVisible,
  createAxiosInstance,
} from './axiosInterceptors';

/**
 * Custom hook for managing axios interceptor loading behavior
 */
export const useAxiosLoading = () => {
  // Configure interceptor behavior
  const configureLoading = useCallback(config => {
    updateInterceptorConfig(config);
  }, []);

  // Enable/disable global loading for all API calls
  const setGlobalLoading = useCallback(enabled => {
    updateInterceptorConfig({showGlobalLoading: enabled});
  }, []);

  // Add URLs to exclude from auto-loading
  const excludeUrls = useCallback(urls => {
    updateInterceptorConfig({excludeUrls: Array.isArray(urls) ? urls : [urls]});
  }, []);

  // Create axios instance with custom loading behavior
  const createCustomAxios = useCallback((axiosConfig = {}) => {
    return createAxiosInstance(axiosConfig);
  }, []);

  // Force hide all API loading (emergency use)
  const forceHideLoading = useCallback(() => {
    forceHideApiLoading();
  }, []);

  // Check if any API calls are currently loading
  const checkApiLoading = useCallback(() => {
    return isApiLoading();
  }, []);

  // Get current active request count (for debugging)
  const getRequestCount = useCallback(() => {
    return getActiveRequestCount();
  }, []);

  // Check if loading is currently visible (for debugging)
  const checkLoadingVisible = useCallback(() => {
    return isLoadingVisible();
  }, []);

  return {
    configureLoading,
    setGlobalLoading,
    excludeUrls,
    createCustomAxios,
    forceHideLoading,
    checkApiLoading,
    getRequestCount, // For debugging multiple requests
    checkLoadingVisible, // For debugging loading visibility
  };
};

export default useAxiosLoading;
