import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FormInput,
  Text,
  View,
  Image,
  Alert,
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
} from 'react-native';
import {Dialog} from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
var date = moment().format('YYYY/MM/DD ');
var time = moment().format('hh:mm A');
import {API_KEY, URL_key} from '../Api/api';
import axios from 'axios';
var RNFS = require('react-native-fs');
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';

import CheckBox from 'react-native-check-box';
import Geolocation from '@react-native-community/geolocation';
import {getDistance} from 'geolib';
import {useLoading} from '../../shared/LoadingContext';
import { fetchStoreDetailsLocation, getUserDeliveryTime } from '../Common/CalculateDistance';

const DISTANCE_THRESHOLD = 3000; // 3km in meters
const BATCH_SIZE = 50; // Process stores in batches

const Home = props => {
  const {showLoading, hideLoading} = useLoading();
  const [deliveryTime, setDeliveryTime] = useState("")

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
  const fetchNearbyStores = async (userLocation, searchTerm = '') => {
    try {
      // showLoading('fetchNearbyStores', 'Loading nearby stores...');
      console.log('🚀 Starting fetchNearbyStores...');
      console.log('📍 User Location:', userLocation);

      setIsLoadingStores(true);
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
      // hideLoading('fetchNearbyStores');
      console.log('✅ fetchNearbyStores completed successfully');
    } catch (error) {
      // hideLoading('fetchNearbyStores');
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
    fetchNearbyStores(currentLocation, textData);
    setSelectedIndex(11);
  };

  const SearchFilterFunction = text => {
    setSearch(text);

    // if (!text) {
    //   setSelectedIndex(0);
    //   clearTimeout(timeoutRef.current);
    //   return;
    // }

    const textData = text.toLowerCase();

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      triggerSearch(textData);
    }, 1500); // 1.5 seconds debounce
  };

  // Add state for banner, address, and location
  const [banner, setBanner] = useState(null);
  const [StreetName, setStreetName] = useState('');
  const [Pincode, setPincode] = useState('');
  const [CategoryName, setCategoryName] = useState('');




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
          

          setStreetName(addressResponse.data[0]?.StreetName || '');
          setPincode(addressResponse.data[0]?.AddressCategory || '');
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
            console.log(
              '📍 Location permission granted, getting current position...',
            );

            // Add timeout to prevent hanging
            const locationTimeout = setTimeout(() => {
              console.log(
                '📍 Location request timed out, continuing without location',
              );
              setIsLoadingStores(false);
            }, 10000); // 10 second timeout

            try {
              Geolocation.getCurrentPosition(
                async position => {
                  try {
                    clearTimeout(locationTimeout);
                    const newLocation = {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                    };

                    setCurrentLocation(newLocation);
                    console.log('📍 Current location:', newLocation);

                    // Fetch nearby stores
                    await fetchNearbyStores(newLocation);
                  } catch (locationError) {
                    clearTimeout(locationTimeout);
                    console.error(
                      '📍 Location processing error:',
                      locationError,
                    );
                    setIsLoadingStores(false);
                  }
                },
                error => {
                  clearTimeout(locationTimeout);
                  console.error('📍 Location error:', error);

                  // Provide user-friendly error message
                  let errorMessage = 'Unable to get your location.';
                  switch (error.code) {
                    case error.PERMISSION_DENIED:
                      errorMessage =
                        'Location permission denied. Please enable location access in settings.';
                      break;
                    case error.POSITION_UNAVAILABLE:
                      errorMessage = 'Location information unavailable.';
                      break;
                    case error.TIMEOUT:
                      errorMessage = 'Location request timed out.';
                      break;
                  }

                  Alert.alert('Location Error', errorMessage, [
                    {
                      text: 'OK',
                      onPress: () => setIsLoadingStores(false),
                    },
                  ]);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 15000,
                  maximumAge: 300000, // 5 minutes
                  distanceFilter: 10, // Update if moved 10 meters
                },
              );
            } catch (geolocationError) {
              clearTimeout(locationTimeout);
              console.error(
                '📍 Geolocation.getCurrentPosition error:',
                geolocationError,
              );
              // Continue without location
            }
          } else {
            console.log(
              '⚠️ Location permission not granted, using default location',
            );
            // Use a default location (e.g., city center)
            const defaultLocation = {
              latitude: 28.7041, // Default to Delhi coordinates
              longitude: 77.1025,
            };
            setCurrentLocation(defaultLocation);
            await fetchNearbyStores(defaultLocation);
          }
        } catch (locationPermissionError) {
          console.error(
            '📍 Location permission error:',
            locationPermissionError,
          );
          // Don't block the app for location permission issues
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
  const testSpecificLocation = async () => {
    const testLocation = {
      latitude: 26.907101631221334,
      longitude: 75.78250122402882,
    };

    console.log('🧪 Testing specific location:', testLocation);
    Alert.alert(
      'Testing Location',
      `Testing with your location:\nLat: ${testLocation.latitude}\nLng: ${testLocation.longitude}`,
      [{text: 'OK'}],
    );

    await fetchNearbyStores(testLocation);
  };

  // Refresh location manually
  const refreshLocation = async () => {
    try {
      setIsLoadingStores(true);
      const hasPermission = await requestLocationPermission();

      if (hasPermission) {
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
            Alert.alert(
              'Error',
              'Failed to refresh location. Please try again.',
            );
            setIsLoadingStores(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0, // Force fresh location
          },
        );
      } else {
        Alert.alert(
          'Permission Required',
          'Location permission is required to refresh your location.',
        );
        setIsLoadingStores(false);
      }
    } catch (error) {
      console.error('📍 Refresh location error:', error);
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
            title: 'Location Permission',
            message:
              'This app needs access to your location to show nearby stores.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('📍 Location permission result:', isGranted);
        return isGranted;
      }
      return true; // iOS handles permissions differently
    } catch (error) {
      console.error('📍 Location permission error:', error);
      return false;
    }
  };

  // Replace render method with return statement
  return (
    <SafeAreaView>
      <ScrollView>
        {showcategory ? (
          <>
            <Text
              style={{
                color: '#00afb5',
                fontSize: 14,
                fontFamily: 'Poppins-Bold',
                textAlign: 'center',
                marginTop: hp('5%'),
              }}>
              {CategoryName}
            </Text>
            <Icon
              onPress={() => setShowcategory(false)}
              name="chevron-back"
              color={'#00afb5'}
              size={40}
              style={{
                marginLeft: wp('4%'),
                padding: hp('1%'),
                marginTop: hp('-5.3%'),
                marginBottom: hp('2%'),
              }}
            />
            <FlatList
              data={subcategory}
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
                    fontSize: 14,
                    fontFamily: 'Poppins-Bold',
                    textAlign: 'center',
                    marginTop: hp('5%'),
                  }}>
                  {this.state.SubCategoryName}
                </Text>
                <Icon
                  onPress={() => {
                    this.setState({
                      showsubcategory: false,
                      showcategory: true,
                    });
                  }}
                  name="chevron-back"
                  color={'#00afb5'}
                  size={40}
                  style={{
                    marginLeft: wp('4%'),
                    padding: hp('1%'),
                    marginTop: hp('-5.3%'),
                    marginBottom: hp('2%'),
                  }}
                />
                <FlatList
                  data={this.state.childsubcategory}
                  renderItem={({item, index}) => {
                    return (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            props.navigation.push('CategoryProduct', {
                              data: {
                                CategoryID: this.state.CategoryID,
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
                <ImageBackground
                  style={{width: wp('100%')}}
                  activeOpacity={0.5}
                  source={require('../Images/output-onlinepngtools1.png')}
                  resizeMode="cover">
                  <Text
                    style={{
                      color: '#333',
                      fontSize: 11,
                      fontFamily: 'Poppins-Medium',
                      marginTop: hp('5%'),
                      marginLeft: wp('10%'),
                    }}>
                    Delivering to
                  </Text>
                  <Text
                    style={{
                      color: '#00afb5',
                      fontSize: 12,
                      fontFamily: 'Poppins-SemiBold',
                      marginLeft: wp('10.5%'),
                    }}>
                    {Pincode}
                  </Text>
                  <Text
                    style={{
                      color: '#333',
                      fontSize: 10,
                      fontFamily: 'Poppins-Light',
                      marginLeft: wp('10%'),
                      width: wp('52%'),
                    }}>
                    {StreetName}
                  </Text>

                  <Text
                    style={{
                      fontSize: 40,
                      textAlign: 'right',
                      color: '#00afb5',
                      fontFamily: 'RedHatDisplay-SemiBold',
                      marginTop: hp('-8%'),
                      marginBottom: hp('1.5%'),
                      marginRight: wp('7%'),
                    }}>
                    fybr
                  </Text>

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
                </ImageBackground>

                {banner == 'false' ? (
                  <></>
                ) : (
                  <>
                    . 0
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
                          marginTop: hp('2%'),
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
                    fontSize: 12,
                    color: '#333',
                    fontFamily: 'Poppins-SemiBold',
                    marginTop: hp('2%'),
                    marginBottom: hp('-1%'),
                    marginLeft: wp('10%'),
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
                              // setCategoryID(item.CategoryID);
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
                                <Icon
                                  name={'man'}
                                  color="#ffff"
                                  size={25}
                                  style={{
                                    marginTop: hp('1.3%'),
                                    marginBottom: hp('1.3%'),
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
                    fontFamily: 'Poppins-SemiBold',
                    marginBottom: hp('-0.5%'),
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
                          No Stores/Products found within 3km of your location
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
                      Alert.alert(
                        'Navigation Error',
                        'Unable to navigate. Please try again.',
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
