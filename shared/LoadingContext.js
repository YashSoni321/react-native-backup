import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  setupAxiosInterceptors,
  setLoadingContext,
  removeAxiosInterceptors,
} from './axiosInterceptors';

// Create the Loading Context
const LoadingContext = createContext();

// Custom hook to use the Loading Context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Loading Provider Component
export const LoadingProvider = ({children}) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);

  // Show loading for a specific key
  const showLoading = useCallback((key = 'global', message = '') => {
    if (key === 'global') {
      setGlobalLoading(true);
    } else {
      setLoadingStates(prev => ({
        ...prev,
        [key]: {
          isVisible: true,
          message: message,
          timestamp: Date.now(),
        },
      }));
    }
  }, []);

  // Hide loading for a specific key
  const hideLoading = useCallback((key = 'global') => {
    if (key === 'global') {
      setGlobalLoading(false);
    } else {
      setLoadingStates(prev => {
        const newState = {...prev};
        delete newState[key];
        return newState;
      });
    }
  }, []);

  // Check if a specific key is loading
  const isLoading = useCallback(
    (key = 'global') => {
      if (key === 'global') {
        return globalLoading;
      }
      return !!loadingStates[key]?.isVisible;
    },
    [globalLoading, loadingStates],
  );

  // Get loading message for a specific key
  const getLoadingMessage = useCallback(
    key => {
      return loadingStates[key]?.message || '';
    },
    [loadingStates],
  );

  // Show loading with auto-hide after timeout
  const showLoadingWithTimeout = useCallback(
    (key, timeout = 5000, message = '') => {
      showLoading(key, message);
      setTimeout(() => {
        hideLoading(key);
      }, timeout);
    },
    [showLoading, hideLoading],
  );

  // Clear all loading states
  const clearAllLoading = useCallback(() => {
    setGlobalLoading(false);
    setLoadingStates({});
  }, []);

  const contextValue = {
    // State
    globalLoading,
    loadingStates,

    // Methods
    showLoading,
    hideLoading,
    isLoading,
    getLoadingMessage,
    showLoadingWithTimeout,
    clearAllLoading,
  };

  // Setup axios interceptors when provider mounts
  useEffect(() => {
    setLoadingContext(contextValue);
    setupAxiosInterceptors();

    return () => {
      removeAxiosInterceptors();
    };
  }, [contextValue]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
