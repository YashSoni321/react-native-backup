import React from 'react';
import {LoadingProvider} from './LoadingContext';
import GlobalLoadingOverlay from './GlobalLoadingOverlay';

/**
 * App Wrapper Component
 * Wraps your entire app with the Loading Context Provider
 * and includes the Global Loading Overlay
 */
const AppWrapper = ({children}) => {
  return (
    <LoadingProvider>
      {children}
      <GlobalLoadingOverlay />
    </LoadingProvider>
  );
};

export default AppWrapper;
