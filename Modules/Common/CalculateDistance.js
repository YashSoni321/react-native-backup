import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

// Constants
const EARTH_RADIUS_KM = 6371;
const AVERAGE_SPEED_KMPH = 25;
const BASE_PREP_TIME_MIN = 15;

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

// API: Fetch Store Location
export const fetchStoreDetailsLocation = async storeId => {
  try {
    const response = await axios.get(
      `https://fybrappapi.benchstep.com/api/ProductApi/gStoreDetails?StoreID=${storeId}`,
    );
    const store = response.data[0];
    return {latitude: store.Latitude, longitude: store.Longitude};
  } catch (error) {
    console.error('Failed to fetch store location:', error);
    throw error;
  }
};

// Geolocation: Get User's Current Location
export const getUserLocation = (showModalCallback = null) => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.error('Location Error:', error);

        let errorMessage = 'Unable to get your location.';
        if (error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Enable location access.';
        } else if (error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable.';
        } else if (error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }

        if (showModalCallback) {
          showModalCallback('Location Error', errorMessage, 'error');
        }
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
        distanceFilter: 10,
      },
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
