import React, {useState, useEffect, useCallback} from 'react';
import {Buffer} from 'buffer';
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
  BackHandler,
  ActivityIndicator,
  FlatList,
  Linking,
} from 'react-native';
import {Dialog} from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Normalize from '../Size/size';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import PhonePePaymentSDK from 'react-native-phonepe-pg';
import {URL_key} from '../Api/api';
import axios from 'axios';
var RNFS = require('react-native-fs');

import MapView, {Marker} from 'react-native-maps';
import PhonePeService from '../Services/PhonePeService';
import {PAYMENT_MOCK_DATA} from '../MockData/paymentMockData';
import CenteredView from '../Common/CenteredView';
import GetLocation from 'react-native-get-location';
import {useLoading} from '../../shared/LoadingContext';
import BookingDebugger from '../../shared/BookingDebugger';
import CustomModal from '../../shared/CustomModal';
import AddressSelector from '../Common/ShowUserLocation';
import HeaderWithAddress from '../Common/HeaderWithCommon';
const reg2 = /^[0-9]+$/;

export const MERCHANT_ID = 'PGTESTPAYUAT86';
export const SALT_KEY = '96434309-7796-489d-8924-ab56988a6076';

const Checkout = ({navigation, route}) => {
  // Add error boundary
  const {showLoading, hideLoading} = useLoading();
  const [hasError, setHasError] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    primaryButtonText: 'OK',
    onPrimaryPress: null,
  });

  // State management
  const [state, setState] = useState({
    PaymentMethodList: [],
    TipAmountList: [],
    PaymentMethodID: null,
    TipAmount: null,
    AddressID: null,
    TipAmountErrior: false,
    PaymentMethodIDerror: false,
    TotalUnitPrice: route?.params?.data?.TotalAmount || 0,
    Subtotal: route?.params?.data?.Subtotal || 0,
    DiscountedPrice: route?.params?.data?.DiscountedPrice || 0,
    DeliveryFee: route?.params?.data?.DeliveryFee || 0,
    ConvenienceFee: route?.params?.data?.ConvenienceFee || 0,
    PackagingFee: route?.params?.data?.PackagingFee || 0,
    CartItems: route?.params?.data?.CartItems || [],
    Latitude: null,
    Longitude: null,
    loading: false,
    fail: false,
    error: null,
    mapReady: false,
    mapError: false,
    disableMapView: false, // Add this to completely disable MapView if needed
    paymentProcessing: false, // Add this to prevent double submission
  });

  // Add helper function for amount calculation
  const calculateFinalAmount = () => {
    const baseAmount = parseFloat(state.TotalUnitPrice) || 0;
    const tipAmount = parseFloat(state.TipAmount) || 0;
    return (baseAmount + tipAmount).toFixed(2);
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

  // Input change handler
  const handleInputChange = useCallback(
    (inputName, inputValue) => {
      const updatedList = state.TipAmountList.map(item1 => ({
        ...item1,
        isCheck: false,
      }));

      setState(prevState => ({
        ...prevState,
        TipAmountList: updatedList,
        [inputName]: inputValue,
      }));
    },
    [state.TipAmountList],
  );

  // Load initial data
  useEffect(() => {
    // Validate that we have the required data
    if (!route?.params?.data?.TotalUnitPrice) {
      showModal(
        'Error',
        'Invalid checkout data. Please return to cart.',
        'error',
        'Go Back',
        () => {
          hideModal();
          navigation.goBack();
        },
      );
      return;
    }

    loadInitialData();
  }, []);

  const loadUserCurrentLocation = async () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
    })
      .then(location => {
        console.log(location);
        console.log('Latitudelocation>>', location);

        // setLatitude(location.latitude);
        setState(prevState => ({
          ...prevState,
          Latitude: location.latitude,
          Longitude: location.longitude,
        }));
        // setLongitude(location.longitude);
      })
      .catch(error => {
        const {code, message} = error;
        console.warn(code, message);
      });
  };

  // Error boundary effect
  useEffect(() => {
    showLoading(
      'fetching_data',
      'Fetching Currect Location and other details.',
    );
    const handleError = error => {
      console.error('Unhandled error in checkout:', error);
      setHasError(true);
    };

    // Add global error handler
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      if (args[0]?.includes?.('Checkout')) {
        handleError(args[0]);
      }
    };

    hideLoading('fetching_data');
  }, []);

  const loadInitialData = async () => {
    try {
      showLoading();
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      loadUserCurrentLocation();
      if (!UserProfileID) {
        showModal(
          'Login Required',
          'Please login to continue with checkout.',
          'warning',
          'Login',
          () => {
            hideModal();
            navigation.navigate('Login');
          },
        );
        return;
      }

      // Load payment methods and tip amounts
      await Promise.all([
        loadPaymentMethods(UserProfileID),
        loadAddressData(UserProfileID),
      ]);
      hideLoading();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setState(prevState => ({
        ...prevState,
        error: 'Failed to load checkout data. Please try again.',
      }));
    }
  };

  const loadPaymentMethods = async UserProfileID => {
    try {
      const iconMap = {
        'Credit Card': 'card',
        'Debit Card': 'card',
        UPI: 'phone-portrait', // PhonePe icon
        'Cash on Delivery': 'cash',
      };

      // const response = await axios.get(
      //   URL_key +
      //     'api/ProductApi/gPaymentMethod?UserProfileID=' +
      //     UserProfileID,
      //   {
      //     headers: {
      //       'content-type': `application/json`,
      //     },
      //   },
      // );
      const response = {
        data: PAYMENT_MOCK_DATA,
      };

      const modifiedData = response.data.PaymentMethodList.map(item => ({
        ...item,
        icon: iconMap[item.PaymentMethod] || 'help-circle-outline',
      }));

      const updatedPaymentMethods = modifiedData.map(item => ({
        ...item,
        isCheck: false,
      }));

      const updatedTipAmountList = response.data.TipAmountList.map(item => ({
        ...item,
        isCheck: false,
      }));

      setState(prevState => ({
        ...prevState,
        TipAmountList: updatedTipAmountList,
        PaymentMethodList: updatedPaymentMethods,
      }));
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const loadAddressData = async UserProfileID => {
    try {
      console.log('📍 Loading address data for user:', UserProfileID);

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

      console.log('📍 Address response:', addressResponse.data);

      if (addressResponse.data && addressResponse.data.length > 0) {
        const preferredAddress = addressResponse.data.find(
          data => data.IsPreferred === true,
        );

        const selectedAddress = preferredAddress || addressResponse.data[0];
        const selectedAddressID = selectedAddress.AddressID;

        console.log('📍 Selected address:', {
          addressID: selectedAddressID,
          isPreferred: !!preferredAddress,
          totalAddresses: addressResponse.data.length,
        });

        // Set the address ID for payment processing
        setState(prevState => ({
          ...prevState,
          AddressID: selectedAddressID,
        }));

        // Validate coordinates if available
        if (selectedAddress.Latitude && selectedAddress.Longitude) {
          const latitude = Number(selectedAddress.Latitude);
          const longitude = Number(selectedAddress.Longitude);

          if (isValidCoordinate(latitude, longitude)) {
            console.log('📍 Valid coordinates:', {latitude, longitude});
          } else {
            console.warn('⚠️ Invalid coordinates received:', {
              latitude,
              longitude,
            });
            setState(prevState => ({
              ...prevState,
              error:
                'Invalid delivery address coordinates. Please update your address.',
            }));
          }
        }
      } else {
        console.warn('⚠️ No addresses found for user');

        setState(prevState => ({
          ...prevState,
          error: 'No delivery address found. Please add an address first.',
        }));
      }
    } catch (error) {
      console.error('❌ Failed to load address data:', error);

      setState(prevState => ({
        ...prevState,
        error: 'Failed to load address data. Please try again.',
      }));
    }
  };

  // Helper function to validate coordinates
  const isValidCoordinate = (lat, lng) => {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  // Payment processing
  const processPayment = async () => {
    try {
      if (state.paymentProcessing) {
        console.log('Payment already in progress');
        return;
      }

      BookingDebugger.log('Starting payment process', {}, 'info');
      console.log('🔄 Starting payment process...');

      // Validate booking prerequisites
      const validation = await BookingDebugger.validateBookingPrerequisites();
      if (!validation.isValid) {
        BookingDebugger.log(
          'Booking prerequisites validation failed',
          validation,
          'error',
        );
        showModal('Error', validation.message, 'error');
        return;
      }

      // Basic validations
      if (!state.PaymentMethodID) {
        setState(prevState => ({
          ...prevState,
          PaymentMethodIDerror: true,
        }));
        return;
      }

      if (state.TipAmount && !reg2.test(state.TipAmount)) {
        setState(prevState => ({
          ...prevState,
          TipAmountErrior: true,
        }));
        return;
      }

      // Set payment processing state
      setState(prevState => ({
        ...prevState,
        paymentProcessing: true,
        loading: true,
        PaymentMethodIDerror: false,
        TipAmountErrior: false,
      }));

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const SystemUser = await AsyncStorage.getItem('FullName');
      const SystemDate = moment().format('YYYY-MM-DD hh:mm:ss A');

      BookingDebugger.trackPayment('User data retrieved', {
        UserProfileID,
        SystemUser,
        SystemDate,
      });

      // Check payment method
      const selectedPaymentMethod = state.PaymentMethodList.find(
        method => method.PaymentMethodID === state.PaymentMethodID,
      );

      if (!selectedPaymentMethod) {
        throw new Error('Invalid payment method selected');
      }

      if (selectedPaymentMethod.PaymentMethod === 'UPI') {
        await initiatePhonePePayment(UserProfileID, SystemUser, SystemDate);
      } else {
        await processRegularPayment(UserProfileID, SystemUser, SystemDate);
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error);
      BookingDebugger.log(
        'Payment error',
        {
          error: error.message,
          stack: error.stack,
        },
        'error',
      );

      setState(prevState => ({
        ...prevState,
        loading: false,
        paymentProcessing: false,
        fail: true,
      }));

      showModal(
        'Payment Failed',
        'Unable to process payment. Please try again.',
        'error',
        'Back to Cart',
        () => {
          hideModal();
          navigation.push('Cart');
        },
      );
    }
  };

  const initiatePhonePePayment = async (
    UserProfileID,
    SystemUser,
    SystemDate,
  ) => {
    try {
      setState(prevState => ({...prevState, loading: true}));

      // Get latest cart ID
      const cartResponse = await axios.get(
        URL_key + 'api/ProductApi/gLatestCardID?UserProfileID=' + UserProfileID,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      // Generate order data
      const orderId = `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const totalAmount =
        parseFloat(state.TotalUnitPrice || 0) +
        parseFloat(state.TipAmount || 0);
      const mobileNumber =
        (await AsyncStorage.getItem('MobileNumber')) || '9999999999';

      // Try PhonePe SDK first
      try {
        console.log('Attempting PhonePe SDK payment...');

        const initResult = await PhonePePaymentSDK.init(
          'SANDBOX',
          MERCHANT_ID,
          null,
          true,
        );
        console.log('initResult', initResult);
        // await PhonePePaymentSDK.init(
        //   environmentForSDK,
        //   merchantId,
        //   appId,
        //   isDebuggingEnabled,
        // ).then(result => {
        //   // handle promise
        // });

        if (initResult) {
          const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: orderId,
            merchantUserId: '90223250',
            amount: Math.round(totalAmount * 100),
            redirectUrl: 'fybr://payment/redirect',
            redirectMode: 'POST',
            callbackUrl: 'fybr://payment/callback',
            mobileNumber: mobileNumber,
            paymentInstrument: {
              type: 'PAY_PAGE',
            },
          };

          const endpoint = '/pg/v1/pay';
          const checksum = await PhonePeService.generateChecksum(
            payload,
            endpoint,
          );
          const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
            'base64',
          );

          // const transactionResult = await PhonePePaymentSDK.startTransaction(
          //   base64Payload,
          //   checksum,
          //   null,
          //   'fybr',
          // );
          let transactionResultStatus = '';
          const transactionResult = await PhonePePaymentSDK.startTransaction(
            base64Payload,
            checksum,
            null,
            'fybr',
          ).then(a => {
            transactionResultStatus = a;
            console.log(a);
          });

          console.log('PhonePe result:', transactionResult);

          if (transactionResultStatus?.status === 'SUCCESS') {
            await savePaymentToBackend(orderId, {
              cartID: cartResponse.data.cartID,
              UserProfileID,
              SystemUser,
              SystemDate,
              PaymentMethodID: state.PaymentMethodID,
              TipAmount: state.TipAmount,
              AddressID: state.AddressID,
              TotalUnitPrice: state.TotalUnitPrice,
              TransactionID: orderId,
            });

            showModal(
              'Payment Successful',
              'Your order has been placed successfully!',
              'success',
              'View Orders',
              () => {
                hideModal();
                navigation.push('Orders');
              },
            );
            setState(prevState => ({...prevState, loading: false}));
            return;
          }
        }
      } catch (phonepeError) {
        console.log(
          'PhonePe SDK failed, trying alternative payment...',
          phonepeError,
        );
      }

      // Fallback: Process as regular payment
      console.log('Processing as regular payment...');

      // Calculate final payment amount including tip
      const baseAmount = state.TotalUnitPrice || 0;
      const tipAmount = parseFloat(state.TipAmount || 0);
      const finalPaymentAmount = baseAmount + tipAmount;

      const paymentData = {
        CartID: cartResponse.data.cartID,
        UserProfileID: UserProfileID,
        PaymentMethodID: state.PaymentMethodID,
        AddressID: state.AddressID,
        TipAmount: tipAmount,
        PaymentAmount: finalPaymentAmount,
        SystemUser: SystemUser,
        SystemDate: SystemDate,
        TransactionID: orderId,
        // Additional fields for backend
        Subtotal: route?.params?.data?.Subtotal || 0,
        DiscountedPrice: route?.params?.data?.DiscountedPrice || 0,
        DeliveryFee: route?.params?.data?.DeliveryFee || 0,
        ConvenienceFee: route?.params?.data?.ConvenienceFee || 0,
        PackagingFee: route?.params?.data?.PackagingFee || 0,
        ItemCount: route?.params?.data?.ItemCount || 0,
        StoreCount: route?.params?.data?.StoreCount || 0,
        OriginalTotal: route?.params?.data?.OriginalTotal || 0,
        FinalTotal: finalPaymentAmount,
      };

      console.log('💳 PhonePe fallback payment data:', paymentData);

      const response = await axios.post(
        URL_key + 'api/ProductApi/sPayment',
        paymentData,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      setState(prevState => ({...prevState, loading: false}));

      if (response.data === 'INSERTED' || response.data === 'UPDATED') {
        showModal(
          'Order Placed Successfully',
          'Your order has been placed successfully!',
          'success',
          'View Orders',
          () => {
            hideModal();
            navigation.push('Orders');
          },
        );
      } else {
        setState(prevState => ({...prevState, fail: true}));
      }
    } catch (error) {
      setState(prevState => ({...prevState, loading: false}));
      console.error('Payment error:', error);
      showModal(
        'Payment Error',
        'Unable to process payment. Please try again.',
        'error',
        'Back to Cart',
        () => {
          hideModal();
          navigation.push('Cart');
        },
      );
    }
  };

  const processRegularPayment = async (
    UserProfileID,
    SystemUser,
    SystemDate,
  ) => {
    try {
      const cartResponse = await axios.get(
        URL_key + 'api/ProductApi/gLatestCardID?UserProfileID=' + UserProfileID,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      if (!cartResponse.data) {
        throw new Error('Invalid cart data received');
      }

      const finalAmount = calculateFinalAmount();
      const paymentData = {
        CartID: cartResponse.data,
        UserProfileID: UserProfileID,
        Subtotal: route?.params?.data?.Subtotal || 0,
        DiscountedPrice: route?.params?.data?.DiscountedPrice || 0,
        DeliveryFee: route?.params?.data?.DeliveryFee || 0,
        ConvenienceFee: route?.params?.data?.ConvenienceFee || 0,
        PackagingFee: route?.params?.data?.PackagingFee || 0,
        ItemCount: route?.params?.data?.ItemCount || 0,
        StoreCount: route?.params?.data?.StoreCount || 0,
        OriginalTotal: route?.params?.data?.OriginalTotal || 0,
        FinalTotal: finalAmount,
        PaymentMethodID: state.PaymentMethodID,
        AddressID: state.AddressID,
        TipAmount: parseFloat(state.TipAmount) || 0,
        PaymentAmount: finalAmount,
        BaseDeliveryFee:
          route?.params?.data?.DeliveryFeeDetails?.BaseDeliveryFee || 0,
        AdditionDistanceFee:
          route?.params?.data?.DeliveryFeeDetails?.AdditionDistanceFee || 0,
        ConvenienceFee:
          route?.params?.data?.DeliveryFeeDetails?.ConvenienceFee || 0,
        PackagingFee:
          route?.params?.data?.DeliveryFeeDetails?.PackagingFee || 0,
        RainyWeatherBaseFee:
          route?.params?.data?.DeliveryFeeDetails?.RainyWeatherBaseFee || 0,
        AdditionalDistanceKM:
          route?.params?.data?.DeliveryFeeDetails?.AdditionalDistanceKM || 0,
        CouponID: route?.params?.data?.CouponID || 0,
        DiscountTypeID: route?.params?.data?.DiscountTypeID || 0,
        CouponDiscount: route?.params?.data?.CouponDiscount || 0,
        CouponDiscountAmount: route?.params?.data?.CouponDiscountAmount || 0,
        SystemUser: SystemUser,
        SystemDate: SystemDate,
      };

      // BookingDebugger.trackApiCall(
      //   '/api/ProductApi/sPayment',
      //   paymentData,
      //   {},
      //   true,
      // );
      console.log('💳 Regular payment data:', paymentData);

      const response = await axios.post(
        URL_key + 'api/ProductApi/sPayment',
        paymentData,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      BookingDebugger.trackApiCall(
        '/api/ProductApi/sPayment',
        paymentData,
        response.data,
        response.data === 'INSERTED' || response.data === 'UPDATED',
      );

      setState(prevState => ({
        ...prevState,
        loading: false,
        paymentProcessing: false,
      }));

      if (response.data === 'INSERTED' || response.data === 'UPDATED') {
        BookingDebugger.log(
          'Payment successful',
          {
            paymentData,
            response: response.data,
          },
          'success',
        );

        showModal(
          'Order Placed Successfully! 🎉',
          'Your order has been placed successfully!',
          'success',
          'View Orders',
          () => {
            hideModal();
            navigation.push('Orders');
          },
        );
      } else {
        throw new Error('Payment failed: ' + response.data);
      }
    } catch (error) {
      console.error('❌ Regular payment error:', error);
      BookingDebugger.log(
        'Payment error',
        {
          error: error.message,
          stack: error.stack,
        },
        'error',
      );

      setState(prevState => ({
        ...prevState,
        loading: false,
        paymentProcessing: false,
        fail: true,
      }));

      showModal(
        'Payment Failed',
        'Payment processing failed. Please try again.',
        'error',
      );
    }
  };

  const handlePaymentResult = useCallback(
    async (paymentStatus, transactionId, paymentData) => {
      try {
        if (paymentStatus === 'SUCCESS') {
          await savePaymentToBackend(transactionId, paymentData);
          showModal(
            'Payment Successful! 🎉',
            'Your order has been placed successfully!',
            'success',
            'View Orders',
            () => {
              hideModal();
              navigation.push('Orders');
            },
          );
        } else if (paymentStatus === 'FAILED') {
          showModal(
            'Payment Failed',
            'Your payment could not be processed. Please try again.',
            'error',
          );
        } else if (paymentStatus === 'CANCELLED') {
          showModal(
            'Payment Cancelled',
            'You have cancelled the payment.',
            'warning',
          );
        }
      } catch (error) {
        console.error('Payment result handling error:', error);
        setState(prevState => ({...prevState, fail: true}));
      }
    },
    [navigation],
  );

  const savePaymentToBackend = async (transactionId, paymentData) => {
    try {
      console.log('💾 Saving payment to backend...');

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const SystemUser = await AsyncStorage.getItem('FullName');
      const SystemDate = moment().format('YYYY-MM-DD hh:mm:ss A');

      const cartResponse = await axios.get(
        URL_key + 'api/ProductApi/gLatestCardID?UserProfileID=' + UserProfileID,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      // Calculate final payment amount including tip
      const baseAmount = state.TotalUnitPrice || 0;
      const tipAmount = parseFloat(state.TipAmount || 0);
      const finalPaymentAmount = baseAmount + tipAmount;

      const backendPaymentData = {
        CartID: cartResponse.data,
        UserProfileID: UserProfileID,
        PaymentMethodID: state.PaymentMethodID,
        AddressID: state.AddressID,
        TipAmount: tipAmount,
        PaymentAmount: finalPaymentAmount,
        SystemUser: SystemUser,
        SystemDate: SystemDate,
        TransactionID: transactionId,
        // Additional fields for backend
        Subtotal: route?.params?.data?.Subtotal || 0,
        DiscountedPrice: route?.params?.data?.DiscountedPrice || 0,
        DeliveryFee: route?.params?.data?.DeliveryFee || 0,
        ConvenienceFee: route?.params?.data?.ConvenienceFee || 0,
        PackagingFee: route?.params?.data?.PackagingFee || 0,
        ItemCount: route?.params?.data?.ItemCount || 0,
        StoreCount: route?.params?.data?.StoreCount || 0,
        OriginalTotal: route?.params?.data?.OriginalTotal || 0,
        FinalTotal: finalPaymentAmount,
      };

      console.log('💾 Backend payment data:', backendPaymentData);

      BookingDebugger.trackApiCall(
        '/api/ProductApi/sPayment (backend)',
        backendPaymentData,
        {},
        true,
      );

      const response = await axios.post(
        URL_key + 'api/ProductApi/sPayment',
        backendPaymentData,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      console.log('💾 Backend payment response:', response.data);

      BookingDebugger.trackApiCall(
        '/api/ProductApi/sPayment (backend)',
        backendPaymentData,
        response.data,
        response.data === 'INSERTED' || response.data === 'UPDATED',
      );

      if (response.data !== 'INSERTED' && response.data !== 'UPDATED') {
        throw new Error('Backend payment save failed');
      }

      BookingDebugger.log(
        'Backend payment saved successfully',
        {
          transactionId,
          response: response.data,
        },
        'success',
      );
    } catch (error) {
      console.error('❌ Backend payment save error:', error);
      BookingDebugger.log(
        'Backend payment save error',
        {
          error: error.message,
          transactionId,
        },
        'error',
      );
      throw error;
    }
  };

  // Selection handlers
  const handleTipAmountSelection = useCallback(
    selectedItem => {
      if (selectedItem.isCheck !== true) {
        const updatedList = state.TipAmountList.map(item1 => ({
          ...item1,
          isCheck: item1.TipAmount === selectedItem.TipAmount,
        }));

        setState(prevState => ({
          ...prevState,
          TipAmountList: updatedList,
          TipAmount: selectedItem.TipAmount,
        }));
      }
    },
    [state.TipAmountList],
  );

  const handlePaymentMethodSelection = useCallback(
    selectedItem => {
      if (selectedItem.isCheck !== true) {
        const updatedList = state.PaymentMethodList.map(item1 => ({
          ...item1,
          isCheck: item1.PaymentMethodID === selectedItem.PaymentMethodID,
        }));

        setState(prevState => ({
          ...prevState,
          PaymentMethodList: updatedList,
          PaymentMethodID: selectedItem.PaymentMethodID,
        }));
      }
    },
    [state.PaymentMethodList],
  );

  // Render components
  const renderTipAmountItem = ({item}) => (
    <TouchableOpacity onPress={() => handleTipAmountSelection(item)}>
      <View
        style={{
          borderRadius: wp('50%'),
          borderWidth: 1,
          borderColor: '#00afb5',
          marginTop: hp('1%'),
          backgroundColor: item.isCheck ? '#00afb5' : '#ffff',
          width: wp('8%'),
          height: wp('8%'),
          marginLeft: wp('1%'),
        }}>
        <Text
          style={{
            fontSize: 10,
            textAlign: 'center',
            color: item.isCheck ? '#ffff' : '#333',
            fontFamily: 'Poppins-SemiBold',
            marginTop: hp('1.2%'),
          }}>
          {item.TipAmount}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPaymentMethodItem = ({item}) => (
    <TouchableOpacity onPress={() => handlePaymentMethodSelection(item)}>
      <View style={{flexDirection: 'row', width: wp('43%')}}>
        <View
          style={{
            width: hp('2%'),
            height: hp('2%'),
            borderRadius: wp('100%'),
            borderColor: '#00afb5',
            borderWidth: 1,
            marginLeft: wp('5%'),
            marginTop: hp('3%'),
            backgroundColor: item.isCheck ? '#00afb5' : 'transparent',
          }}
        />

        <Icon
          name={item.icon}
          color={'#00afb5'}
          size={20}
          style={{
            marginLeft: wp('3%'),
            padding: hp('1%'),
            marginTop: hp('2%'),
          }}
        />

        <Text
          style={{
            fontSize: 15,
            color: '#333',
            fontFamily: 'Poppins-SemiBold',
            marginLeft: wp('3%'),
            marginTop: hp('2.7%'),
          }}>
          {item.PaymentMethod === 'UPI' ? 'PhonePe' : item.PaymentMethod}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Check if MapView is available
  const isMapViewAvailable = () => {
    try {
      return typeof MapView !== 'undefined' && MapView;
    } catch (error) {
      console.error('MapView not available:', error);
      return false;
    }
  };

  // Simple location display component (no MapView)
  const LocationDisplay = ({latitude, longitude}) => (
    <View
      style={{
        height: hp('20%'),
        width: wp('80%'),
        alignSelf: 'center',
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
      }}>
      <Icon name="location" color="#00afb5" size={40} />
      <Text
        style={{
          color: '#495057',
          fontSize: 14,
          fontFamily: 'Poppins-Medium',
          marginTop: 10,
          textAlign: 'center',
        }}>
        Delivery Location
      </Text>
      <Text
        style={{
          color: '#6c757d',
          fontSize: 12,
          fontFamily: 'Poppins-Light',
          marginTop: 5,
          textAlign: 'center',
        }}>
        Lat: {latitude?.toFixed(6)}, Lng: {longitude?.toFixed(6)}
      </Text>
    </View>
  );

  try {
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
          {state.error && (
            <View
              style={{
                backgroundColor: '#ffebee',
                padding: 15,
                margin: 10,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#f44336',
              }}>
              <Text
                style={{
                  color: '#c62828',
                  fontSize: 14,
                  fontFamily: 'Poppins-Medium',
                }}>
                {state.error}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setState(prevState => ({...prevState, error: null}))
                }
                style={{
                  alignSelf: 'flex-end',
                  marginTop: 5,
                }}>
                <Text style={{color: '#00afb5', fontSize: 12}}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}
          <Dialog
            visible={state.fail}
            title="Payment Failed"
            onTouchOutside={() =>
              setState(prevState => ({
                ...prevState,
                fail: false,
                paymentProcessing: false,
              }))
            }
            dialogStyle={{
              backgroundColor: '#ffff',
              width: wp('70%'),
              alignSelf: 'center',
              borderRadius: wp('2%'),
            }}>
            <View style={{alignItems: 'center'}}>
              {/* <Image
                source={require('../Images/payment-failed.png')}
                style={{
                  width: 60,
                  height: 60,
                  marginBottom: 10,
                }}
              /> */}

              <Text
                style={{
                  fontSize: 15,
                  color: '#333',
                  fontFamily: 'Poppins-Medium',
                  textAlign: 'center',
                  marginTop: hp('2%'),
                }}>
                Payment processing failed. Please try again.
              </Text>
              <TouchableOpacity
                style={[
                  styles.SubmitButtonStyledd,
                  {backgroundColor: '#ff4444'},
                ]}
                activeOpacity={0.5}
                onPress={() =>
                  setState(prevState => ({
                    ...prevState,
                    fail: false,
                    paymentProcessing: false,
                  }))
                }>
                <Text
                  style={{
                    color: '#ffff',
                    textAlign: 'center',
                    fontSize: 15,
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </Dialog>

          <HeaderWithAddress
            navigation={navigation}
            handleBackPress={() => navigation.push('Tab')}
          />

          {/* Map View with Error Handling */}
          <View style={{marginTop: hp('2%')}}>
            {state.Latitude &&
            state.Longitude &&
            isValidCoordinate(state.Latitude, state.Longitude) &&
            !state.mapError &&
            isMapViewAvailable() &&
            !state.disableMapView ? (
              <View
                style={{
                  height: hp('20%'),
                  width: wp('80%'),
                  alignSelf: 'center',
                }}>
                {(() => {
                  try {
                    return (
                      <MapView
                        style={styles.map}
                        initialRegion={{
                          latitude: state.Latitude,
                          longitude: state.Longitude,
                          latitudeDelta: 0.0922,
                          longitudeDelta: 0.0421,
                        }}>
                        <Marker
                          coordinate={{
                            latitude: state.Latitude,
                            longitude: state.Longitude,
                          }}
                          title={'My Location'}
                        />
                      </MapView>
                    );
                  } catch (error) {
                    console.error('MapView rendering error:', error);
                    return <View></View>;
                  }
                })()}
              </View>
            ) : state.Latitude &&
              state.Longitude &&
              isValidCoordinate(state.Latitude, state.Longitude) ? (
              <LocationDisplay
                latitude={state.Latitude}
                longitude={state.Longitude}
              />
            ) : (
              <View
                style={{
                  height: hp('20%'),
                  width: wp('80%'),
                  alignSelf: 'center',
                  backgroundColor: '#ffffff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 8,
                }}>
                <Icon name="location" color="#00afb5" size={40} />
                <Text
                  style={{
                    color: '#666',
                    fontSize: 12,
                    fontFamily: 'Poppins-Light',
                    marginTop: 10,
                    textAlign: 'center',
                  }}>
                  {state.mapError
                    ? 'Map temporarily unavailable'
                    : 'Loading delivery location...'}
                </Text>
              </View>
            )}
          </View>
          <CenteredView>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',

                width: wp('90%'),
                alignItems: 'center',
                margin: 'auto',
                justifyContent: 'space-between',
                // marginTop: hp('2%'),
                // width: '100%',
              }}>
              <Icon
                name="location"
                color={'#00afb5'}
                size={40}
                style={{
                  // marginLeft: wp('7%'),
                  padding: hp('1%'),
                  marginTop: hp('2%'),
                }}
              />

              <Text
                style={{
                  fontSize: 17,
                  color: '#333',
                  fontFamily: 'Poppins-SemiBold',
                  // marginLeft: wp('18%'),
                  // marginTop: hp('-7%'),
                }}>
                Delivery Address
              </Text>

              <Icon
                onPress={() => navigation.push('AddressList')}
                name="chevron-forward-outline"
                color={'#00afb5'}
                size={40}
                style={{
                  alignSelf: 'flex-end',
                  padding: hp('1%'),
                  marginTop: hp('-7.5%'),
                  marginRight: wp('3%'),
                }}
              />
            </View>
          </CenteredView>

          {/* Debug button to toggle MapView */}

          <Text
            style={{
              fontSize: 15,
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginLeft: wp('7%'),
              marginTop: hp('3%'),
            }}>
            Tip Amount
          </Text>

          <TextInput
            placeholder="Enter tip amount"
            placeholderTextColor="#999"
            keyboardType="numeric"
            fontSize={11}
            maxLength={6}
            onChangeText={value => handleInputChange('TipAmount', value)}
            style={{
              padding: hp('0.5%'),
              marginLeft: wp('9%'),
              width: wp('30%'),
              marginTop: hp('1.5%'),
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              marginLeft: wp('40'),
              marginTop: hp('-5%'),
            }}>
            <FlatList
              data={state.TipAmountList}
              horizontal={true}
              renderItem={renderTipAmountItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>

          {state.TipAmountErrior && (
            <Text
              style={{
                fontSize: 10,
                color: 'red',
                fontFamily: 'Poppins-Medium',
                marginLeft: wp('9%'),
                marginTop: hp('1%'),
              }}>
              Please enter valid tip amount
            </Text>
          )}

          {/* Order Summary */}
          <View
            style={{
              marginTop: hp('3%'),
              marginHorizontal: wp('7%'),
            }}>
            <View style={{marginBottom: hp('1%')}}>
              <View
                style={{
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
                      fontSize: 14,
                      color: '#333',
                      fontFamily: 'Poppins-Medium',
                    }}>
                    Total Amount
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#333',
                      fontFamily: 'Poppins-Medium',
                    }}>
                    ₹ {state.TotalUnitPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Text
            style={{
              fontSize: 15,
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginLeft: wp('7%'),
              marginTop: hp('3%'),
            }}>
            Payment Method
          </Text>

          <FlatList
            data={state.PaymentMethodList}
            renderItem={renderPaymentMethodItem}
            keyExtractor={(item, index) => index.toString()}
          />

          {state.PaymentMethodIDerror && (
            <Text
              style={{
                fontSize: 10,
                color: 'red',
                fontFamily: 'Poppins-Medium',
                marginLeft: wp('7%'),
                marginTop: hp('1%'),
              }}>
              Please select payment method
            </Text>
          )}

          <TouchableOpacity
            activeOpacity={0.5}
            disabled={
              state.loading || !state.TotalUnitPrice || state.paymentProcessing
            }
            onPress={processPayment}>
            <View
              style={{
                backgroundColor:
                  state.loading || state.paymentProcessing
                    ? '#cccccc'
                    : '#00afb5',
                width: wp('80%'),
                height: hp('5%'),
                alignSelf: 'center',
                marginTop: hp('5%'),
                marginBottom: hp('2%'),
                borderRadius: wp('2%'),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {state.loading || state.paymentProcessing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  style={{
                    color: '#ffff',
                    textAlign: 'center',
                    fontSize: 15,
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  Get it delivered - ₹{calculateFinalAmount()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('Checkout component error:', error);
    setHasError(true);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    fontSize: Normalize(11),
    color: 'red',
    marginBottom: hp('2%'),
    fontFamily: 'Poppins-Light',
    marginLeft: wp('4%'),
  },
  SubmitButtonStyledd: {
    paddingTop: hp('0.5%'),
    paddingBottom: hp('0.5%'),
    paddingLeft: wp('10%'),
    paddingRight: wp('10%'),
    backgroundColor: '#00afb5',
    alignSelf: 'center',
    marginTop: hp('3%'),
    borderRadius: wp('1%'),
    marginLeft: wp('4%'),
  },
  map: {
    flex: 1,
    borderRadius: 8,
  },
  cartItemsContainer: {
    marginHorizontal: wp('7%'),
    marginTop: hp('3%'),
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: hp('2%'),
  },
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: hp('1%'),
  },
  productImage: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  productAttributes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  productInfo: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    color: '#666',
  },
  quantityPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  quantityText: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    color: '#666',
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
});

export default Checkout;
