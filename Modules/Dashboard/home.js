import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FormInput,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Button,
  Platform,
  PermissionsAndroid,
  ImageBackground,
  ActivityIndicator,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import {Dialog} from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {API_KEY, URL_key} from '../Api/api';
import axios from 'axios';
var RNFS = require('react-native-fs');
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';

import CheckBox from 'react-native-check-box';
import Geolocation from '@react-native-community/geolocation';
import {getDistance} from 'geolib';
import {useLoading} from '../../shared/LoadingContext';
import CustomModal from '../../shared/CustomModal';
import HeaderWithAddress from '../Common/HeaderWithCommon';

const DISTANCE_THRESHOLD = 3000; // 3km in meters
const BATCH_SIZE = 50; // Process stores in batches

const Home = props => {
  const showModal = (
    title,
    message,
    type = 'info',
    primaryButtonText = 'OK',
    onPrimaryPress = null,
  ) => {
    setModalConfig({
      visible: true,
      title,
      message,
      type,
      primaryButtonText,
      onPrimaryPress,
    });
  };

  const hideModal = () => {
    setModalConfig(prev => ({...prev, visible: false}));
  };
  const {showLoading, hideLoading} = useLoading();
  const [deliveryTime, setDeliveryTime] = useState('');
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    primaryButtonText: 'OK',
    onPrimaryPress: null,
  });

  const [brand, setBrand] = useState([
    {
      name: 'LOV',
      ischeck: false,
    },
    {name: 'Nuon', ischeck: false},
    {
      name: 'Studiofit',
      ischeck: false,
    },
    {
      name: 'Wardrobe',
      ischeck: false,
    },
  ]);

  const [size, setSize] = useState([
    {
      name: 'XL',
      ischeck: false,
    },
    {name: 'XS', ischeck: false},
    {
      name: 'XXL',
      ischeck: false,
    },
    {
      name: 'S',
      ischeck: false,
    },
    {
      name: 'M',
      ischeck: false,
    },
  ]);

  const [color, setColor] = useState([
    {
      name: 'Black',
      ischeck: false,
    },
    {name: 'Blue', ischeck: false},
    {
      name: 'Brown',
      ischeck: false,
    },
    {
      name: 'Green',
      ischeck: false,
    },
    {
      name: 'Red',
      ischeck: false,
    },
    {
      name: 'Pink',
      ischeck: false,
    },
    {
      name: 'White',
      ischeck: false,
    },
  ]);

  const [pattern, setPattern] = useState([
    {
      name: 'Checks',
      ischeck: false,
    },
    {name: 'self', ischeck: false},
    {
      name: 'Solid',
      ischeck: false,
    },
    {
      name: 'Stripes',
      ischeck: false,
    },
    {
      name: 'Textured',
      ischeck: false,
    },
  ]);

  const [subcategory, setSubcategory] = useState(null);
  const [categories1, setCategories1] = useState(null);
  const [showcategory, setShowcategory] = useState(false);
  const [showsubcategory, setShowsubcategory] = useState(false);
  const [childsubcategory, setChildsubcategory] = useState(null);
  const [Nearbystores, setNearbystores] = useState(null);
  const [Nearbystores1, setNearbystores1] = useState(null);
  const [subCategoryName, setSubCategoryName] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [processedStores, setProcessedStores] = useState(0);
  const timeoutRef = useRef(null);

  // Create ref for RBSheet
  const RBSheetRef = useRef(null);

  // Optimized distance calculation with validation
  const calculateDistance = (userLocation, storeLocation) => {
    try {
      // Validate coordinates
      if (!userLocation || !storeLocation) return null;

      const {latitude: userLat, longitude: userLng} = userLocation;
      const {latitude: storeLat, longitude: storeLng} = storeLocation;

      // Check if coordinates are valid numbers
      if (
        isNaN(userLat) ||
        isNaN(userLng) ||
        isNaN(storeLat) ||
        isNaN(storeLng) ||
        userLat < -90 ||
        userLat > 90 ||
        userLng < -180 ||
        userLng > 180 ||
        storeLat < -90 ||
        storeLat > 90 ||
        storeLng < -180 ||
        storeLng > 180
      ) {
        return null;
      }

      return getDistance(userLocation, storeLocation);
    } catch (error) {
      console.warn('Distance calculation error:', error);
      return null;
    }
  };

  // Parse coordinates from different formats
  const parseCoordinates = (lat, lng) => {
    try {
      const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
      const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;

      if (isNaN(latitude) || isNaN(longitude)) return null;

      return {latitude, longitude};
    } catch (error) {
      console.warn('Coordinate parsing error:', error);
      return null;
    }
  };

  // Process stores in batches to prevent UI blocking
  const processStoresInBatches = async (stores, userLocation) => {
    console.log('🔍 Processing stores in batches...');
    console.log('📍 User Location:', userLocation);
    console.log('🏪 Total stores to process:', stores.length);

    return new Promise(resolve => {
      const validStores = [];
      let currentIndex = 0;
      let skippedStores = {
        noCoordinates: 0,
        invalidCoordinates: 0,
        tooFar: 0,
      };

      const processBatch = () => {
        const endIndex = Math.min(currentIndex + BATCH_SIZE, stores.length);

        for (let i = currentIndex; i < endIndex; i++) {
          const product = stores[i];

          // Debug each store
          console.log(`\n🏪 Store ${i + 1}:`, {
            StoreName: product.StoreName,
            StoreLocation: product.StoreLocation,
            Latitude: product.Latitude,
            Longitude: product.Longitude,
          });

          // Skip if no coordinates
          if (!product.Latitude || !product.Longitude) {
            console.log('❌ Skipped: No coordinates');
            skippedStores.noCoordinates++;
            continue;
          }

          const storeLocation = parseCoordinates(
            product.Latitude,
            product.Longitude,
          );
          if (!storeLocation) {
            console.log('❌ Skipped: Invalid coordinates');
            skippedStores.invalidCoordinates++;
            continue;
          }

          console.log('📍 Store Location:', storeLocation);

          const distance = calculateDistance(userLocation, storeLocation);
          console.log(
            '📏 Distance:',
            distance ? `${Math.round(distance)}m` : 'Failed to calculate',
          );

          // Skip if distance calculation failed or exceeds threshold
          if (distance === null || distance > DISTANCE_THRESHOLD) {
            if (distance === null) {
              console.log('❌ Skipped: Distance calculation failed');
            } else {
              console.log(
                `❌ Skipped: Too far (${Math.round(
                  distance,
                )}m > ${DISTANCE_THRESHOLD}m)`,
              );
              skippedStores.tooFar++;
            }
            continue;
          }

          console.log('✅ Store within range!');
          validStores.push({
            ...product,
            distance: distance,
            storeLocation: storeLocation,
          });
        }

        currentIndex = endIndex;
        const progress = Math.round((currentIndex / stores.length) * 100);

        setProcessedStores(currentIndex);
        setLoadingProgress(progress);

        if (currentIndex < stores.length) {
          // Process next batch asynchronously
          setTimeout(processBatch, 10);
        } else {
          console.log('\n📊 Processing Summary:');
          console.log('✅ Valid stores found:', validStores.length);
          console.log('❌ Stores skipped:');
          console.log('  - No coordinates:', skippedStores.noCoordinates);
          console.log(
            '  - Invalid coordinates:',
            skippedStores.invalidCoordinates,
          );
          console.log('  - Too far (>3km):', skippedStores.tooFar);

          resolve(validStores);
        }
      };

      processBatch();
    });
  };

  // Group stores by location
  const groupStoresByLocation = products => {
    const grouped = products.reduce((acc, product) => {
      const key = `${product.StoreName} - ${product.StoreLocation}`;

      if (!acc[key]) {
        acc[key] = {
          StoreName: product.StoreName,
          StoreLocation: product.StoreLocation,
          StoreID: product.StoreID,
          distance: product.distance,
          storeLocation: product.storeLocation,
          Products: [],
        };
      }

      acc[key].Products.push(product);
      return acc;
    }, {});

    // Sort by distance
    return Object.values(grouped).sort((a, b) => a.distance - b.distance);
  };

  // Main function to fetch and process nearby stores
  const fetchNearbyStores = async (
    userLocation,
    searchTerm = '',
    displayLoading = true,
  ) => {
    try {
      console.log('🚀 Starting fetchNearbyStores...');
      console.log('📍 User Location:', userLocation);
      if (displayLoading) {
        showLoading('fetchNearbyStores', 'Loading nearby stores...');
        setIsLoadingStores(true);
      }
      setLoadingProgress(0);
      setProcessedStores(0);

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      console.log('👤 UserProfileID:', UserProfileID);

      if (!UserProfileID) {
        console.log('⚠️ No UserProfileID found, skipping store fetch');
        setIsLoadingStores(false);
        setNearbystores([]);
        setNearbystores1([]);
        return;
      }

      const apiUrl = `${URL_key}api/ProductApi/gNearByProductList?UserProfileID=${UserProfileID}`;
      console.log('🌐 API URL:', apiUrl);

      const response = await axios.post(
        apiUrl,
        {productName: searchTerm, storeName: ''}, // <== This is your payload (2nd param)
        {
          headers: {'content-type': 'application/json'},
          timeout: 30000,
        },
      );
      console.log('🔄 API request sent, waiting for response...', {
        productName: searchTerm,
        storeName: '',
      });

      console.log('📡 API Response Status:', response.status);
      const allStores = response.data || [];
      console.log('🏪 Total stores from API:', allStores.length);

      // Log first few stores for debugging
      if (allStores.length > 0) {
        console.log('📋 Sample stores:');
        allStores.slice(0, 3).forEach((store, index) => {
          console.log(`Store ${index + 1}:`, {
            StoreName: store.StoreName,
            StoreLocation: store.StoreLocation,
            Latitude: store.Latitude,
            Longitude: store.Longitude,
            ProductName: store.ProductName,
          });
        });
      }

      setTotalStores(allStores.length);

      if (allStores.length === 0) {
        console.log('⚠️ No stores returned from API');
        setNearbystores([]);
        setNearbystores1([]);
        setIsLoadingStores(false);
        return;
      }

      // Process stores in batches
      console.log('⚙️ Starting batch processing...');
      const validStores = await processStoresInBatches(allStores, userLocation);

      // Group by store location
      console.log('📦 Grouping stores by location...');
      const groupedStores = groupStoresByLocation(validStores);
      console.log('🏪 Final grouped stores:', groupedStores.length);

      setNearbystores(groupedStores);
      setNearbystores1(groupedStores);
      setIsLoadingStores(false);
      setLoadingProgress(100);
      if (displayLoading) hideLoading('fetchNearbyStores');
      console.log('✅ fetchNearbyStores completed successfully');
    } catch (error) {
      if (displayLoading) hideLoading('fetchNearbyStores');
      console.error('💥 Error fetching nearby stores:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      setIsLoadingStores(false);
      setNearbystores([]);
      setNearbystores1([]);

      // Don't show alert for network errors, just log them
      console.log('⚠️ Store fetch failed, but app will continue to work');
    }
  };

  // Add state for search and selectedIndex
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const triggerSearch = textData => {
    fetchNearbyStores(currentLocation, textData, false);
    setSelectedIndex(11);
  };

  const SearchFilterFunction = text => {
    setSearch(text.toLowerCase().trim());

    // if (!text) {
    //   setSelectedIndex(0);
    //   clearTimeout(timeoutRef.current);
    //   return;
    // }

    const textData = text.toLowerCase().trim();

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      textData && triggerSearch(textData);
    }, 1500); // 1.5 seconds debounce
  };

  // Add state for banner, address, and location
  const [banner, setBanner] = useState(null);
  const [StreetName, setStreetName] = useState('');
  const [Pincode, setPincode] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [CategoryName, setCategoryName] = useState('');
  const [CategoryID, setCategoryID] = useState(null);

  // Replace componentDidMount with useEffect
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        console.log('🏠 Home component mounting...');

        const bannerValue = await AsyncStorage.getItem('banner');
        setBanner(bannerValue);

        const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
        console.log('👤 UserProfileID:', UserProfileID);

        // Fetch categories first (non-critical)
        try {
          const categoriesResponse = await axios.get(
            URL_key + 'api/CategoryApi/gCategoryList',
            {
              headers: {
                'content-type': `application/json`,
              },
            },
          );
          setCategories1(categoriesResponse.data);
          console.log('✅ Categories loaded successfully');
        } catch (err) {
          console.log('⚠️ Categories fetch error:', err);
          // Don't block the app for category loading failure
        }

        // Fetch user address (non-critical)
        try {
          const addressResponse = await axios.get(
            URL_key +
              'api/AddressApi/gCustomerAddress?UserProfileID=' +
              UserProfileID,
            {
              headers: {
                'content-type': `application/json`,
              },
            },
          );
          console.log('🏠 AddressResponse:', addressResponse.data[0]);
          if (addressResponse && addressResponse.data[0]) {
            setUserAddress(addressResponse.data[0]);
            setStreetName(addressResponse.data[0]?.StreetName || '');
            setPincode(addressResponse.data[0]?.AddressCategory || '');
          }
          console.log('✅ Address loaded successfully');
        } catch (err) {
          console.log('⚠️ Address fetch error:', err);
          // Don't block the app for address loading failure
        }

        // Try to get location (optional - don't block the app)
        // For now, let's skip location entirely to prevent crashes
        console.log('📍 Skipping location functionality to prevent crashes');

        // Uncomment the following code when location issues are resolved:

        try {
          const hasPermission = await requestLocationPermission();
          if (hasPermission) {
            // Add timeout to prevent hangin // 10 second timeout

            try {
              Geolocation.getCurrentPosition(
                async position => {
                  try {
                    // clearTimeout(locationTimeout);
                    const newLocation = {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                    };

                    setCurrentLocation(newLocation);
                    console.log('📍 Current location:', newLocation);

                    // Fetch nearby stores
                    await fetchNearbyStores(newLocation);
                  } catch (locationError) {
                    // clearTimeout(locationTimeout);
                    console.error(
                      '📍 Location processing error:',
                      locationError,
                    );
                    setIsLoadingStores(false);
                  }
                },
                error => {
                  console.error('📍 Location error:', error);

                  // Provide user-friendly error message
                  let errorMessage = 'Unable to get your location.';
                  let actionButtonText = 'Open Settings';

                  switch (error.code) {
                    case error.PERMISSION_DENIED:
                      errorMessage =
                        'To show you nearby stores and products, we need access to your location. Please enable location services in settings.';
                      break;
                    case error.POSITION_UNAVAILABLE:
                      errorMessage =
                        "We're having trouble getting your location. Please check if location services are enabled on your device.";
                      break;
                    case error.TIMEOUT:
                      errorMessage =
                        'Location request took too long. Please check your connection and try again.';
                      actionButtonText = 'Try Again';
                      break;
                  }
                  if (error.POSITION_UNAVAILABLE) {
                    return;
                  }

                  showModal(
                    'Location Access Required',
                    errorMessage,
                    'info',
                    actionButtonText,
                    () => {
                      if (error.code === error.TIMEOUT) {
                        refreshLocation();
                      } else {
                        if (Platform.OS === 'android') {
                          Linking.openSettings();
                        } else {
                          Linking.openURL('app-settings:');
                        }
                      }
                    },
                  );
                },
                {
                  enableHighAccuracy: false, // Set to false for faster initial fix
                  timeout: 20000, // Increased timeout
                  maximumAge: 60000, // Reduced to 1 minute for more accuracy
                  distanceFilter: 100, // Increased to reduce updates
                },
              );
            } catch (geolocationError) {
              // clearTimeout(locationTimeout);
              showModal(
                'Location Error',
                'Location permission denied. Please enable location access in settings.',
                'error',
                'OK',
                () => {
                  if (Platform.OS === 'android') {
                    Linking.openSettings(); // Opens App Settings
                  } else {
                    Linking.openURL('App-Prefs:root=Privacy&path=LOCATION'); // iOS (but limited)
                  }
                },
              );
              // Continue without location
            }
          } else {
            showModal(
              'Location Error',
              'Location permission denied. Please enable location access in settings.',
              'error',
              'OK',
              () => {
                if (Platform.OS === 'android') {
                  Linking.openSettings(); // Opens App Settings
                } else {
                  Linking.openURL('App-Prefs:root=Privacy&path=LOCATION'); // iOS (but limited)
                }
              },
            );
          }
        } catch (locationPermissionError) {
          console.error(
            '📍 Location permission error:',
            locationPermissionError,
          );
        }

        console.log('✅ Home component mounted successfully');
      } catch (error) {
        console.error('💥 ComponentDidMount error:', error);
        // Don't crash the app, just log the error
      }
    };

    initializeComponent();
  }, []); // Empty dependency array means this effect runs once on mount

  // Function for debugging specific location

  // Test function for debugging specific location

  // Refresh location manually
  const refreshLocation = async () => {
    try {
      setIsLoadingStores(true);

      // First check location services
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        setIsLoadingStores(false);
        return; // Wait for user to enable services
      }

      // Then check/request permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsLoadingStores(false);
        return; // Permission handling is done in requestLocationPermission
      }

      // Get location if we have both services and permission
      Geolocation.getCurrentPosition(
        async position => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(newLocation);
          console.log('📍 Refreshed location:', newLocation);
          await fetchNearbyStores(newLocation);
        },
        error => {
          console.error('📍 Refresh location error:', error);
          let errorMessage = 'Unable to get your location.';
          let actionButtonText = 'Try Again';

          switch (error.code) {
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                'Location services seem to be disabled. Please enable them and try again.';
              actionButtonText = 'Enable Location';
              break;
            case error.TIMEOUT:
              errorMessage =
                'Location request took too long. Please check your connection and try again.';
              break;
            default:
              errorMessage = 'Failed to get your location. Please try again.';
          }

          showModal(
            'Location Error',
            errorMessage,
            'error',
            actionButtonText,
            async () => {
              if (error.code === error.POSITION_UNAVAILABLE) {
                // Re-check location services
                checkLocationServices();
              } else {
                refreshLocation();
              }
            },
          );
          setIsLoadingStores(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 60000,
          distanceFilter: 100,
        },
      );
    } catch (error) {
      console.error('📍 Refresh location error:', error);
      showModal(
        'Location Error',
        'Something went wrong while getting your location. Please try again.',
        'error',
        'Retry',
        () => refreshLocation(),
      );
      setIsLoadingStores(false);
    }
  };

  // Handle input changes
  const handleInputChange = useCallback((inputName, inputValue) => {
    // Use the appropriate setter function based on the input name
    switch (inputName) {
      case 'search':
        setSearch(inputValue);
        break;
      case 'selectedIndex':
        setSelectedIndex(inputValue);
        break;
      case 'showcategory':
        setShowcategory(inputValue);
        break;
      case 'CategoryName':
        setCategoryName(inputValue);
        break;
      case 'subcategory':
        setSubcategory(inputValue);
        break;
      // Add other cases as needed
      default:
        console.log(`No setter defined for ${inputName}`);
    }
  }, []);

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        // Check if permission is already granted
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (hasPermission) {
          console.log('📍 Location permission already granted');
          return true;
        }

        // Request permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Enable Location Services',
            message:
              'To show you nearby stores and products, we need access to your location. Please enable location services to continue.',
            buttonNeutral: null, // Remove "Ask Me Later" option
            buttonNegative: 'Not Now',
            buttonPositive: 'Enable',
          },
        );

        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('📍 Location permission result:', isGranted);

        if (!isGranted) {
          showModal(
            'Location Access Required',
            'To find stores near you, please enable location access in your device settings.',
            'info',
            'Open Settings',
            () => {
              if (Platform.OS === 'android') {
                Linking.openSettings();
              } else {
                Linking.openURL('app-settings:');
              }
            },
          );
        }

        return isGranted;
      } else {
        // For iOS
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
        () => refreshLocation(),
      );
      return false;
    }
  };

  // Check and handle location services
  const checkLocationServices = async () => {
    try {
      if (Platform.OS === 'android') {
        const isEnabled = await isLocationEnabled();
        console.log('📍 Location services enabled:', isEnabled);

        if (!isEnabled) {
          showModal(
            'Enable Location Services',
            'Please enable location services to find stores near you.',
            'info',
            'Enable',
            async () => {
              try {
                await promptForEnableLocationIfNeeded();
                // After enabling location services, request permission
                const hasPermission = await requestLocationPermission();
                if (hasPermission) {
                  refreshLocation();
                  // show; // Get location after permission granted
                }
                hideModal();
              } catch (error) {
                console.log('Error enabling location:', error);
                showModal(
                  'Location Error',
                  'Unable to enable location services. Please try again.',
                  'error',
                  'Retry',
                  () => checkLocationServices(),
                );
              }
            },
          );
          return false;
        }
        return true;
      }
      // For iOS, we'll handle it in the permission request
      return true;
    } catch (error) {
      console.error('Location services check error:', error);
      return false;
    }
  };

  // Initialize location handling
  const initializeLocation = async () => {
    try {
      // First check if location services are enabled
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        return; // Wait for user to enable services
      }

      // Then request permission
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        // Get location only if we have both services and permission
        refreshLocation();
      }
    } catch (error) {
      console.error('Location initialization error:', error);
    }
  };

  useEffect(() => {
    initializeLocation();
  }, []);

  // Replace render method with return statement
  return (
    <SafeAreaView>
      {/* Custom Modal */}

      <CustomModal
        visible={modalConfig.visible}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        primaryButtonText={modalConfig.primaryButtonText}
        onPrimaryPress={modalConfig.onPrimaryPress}
      />
      <ScrollView style={{backgroundColor: 'white', height: '100%'}}>
        {showcategory ? (
          <>
            {/* <HeaderWithAddress navigation={props.navigation} /> */}
            {/* <View style={{display: 'flex', flexDirection: 'row'}}> */}
            <Text
              style={{
                color: '#00afb5',
                fontSize: 18,
                fontWeight: '700',
                fontFamily: 'Poppins-Bold',
                textAlign: 'center',
                marginTop: hp('5%'),
              }}>
              {CategoryName}
            </Text>
            <View>
              <Icon
                onPress={() => setShowcategory(false)}
                name="chevron-back"
                color={'#00afb5'}
                size={30}
                style={{
                  marginLeft: wp('1%'),
                  padding: hp('1%'),
                  marginTop: hp('-4%'),
                }}
              />
            </View>
            {/* </View> */}

            <FlatList
              data={subcategory}
              style={{marginTop: hp('2%')}}
              renderItem={({item, index}) => {
                return (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        axios
                          .get(
                            URL_key +
                              'api/CategoryApi/gChildSubCategoryList?SubCategoryID=' +
                              item.SubCategoryID,
                            {
                              headers: {
                                'content-type': `application/json`,
                              },
                            },
                          )
                          .then(response => {
                            setChildsubcategory(response.data);
                            setSubCategoryName(item.SubCategoryName);
                            setShowsubcategory(true);
                            setShowcategory(false);
                            console.log(item.CategoryName);
                            console.log(item.SubCategoryImage);
                          })
                          .catch(err => {
                            console.log(err);
                          });
                      }}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image
                          style={{
                            width: wp('18%'),
                            height: hp('10%'),
                            resizeMode: 'contain',
                            marginTop: hp('1.5%'),
                            marginLeft: wp('8%'),
                            marginRight: wp('3%'),
                            borderRadius: wp('3%'),
                            marginBottom: hp('1.5%'),
                          }}
                          source={
                            item.SubCategoryImage
                              ? {uri: item.SubCategoryImage}
                              : require('../Images/tshirt.jpg')
                          }
                        />

                        <Text
                          style={{
                            color: '#333',
                            fontSize: 12,
                            fontFamily: 'Poppins-Regular',
                            width: wp('55%'),
                            marginLeft: wp('8%'),
                          }}>
                          {item.SubCategoryName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </>
                );
              }}
              numColumns={1}
            />
          </>
        ) : (
          <>
            {showsubcategory == true ? (
              <>
                <Text
                  style={{
                    color: '#00afb5',
                    fontSize: 18,
                    fontWeight: '700',
                    fontFamily: 'Poppins-Bold',
                    textAlign: 'center',
                    marginTop: hp('5%'),
                  }}>
                  {subCategoryName}
                </Text>
                <View>
                  <Icon
                    onPress={() => {
                      setShowsubcategory(false);
                      setShowcategory(true);
                    }}
                    name="chevron-back"
                    color={'#00afb5'}
                    size={30}
                    style={{
                      marginLeft: wp('1%'),
                      padding: hp('1%'),
                      marginTop: hp('-4%'),
                    }}
                  />
                </View>
                <FlatList
                  data={childsubcategory}
                  renderItem={({item, index}) => {
                    return (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            props.navigation.push('CategoryProduct', {
                              data: {
                                CategoryID: item.CategoryID,
                                SubCategoryID: item.SubCategoryID,
                                ChildSubCategoryID: item.ChildSubCategoryID,
                              },
                            });
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Image
                              style={{
                                width: wp('18%'),
                                height: hp('10%'),
                                resizeMode: 'stretch',
                                marginTop: hp('1.5%'),
                                marginLeft: wp('8%'),
                                marginRight: wp('3%'),
                                borderRadius: wp('3%'),
                                marginBottom: hp('1.5%'),
                              }}
                              source={
                                item.ChildSubCategoryImage
                                  ? {uri: item.ChildSubCategoryImage}
                                  : require('../Images/tshirt.jpg')
                              }
                            />

                            <Text
                              style={{
                                color: '#333',
                                fontSize: 12,
                                fontFamily: 'Poppins-Regular',
                                width: wp('55%'),
                                marginLeft: wp('8%'),
                              }}>
                              {item.ChildSubCategoryName}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </>
                    );
                  }}
                  numColumns={1}
                />
              </>
            ) : (
              <>
                <HeaderWithAddress
                  showBackButton={false}
                  handleBackPress={() => {}}
                  navigation={props.navigation}
                />
                <View style={{flexDirection: 'row', marginBottom: hp('5%')}}>
                  <View
                    style={{
                      justifyContent: 'center',
                      borderRadius: wp('3%'),
                      height: hp('5.2%'),
                      borderColor: '#00afb5',
                      marginTop: hp('2%'),
                      backgroundColor: '#ffff',
                      width: wp('85%'),
                      alignSelf: 'center',
                      flexDirection: 'row',
                      marginBottom: hp('1%'),
                      textAlignVertical: 'top',
                      marginLeft: wp('7%'),
                      borderWidth: 0.5,
                    }}>
                    <TextInput
                      placeholder="Search for products & stores"
                      fontFamily={'Poppins-Medium'}
                      placeholderTextColor={'#00afb5'}
                      color={'black'}
                      fontSize={11}
                      onChangeText={value => SearchFilterFunction(value)}
                      style={{
                        width: wp('65%'),
                      }}
                    />
                    <Icon
                      style={{marginLeft: wp('1%'), padding: hp('1%')}}
                      name="search"
                      color={'gray'}
                      size={20}
                    />
                  </View>
                </View>

                {banner == 'true' ? (
                  <></>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        AsyncStorage.setItem('banner', 'true');
                        props.navigation.push('Invite');
                      }}>
                      <View
                        style={{
                          width: wp('90%'),
                          alignSelf: 'center',
                          backgroundColor: '#00afb5',
                          borderRadius: wp('4%'),
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: wp('4%'),
                          marginTop: hp('1%'),
                        }}>
                        {/* Left side: Text content */}
                        <View style={{flex: 1, paddingRight: wp('2%')}}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#fff',
                              fontFamily: 'Poppins-Medium',
                              marginBottom: hp('0.5%'),
                              fontWeight: 'bold',
                            }}>
                            Refer & Enjoy
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              color: '#fff',
                              fontFamily: 'Poppins-Light',
                            }}>
                            Tap here to refer and get 20% off on {'\n'} order
                            above ₹1299 →
                          </Text>
                        </View>

                        {/* Right side: Badge */}
                        <View style={{alignItems: 'center'}}>
                          {/* Main Badge Box */}
                          <View
                            style={{
                              borderWidth: 1,
                              borderColor: '#fff',
                              borderRadius: wp('2%'),
                              paddingVertical: hp('0.8%'),
                              paddingHorizontal: wp('3.5%'),
                              alignItems: 'center',
                              backgroundColor: '#00afb5',
                            }}>
                            <Text
                              style={{
                                fontSize: 14,
                                color: '#fff',
                                fontFamily: 'Poppins-Medium',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                lineHeight: 14,
                              }}>
                              20%{'\n'}OFF
                            </Text>
                          </View>

                          {/* Triangle Pointer */}
                          <View
                            style={{
                              width: 0,
                              height: 0,
                              borderLeftWidth: wp('1.5%'),
                              borderRightWidth: wp('1.5%'),
                              borderTopWidth: hp('1%'),
                              borderLeftColor: 'transparent',
                              borderRightColor: 'transparent',
                              borderTopColor: '#fff',
                            }}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </>
                )}

                <Text
                  style={{
                    fontSize: 14,
                    color: '#333',
                    fontWeight: '600',
                    fontFamily: 'Poppins-SemiBold',
                    // marginTop: hp('2%'),
                    marginBottom: hp('-1%'),
                    marginLeft: wp('8%'),
                    marginRight: wp('1%'),
                  }}>
                  Categories
                </Text>
                <View
                  style={{
                    marginLeft: wp('4%'),
                    marginRight: wp('4%'),
                  }}>
                  <FlatList
                    data={categories1}
                    horizontal={true}
                    renderItem={({item, index}) => {
                      return (
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              console.log(
                                'item.CategoryID----',
                                item.CategoryID,
                              );
                              setCategoryID(item.CategoryID);
                              axios
                                .get(
                                  URL_key +
                                    'api/CategoryApi/gSubCategoryList?CategoryID=' +
                                    item.CategoryID,
                                  {
                                    headers: {
                                      'content-type': `application/json`,
                                    },
                                  },
                                )
                                .then(response => {
                                  setSubcategory(response.data);
                                  setCategoryName(item.CategoryName);
                                  setShowcategory(true);
                                })
                                .catch(err => {
                                  console.log(err);
                                });
                            }}>
                            <View style={{width: wp('16.5%')}}>
                              <View
                                style={[
                                  {
                                    width: wp('13.5%'),
                                    alignSelf: 'center',
                                    elevation: 10,
                                    shadowColor: '#000',
                                    shadowOffset: {width: 0, height: 3},
                                    shadowOpacity: 0.5,
                                    shadowRadius: 5,
                                    backgroundColor: '#00afb5',
                                    borderRadius: wp('2%'),
                                    marginLeft: wp('1%'),
                                    marginRight: wp('1%'),
                                    marginTop: hp('2%'),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  },
                                ]}>
                                {/* <Icon
                                  name={'man'}
                                  color="#ffff"
                                  size={25}
                                  style={{
                                    marginTop: hp('1.3%'),
                                    marginBottom: hp('1.3%'),
                                  }}
                                /> */}
                                <Image
                                  style={{
                                    height: hp('7%'), // No 'px'
                                    width: wp('8%'), // No 'px'
                                    // marginTop: hp('1.3%'),
                                    resizeMode: 'contain', // Optional, improves image fitting
                                  }}
                                  source={{
                                    uri:
                                      item.CategoryImage ||
                                      'https://cdn1.iconfinder.com/data/icons/heroicons-ui/24/menu-512.png',
                                  }}
                                />
                              </View>

                              <Text
                                style={{
                                  fontSize: 9,
                                  fontFamily: 'Poppins-Light',
                                  alignContent: 'center',
                                  textAlign: 'center',
                                  justifyContent: 'center',
                                  color: '#333',
                                  marginTop: hp('0.5%'),
                                  marginBottom: hp('1%'),
                                }}>
                                {item.CategoryName}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </>
                      );
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#333',
                    fontWeight: '600',
                    fontFamily: 'Poppins-SemiBold',
                    marginBottom: hp('1%'),
                    marginLeft: wp('10%'),
                    marginRight: wp('1%'),
                  }}>
                  Nearby stores
                </Text>
                <Text
                  onPress={() => {
                    console.log('🔄 Navigating to Tabs screen...');
                    props.navigation.push('Tabs');
                  }}
                  style={{
                    fontSize: 9,
                    fontFamily: 'Poppins-Light',
                    textAlign: 'right',
                    color: '#333',
                    marginTop: hp('-2%'),
                    marginBottom: hp('1%'),
                    marginRight: wp('7%'),
                  }}>
                  View all -&gt;
                </Text>

                {/* Refresh Location Button */}

                {isLoadingStores && (
                  <View
                    style={{
                      alignItems: 'center',
                      marginTop: hp('5%'),
                      marginBottom: hp('3%'),
                    }}>
                    <ActivityIndicator size="large" color="#00afb5" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Poppins-Medium',
                        color: '#333',
                        marginTop: hp('2%'),
                        textAlign: 'center',
                      }}>
                      Fetching nearby stores...
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: 'Poppins-Light',
                        color: '#666',
                        marginTop: hp('0.5%'),
                        textAlign: 'center',
                      }}>
                      Processed {processedStores} of {totalStores} stores (
                      {loadingProgress}%)
                    </Text>
                  </View>
                )}

                {!isLoadingStores && (
                  <>
                    {Nearbystores1 && Nearbystores1.length > 0 ? (
                      <FlatList
                        data={Nearbystores1}
                        keyExtractor={(item, index) => `store-${index}`}
                        renderItem={({item, index}) => {
                          return (
                            <>
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: '#333',
                                  fontFamily: 'Poppins-Medium',
                                  marginBottom: hp('-0.5%'),
                                  marginLeft: wp('10%'),
                                  marginRight: wp('1%'),
                                  width: wp('80%'),
                                }}>
                                {item.StoreName}
                                <Text
                                  style={{
                                    fontSize: 9,
                                    color: 'grey',
                                    fontFamily: 'Poppins-Light',
                                    marginTop: hp('2%'),
                                    marginBottom: hp('-0.5%'),
                                  }}>
                                  {'  '}
                                  {item.StoreLocation} •{' '}
                                  {Math.round((item.distance / 1000) * 10) / 10}{' '}
                                  km away
                                </Text>
                              </Text>
                              <View
                                style={{
                                  marginLeft: wp('4%'),
                                  marginRight: wp('4%'),
                                  marginTop: hp('2%'),
                                  marginBottom: hp('2%'),
                                }}>
                                <FlatList
                                  data={item.Products}
                                  keyExtractor={(product, productIndex) =>
                                    `product-${index}-${productIndex}`
                                  }
                                  renderItem={({item: product}) => {
                                    return (
                                      <>
                                        <TouchableOpacity
                                          onPress={() => {
                                            props.navigation.push(
                                              'ProductDetails',
                                              {
                                                data: {
                                                  ProductID: product.ProductID,
                                                  Pagename: 'Tab',
                                                },
                                              },
                                            );
                                          }}>
                                          <View
                                            style={[
                                              {
                                                alignSelf: 'center',
                                                borderRadius: wp('5%'),
                                                marginLeft: wp('1%'),
                                                marginRight: wp('1%'),
                                                marginTop: hp('1%'),
                                              },
                                            ]}>
                                            {product.ProductImage == null ||
                                            product.ProductImage ==
                                              undefined ? (
                                              <>
                                                <Image
                                                  style={{
                                                    width: wp('39%'),
                                                    height: hp('15%'),
                                                    resizeMode: 'contain',
                                                    marginLeft: wp('3%'),
                                                    marginRight: wp('3%'),
                                                  }}
                                                  source={require('../Images/tshirt.jpg')}
                                                />
                                              </>
                                            ) : (
                                              <>
                                                {product.ProductImage.length ==
                                                  0 ||
                                                product.ProductImage == '' ? (
                                                  <>
                                                    <Image
                                                      style={{
                                                        width: wp('39%'),
                                                        height: hp('15%'),
                                                        resizeMode: 'stretch',
                                                        marginLeft: wp('3%'),
                                                        marginRight: wp('3%'),
                                                      }}
                                                      source={require('../Images/tshirt.jpg')}
                                                    />
                                                  </>
                                                ) : (
                                                  <>
                                                    <Image
                                                      style={{
                                                        width: wp('39%'),
                                                        height: hp('15%'),
                                                        resizeMode: 'center',
                                                        marginLeft: wp('3%'),
                                                        marginRight: wp('3%'),
                                                      }}
                                                      source={{
                                                        uri: product.ProductImage,
                                                      }}
                                                    />
                                                  </>
                                                )}
                                              </>
                                            )}

                                            <Text
                                              style={{
                                                fontSize: 9,
                                                fontFamily: 'Poppins-Light',
                                                color: '#333',
                                                marginTop: hp('0.5%'),
                                                marginLeft: wp('4%'),
                                                width: wp('39%'),
                                              }}>
                                              {product.ProductName}
                                            </Text>
                                            <Text
                                              style={{
                                                fontSize: 8,
                                                fontFamily: 'Poppins-Light',
                                                color: 'grey',
                                                marginLeft: wp('4%'),
                                              }}>
                                              {product.ProductColor}
                                            </Text>
                                            <Text
                                              style={{
                                                fontSize: 8,
                                                fontFamily: 'Poppins-Light',
                                                color: '#333',
                                                marginLeft: wp('4%'),
                                              }}>
                                              ₹ {product.ProductPrice}
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      </>
                                    );
                                  }}
                                  numColumns={2}
                                />
                              </View>
                            </>
                          );
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          alignItems: 'center',
                          marginTop: hp('10%'),
                          marginBottom: hp('5%'),
                        }}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Poppins-Medium',
                            color: '#333',
                            textAlign: 'center',
                            marginHorizontal: wp('10%'),
                          }}>
                          {search
                            ? `No results found for "${search}" within your nearby location`
                            : 'No Stores/Products found in your nearby location'}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            fontFamily: 'Poppins-Light',
                            color: '#666',
                            textAlign: 'center',
                            marginTop: hp('1%'),
                            marginHorizontal: wp('10%'),
                          }}>
                          Try browsing all available stores
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            try {
                              props.navigation.push('Tabs');
                            } catch (error) {
                              console.error('❌ Navigation error:', error);
                              Alert.alert(
                                'Navigation Error',
                                'Unable to navigate. Please try again.',
                              );
                            }
                          }}
                          style={{
                            backgroundColor: '#00afb5',
                            paddingHorizontal: wp('5%'),
                            paddingVertical: hp('1%'),
                            borderRadius: wp('3%'),
                            marginTop: hp('2%'),
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 10,
                              fontFamily: 'Poppins-Medium',
                            }}>
                            Browse All Stores
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}

                <Text
                  onPress={() => {
                    try {
                      console.log(
                        '🔄 Navigating to Tabs screen from Browse more stores...',
                      );
                      props.navigation.push('Tabs');
                    } catch (error) {
                      console.error('❌ Navigation error:', error);
                      showModal(
                        'Navigation Error',
                        'Unable to navigate. Please try again.',
                        'error',
                      );
                    }
                  }}
                  style={{
                    fontSize: 9,
                    fontFamily: 'Poppins-Light',
                    color: '#333',
                    marginTop: hp('1%'),
                    marginBottom: hp('3%'),
                    textAlign: 'center',
                  }}>
                  Browse more stores near you
                </Text>

                <RBSheet
                  ref={RBSheetRef}
                  closeOnPressMask={true}
                  closeOnPressBack={true}
                  height={hp('100%')}
                  customStyles={{
                    container: {},
                  }}>
                  <ScrollView>
                    <View style={{backgroundColor: '#00afb5'}}>
                      <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => RBSheetRef.current.close()}>
                        <Icon
                          name="close-circle-sharp"
                          color={'lightgrey'}
                          size={hp('4%')}
                          style={{
                            marginLeft: wp('7%'),
                            marginTop: hp('2.5%'),
                          }}
                        />
                      </TouchableOpacity>
                      <Text
                        style={{
                          fontSize: 20,
                          textAlign: 'center',
                          color: '#ffff',
                          fontFamily: 'Poppins-SemiBold',
                          marginBottom: hp('1%'),
                        }}>
                        FILTERS
                      </Text>
                      <Separator />
                      <TouchableOpacity
                        onPress={() => {
                          setCoup(!coup);
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginBottom: hp('-1%'),
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#ffff',
                              fontFamily: 'Poppins-SemiBold',
                              marginTop: hp('1%'),
                              marginLeft: wp('3%'),
                              marginRight: wp('1%'),
                            }}>
                            BRAND
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View
                        style={{
                          marginLeft: wp('2%'),
                          marginRight: wp('2%'),
                          marginTop: hp('1.5%'),
                        }}>
                        <FlatList
                          data={brand}
                          renderItem={({item, index}) => {
                            return (
                              <>
                                <View
                                  style={[
                                    {
                                      width: wp('95%'),
                                      alignSelf: 'center',
                                      borderRadius: wp('3%'),
                                      marginTop: hp('1%'),
                                      borderColor: '#00afb5',
                                    },
                                  ]}>
                                  <CheckBox
                                    style={{
                                      flex: 1,
                                      padding: 5,
                                      marginLeft: wp('3%'),
                                    }}
                                    checkedImage={
                                      <Image
                                        source={require('../Images/check.png')}
                                        style={{
                                          height: hp('2.55%'),
                                          width: wp('5.2%'),
                                        }}
                                      />
                                    }
                                    unCheckedImage={
                                      <Image
                                        source={require('../Images/z-removebg-preview.png')}
                                        style={{
                                          height: hp('2.55%'),
                                          width: wp('5.2%'),
                                        }}
                                      />
                                    }
                                    onClick={() => {
                                      if (item.ischeck == true) {
                                        let newMarkers = [...brand];
                                        newMarkers[index].ischeck = false;
                                        setBrand(newMarkers);
                                      } else {
                                        let newMarkers = [...brand];
                                        newMarkers[index].ischeck = true;
                                        setBrand(newMarkers);
                                      }
                                    }}
                                    isChecked={item.ischeck}
                                    rightText={item.name}
                                    rightTextStyle={{
                                      color: '#ffff',
                                      fontFamily: 'Poppins-Light',
                                      marginTop: hp('-0.3%'),
                                      fontSize: 13,
                                      marginLeft: wp('5%'),
                                      marginRight: wp('2%'),
                                    }}
                                    checkBoxColor={'white'}
                                  />
                                </View>
                              </>
                            );
                          }}
                        />
                      </View>
                      <Separator />
                      <TouchableOpacity
                        onPress={() => {
                          setCoup(!coup);
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginBottom: hp('-1%'),
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#ffff',
                              fontFamily: 'Poppins-SemiBold',
                              marginTop: hp('1%'),
                              marginLeft: wp('3%'),
                              marginRight: wp('1%'),
                            }}>
                            SIZE
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View
                        style={{
                          marginLeft: wp('2%'),
                          marginRight: wp('2%'),
                          marginTop: hp('1.5%'),
                        }}>
                        <FlatList
                          data={size}
                          renderItem={({item, index}) => {
                            return (
                              <>
                                <View
                                  style={[
                                    {
                                      width: wp('95%'),
                                      alignSelf: 'center',
                                      borderRadius: wp('3%'),
                                      marginTop: hp('1%'),
                                      borderColor: '#00afb5',
                                    },
                                  ]}>
                                  <CheckBox
                                    style={{
                                      flex: 1,
                                      padding: 5,
                                      marginLeft: wp('3%'),
                                    }}
                                    checkedImage={
                                      <Image
                                        source={require('../Images/check.png')}
                                        style={{
                                          height: hp('2.55%'),
                                          width: wp('5.2%'),
                                        }}
                                      />
                                    }
                                    unCheckedImage={
                                      <Image
                                        source={require('../Images/z-removebg-preview.png')}
                                        style={{
                                          height: hp('2.55%'),
                                          width: wp('5.2%'),
                                        }}
                                      />
                                    }
                                    onClick={() => {
                                      if (item.ischeck == true) {
                                        let newMarkers = [...size];
                                        newMarkers[index].ischeck = false;
                                        setSize(newMarkers);
                                      } else {
                                        let newMarkers = [...size];
                                        newMarkers[index].ischeck = true;
                                        setSize(newMarkers);
                                      }
                                    }}
                                    isChecked={item.ischeck}
                                    rightText={item.name}
                                    rightTextStyle={{
                                      color: '#ffff',
                                      fontFamily: 'Poppins-Light',
                                      marginTop: hp('-0.3%'),
                                      fontSize: 13,
                                      marginLeft: wp('5%'),
                                      marginRight: wp('2%'),
                                    }}
                                    checkBoxColor={'white'}
                                  />
                                </View>
                              </>
                            );
                          }}
                        />
                      </View>
                      <Separator />
                      <TouchableOpacity
                        onPress={() => {
                          setCoup(!coup);
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginBottom: hp('-1%'),
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#ffff',
                              fontFamily: 'Poppins-SemiBold',
                              marginTop: hp('1%'),
                              marginLeft: wp('3%'),
                              marginRight: wp('1%'),
                            }}>
                            COLOUR
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View
                        style={{
                          marginLeft: wp('2%'),
                          marginRight: wp('2%'),
                          marginTop: hp('1.5%'),
                        }}>
                        <FlatList
                          data={color}
                          renderItem={({item, index}) => {
                            return (
                              <>
                                <View
                                  style={[
                                    {
                                      width: wp('95%'),
                                      alignSelf: 'center',
                                      borderRadius: wp('3%'),
                                      marginTop: hp('1%'),
                                      borderColor: '#00afb5',
                                    },
                                  ]}>
                                  <CheckBox
                                    style={{
                                      flex: 1,
                                      padding: 5,
                                      marginLeft: wp('3%'),
                                    }}
                                    checkedImage={
                                      <Image
                                        source={require('../Images/check.png')}
                                        style={{
                                          height: hp('2.55%'),
                                          width: wp('5.2%'),
                                        }}
                                      />
                                    }
                                    unCheckedImage={
                                      <Image
                                        source={require('../Images/z-removebg-preview.png')}
                                        style={{
                                          height: hp('2.55%'),
                                          width: wp('5.2%'),
                                        }}
                                      />
                                    }
                                    onClick={() => {
                                      if (item.ischeck == true) {
                                        let newMarkers = [...color];
                                        newMarkers[index].ischeck = false;
                                        setColor(newMarkers);
                                      } else {
                                        let newMarkers = [...color];
                                        newMarkers[index].ischeck = true;
                                        setColor(newMarkers);
                                      }
                                    }}
                                    isChecked={item.ischeck}
                                    rightText={item.name}
                                    rightTextStyle={{
                                      color: '#ffff',
                                      fontFamily: 'Poppins-Light',
                                      marginTop: hp('-0.3%'),
                                      fontSize: 13,
                                      marginLeft: wp('5%'),
                                      marginRight: wp('2%'),
                                    }}
                                    checkBoxColor={'white'}
                                  />
                                </View>
                              </>
                            );
                          }}
                        />
                      </View>
                      <Separator />
                      <TouchableOpacity
                        onPress={() => {
                          setCoup(!coup);
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginBottom: hp('-1%'),
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#ffff',
                              fontFamily: 'Poppins-SemiBold',
                              marginTop: hp('1%'),
                              marginLeft: wp('3%'),
                              marginRight: wp('1%'),
                            }}>
                            PATTERN
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View
                        style={{
                          marginLeft: wp('2%'),
                          marginRight: wp('2%'),
                          marginTop: hp('1.5%'),
                        }}>
                        <FlatList
                          data={pattern}
                          renderItem={({item, index}) => {
                            return (
                              <>
                                <View
                                  style={[
                                    {
                                      width: wp('95%'),
                                      alignSelf: 'center',
                                      borderRadius: wp('3%'),
                                      marginTop: hp('1%'),
                                      borderColor: '#00afb5',
                                    },
                                  ]}>
                                  <CheckBox
                                    style={{
                                      flex: 1,
                                      padding: 5,
                                      marginLeft: wp('3%'),
                                    }}
                                    checkedImage={
                                      <Image
                                        source={require('../Images/check.png')}
                                        style={{
                                          height: hp('2.55%'),
                                          width: wp('5.2%'),
                                        }}
                                      />
                                    }
                                    unCheckedImage={
                                      <Image
                                        source={require('../Images/z-removebg-preview.png')}
                                        style={{
                                          height: hp('2.55%'),
                                          width: wp('5.2%'),
                                        }}
                                      />
                                    }
                                    onClick={() => {
                                      if (item.ischeck == true) {
                                        let newMarkers = [...pattern];
                                        newMarkers[index].ischeck = false;
                                        setPattern(newMarkers);
                                      } else {
                                        let newMarkers = [...pattern];
                                        newMarkers[index].ischeck = true;
                                        setPattern(newMarkers);
                                      }
                                    }}
                                    isChecked={item.ischeck}
                                    rightText={item.name}
                                    rightTextStyle={{
                                      color: '#ffff',
                                      fontFamily: 'Poppins-Light',
                                      marginTop: hp('-0.3%'),
                                      fontSize: 13,
                                      marginLeft: wp('5%'),
                                      marginRight: wp('2%'),
                                    }}
                                    checkBoxColor={'white'}
                                  />
                                </View>
                              </>
                            );
                          }}
                        />
                      </View>
                      <Separator />

                      <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => {
                          RBSheetRef.current.close();
                        }}>
                        <LinearGradient
                          colors={['#00afb5', '#348db3']}
                          style={{
                            marginTop: hp('5%'),
                            paddingTop: hp('0.7%'),
                            paddingBottom: hp('0.7%'),
                            backgroundColor: '#00afb5',
                            borderRadius: wp('3%'),
                            marginLeft: wp('13%'),
                            marginRight: wp('13%'),
                            borderColor: 'white',
                            marginBottom: hp('5%'),
                            borderWidth: 1,
                          }}>
                          <Text
                            style={{
                              textAlign: 'center',
                              color: '#ffff',
                              fontFamily: 'Poppins-SemiBold',
                              fontSize: 16,
                            }}>
                            {' '}
                            APPLY FILTER{' '}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </RBSheet>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Separator = () => <View style={styles.separator} />;
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 0.5,
    marginTop: hp('1%'),
    width: wp('100%'),
    alignSelf: 'center',
  },
});

export default Home;
