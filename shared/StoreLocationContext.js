import React, {createContext, useState, useContext} from 'react';

const StoreLocationContext = createContext();

export const StoreLocationProvider = ({children}) => {
  const [storeLocations, setStoreLocations] = useState({});

  const updateStoreLocation = (storeId, location) => {
    setStoreLocations(prev => ({
      ...prev,
      [storeId]: location,
    }));
  };

  const getStoreLocation = storeId => {
    return storeLocations[storeId];
  };

  const value = {
    storeLocations,
    updateStoreLocation,
    getStoreLocation,
  };

  return (
    <StoreLocationContext.Provider value={value}>
      {children}
    </StoreLocationContext.Provider>
  );
};

export const useStoreLocation = () => {
  const context = useContext(StoreLocationContext);
  if (!context) {
    throw new Error(
      'useStoreLocation must be used within a StoreLocationProvider',
    );
  }
  return context;
};
