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
import CustomModal from '../../shared/CustomModal';
import AddressSelector from '../Common/ShowUserLocation';
import HeaderWithAddress from '../Common/HeaderWithCommon';

const Cart = ({navigation}) => {
  const {showLoading, hideLoading} = useLoading();
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [storeList, setStoreList] = useState([]);
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    primaryButtonText: 'OK',
    onPrimaryPress: null,
  });
  // Update initial state
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
    BaseDeliveryFee: 0,
    appliedCouponID: 0,
    appliedDiscountTypeID: 0,
    appliedCouponDiscountAmount: 0,
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
    isLoading: false,
    error: null,
    isRaining: false,
  });

  // Add precision helper
  const roundToTwoDecimals = num => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  // Add amount validation helper
  const validateAmount = (amount, min = 0) => {
    const num = parseFloat(amount);
    return isNaN(num) ? min : Math.max(min, roundToTwoDecimals(num));
  };

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

  const handleError = (error, context = 'Unknown operation') => {
    hideLoading();
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
      console.log('fetchDeliveryCharges', response.data);

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

  // Update validateCoupon function
  const validateCoupon = async code => {
    try {
      const couponToValidate = code || couponCode;

      if (!couponToValidate?.trim()) {
        setCouponMessage('Please enter a coupon code.');
        return;
      }

      showLoading();

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      if (!UserProfileID) {
        setCouponMessage('Please login to apply coupon.');
        hideLoading();
        return;
      }

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

      // Validate minimum order amount
      const currentSubtotal = validateAmount(state.TotalUnitPrice);
      if (currentSubtotal < selectedCoupon.MinimumOrderAmount) {
        setCouponMessage(
          `Minimum order amount of ₹${selectedCoupon.MinimumOrderAmount} required.`,
        );
        setIsCouponValid(false);
        hideLoading();
        return;
      }

      // Validate with API
      try {
        const response = await axios.post(
          'https://fybrappapi.benchstep.com/api/ProductApi/vUserCoupon',
          {
            UserProfileID: parseInt(UserProfileID),
            CouponID: selectedCoupon.CouponID,
          },
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        );

        if (response.data !== 'ALLOW') {
          setCouponMessage('This coupon cannot be applied to your account.');
          setIsCouponValid(false);
          hideLoading();
          return;
        }
      } catch (error) {
        console.error('API validation error:', error);
        setCouponMessage('Error validating coupon. Please try again.');
        setIsCouponValid(false);
        hideLoading();
        return;
      }

      // Calculate discount with proper validation
      const remainingAmount =
        currentSubtotal - validateAmount(state.TotalDiscountPrice);
      let discountValue = 0;

      if (selectedCoupon.DiscountType === 'Flat') {
        discountValue = Math.min(
          validateAmount(selectedCoupon.CouponDiscount),
          remainingAmount,
        );
      } else {
        // Percentage discount
        const percentageDiscount =
          (remainingAmount * validateAmount(selectedCoupon.CouponDiscount)) /
          100;
        discountValue = Math.min(percentageDiscount, remainingAmount);
      }

      // Update state with applied coupon
      setState(prev => ({
        ...prev,
        appliedCoupon: selectedCoupon,
        appliedCouponDiscount: discountValue,
        appliedCouponID: selectedCoupon.CouponID,
        appliedDiscountTypeID: selectedCoupon.DiscountTypeID,
        appliedCouponDiscountAmount: discountValue,
      }));

      setIsCouponValid(true);
      setCouponMessage(
        `Coupon applied! You saved ₹${discountValue.toFixed(2)}`,
      );
      setShowCouponModal(false);

      hideLoading();
    } catch (error) {
      console.error('Coupon validation error:', error);
      hideLoading();
      setIsCouponValid(false);
      setCouponMessage('Error validating coupon. Please try again.');
    }
  };

  // Update removeCoupon function
  const removeCoupon = () => {
    setState(prev => ({
      ...prev,
      appliedCoupon: null,
      appliedCouponDiscount: 0,
      appliedCouponID: 0,
      appliedDiscountTypeID: 0,
      appliedCouponDiscountAmount: 0,
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

  // Add this function to get user location with proper error handling
  const getUserLocation = () => {
    return new Promise(async resolve => {
      try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          console.warn('Location permission denied');
          resolve({
            latitude: 17.385044,
            longitude: 78.486671,
          });
          return;
        }

        Geolocation.getCurrentPosition(
          position => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setState(prev => ({...prev, userLocation: location}));
            resolve(location);
          },
          error => {
            console.warn('Error getting location:', error);
            resolve({
              latitude: 17.385044,
              longitude: 78.486671,
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );
      } catch (error) {
        console.error('Error in getUserLocation:', error);
        resolve({
          latitude: 17.385044,
          longitude: 78.486671,
        });
      }
    });
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

  // Update calculateTotalDeliveryFees function
  const calculateTotalDeliveryFees = async (stores, userLocation, charges) => {
    try {
      let totalDeliveryFee = 0;
      let totalConvenienceFee = 0;
      let totalPackagingFee = 0;

      for (const store of stores) {
        // const storeLocation = await fetchStoreLocation(store.StoreID);
        console.log('store.StoreID', store.StoreID, storeList);

        const storeLocation = await getStoreLocation(store.StoreID);
        console.log('storeLocation', storeLocation);

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          storeLocation.latitude,
          storeLocation.longitude,
        );

        const fees = calculateDeliveryFee(distance, charges, state.isRaining);

        totalDeliveryFee += validateAmount(fees.deliveryFee);
        totalConvenienceFee += validateAmount(fees.convenienceFee);
        totalPackagingFee += validateAmount(fees.packagingFee);
      }
      console.log('totalDeliveryFee>>>', totalDeliveryFee);

      return {
        totalDeliveryFee: roundToTwoDecimals(totalDeliveryFee),
        totalConvenienceFee: roundToTwoDecimals(totalConvenienceFee),
        totalPackagingFee: roundToTwoDecimals(totalPackagingFee),
        grandTotalFees: roundToTwoDecimals(
          totalDeliveryFee + totalConvenienceFee + totalPackagingFee,
        ),
      };
    } catch (error) {
      console.error('Error calculating delivery fees:', error);
      return {
        totalDeliveryFee: validateAmount(charges.BaseDeliveryFee),
        totalConvenienceFee: validateAmount(charges.ConvenienceFee),
        totalPackagingFee: validateAmount(charges.PackagingFee),
        grandTotalFees: validateAmount(
          charges.BaseDeliveryFee +
            charges.ConvenienceFee +
            charges.PackagingFee,
        ),
      };
    }
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

  const fetchStoreList = async () => {
    try {
      console.log('fetchStoreList');

      // showLoading();
      setState(prevState => ({...prevState, isLoading: true, error: null}));

      const response = await axios.get(URL_key + 'api/ProductApi/gStoreList', {
        headers: {
          'content-type': `application/json`,
        },
      });

      if (response.data && response.data.length > 0) {
        const stores = await response.data.map(store => ({
          StoreID: store.StoreID,
          StoreName: store.StoreName,
          StoreLocation: {
            latitude: store.Latitude,
            longitude: store.Longitude,
          },
        }));
        console.log('stores>>', stores.length);

        // setState(prevState => ({
        //   ...prevState,
        //   storeList: stores,
        // }));
        console.log('stores>>', stores);

        setStoreList(stores);
      } else {
        setStoreList([]);
      }
      // hideLoading();
    } catch (error) {
      handleError(error, 'Fetching store list');
    }
  };

  const getStoreLocation = async storeId => {
    try {
      if (storeList && storeList.length > 0) {
        const {StoreLocation} = storeList.find(
          store => store.StoreID == storeId,
        );
        console.log('StoreLocat ion>>', StoreLocation);

        return StoreLocation;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching store location:', error);
    }
  };

  // Update fetchCartData to handle location properly
  const fetchCartData = async (isLocationChange = false) => {
    try {
      console.log('fetchCartData');
      showLoading();
      setState(prevState => ({...prevState, isLoading: true, error: null}));

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      if (!UserProfileID) {
        throw new Error('User not logged in');
      }

      // Get user location first
      const location = await getUserLocation();

      // Ensure we have delivery charges
      if (!state.deliveryCharges) {
        await fetchDeliveryCharges();
      }

      // Fetch cart data
      const cartResponse = await axios.get(
        `${URL_key}api/ProductApi/gProductCartList?UserProfileID=${UserProfileID}`,
        {headers: {'content-type': 'application/json'}},
      );

      let cartItems = [];
      if (Array.isArray(cartResponse.data)) {
        cartResponse.data.forEach(cart => {
          if (cart.CartItems && Array.isArray(cart.CartItems)) {
            cartItems = cartItems.concat(cart.CartItems);
          }
        });
      } else if (cartResponse.data && cartResponse.data.CartItems) {
        cartItems = cartResponse.data.CartItems;
      }

      if (cartItems.length === 0) {
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

      // Process cart items and calculate fees
      const enrichedCartItems = cartItems.map(item => ({
        CartID: item.CartID,
        CartItemID: item.CartItemID,
        ProductID: item.ProductID,
        ProductItemID: item.ProductItemID,
        StoreID: item.StoreID,
        Quantity: item.Quantity || 0,
        UnitPrice: item.UnitPrice || 0,
        TotalPrice: item.TotalPrice || 0,
        ProductName: item.ProductName || item.ItemName || 'Product',
        ProductImage: item.ProductImage || item.ItemImage || '',
        ProductColor: item.Color || '',
        ProductSize: item.Size || '',
        StoreName: item.StoreName || 'Store',
        StoreLocation: item.StoreLocation || 'Location',
        DiscountedPrice: item.DiscountedPrice || 0,
        Color: item.Color || '',
        SizeID: item.Size || '',
      }));

      // Group by store
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
      const totalUnitPrice = validateAmount(
        enrichedCartItems.reduce(
          (sum, product) => sum + (parseFloat(product.TotalPrice) || 0),
          0,
        ),
      );

      const rawDiscountPrice = enrichedCartItems.reduce(
        (sum, product) =>
          sum +
          (parseFloat(product.UnitPrice) -
            parseFloat(product.DiscountedPrice)) *
            Number(product.Quantity),
        0,
      );

      const totalDiscountPrice = Math.min(
        validateAmount(rawDiscountPrice),
        totalUnitPrice,
      );

      // Calculate delivery fees with the confirmed location
      let deliveryFeeData = {
        totalDeliveryFee: state.deliveryCharges.BaseDeliveryFee || 0,
        totalConvenienceFee: state.deliveryCharges.ConvenienceFee || 0,
        totalPackagingFee: state.deliveryCharges.PackagingFee || 0,
        grandTotalFees: 0,
      };
      console.log('location>>', location, groupedArray.length);

      if (location && groupedArray.length > 0) {
        try {
          deliveryFeeData = await calculateTotalDeliveryFees(
            groupedArray,
            location,
            state.deliveryCharges,
          );
        } catch (error) {
          console.warn('Error calculating delivery fees:', error);
        }
      }

      // Update state with all calculated data
      setState(prevState => ({
        ...prevState,
        userLocation: location,
        Nearbystores: groupedArray,
        Nearbystores1: groupedArray,
        TotalUnitPrice: totalUnitPrice,
        TotalDiscountPrice: totalDiscountPrice,
        totalDeliveryFee: validateAmount(deliveryFeeData.totalDeliveryFee),
        totalConvenienceFee: validateAmount(
          deliveryFeeData.totalConvenienceFee,
        ),
        totalPackagingFee: validateAmount(deliveryFeeData.totalPackagingFee),
        isLoading: false,
        error: null,
      }));

      hideLoading();
    } catch (error) {
      hideLoading();
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
          await fetchCartData(false);
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
          await fetchCartData(false);
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

  // Update handleCheckout function
  const handleCheckout = () => {
    try {
      // Validate cart items
      if (!state.Nearbystores1?.length) {
        showModal(
          'Empty Cart',
          'Your cart is empty. Please add items before checkout.',
          'warning',
        );
        return;
      }

      // Calculate amounts with validation
      const subtotal = validateAmount(state.TotalUnitPrice);
      const itemDiscount = validateAmount(state.TotalDiscountPrice);
      const couponDiscount = validateAmount(state.appliedCouponDiscountAmount);
      const deliveryFee = validateAmount(state.totalDeliveryFee);
      const convenienceFee = validateAmount(state.totalConvenienceFee);
      const packagingFee = validateAmount(state.totalPackagingFee);

      // Ensure discounts don't exceed subtotal
      const totalDiscount = Math.min(itemDiscount + couponDiscount, subtotal);

      // Calculate final total
      const totalAmount = roundToTwoDecimals(
        subtotal - totalDiscount + deliveryFee + convenienceFee + packagingFee,
      );

      if (totalAmount <= 0) {
        showModal(
          'Error',
          'Invalid order total. Please check your cart.',
          'error',
        );
        return;
      }

      const checkoutData = {
        TotalUnitPrice: totalAmount,
        TotalAmount: totalAmount,
        Subtotal: subtotal,
        DiscountedPrice: itemDiscount,
        DeliveryFee: deliveryFee,
        DeliveryFeeDetails: state.deliveryCharges,
        ConvenienceFee: convenienceFee,
        PackagingFee: packagingFee,
        CartItems: state.Nearbystores1,
        ItemCount: state.Nearbystores1.reduce(
          (count, store) => count + (store.Products?.length || 0),
          0,
        ),
        StoreCount: state.Nearbystores1.length,
        OriginalTotal: subtotal,
        FinalTotal: totalAmount,
        AppliedCoupon: state.appliedCoupon,
        CouponDiscount: couponDiscount,
        CouponID: state.appliedCouponID,
        DiscountTypeID: state.appliedDiscountTypeID,
        CouponDiscountAmount: state.appliedCouponDiscountAmount,
      };

      navigation.push('Checkout', {data: checkoutData});
    } catch (error) {
      console.error('Checkout error:', error);
      showModal(
        'Error',
        'Failed to proceed to checkout. Please try again.',
        'error',
      );
    }
  };
  const fetchCartPageHandler = async () => {
    try {
      showLoading();
      await fetchStoreList();
      await fetchDeliveryCharges();
      await fetchStoreList();
    } catch (error) {
      handleError(error, 'Loading cart page');
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchCartPageHandler();
  }, []);
  useEffect(() => {
    if (storeList && storeList.length > 0) fetchCartData(true);
  }, [storeList]);

  useEffect(() => {
    if (state.error) {
      showModal('Error', state.error, 'error', 'OK', () => {
        setState(prevState => ({...prevState, error: null}));
      });
    }
  }, [state.error]);

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

        <HeaderWithAddress
          navigation={navigation}
          showBackButton={true}
          handleBackPress={() => navigation.push('Tab')}
        />

        {state.Nearbystores1 == null ||
        state.Nearbystores == undefined ||
        state.Nearbystores1?.length === 0 ? (
          <EmptyCart navigation={navigation} />
        ) : (
          <View style={{backgroundColor: 'white'}}>
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
                          backgroundColor: '#ffffff',
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
              <SummaryRow
                label="Subtotal"
                value={validateAmount(state.TotalUnitPrice)}
              />

              {/* Delivery Fees */}
              <SummaryRow
                label="Delivery Fees"
                value={validateAmount(state.totalDeliveryFee)}
                isFree={state.totalDeliveryFee === 0}
              />

              {/* Item Discount */}
              <SummaryRow
                label="Item Discount"
                value={-validateAmount(state.TotalDiscountPrice)}
              />

              {/* Coupon Discount */}
              {state.appliedCoupon && (
                <SummaryRow
                  label={`Coupon (${state.appliedCoupon.CouponCode})`}
                  value={-validateAmount(state.appliedCouponDiscountAmount)}
                  valueColor="#2ecc71"
                />
              )}

              {/* Convenience Fees */}
              <SummaryRow
                label="Convenience Fee"
                value={validateAmount(state.totalConvenienceFee)}
                isFree={state.totalConvenienceFee === 0}
              />

              {/* Packaging Fees */}
              <SummaryRow
                label="Packaging Fee"
                value={validateAmount(state.totalPackagingFee)}
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
                  {roundToTwoDecimals(
                    validateAmount(state.TotalUnitPrice) -
                      validateAmount(state.TotalDiscountPrice) -
                      validateAmount(state.appliedCouponDiscountAmount) +
                      validateAmount(state.totalDeliveryFee) +
                      validateAmount(state.totalConvenienceFee) +
                      validateAmount(state.totalPackagingFee),
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
                  marginBottom: hp('2%'),
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
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

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
