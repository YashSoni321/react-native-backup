import {PermissionsAndroid, Platform, Linking} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

// Pass this in from your modal component
let modalHandler = null;

export const setLocationModalHandler = handler => {
  modalHandler = handler;
};

const showModal = (title, message, type, buttonText, onPress) => {
  if (modalHandler) {
    modalHandler(title, message, type, buttonText, onPress);
  } else {
    console.warn('⚠️ Modal handler not set for LocationService');
  }
};

// 🔹 Public function to request permission + GPS enable
export const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (!hasPermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Enable Location Services',
            message:
              'To show you nearby stores and products, we need access to your location. Please enable location services to continue.',
            buttonNegative: 'Not Now',
            buttonPositive: 'Enable',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showModal(
            'Location Access Required',
            'To find stores near you, please enable location access in your device settings.',
            'info',
            'Open Settings',
            () => Linking.openSettings(),
          );
          return false;
        }
      }

      // ✅ Check GPS state after permission granted
      return await checkAndEnableGPS();
    } else {
      // iOS
      const status = await Geolocation.requestAuthorization('whenInUse');
      const isAuthorized = status === 'granted';

      if (!isAuthorized) {
        showModal(
          'Location Access Required',
          'To find stores near you, please enable location access in your device settings.',
          'info',
          'Open Settings',
          () => Linking.openURL('app-settings:'),
        );
      }

      return isAuthorized;
    }
  } catch (error) {
    console.error('📍 Location permission error:', error);
    showModal(
      'Location Error',
      'Unable to access location services. Please try again.',
      'error',
      'Retry',
      () => requestLocationPermission(),
    );
    return false;
  }
};

// 🔹 Internal: Check and prompt GPS enable (Android only)
const checkAndEnableGPS = async () => {
  try {
    await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    });
    console.log('📍 GPS enabled');
    return true;
  } catch (err) {
    console.warn('⚠️ GPS enable request denied:', err);
    return false;
  }
};
