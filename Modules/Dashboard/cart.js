import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
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

import {CustomSpinner} from '../../shared/CustomSpinner';
import EmptyCart from './EmptyCart';
import {useLoading} from '../../shared/LoadingContext';
import CartValidation from '../../shared/CartValidation';
import CenteredView from '../Common/CenteredView';
import Geolocation from '@react-native-community/geolocation';

const Cart = ({navigation}) => {
  const {showLoading, hideLoading} = useLoading();
  const [state, setState] = useState({
    categories1: [
      {
        name: 'Wallets',
        Icon: 'wallet',
        nav: 'Receivables',
      },
      {
        name: 'Grocery',
        Icon: 'color-filter',
        nav: 'Receivables',
      },
    ],
    categories: [
      {
        name: 'Grocery',
        Icon: 'color-filter',
        nav: 'Receivables',
      },
    ],
    currentPosition: 0,
    num: 1,
    amt: 1299,
    aamt: 1299,
    coup: false,
    ischeck: false,
    disc: 0,
    fail: false,
    StreetName: '',
    Pincode: '',
    Nearbystores: null,
    Nearbystores1: null,
    TotalUnitPrice: 0,
    TotalDiscountPrice: 0,
    ProductID: null,
    ProductItemID: null,
    StoreID: null,
    UnitPrice: null,
    isLoading: false,
    error: null,
    deliveryCharges: {
      BaseDeliveryFee: 42.0,
      AdditionDistanceFee: 10.0,
      ConvenienceFee: 7.8,
      PackagingFee: 4.0,
      RainyWeatherBaseFee: 48.0,
      AdditionalDistanceKM: 3.0,
    },
    userLocation: null,
    storeLocations: {},
    totalDeliveryFee: 0,
    isRaining: false,
  });

  const handleError = (error, context = 'Unknown operation') => {
    hideLoading();
    console.error(`Error in ${context}:`, error);
    setState(prevState => ({
      ...prevState,
      error: `${context} failed. Please try again.`,
      isLoading: false,
    }));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
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
  };

  const fetchDeliveryCharges = async () => {
    try {
      const response = await axios.get(
        'https://fybrappapi.benchstep.com/api/ProductApi/gFybrCharges',
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      );
      console.log('response.data', response.data);

      if (response.data && response.data.length > 0) {
        setState(prevState => ({
          ...prevState,
          deliveryCharges: response.data[0],
        }));
      }
    } catch (error) {
      console.error('Error fetching delivery charges:', error);
    }
  };

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
              'This app needs access to your location to calculate delivery fees.',
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

  const getUserLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();

      if (hasPermission) {
        return new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(
            position => {
              const currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };

              setState(prevState => ({
                ...prevState,
                userLocation: currentLocation,
              }));

              console.log('📍 Current location:', currentLocation);
              resolve(currentLocation);
            },
            error => {
              console.error('📍 Location error:', error);
              Alert.alert(
                'Error',
                'Failed to get your location. Using default location instead.',
              );

              // Fallback to default location
              const defaultLocation = {
                latitude: 28.7041,
                longitude: 79.0011,
              };

              setState(prevState => ({
                ...prevState,
                userLocation: defaultLocation,
              }));

              resolve(defaultLocation);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0, // Force fresh location
            },
          );
        });
      } else {
        Alert.alert(
          'Permission Required',
          'Location permission is required to calculate delivery fees accurately.',
        );

        // Fallback to default location
        const defaultLocation = {
          latitude: 28.7041,
          longitude: 79.0011,
        };

        setState(prevState => ({
          ...prevState,
          userLocation: defaultLocation,
        }));

        return defaultLocation;
      }
    } catch (error) {
      console.error('Error getting user location:', error);

      // Fallback to default location
      const defaultLocation = {
        latitude: 28.7041,
        longitude: 79.0011,
      };

      setState(prevState => ({
        ...prevState,
        userLocation: defaultLocation,
      }));

      return defaultLocation;
    }
  };

  const fetchStoreLocation = async storeId => {
    try {
      const response = await axios.get(
        `${URL_key}api/ProductApi/gStoreDetails?StoreID=${storeId}`,
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      );
      console.log('fetchStoreLocation', response.data);

      return {
        latitude: response.data.Latitude || 28.7041,
        longitude: response.data.Longitude || 77.1025,
      };
    } catch (error) {
      console.error('Error fetching store location:', error);
      return {
        latitude: 28.7041,
        longitude: 77.1025,
      };
    }
  };

  const calculateDeliveryFee = (distance, charges, isRaining = false) => {
    let baseFee = isRaining
      ? charges.RainyWeatherBaseFee
      : charges.BaseDeliveryFee;
    let additionalFee = 0;

    if (distance > charges.AdditionalDistanceKM) {
      const extraDistance = distance - charges.AdditionalDistanceKM;
      additionalFee = Math.ceil(extraDistance) * charges.AdditionDistanceFee;
    }

    const totalDeliveryFee = Math.max(baseFee + additionalFee, 20); // Minimum delivery fee
    const convenienceFee = Math.max(charges.ConvenienceFee || 0, 5); // Minimum convenience fee
    const packagingFee = Math.max(charges.PackagingFee || 0, 3); // Minimum packaging fee

    return {
      deliveryFee: totalDeliveryFee,
      convenienceFee: convenienceFee,
      packagingFee: packagingFee,
      totalFees: totalDeliveryFee + convenienceFee + packagingFee,
    };
  };

  const calculateTotalDeliveryFees = async (stores, userLocation, charges) => {
    let totalDeliveryFee = 0;
    let totalConvenienceFee = 0;
    let totalPackagingFee = 0;

    for (const store of stores) {
      const storeLocation = await fetchStoreLocation(store.StoreID);
      console.log('storeLocation', storeLocation);
      console.log('userLocation', userLocation);

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        storeLocation.latitude,
        storeLocation.longitude,
      );
      console.log('distance', distance);
      const fees = calculateDeliveryFee(distance, charges, state.isRaining);
      console.log('fees', fees);
      totalDeliveryFee += fees.deliveryFee;
      totalConvenienceFee += fees.convenienceFee;
      totalPackagingFee += fees.packagingFee;
    }

    return {
      totalDeliveryFee,
      totalConvenienceFee,
      totalPackagingFee,
      grandTotalFees:
        totalDeliveryFee + totalConvenienceFee + totalPackagingFee,
    };
  };

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

  const fetchCartData = async () => {
    try {
      showLoading();
      setState(prevState => ({...prevState, isLoading: true, error: null}));

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      if (!UserProfileID) {
        throw new Error('User not logged in');
      }

      await Promise.all([fetchDeliveryCharges(), getUserLocation()]);

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

      const preferredAddress = addressResponse.data.filter(
        data => data.IsPreferred === true,
      );
      const stateData = stateResponse.data.filter(
        data => data.StateID === preferredAddress[0]?.StateID,
      );

      const cartResponse = await axios.get(
        `https://fybrappapi.benchstep.com/api/ProductApi/gProductCartList?UserProfileID=${UserProfileID}`,
        {headers: {'content-type': 'application/json'}},
      );

      console.log('Cart API Response:', cartResponse.data);

      // Handle the new API response format - array of cart objects
      let cartItems = [];
      if (Array.isArray(cartResponse.data)) {
        // Extract all cart items from all carts
        cartResponse.data.forEach(cart => {
          if (cart.CartItems && Array.isArray(cart.CartItems)) {
            cartItems = cartItems.concat(cart.CartItems);
          }
        });
      } else if (cartResponse.data && cartResponse.data.CartItems) {
        // Fallback for old format
        cartItems = cartResponse.data.CartItems;
      }

      console.log('Processed cartItems:', cartItems);
      console.log('Processing cartItems count:', cartItems.length);

      if (cartItems.length === 0) {
        console.log('No cart items found, setting empty state');
        setState(prevState => ({
          ...prevState,
          Nearbystores: [],
          Nearbystores1: [],
          TotalUnitPrice: 0,
          TotalDiscountPrice: 0,
          totalDeliveryFee: 0,
          totalConvenienceFee: 0,
          totalPackagingFee: 0,
          isLoading: false,
          error: null,
        }));
        hideLoading();
        return;
      }

      // Map and enrich cart items with proper field mapping
      const enrichedCartItems = cartItems.map(item => {
        console.log('🔍 Processing cart item:', item);

        // Map the fields properly from the API response
        return {
          // Cart item fields
          CartID: item.CartID,
          CartItemID: item.CartItemID,
          ProductID: item.ProductID,
          ProductItemID: item.ProductItemID,
          StoreID: item.StoreID,
          Quantity: item.Quantity || 0,
          UnitPrice: item.UnitPrice || 0,
          TotalPrice: item.TotalPrice || 0,

          // Product details (from the new API structure)
          ProductName: item.ProductName || item.ItemName || 'Product',
          ProductImage: item.ProductImage || item.ItemImage || '',
          ProductColor: item.Color || '',
          ProductSize: item.Size || '',

          // Store details
          StoreName: item.StoreName || 'Store',
          StoreLocation: item.StoreLocation || 'Location',

          // Additional fields
          DiscountedPrice: item.DiscountedPrice || 0,
          Color: item.Color || '',
          SizeID: item.Size || '',
        };
      });

      console.log('📦 All enriched cart items:', enrichedCartItems);

      // Create a simplified structure for the UI
      // Group products by store for display purposes
      const storeMap = new Map();

      enrichedCartItems.forEach(item => {
        if (!storeMap.has(item.StoreID)) {
          storeMap.set(item.StoreID, {
            StoreName: item.StoreName,
            StoreID: item.StoreID,
            StoreLocation: item.StoreLocation,
            Products: [],
          });
        }
        storeMap.get(item.StoreID).Products.push(item);
      });

      const groupedArray = Array.from(storeMap.values());

      // Calculate totals
      const totalUnitPrice = enrichedCartItems
        .reduce(
          (sum, product) => sum + (parseFloat(product.TotalPrice) || 0),
          0,
        )
        .toFixed(2);

      const rawDiscountPrice = enrichedCartItems.reduce(
        (sum, product) => sum + (parseFloat(product.DiscountedPrice) || 0),
        0,
      );

      // Validate discounted price - ensure it's not greater than original price
      const totalDiscountPrice = Math.min(
        rawDiscountPrice,
        parseFloat(totalUnitPrice),
      ).toFixed(2);

      const currentUserLocation = state.userLocation;
      const currentCharges = state.deliveryCharges;

      // Initialize fee data
      let deliveryFeeData = {
        totalDeliveryFee: 0,
        totalConvenienceFee: 0,
        totalPackagingFee: 0,
        grandTotalFees: 0,
      };

      // Calculate delivery fees if we have location and stores
      if (currentUserLocation && groupedArray.length > 0) {
        deliveryFeeData = await calculateTotalDeliveryFees(
          groupedArray,
          currentUserLocation,
          currentCharges,
        );
      }

      // Ensure minimum fees are applied
      deliveryFeeData.totalDeliveryFee = Math.max(
        deliveryFeeData.totalDeliveryFee,
        20,
      );
      deliveryFeeData.totalConvenienceFee = Math.max(
        deliveryFeeData.totalConvenienceFee,
        5,
      );
      deliveryFeeData.totalPackagingFee = Math.max(
        deliveryFeeData.totalPackagingFee,
        3,
      );

      // Update state with all the calculated data
      setState(prevState => ({
        ...prevState,
        StreetName: addressResponse.data[0]?.StreetName || '',
        Pincode: addressResponse.data[0]?.AddressCategory || '',
        Nearbystores: groupedArray,
        Nearbystores1: groupedArray,
        TotalUnitPrice: parseFloat(totalUnitPrice),
        TotalDiscountPrice: parseFloat(totalDiscountPrice),
        totalDeliveryFee: deliveryFeeData.totalDeliveryFee,
        totalConvenienceFee: deliveryFeeData.totalConvenienceFee,
        totalPackagingFee: deliveryFeeData.totalPackagingFee,
        isLoading: false,
        error: null,
      }));
      hideLoading();
    } catch (error) {
      handleError(error, 'Fetching cart data');
    }
  };

  const handleQuantityChange = async (item, num) => {
    try {
      // Prevent negative quantities
      if (num < 0) {
        console.log('Quantity cannot be negative');
        return;
      }

      showLoading();
      setState(prevState => ({...prevState, isLoading: true}));

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const SystemUser = await AsyncStorage.getItem('FullName');
      const SystemDate = moment().format('YYYY-MM-DD hh:mm:ss A');

      const latestCart = await axios.get(
        `${URL_key}api/ProductApi/gLatestCardID?UserProfileID=${UserProfileID}`,
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      );

      const CartID = latestCart.data;

      if (num > 0) {
        const body = {
          CartID,
          CartItemID: item.CartItemID,
          UserProfileID,
          ProductID: item.ProductID,
          ProductItemID: item.ProductItemID,
          StoreID: item.StoreID,
          Quantity: num,
          UnitPrice: item.UnitPrice,
          SystemUser,
          SystemDate,
        };

        const res = await axios.post(
          `${URL_key}api/ProductApi/sProductCartItem`,
          body,
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        );

        if (res.data.Result === 'UPDATED') {
          await AsyncStorage.setItem('CartID', res.data.CartID.toString());
          await fetchCartData();
        } else {
          throw new Error('Failed to update cart item');
        }
      } else {
        // Handle deletion when quantity becomes 0
        const body = {
          CartID,
          CartItemID: item.CartItemID,
          SystemUser,
          SystemDate,
        };

        const res = await axios.post(
          `${URL_key}api/ProductApi/dProductCartItem`,
          body,
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        );

        if (res.data === 'DELETED') {
          await AsyncStorage.removeItem('CartID');
          // Refresh cart data to recalculate totals
          await fetchCartData();
        } else {
          throw new Error('Failed to delete cart item');
        }
      }
    } catch (error) {
      handleError(error, 'Updating cart quantity');
    }
  };

  const handleStoreNavigation = async storeId => {
    try {
      const response = await axios.get(URL_key + 'api/ProductApi/gStoreList', {
        headers: {
          'content-type': `application/json`,
        },
      });

      const storeData = response.data.filter(data => data.StoreID === storeId);

      if (storeData.length > 0) {
        const store = storeData[0];
        const timing = calculateTimeDifference(
          store.StartTiming,
          store.EndTiming,
        );

        const transformedStore = {
          StoreID: store.StoreID,
          StoreName: store.StoreName,
          StoreLocation: store.StoreLocation,
          Timing: timing,
          DeliveryCharges: store.DeliveryCharges,
        };

        navigation.push('StoreProducts', {data: transformedStore});
      }
    } catch (error) {
      handleError(error, 'Navigating to store');
    }
  };

  const handleCheckout = () => {
    try {
      // Calculate total amount with all fees
      const totalAmount =
        (state.TotalUnitPrice || 0) -
        (state.TotalDiscountPrice || 0) +
        (state.totalDeliveryFee || 0) +
        (state.totalConvenienceFee || 0) +
        (state.totalPackagingFee || 0);

      // Validate that we have a valid total
      if (totalAmount <= 0) {
        Alert.alert('Error', 'Invalid order total. Please check your cart.');
        return;
      }

      // Pass complete data to checkout
      navigation.push('Checkout', {
        data: {
          TotalUnitPrice: totalAmount,
          Subtotal: state.TotalUnitPrice || 0,
          DiscountedPrice: state.TotalDiscountPrice || 0,
          DeliveryFee: state.totalDeliveryFee || 0,
          ConvenienceFee: state.totalConvenienceFee || 0,
          PackagingFee: state.totalPackagingFee || 0,
          CartItems: state.Nearbystores1 || [],
        },
      });
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to proceed to checkout. Please try again.');
    }
  };

  const SearchFilterFunction = text => {
    console.log('Search text:', text);
  };

  useEffect(() => {
    fetchCartData();
  }, []);

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
      <ScrollView>
        <Dialog
          visible={state.fail}
          dialogStyle={{
            borderRadius: wp('5%'),
            width: wp('75%'),
            alignSelf: 'center',
          }}
          onTouchOutside={() => console.log('no')}>
          <View
            style={{
              alignItems: 'center',
              marginTop: hp('2%'),
              marginBottom: hp('0.5%'),
            }}>
            <Image
              style={{
                height: hp('6%'),
                width: hp('6%'),
                borderRadius: hp('100%'),
                alignSelf: 'center',
                justifyContent: 'center',
              }}
              resizeMode="contain"
              source={require('../Images/1024px-Cross_red_circle.svg-removebg-preview.png')}
            />
          </View>
          <Text
            style={{
              color: 'red',
              fontSize: 15,
              fontFamily: 'Poppins-Light',
              textAlign: 'center',
              marginTop: hp('2%'),
              marginBottom: hp('1%'),
              lineHeight: hp('2.5%'),
            }}>
            Error !! Please Try Again.
          </Text>
          <TouchableOpacity
            style={styles.SubmitButtonStyledd}
            activeOpacity={0.5}
            onPress={() => {
              setState(prevState => ({...prevState, fail: false}));
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
              }}>
              OK
            </Text>
          </TouchableOpacity>
        </Dialog>

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
              marginLeft: wp('17%'),
            }}>
            Delivering to
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
        </ImageBackground>

        {state.Nearbystores1 == null ||
        state.Nearbystores == undefined ||
        state.Nearbystores1?.length === 0 ? (
          <EmptyCart navigation={navigation} />
        ) : (
          <>
            <FlatList
              data={state.Nearbystores1}
              renderItem={({item, index}) => {
                return (
                  <>
                    <View
                      style={{
                        marginBottom: hp('2%'),
                        marginTop: hp('2%'),
                      }}>
                      <View
                        style={{
                          backgroundColor: '#f5f5f5',
                          padding: 15,
                          marginHorizontal: 10,
                          borderRadius: 8,
                          marginBottom: 10,
                        }}>
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#333',
                            fontFamily: 'Poppins-Medium',
                            marginBottom: 5,
                          }}>
                          {item.StoreName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#666',
                            fontFamily: 'Poppins-Light',
                          }}>
                          {item.StoreLocation}
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: 10,
                          color: '#666',
                          fontFamily: 'Poppins-Light',
                          fontStyle: 'italic',
                          marginLeft: wp('8%'),
                          marginBottom: hp('1%'),
                        }}>
                        Note: You can only order from one store at a time
                      </Text>

                      <FlatList
                        data={item.Products}
                        renderItem={({item: product}) => {
                          return (
                            <View
                              style={[
                                {
                                  width: wp('95%'),
                                  alignSelf: 'center',
                                  borderRadius: wp('3%'),
                                  marginTop: hp('2%'),
                                  borderColor: '#00afb5',
                                },
                              ]}>
                              <View style={{flexDirection: 'row'}}>
                                <View>
                                  {product.ProductImage == null ||
                                  product.ProductImage == undefined ||
                                  product.ProductImage == '' ? (
                                    <Image
                                      style={{
                                        width: wp('30%'),
                                        height: hp('14%'),
                                        resizeMode: 'stretch',
                                        marginLeft: wp('5%'),
                                        marginRight: wp('5%'),
                                      }}
                                      source={require('../Images/bb.jpg')}
                                    />
                                  ) : (
                                    <Image
                                      style={{
                                        width: wp('30%'),
                                        height: hp('14%'),
                                        resizeMode: 'stretch',
                                        marginLeft: wp('5%'),
                                        marginRight: wp('5%'),
                                      }}
                                      source={{uri: product.ProductImage}}
                                    />
                                  )}
                                </View>
                                <View>
                                  <Text
                                    style={{
                                      fontSize: 10,
                                      fontFamily: 'Poppins-Medium',
                                      alignContent: 'center',
                                      textAlign: 'left',
                                      justifyContent: 'center',
                                      color: '#333',
                                      marginTop: hp('0.5%'),
                                      marginLeft: wp('3%'),
                                      marginRight: wp('2%'),
                                      width: wp('25%'),
                                    }}>
                                    {product.ProductName}
                                  </Text>

                                  <View
                                    style={{
                                      height: hp('2%'),
                                      width: hp('2%'),
                                      borderRadius: wp('100%'),
                                      borderWidth: 1,
                                      borderColor: '#00afb5',
                                      marginLeft: wp('3%'),
                                      backgroundColor:
                                        product.ProductColor.toLowerCase(),
                                      marginTop: hp('1%'),
                                    }}></View>

                                  <Text
                                    style={{
                                      fontSize: 11,
                                      fontFamily: 'Poppins-Medium',
                                      alignContent: 'center',
                                      textAlign: 'left',
                                      justifyContent: 'center',
                                      color: '#333',
                                      marginTop: hp('-2%'),
                                      marginLeft: wp('10%'),
                                      marginRight: wp('2%'),
                                      width: wp('25%'),
                                    }}>
                                    {product.ProductSize}
                                  </Text>

                                  <CustomSpinner
                                    value={product.Quantity ?? 0}
                                    onChange={num =>
                                      handleQuantityChange(product, num)
                                    }
                                  />
                                </View>
                                <View>
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      fontFamily: 'Poppins-SemiBold',
                                      color: '#333',
                                      marginTop: hp('5%'),
                                      marginLeft: wp('3%'),
                                      marginRight: wp('4%'),
                                    }}>
                                    ₹ {product.TotalPrice}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        }}
                        numColumns={1}
                      />
                    </View>
                    <Text
                      onPress={() => handleStoreNavigation(item.StoreID)}
                      style={{
                        fontSize: 9,
                        fontFamily: 'Poppins-Light',
                        color: '#333',
                        marginLeft: wp('8%'),
                        marginRight: wp('4%'),
                        textDecorationLine: 'underline',
                      }}>
                      Add more items from {item.StoreName}
                    </Text>
                  </>
                );
              }}
            />

            <Text
              style={{
                fontSize: 12,
                color: '#333',
                fontFamily: 'Poppins-Medium',
                marginTop: hp('3%'),
                marginLeft: wp('8%'),
                marginRight: wp('1%'),
              }}>
              Coupons
            </Text>
            <View style={{flexDirection: 'row'}}>
              <View
                style={{
                  justifyContent: 'center',
                  borderWidth: 0.7,
                  height: hp('4.5%'),
                  borderColor: '#00afb5',
                  marginTop: hp('2%'),
                  backgroundColor: '#ffff',
                  width: wp('60%'),
                  marginBottom: hp('1%'),
                  textAlignVertical: 'top',
                  marginLeft: wp('7%'),
                }}>
                <TextInput
                  placeholder="Enter coupon no."
                  fontFamily={'Poppins-Light'}
                  placeholderTextColor={'#666'}
                  color={'black'}
                  fontSize={10}
                  onChangeText={SearchFilterFunction}
                  style={{
                    padding: hp('1%'),
                    width: wp('58%'),
                    marginLeft: wp('1%'),
                  }}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 7,
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('3.5%'),
                    marginLeft: wp('11%'),
                    marginRight: wp('5%'),
                  }}>
                  Browse coupons
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: hp('2%'),
                marginHorizontal: wp('8%'),
                backgroundColor: '#f8f8f8',
                borderRadius: 8,
                padding: 15,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#333',
                  fontFamily: 'Poppins-Medium',
                  marginBottom: hp('2%'),
                }}>
                Payment Summary
              </Text>

              <View style={{marginBottom: hp('1%')}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: hp('1%'),
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                    }}>
                    Subtotal
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                    }}>
                    ₹ {state.TotalUnitPrice.toFixed(2)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: hp('1%'),
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                    }}>
                    Delivery Fees
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: state.totalDeliveryFee > 0 ? '#333' : '#e74c3c',
                      fontFamily: 'Poppins-Light',
                    }}>
                    ₹ {state.totalDeliveryFee.toFixed(2)}
                    {state.totalDeliveryFee === 0 && ' (Free)'}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: hp('1%'),
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                    }}>
                    Discounted Price
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                    }}>
                    - ₹ {state.TotalDiscountPrice.toFixed(2)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: hp('1%'),
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                    }}>
                    Convenience Fees
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: state.totalConvenienceFee > 0 ? '#333' : '#e74c3c',
                      fontFamily: 'Poppins-Light',
                    }}>
                    ₹ {state.totalConvenienceFee.toFixed(2)}
                    {state.totalConvenienceFee === 0 && ' (Free)'}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: hp('1%'),
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                    }}>
                    Packaging Fees
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: state.totalPackagingFee > 0 ? '#333' : '#e74c3c',
                      fontFamily: 'Poppins-Light',
                    }}>
                    ₹ {state.totalPackagingFee.toFixed(2)}
                    {state.totalPackagingFee === 0 && ' (Free)'}
                  </Text>
                </View>

                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: '#ddd',
                    paddingTop: hp('1%'),
                    marginTop: hp('1%'),
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#333',
                        fontFamily: 'Poppins-Medium',
                      }}>
                      Total amount
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#333',
                        fontFamily: 'Poppins-Medium',
                      }}>
                      ₹{' '}
                      {(
                        state.TotalUnitPrice -
                        state.TotalDiscountPrice +
                        state.totalDeliveryFee +
                        state.totalConvenienceFee +
                        state.totalPackagingFee
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <CenteredView>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: 'auto',
                  marginHorizontal: wp('8%'),
                  marginTop: hp('3%'),
                }}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={handleCheckout}
                  disabled={state.isLoading}
                  style={{
                    backgroundColor: state.isLoading ? '#ccc' : '#00afb5',
                    width: wp('85%'),
                    height: hp('4.5%'),
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                  }}>
                  <Text
                    style={{
                      color: '#ffff',
                      fontSize: 11,
                      fontFamily: 'Poppins-SemiBold',
                      textAlign: 'center',
                    }}>
                    {state.isLoading ? 'Processing...' : 'Checkout'}
                  </Text>
                </TouchableOpacity>
              </View>
            </CenteredView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  separator: {
    borderBottomColor: '#666',
    borderBottomWidth: 0.5,
    marginTop: hp('2%'),
    width: wp('100%'),
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  SubmitButtonStyledd: {
    paddingTop: hp('0.5%'),
    paddingBottom: hp('0.5%'),
    backgroundColor: 'red',
    borderRadius: wp('5%'),
    width: wp('25%'),
    alignSelf: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
  },
});

export default Cart;
