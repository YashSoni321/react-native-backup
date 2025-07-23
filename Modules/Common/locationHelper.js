import {Alert, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid} from 'react-native';

export const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Permission error:', err);
    return false;
  }
};

export const getUserLocation = () => {
  return new Promise(async (resolve, reject) => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Location access is required to find nearby services.',
      );
      return reject(new Error('Location permission denied'));
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Location request timed out'));
    }, 15000); // 15 seconds timeout

    Geolocation.getCurrentPosition(
      position => {
        clearTimeout(timeoutId);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        clearTimeout(timeoutId);

        let message = 'Unable to fetch location.';
        switch (error.code) {
          case 1:
            message = 'Permission denied.';
            break;
          case 2:
            message = 'Location unavailable.';
            break;
          case 3:
            message = 'Location timeout.';
            break;
        }

        Alert.alert('Location Error', message);
        reject(new Error(message));
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
