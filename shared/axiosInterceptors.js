import axios from 'axios';

let loadingContext = null;
let activeRequestCount = 0; // Track active API requests
let isGlobalLoadingVisible = false; // Track if loading is currently showing

// Configuration for interceptors
let config = {
  showGlobalLoading: true,
  excludeUrls: [], // URLs to exclude from auto-loading
};

// Set the loading context (called from LoadingProvider)
export const setLoadingContext = context => {
  loadingContext = context;
};

// Update configuration
export const updateInterceptorConfig = newConfig => {
  Object.assign(config, newConfig);
};

// Check if URL should be excluded
const shouldExcludeUrl = url => {
  return config.excludeUrls.some(excludeUrl => url.includes(excludeUrl));
};

// Show global loading (only if not already showing)
const showLoading = url => {
  if (!loadingContext || shouldExcludeUrl(url) || !config.showGlobalLoading) {
    return;
  }
  activeRequestCount++;

  // Only show loading if this is the first request AND loading is not already visible
  if (activeRequestCount === 1 && !isGlobalLoadingVisible) {
    // if (!isGlobalLoadingVisible) loadingContext.showLoading('global');
    isGlobalLoadingVisible = true;
    console.log('🔄 Global loading started');
  }
};

// Hide global loading (only when all requests complete)
const hideLoading = () => {
  if (!loadingContext || !config.showGlobalLoading) {
    return;
  }

  activeRequestCount = Math.max(0, activeRequestCount - 1);

  // Only hide loading when all requests are complete AND loading is currently visible
  if (activeRequestCount === 0 && isGlobalLoadingVisible) {
    loadingContext.hideLoading('global');
    isGlobalLoadingVisible = false;
    console.log('✅ Global loading finished');
  }
};

// Setup axios interceptors
export const setupAxiosInterceptors = () => {
  // Request interceptor
  // axios.interceptors.request.use(
  //   requestConfig => {
  //     console.log(
  //       `🚀 API Request: ${requestConfig.method?.toUpperCase()} ${
  //         requestConfig.url
  //       }`,
  //     );
  //     //   if (!isGlobalLoadingVisible) showLoading(requestConfig.url);
  //     return requestConfig;
  //   },
  //   error => {
  //     console.error('❌ Request Setup Error:', error);
  //     hideLoading();
  //     return Promise.reject(error);
  //   },
  // );
  // // Response interceptor
  // axios.interceptors.response.use(
  //   response => {
  //     const startTime = response.config.startTime;
  //     const duration = startTime ? Date.now() - startTime : 0;
  //     console.log(
  //       `✅ API Success: ${response.config.method?.toUpperCase()} ${
  //         response.config.url
  //       } (${duration}ms)`,
  //     );
  //     hideLoading();
  //     return response;
  //   },
  //   error => {
  //     const startTime = error.config?.startTime;
  //     const duration = startTime ? Date.now() - startTime : 0;
  //     // Determine error type
  //     let errorType = 'Unknown Error';
  //     if (error.code === 'ECONNABORTED') {
  //       errorType = 'Timeout';
  //     } else if (error.response) {
  //       errorType = `HTTP ${error.response.status}`;
  //     } else if (error.request) {
  //       errorType = 'Network Error';
  //     }
  //     console.error(
  //       `❌ API Error: ${error.config?.method?.toUpperCase()} ${
  //         error.config?.url
  //       } (${duration}ms) - ${errorType}`,
  //       error.message,
  //     );
  //     hideLoading();
  //     return Promise.reject(error);
  //   },
  // );
};

// Remove all interceptors
export const removeAxiosInterceptors = () => {
  // Reset counter and loading state when removing interceptors
  activeRequestCount = 0;
  isGlobalLoadingVisible = false;
  axios.interceptors.request.eject();
  axios.interceptors.response.eject();
};

// Manual control functions
export const forceHideApiLoading = () => {
  if (loadingContext && isGlobalLoadingVisible) {
    loadingContext.hideLoading('global');
  }
  // Reset counter and loading state on force hide
  activeRequestCount = 0;
  isGlobalLoadingVisible = false;
  console.log('🔧 Force hidden API loading and reset state');
};

export const isApiLoading = () => {
  return activeRequestCount > 0;
};

// Get current request count (for debugging)
export const getActiveRequestCount = () => {
  return activeRequestCount;
};

// Get loading visibility state (for debugging)
export const isLoadingVisible = () => {
  return isGlobalLoadingVisible;
};

// Create custom axios instance with specific config
export const createAxiosInstance = (customConfig = {}) => {
  const instance = axios.create(customConfig);
  return instance;
  //   // Apply interceptors to custom instance
  //   instance.interceptors.request.use(
  //     requestConfig => {
  //       requestConfig.startTime = Date.now();
  //       if (!isGlobalLoadingVisible) showLoading(requestConfig.url);
  //       return requestConfig;
  //     },
  //     error => {
  //       hideLoading();
  //       return Promise.reject(error);
  //     },
  //   );
  //   instance.interceptors.response.use(
  //     response => {
  //       hideLoading();
  //       return response;
  //     },
  //     error => {
  //       hideLoading();
  //       return Promise.reject(error);
  //     },
  //   );
  //   return instance;
};

export default {
  setupAxiosInterceptors,
  setLoadingContext,
  updateInterceptorConfig,
  removeAxiosInterceptors,
  forceHideApiLoading,
  isApiLoading,
  getActiveRequestCount,
  isLoadingVisible,
  createAxiosInstance,
};
