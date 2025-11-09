import React from 'react';
import {LoadingProvider} from './LoadingContext';
import GlobalLoadingOverlay from './GlobalLoadingOverlay';

/**
 * App Wrapper Component
 * Wraps your entire app with the Loading Context Provider
 * and includes the Global Loading Overlay
 */
const AppWrapper = ({children}) => {
  console.log('[AppWrapper] ========================================');
  console.log('[AppWrapper] Component rendering START');
  console.log('[AppWrapper] Children:', !!children);
  console.log('[AppWrapper] ========================================');
  
  console.log('[AppWrapper] About to render LoadingProvider');
  const result = (
    <LoadingProvider>
      {children}
      <GlobalLoadingOverlay />
    </LoadingProvider>
  );
  console.log('[AppWrapper] Render complete, returning JSX');
  return result;
};

export default AppWrapper;
