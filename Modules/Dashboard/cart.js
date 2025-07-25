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
  Modal,
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
import {SummaryRow} from '../Common/SummaryRow';

const Cart = ({navigation}) => {
  const {showLoading, hideLoading} = useLoading();
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
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
    appliedCoupon: null,
    appliedCouponDiscount: 0,
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

  const validateCoupon = async code => {
    try {
      const couponToValidate = code || couponCode;

      if (!couponToValidate?.trim()) {
        setCouponMessage('Please enter a coupon code.');
        return;
      }

      showLoading();

      // Find coupon in available coupons
      const selectedCoupon = availableCoupons.find(
        c => c.CouponCode === couponToValidate.toUpperCase(),
      );

      if (!selectedCoupon) {
        setCouponMessage('Invalid coupon code.');
        setIsCouponValid(false);
        hideLoading();
        return;
      }

      // Check minimum order amount
      if (state.TotalUnitPrice < selectedCoupon.MinimumOrderAmount) {
        setCouponMessage(
          `Minimum order amount of ₹${selectedCoupon.MinimumOrderAmount} required.`,
        );
        setIsCouponValid(false);
        hideLoading();
        return;
      }

      // Calculate discount
      let discountValue = 0;
      if (selectedCoupon.DiscountType === 'Flat') {
        discountValue = selectedCoupon.CouponDiscount;
      } else {
        // Percentage discount
        discountValue =
          (state.TotalUnitPrice * selectedCoupon.CouponDiscount) / 100;
      }

      // Update state with applied coupon
      setState(prev => ({
        ...prev,
        appliedCoupon: selectedCoupon,
        appliedCouponDiscount: discountValue,
      }));

      setIsCouponValid(true);
      setCouponMessage(
        `Coupon applied! You saved ₹${discountValue.toFixed(2)}`,
      );
      setShowCouponModal(false);

      hideLoading();
    } catch (error) {
      hideLoading();
      setIsCouponValid(false);
      setCouponMessage('Error validating coupon. Try again.');
      console.error('Coupon validation error:', error);
    }
  };

  const removeCoupon = () => {
    setState(prev => ({
      ...prev,
      appliedCoupon: null,
      appliedCouponDiscount: 0,
    }));
    setIsCouponValid(false);
    setCouponCode('');
    setCouponMessage('');
  };

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${URL_key}api/ProductApi/gCoupons`);
      setAvailableCoupons(response.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  useEffect(() => {
    if (showCouponModal) {
      fetchCoupons();
    }
  }, [showCouponModal]);

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

  const generateCouponDescription = coupon => {
    const amount = `₹${coupon.MinimumOrderAmount}`;
    const discount =
      coupon.DiscountType === 'Flat'
        ? `₹${coupon.CouponDiscount}`
        : `${coupon.CouponDiscount}%`;

    return (
      <Text key={coupon.CouponID}>
        <Text style={{fontWeight: 'bold', color: '#000'}}>
          {coupon.CouponCode}
        </Text>
        {`: Get ${discount} off on orders above ${amount}`}
      </Text>
    );
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
      console.log('🛒 Starting checkout process...');
      console.log('🛒 Cart state:', {
        TotalUnitPrice: state.TotalUnitPrice,
        TotalDiscountPrice: state.TotalDiscountPrice,
        totalDeliveryFee: state.totalDeliveryFee,
        totalConvenienceFee: state.totalConvenienceFee,
        totalPackagingFee: state.totalPackagingFee,
        cartItems: state.Nearbystores1,
      });

      // Calculate total amount with all fees
      const subtotal = state.TotalUnitPrice || 0;
      const discount = state.TotalDiscountPrice || 0;
      const deliveryFee = state.totalDeliveryFee || 0;
      const convenienceFee = state.totalConvenienceFee || 0;
      const packagingFee = state.totalPackagingFee || 0;

      const totalAmount =
        subtotal - discount + deliveryFee + convenienceFee + packagingFee;

      console.log('💰 Amount breakdown:', {
        subtotal,
        discount,
        deliveryFee,
        convenienceFee,
        packagingFee,
        totalAmount,
      });

      // Validate that we have a valid total
      if (totalAmount <= 0) {
        Alert.alert('Error', 'Invalid order total. Please check your cart.');
        return;
      }

      // Validate cart items
      if (!state.Nearbystores1 || state.Nearbystores1.length === 0) {
        Alert.alert(
          'Error',
          'Your cart is empty. Please add items before checkout.',
        );
        return;
      }

      // Pass complete data to checkout with proper structure
      const checkoutData = {
        TotalUnitPrice: totalAmount, // Final total amount
        Subtotal: subtotal, // Original cart total
        DiscountedPrice: discount, // Total discount
        DeliveryFee: deliveryFee,
        ConvenienceFee: convenienceFee,
        PackagingFee: packagingFee,
        CartItems: state.Nearbystores1 || [],
        // Add additional fields for backend
        ItemCount: state.Nearbystores1.reduce(
          (count, store) =>
            count + (store.Products ? store.Products.length : 0),
          0,
        ),
        StoreCount: state.Nearbystores1.length,
        OriginalTotal: subtotal,
        FinalTotal: totalAmount,
        // Coupon data
        AppliedCoupon: state.appliedCoupon,
        CouponDiscount: state.appliedCouponDiscount,
      };

      console.log('📤 Checkout data being sent:', checkoutData);

      navigation.push('Checkout', {
        data: checkoutData,
      });
    } catch (error) {
      console.error('❌ Checkout error:', error);
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
            <View style={{marginHorizontal: wp('7%'), marginTop: hp('2%')}}>
              {/* Coupon Input Section */}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    flex: 1,
                    borderWidth: 0.7,
                    height: hp('4.5%'),
                    borderColor: isCouponValid ? '#2ecc71' : '#00afb5',
                    backgroundColor: '#ffff',
                    borderRadius: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <TextInput
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChangeText={text => {
                      setCouponCode(text.toUpperCase());
                      setCouponMessage('');
                    }}
                    style={{
                      flex: 1,
                      padding: hp('1%'),
                      fontFamily: 'Poppins-Light',
                      color: 'black',
                      fontSize: 12,
                    }}
                    autoCapitalize="characters"
                  />
                  {state.appliedCoupon && (
                    <TouchableOpacity
                      onPress={removeCoupon}
                      style={{padding: 8}}>
                      <Icon name="close-circle" size={16} color="#ff4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => validateCoupon()}
                  style={{
                    backgroundColor: '#00afb5',
                    paddingHorizontal: wp('4%'),
                    paddingVertical: hp('1%'),
                    borderRadius: 4,
                    marginLeft: 8,
                  }}>
                  <Text style={{color: 'white', fontSize: 12}}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* Coupon Message */}
              {couponMessage ? (
                <Text
                  style={{
                    fontSize: 11,
                    color: isCouponValid ? '#2ecc71' : '#ff4444',
                    marginTop: 4,
                    fontFamily: 'Poppins-Light',
                  }}>
                  {couponMessage}
                </Text>
              ) : (
                <TouchableOpacity onPress={() => setShowCouponModal(true)}>
                  {/* <Text
                    style={{
                      fontSize: 11,
                      color: '#00afb5',
                      marginTop: 4,
                      fontFamily: 'Poppins-Light',
                      textDecorationLine: 'underline',
                    }}>
                    View available coupons
                  </Text> */}
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowCouponModal(true)}>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#00afb5',
                    marginTop: 4,
                    fontFamily: 'Poppins-Light',
                    textDecorationLine: 'underline',
                  }}>
                  View available coupons
                </Text>
              </TouchableOpacity>
            </View>

            <Modal
              visible={showCouponModal}
              animationType="slide"
              transparent={true}>
              <View
                style={{
                  flex: 1,

                  backgroundColor: 'rgba(0,0,0,0.4)',
                  justifyContent: 'flex-end',
                }}>
                <View
                  style={{
                    height: '52%',
                    // padding: hp('10%'),
                    backgroundColor: '#fff',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    paddingHorizontal: 20,
                    paddingTop: 14,
                    paddingBottom: 14,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: -3},
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 20,
                  }}>
                  {/* Swipe handle */}
                  <View style={{alignItems: 'center', marginBottom: 12}}>
                    <View
                      style={{
                        width: 40,
                        height: 5,
                        backgroundColor: '#ccc',
                        borderRadius: 3,
                      }}
                    />
                  </View>

                  {/* Title */}
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '600',
                      textAlign: 'center',
                      marginBottom: 8,
                      color: '#222',
                    }}>
                    🎁 Available Coupons
                  </Text>

                  {/* Subtitle */}
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#666',
                      textAlign: 'center',
                      marginBottom: 16,
                    }}>
                    Tap to apply a coupon instantly!
                  </Text>

                  {/* Coupons List */}
                  <FlatList
                    data={availableCoupons}
                    keyExtractor={(item, index) => `${item.code}-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 16}}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={{
                          backgroundColor: '#e6faff',
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 14,
                          borderLeftWidth: 4,
                          borderLeftColor: '#00afb5',
                          shadowColor: '#000',
                          shadowOffset: {width: 0, height: 2},
                          shadowOpacity: 0.05,
                          shadowRadius: 6,
                          elevation: 1,
                        }}
                        onPress={() => {
                          setCouponCode(item.CouponCode);
                          setShowCouponModal(false);
                          validateCoupon(item.CouponCode);
                        }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: '#007b83',
                          }}>
                          {item.CouponCode}
                        </Text>
                        {item.description && (
                          <Text
                            style={{
                              color: '#333',
                              fontSize: 13,
                              marginTop: 4,
                              lineHeight: 18,
                            }}>
                            {item.description}
                          </Text>
                        )}
                        <Text
                          style={{
                            color: '#666',
                            fontSize: 12,
                            marginTop: 6,
                          }}>
                          {generateCouponDescription(item)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <Text
                        style={{
                          color: '#888',
                          textAlign: 'center',
                          marginTop: 20,
                          fontSize: 14,
                        }}>
                        😔 No coupons available right now.
                      </Text>
                    }
                  />

                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowCouponModal(false);
                    }}
                    style={{
                      backgroundColor: '#00afb5',
                      paddingVertical: 12,
                      borderRadius: 12,
                      marginTop: 10,
                    }}>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: 16,
                      }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View
              style={{
                marginTop: hp('2%'),
                marginHorizontal: wp('8%'),
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#222',
                  fontFamily: 'Poppins-SemiBold',
                  marginBottom: hp('2%'),
                }}>
                Payment Summary
              </Text>

              {/* Subtotal */}
              <SummaryRow label="Subtotal" value={state.TotalUnitPrice} />

              {/* Delivery Fees */}
              <SummaryRow
                label="Delivery Fees"
                value={state.totalDeliveryFee}
                isFree={state.totalDeliveryFee === 0}
              />

              {/* Discounted Price */}
              <SummaryRow
                label="Item Discount"
                value={-state.TotalDiscountPrice}
              />

              {/* Coupon Discount */}
              {state.appliedCoupon && (
                <SummaryRow
                  label={`Coupon (${state.appliedCoupon.CouponCode})`}
                  value={-state.appliedCouponDiscount}
                  valueColor="#2ecc71"
                />
              )}

              {/* Convenience Fees */}
              <SummaryRow
                label="Convenience Fee"
                value={state.totalConvenienceFee}
                isFree={state.totalConvenienceFee === 0}
              />

              {/* Packaging Fees */}
              <SummaryRow
                label="Packaging Fee"
                value={state.totalPackagingFee}
                isFree={state.totalPackagingFee === 0}
              />

              {/* Divider */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: '#eee',
                  marginVertical: hp('1.5%'),
                }}
              />

              {/* Total */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: '#000',
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  Total Amount
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: '#000',
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  ₹{' '}
                  {(
                    state.TotalUnitPrice -
                    state.TotalDiscountPrice -
                    state.appliedCouponDiscount +
                    state.totalDeliveryFee +
                    state.totalConvenienceFee +
                    state.totalPackagingFee
                  ).toFixed(2)}
                </Text>
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
