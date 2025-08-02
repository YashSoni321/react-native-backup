import Geolocation from "@react-native-community/geolocation";
import axios from "axios";
import { Alert } from "react-native";

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    try {
      const R = 6371; // Radius of Earth in KM
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    } catch (e) {
    //   handleError(e, 'Distance calc error');
      return 0;
    }
  };

export const estimateDeliveryTime = distanceKm => {
    try {
      // Base delivery time: 15 minutes for preparation
      let baseTime = 15;

      // Add time based on distance
      // Assume average speed of 25 km/h in city traffic
      const travelTimeMinutes = (distanceKm / 25) * 60;

      const totalMinutes = Math.ceil(baseTime + travelTimeMinutes);

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
    //   handleError(error, 'Delivery time estimation');
      return '30 mins';
    }
  };


export const getActualDeliveryTime = (lat1, lon1, lat2, lon2) => {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    const finalDistance = estimateDeliveryTime(distance);
    return finalDistance
}

export const fetchStoreDetailsLocation = async () => {
    const result = await axios.get("https://fybrappapi.benchstep.com/api/ProductApi/gStoreDetails?StoreID=1")
    console.log('storeDetails', result?.data);
    const storedetails = result?.data[0]
    const storeLocation = {
        latitude : storedetails.Latitude,
        longitude : storedetails.Longitude
    }
    console.log('storeLocation', storeLocation);

    return storeLocation;
}

export const getUserLocation = async () => {
    const location = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            console.log('📍 Current location:', newLocation);
            resolve(newLocation);
          },
          error => {
            console.error('📍 Location error:', error);
  
            let errorMessage = 'Unable to get your location.';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied. Please enable location access in settings.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out.';
                break;
            }
  
            Alert.alert('Location Error', errorMessage);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000,
            distanceFilter: 10,
          }
        );
      });
  
      return location;
}

export const getUserDeliveryTime = async  () => {
    console.log("getUserDeliveryTimegetUserDeliveryTime");
    const storeLocation = await fetchStoreDetailsLocation();
    const userLocation = await getUserLocation();
    console.log("storeLocation",storeLocation);
    
    console.log("userLocation",userLocation);
    
    const newLocation = await getActualDeliveryTime(userLocation.latitude, userLocation.longitude, storeLocation.latitude, storeLocation.longitude);
    console.log("newLocation in KMS>>>>>>",newLocation);
    return newLocation
}