import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import {PermissionsAndroid, Platform} from 'react-native';

// Constants
const EARTH_RADIUS_KM = 6371;
const AVERAGE_SPEED_KMPH = 25;
const BASE_PREP_TIME_MIN = 15;

// Request permission before using Geolocation
const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  }
  return true; // iOS handles via Info.plist
};

// Utility: Haversine Distance Calculation
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  try {
    const toRadians = deg => (deg * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  } catch (e) {
    console.error('Distance Calculation Error:', e);
    return 0;
  }
};

// Utility: Estimate Delivery Time based on Distance
export const estimateDeliveryTime = distanceKm => {
  try {
    const travelTime = (distanceKm / AVERAGE_SPEED_KMPH) * 60;
    const totalMinutes = Math.ceil(BASE_PREP_TIME_MIN + travelTime);

    if (totalMinutes < 60) {
      return `${totalMinutes} mins`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes === 0
        ? `${hours} hour${hours > 1 ? 's' : ''}`
        : `${hours}h ${minutes}m`;
    }
  } catch (error) {
    console.error('Delivery Time Estimation Error:', error);
    return '30 mins';
  }
};

// API: Fetch Store Location (force JSON)
export const fetchStoreDetailsLocation = async storeId => {
  try {
    const response = await axios.get(
      `https://fybrappapi.benchstep.com/api/ProductApi/gStoreDetails?StoreID=${storeId}`,
      {headers: {Accept: 'application/json'}},
    );
    const store = response.data[0];
    return {latitude: store.Latitude, longitude: store.Longitude};
  } catch (error) {
    console.error('Failed to fetch store location:', error);
    throw error;
  }
};

// Geolocation: Get User's Current Location with fallback
export const getUserLocation = (showModalCallback = null) => {
  return new Promise(async (resolve, reject) => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      const msg = 'Location permission denied. Enable location access.';
      if (showModalCallback) showModalCallback('Location Error', msg, 'error');
      return reject(new Error(msg));
    }

    const optionsHighAccuracy = {
      enableHighAccuracy: true,
      timeout: 30000, // longer timeout
      maximumAge: 0,
      distanceFilter: 0,
    };

    const optionsLowAccuracy = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
      distanceFilter: 0,
    };

    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.warn('High accuracy location failed:', error);
        // Try again with low accuracy
        Geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          err => {
            console.error('Low accuracy location failed:', err);

            let errorMessage = 'Unable to get your location.';
            if (err.code === 1) {
              errorMessage =
                'Location permission denied. Enable location access.';
            } else if (err.code === 2) {
              errorMessage = 'Location information unavailable.';
            } else if (err.code === 3) {
              errorMessage = 'Location request timed out.';
            }

            if (showModalCallback) {
              showModalCallback('Location Error', errorMessage, 'error');
            }
            reject(err);
          },
          optionsLowAccuracy,
        );
      },
      optionsHighAccuracy,
    );
  });
};

// Main Function: Calculate User's Delivery Time
export const getUserDeliveryTime = async storeId => {
  try {
    const [storeLocation, userLocation] = await Promise.all([
      fetchStoreDetailsLocation(storeId),
      getUserLocation(),
    ]);
    if (!storeLocation || !userLocation) {
      return '';
    }
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      storeLocation.latitude,
      storeLocation.longitude,
    );

    const deliveryTime = estimateDeliveryTime(distance);

    console.log(
      `Distance: ${distance.toFixed(
        2,
      )} km, Estimated Delivery: ${deliveryTime}`,
    );

    return deliveryTime;
  } catch (error) {
    console.error('Error calculating delivery time:', error);
    return 'Unable to estimate delivery time.';
  }
};
