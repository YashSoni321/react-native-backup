import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  ActivityIndicator,
  BackHandler,
  FlatList,
  ImageBackground,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {Switch} from 'react-native-switch';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import ToggleSwitch from 'toggle-switch-react-native';
import {Dialog} from 'react-native-simple-dialogs';
import {CustomPicker} from 'react-native-custom-picker';
import {API_KEY, URL_key} from '../Api/api';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
var RNFS = require('react-native-fs');
import {
  notifications,
  messages,
  NotificationMessage,
  Android,
} from 'react-native-firebase-push-notifications';
import Normalize from '../Size/size';
import NoResults from './NoResults';
import ErrorMessage from '../../shared/ErrorMessage';
import {useLoading} from '../../shared/LoadingContext';
import {getUserLocation} from '../Common/locationHelper';
import CustomModal from '../../shared/CustomModal';
import HeaderWithAddress from '../Common/HeaderWithCommon';

const Store = ({navigation}) => {
  const {showLoading, hideLoading, isLoading} = useLoading();
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onPrimaryPress: null,
  });

  const showModal = (title, message, type = 'info', onPrimaryPress = null) => {
    setModalConfig({
      visible: true,
      title,
      message,
      type,
      onPrimaryPress,
    });
  };

  const hideModal = () => {
    setModalConfig(prev => ({...prev, visible: false}));
  };

  const [state, setState] = useState({
    categories1: [
      {
        name: 'Men',
        Icon: 'man',
        nav: 'protab',
      },
      {
        name: 'Women',
        Icon: 'woman',
        nav: 'protab',
      },
      {name: 'Shoes', Icon: 'file-tray-sharp', nav: 'payments'},
      {
        name: 'Dresses',
        Icon: 'shirt',
        nav: 'Receivables',
      },
      {
        name: 'Wallets',
        Icon: 'wallet',
        nav: 'Receivables',
      },
      {
        name: 'Accessories',
        Icon: 'color-filter',
        nav: 'Receivables',
      },
    ],
    Storelist: null,
    Storelist1: null,
    StreetName: '',
    Pincode: '',
    search: '',
    selectedIndex: 0,
    isLoading: false,
    error: null,
    userLocation: null,
  });

  // Error handling function
  const handleError = (error, context = 'Unknown operation') => {
    console.error(`Error in ${context}:`, error);
    setState(prevState => ({
      ...prevState,
      error: `${context} failed. Please try again.`,
      isLoading: false,
    }));
  };

  // Search filter function
  const SearchFilterFunction = text => {
    try {
      setState(prevState => ({...prevState, search: text}));

      if (text) {
        const newData = state.Storelist?.filter(function (data) {
          const textData = text.toUpperCase();
          return (
            (data.StoreName &&
              data.StoreName.toUpperCase().indexOf(textData) >= 0) ||
            (data.StoreLocation &&
              data.StoreLocation.toUpperCase().indexOf(textData) >= 0)
          );
        });

        console.log('Search results:', newData);
        setState(prevState => ({
          ...prevState,
          Storelist1: newData || [],
          selectedIndex: 0,
        }));
      } else {
        setState(prevState => ({
          ...prevState,
          Storelist1: state.Storelist,
          selectedIndex: 0,
        }));
      }
    } catch (error) {
      handleError(error, 'Search operation');
    }
  };

  // Clear search function
  const clearSearch = () => {
    try {
      setState(prevState => ({
        ...prevState,
        search: '',
        Storelist1: state.Storelist,
        selectedIndex: 0,
      }));
    } catch (error) {
      handleError(error, 'Clear search');
    }
  };

  // Calculate time difference function

  // Calculate distance between two coordinates using Haversine formula

  // Estimate delivery time based on distance
  const estimateDeliveryTime = distanceKm => {
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
      handleError(error, 'Delivery time estimation');
      return '30 mins';
    }
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      showLoading('fetching_data', 'Fetching store list.');
      setState(prev => ({...prev, isLoading: true, error: null}));

      // Get UserProfileID
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      if (!UserProfileID) {
        throw new Error('User not logged in. Please login to continue.');
      }
      console.log('UserProfileID ----> ', UserProfileID);

      // Get user location with timeout
      const userLocation = await Promise.race([
        getUserLocation(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Location fetch timeout')), 10000),
        ),
      ]).catch(error => {
        console.warn('Location fetch error:', error);
        // Return default location if unable to get user location
        return {
          latitude: 17.385044,
          longitude: 78.486671,
        };
      });

      // Fetch all required data in parallel with proper error handling
      const [addressRes, storeRes] = await Promise.all([
        axios
          .get(
            `${URL_key}api/AddressApi/gCustomerAddress?UserProfileID=${UserProfileID}`,
            {
              headers: {
                'content-type': 'application/json',
              },
              timeout: 15000, // 15 second timeout
            },
          )
          .catch(error => {
            console.error('Address API error:', error);
            return {data: []}; // Return empty data on error
          }),

        axios
          .get(`${URL_key}api/ProductApi/gStoreList`, {
            headers: {
              'content-type': 'application/json',
            },
            timeout: 15000, // 15 second timeout
          })
          .catch(error => {
            console.error('Store list API error:', error);
            throw new Error('Failed to fetch store list. Please try again.');
          }),
      ]);

      // Validate store response
      if (!storeRes || !storeRes.data) {
        throw new Error('Invalid store data received from server');
      }

      const stores = storeRes.data || [];

      console.log('storeRes info ----> ', storeRes);

      // Transform and validate store data
      const transformedStores = stores
        .map((store, index) => {
          try {
            // Destructure with default values to prevent undefined errors
            const {
              Latitude = '0',
              Longitude = '0',
              StoreName = '',
              StoreID = '',
              StoreLocation = '',
              StartTiming = '00:00:00',
              EndTiming = '23:59:59',
              DeliveryCharges = 0,
              IsDeliveryCharges = false,
              StoreImage = '',
              IsStoreClosed = false,
            } = store;

            // Validate required fields
            if (!StoreID || !StoreName) {
              console.warn(`Invalid store data at index ${index}:`, store);
              return null;
            }

            // Parse coordinates with validation
            const storeLat = parseFloat(Latitude);
            const storeLon = parseFloat(Longitude);
            const isValidLocation =
              !isNaN(storeLat) &&
              !isNaN(storeLon) &&
              storeLat >= -90 &&
              storeLat <= 90 &&
              storeLon >= -180 &&
              storeLon <= 180;

            // Calculate distance and delivery time
            let distance = 0;
            let deliveryTime = '30 mins';

            if (isValidLocation && userLocation) {
              try {
                distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  storeLat,
                  storeLon,
                );
                deliveryTime = estimateDeliveryTime(distance);
              } catch (error) {
                console.warn(
                  'Distance calculation error for store:',
                  StoreID,
                  error,
                );
              }
            }

            // Validate timing format
            const timing = (() => {
              try {
                return calculateTimeDiff(StartTiming, EndTiming);
              } catch (error) {
                console.warn(
                  'Time calculation error for store:',
                  StoreID,
                  error,
                );
                return 'Store hours not available';
              }
            })();

            return {
              StoreID,
              StoreName: StoreName.trim(),
              StoreLocation: StoreLocation.trim(),
              Timing: timing,
              DeliveryCharges: parseFloat(DeliveryCharges) || 0,
              IsDeliveryCharges,
              StoreImage: StoreImage?.trim() || '',
              IsStoreClosed,
              Latitude: isValidLocation ? storeLat : null,
              Longitude: isValidLocation ? storeLon : null,
              DeliveryTime: deliveryTime,
              Distance: distance.toFixed(1),
              HasValidLocation: isValidLocation,
            };
          } catch (err) {
            console.error(
              `Unexpected error processing store at index ${index}:`,
              err,
            );
            return null;
          }
        })
        .filter(store => store !== null);

      // Filter out null values and sort by distance
      const validStores = transformedStores
        .filter(store => store !== null)
        .sort((a, b) => parseFloat(a.Distance) - parseFloat(b.Distance));

      if (validStores.length === 0) {
        console.warn('No valid stores found after transformation');
      }

      // Process address data
      const address = addressRes.data?.[0] || {};

      // Log the final data for debugging
      console.log('Final processed data:', {
        storeCount: validStores.length,
        hasAddress: !!address,
        userLocation: userLocation,
      });

      // Update state with processed data
      setState(prev => ({
        ...prev,
        StreetName: address.StreetName?.trim() || '',
        Pincode: address.AddressCategory?.trim() || '',
        Storelist: validStores,
        Storelist1: validStores,
        userLocation: userLocation,
        isLoading: false,
        error:
          validStores.length === 0
            ? 'No stores available at the moment.'
            : null,
        lastUpdated: new Date().toISOString(),
      }));

      hideLoading('fetching_data');
    } catch (error) {
      console.error('Store fetch error:', error);

      hideLoading('fetching_data');

      // Provide user-friendly error message
      const errorMessage = (() => {
        if (error.message.includes('Network Error')) {
          return 'Unable to connect to server. Please check your internet connection.';
        }
        if (error.message.includes('timeout')) {
          return 'Request timed out. Please try again.';
        }
        if (error.message.includes('User not logged in')) {
          return 'Please login to view stores.';
        }
        return 'Unable to load stores. Please try again.';
      })();

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        Storelist: [],
        Storelist1: [],
      }));

      // Show error modal to user
      showModal('Error', errorMessage, 'error', () => {
        // Retry loading if it was a network error
        if (error.message.includes('Network Error')) {
          fetchData();
        }
      });
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
      handleError(e, 'Distance calc error');
      return 0;
    }
  };

  const calculateTimeDiff = (start, end) => {
    try {
      const s = new Date(`1970-01-01T${start}Z`);
      const e = new Date(`1970-01-01T${end}Z`);
      const diff = Math.max((e - s) / 60000, 0);
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      return mins === 0 ? `${hrs} hrs` : `${hrs} hrs ${mins} mins`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Handle store navigation
  const handleStorePress = item => {
    try {
      if (item.IsStoreClosed === false) {
        navigation.push('StoreProducts', {
          data: {
            StoreID: item.StoreID,
            StoreName: item.StoreName,
            StoreLocation: item.StoreLocation,
            StoreImage: item.StoreImage,
            Timing: item.Timing,
            DeliveryCharges: item.DeliveryCharges,
            DeliveryTime: item.DeliveryTime,
            Distance: item.Distance,
            Latitude: item.Latitude,
            Longitude: item.Longitude,
          },
        });
      }
    } catch (error) {
      handleError(error, 'Store navigation');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Error alert
  useEffect(() => {
    if (state.error) {
      showModal('Error', state.error, 'error', () => {
        setState(prevState => ({...prevState, error: null}));
        hideModal();
      });
    }
  }, [state.error]);

  return (
    <SafeAreaView>
      {/* NavigationEvents removed - using useFocusEffect instead */}
      <ScrollView style={{backgroundColor: 'white', height: '100%'}}>
        <HeaderWithAddress navigation={navigation} showBackButton={true} />

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
              placeholder="Search for stores"
              fontFamily={'Poppins-Medium'}
              placeholderTextColor={'#00afb5'}
              color={'black'}
              fontSize={11}
              value={state.search}
              onChangeText={SearchFilterFunction}
              style={{
                width: wp('65%'),
              }}
            />
            <Icon
              style={{marginLeft: wp('1%'), padding: hp('1%')}}
              onPress={() => {}}
              name="search"
              color={'grey'}
              size={20}
            />
          </View>
        </View>

        <Text
          style={{
            fontSize: 13,
            color: '#333',
            fontFamily: 'Poppins-SemiBold',
            marginTop: hp('2%'),
            marginBottom: hp('-0.5%'),
            marginLeft: wp('9%'),
            marginRight: wp('1%'),
          }}>
          All Stores
        </Text>

        <View
          style={{
            marginLeft: wp('2%'),
            marginRight: wp('2%'),
            marginBottom: hp('2%'),
          }}>
          {state.isLoading ? (
            <View style={{marginTop: hp('10%'), alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#00afb5" />
              <Text style={{marginTop: hp('2%'), fontFamily: 'Poppins-Light'}}>
                Loading stores...
              </Text>
            </View>
          ) : state.search && state.Storelist1?.length === 0 ? (
            <NoResults searchTerm={state.search} onClearSearch={clearSearch} />
          ) : (
            <FlatList
              data={state.Storelist1}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => handleStorePress(item)}>
                    <View
                      style={[
                        {
                          width: wp('93%'),
                          alignSelf: 'center',
                          borderRadius: wp('3%'),
                          marginLeft: wp('1%'),
                          marginRight: wp('1%'),
                          marginTop: hp('2%'),
                          borderColor: '#00afb5',
                        },
                      ]}>
                      <View style={{flexDirection: 'row'}}>
                        <View>
                          {item.StoreImage == null ||
                          item.StoreImage == undefined ||
                          item.StoreImage == '' ? (
                            <Image
                              style={{
                                width: wp('25%'),
                                height: hp('10%'),
                                marginTop: hp('1%'),
                                marginLeft: wp('6%'),
                                marginRight: wp('4%'),
                                marginBottom: hp('1%'),
                                opacity: item.IsStoreClosed == true ? 0.2 : 1,
                              }}
                              source={require('../Images/Zudio.jpg')}
                            />
                          ) : (
                            <Image
                              style={{
                                width: wp('25%'),
                                height: hp('10%'),
                                marginTop: hp('1%'),
                                marginLeft: wp('6%'),
                                marginRight: wp('4%'),
                                marginBottom: hp('1%'),
                                opacity: item.IsStoreClosed == true ? 0.2 : 1,
                              }}
                              source={{uri: item.StoreImage}}
                            />
                          )}
                        </View>

                        <View>
                          <Text
                            style={{
                              fontSize: 12,
                              fontFamily: 'Poppins-Medium',
                              alignContent: 'center',
                              textAlign: 'left',
                              justifyContent: 'center',
                              color: '#333',
                              marginTop: hp('0.5%'),
                              marginLeft: wp('1%'),
                              marginRight: wp('2%'),
                              width: wp('55%'),
                              opacity: item.IsStoreClosed == true ? 0.3 : 1,
                            }}>
                            {item.StoreName}
                          </Text>
                          <Text
                            style={{
                              fontSize: 9,
                              fontFamily: 'Poppins-Light',
                              alignContent: 'center',
                              textAlign: 'left',
                              justifyContent: 'center',
                              color: 'gray',
                              marginLeft: wp('1%'),
                              marginRight: wp('2%'),
                              width: wp('55%'),
                              opacity: item.IsStoreClosed == true ? 0.7 : 1,
                            }}>
                            {item.StoreLocation}
                          </Text>

                          {/* <Text
                            style={{
                              fontSize: 9,
                              fontFamily: 'Poppins-Medium',
                              alignContent: 'center',
                              textAlign: 'left',
                              justifyContent: 'center',
                              color: '#00afb5',
                              marginTop: hp('1%'),
                              marginLeft: wp('1%'),
                              marginRight: wp('2%'),
                              width: wp('74%'),
                              opacity: item.IsStoreClosed == true ? 0.3 : 1,
                            }}>
                            {/* ⏰ {item.Timing || 'Store Hours'} • ₹
                            {item.DeliveryCharges || '0'} 
                          </Text> */}

                          <Text
                            style={{
                              fontSize: 8,
                              fontFamily: 'Poppins-Light',
                              alignContent: 'center',
                              textAlign: 'left',
                              justifyContent: 'center',
                              color: '#232423',
                              fontWeight: 'bold',
                              marginTop: hp('0.5%'),
                              marginLeft: wp('1%'),
                              marginRight: wp('2%'),
                              width: wp('74%'),
                              opacity: item.IsStoreClosed == true ? 0.3 : 1,
                            }}>
                            🚚 Delivery in {item.DeliveryTime || '30 mins'} •{' '}
                            {item.Distance || '0.0'} km away
                          </Text>
                        </View>
                      </View>
                      {item.IsStoreClosed == true ? (
                        <Text
                          style={{
                            fontSize: 9,
                            fontFamily: 'Poppins-Medium',
                            alignContent: 'center',
                            textAlign: 'center',
                            justifyContent: 'center',
                            color: '#333',
                            marginTop: hp('1%'),
                          }}>
                          Oops! The shop is closed.
                        </Text>
                      ) : (
                        <></>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              numColumns={1}
            />
          )}
        </View>

        <Text
          onPress={() => {
            navigation.push('Tabs');
          }}
          style={{
            fontSize: 9,
            fontFamily: 'Poppins-Light',
            color: '#333',
            marginTop: hp('1%'),
            marginBottom: hp('3%'),
            textAlign: 'center',
            marginRight: wp('5%'),
            marginLeft: wp('5%'),
          }}>
          We're working to bring more stores closer to you. In the meantime,
          happy shopping!
        </Text>
      </ScrollView>

      <CustomModal
        visible={modalConfig.visible}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onPrimaryPress={modalConfig.onPrimaryPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Store;
