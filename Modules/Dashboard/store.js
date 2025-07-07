import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  Alert,
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

const Store = ({navigation}) => {
  const {showLoading, hideLoading, isLoading} = useLoading();
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
  const calculateTimeDifference = (start, end) => {
    try {
      const startTime = new Date(`1970-01-01T${start}Z`);
      const endTime = new Date(`1970-01-01T${end}Z`);

      const diffMs = endTime - startTime;
      const diffMinutes = Math.floor(diffMs / 60000);

      if (diffMinutes < 60) {
        return `${diffMinutes} mins`;
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return minutes === 0
          ? `${hours} hours`
          : `${hours} hours ${minutes} mins`;
      }
    } catch (error) {
      handleError(error, 'Time calculation');
      return '0 mins';
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    try {
      const R = 6371; // Radius of Earth in kilometers
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance;
    } catch (error) {
      handleError(error, 'Distance calculation');
      return 0;
    }
  };

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

  // Get user location
  const getUserLocation = async () => {
    try {
      // Mock user location for now - you can replace this with actual location service
      const mockUserLocation = {
        latitude: 28.7041,
        longitude: 77.1025,
      };

      setState(prevState => ({
        ...prevState,
        userLocation: mockUserLocation,
      }));

      return mockUserLocation;
    } catch (error) {
      handleError(error, 'Getting user location');
      return {
        latitude: 28.7041,
        longitude: 77.1025,
      };
    }
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      showLoading('fetching_data', 'Fetching store list.');
      setState(prevState => ({...prevState, isLoading: true, error: null}));

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');

      // Get user location first
      const userLocation = await getUserLocation();

      // Fetch address data
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

      const stateResponse = await axios.get(
        URL_key + 'api/AddressApi/gStateDDL',
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      const stateData = stateResponse.data.filter(
        data => data.StateID === addressResponse.data[0]?.StateID,
      );

      // Fetch store list
      const storeResponse = await axios.get(
        URL_key + 'api/ProductApi/gStoreList',
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      console.log('storeList', storeResponse.data);

      const calculateTimeDifference = (start, end) => {
        const startTime = new Date(`1970-01-01T${start}Z`);
        const endTime = new Date(`1970-01-01T${end}Z`);

        const diffMinutes = (endTime - startTime) / 60000;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        return minutes === 0
          ? `${hours} hours`
          : `${hours} hours ${minutes} mins`;
      };

      // Transform stores data with delivery time calculation
      const transformedStores = storeResponse.data.map(store => {
        let deliveryTime = '30 mins'; // Default delivery time
        let distance = 0;

        if (userLocation && store.Latitude && store.Longitude) {
          // Calculate distance between user and store
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            parseFloat(store.Latitude),
            parseFloat(store.Longitude),
          );

          // Estimate delivery time based on distance
          deliveryTime = estimateDeliveryTime(distance);

          // Debug log for testing
          console.log(
            `Store: ${store.StoreName}, Distance: ${distance.toFixed(
              1,
            )}km, Delivery Time: ${deliveryTime}`,
          );
        }

        return {
          StoreID: store.StoreID,
          StoreName: store.StoreName,
          StoreLocation: store.StoreLocation,
          Timing: calculateTimeDifference(store.StartTiming, store.EndTiming),
          DeliveryCharges: store.DeliveryCharges,
          IsDeliveryCharges: store.IsDeliveryCharges,
          StoreImage: store.StoreImage,
          IsStoreClosed: store.IsStoreClosed,
          Latitude: store.Latitude,
          Longitude: store.Longitude,
          DeliveryTime: deliveryTime,
          Distance: distance.toFixed(1), // Distance in km
        };
      });
      hideLoading('fetching_data');

      setState(prevState => ({
        ...prevState,
        StreetName: addressResponse.data[0]?.StreetName || '',
        Pincode: addressResponse.data[0]?.AddressCategory || '',
        Storelist: transformedStores,
        Storelist1: transformedStores,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      handleError(error, 'Fetching data');
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
      Alert.alert('Error', state.error, [
        {
          text: 'OK',
          onPress: () => setState(prevState => ({...prevState, error: null})),
        },
      ]);
    }
  }, [state.error]);

  return (
    <SafeAreaView>
      {/* NavigationEvents removed - using useFocusEffect instead */}
      <ScrollView>
        <Text
          style={{
            color: '#333',
            fontSize: 11,
            fontFamily: 'Poppins-Medium',
            marginTop: hp('5%'),
            marginLeft: wp('17%'),
          }}>
          Delivering to {'>'}
        </Text>
        <Text
          style={{
            color: '#00afb5',
            fontSize: 12,
            fontFamily: 'Poppins-Medium',
            marginLeft: wp('17%'),
          }}>
          {state.Pincode}
        </Text>
        <Text
          style={{
            color: '#333',
            fontSize: 10,
            fontFamily: 'Poppins-Light',
            marginLeft: wp('17%'),
          }}>
          {state.StreetName}
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
        <Icon
          onPress={() => {
            navigation.push('Tab');
          }}
          name="chevron-back"
          color={'#00afb5'}
          size={40}
          style={{
            marginLeft: wp('1%'),
            padding: hp('1%'),
            marginTop: hp('-10%'),
            marginBottom: hp('4%'),
          }}
        />

        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <View
            style={{
              borderWidth: 1,
              borderRadius: wp('1%'),
              height: hp('5%'),
              borderColor: '#00afb5',
              marginTop: hp('1%'),
              backgroundColor: '#ffff',
              width: wp('85%'),
              alignSelf: 'center',
              flexDirection: 'row',
              marginBottom: hp('1%'),
              alignItems: 'center',
              textAlignVertical: 'top',
              marginLeft: wp('2%'),
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
                padding: hp('1%'),
                width: wp('70%'),
                marginLeft: wp('3%'),
              }}
            />
            <Icon
              style={{}}
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
                              color: '#02b008',
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
