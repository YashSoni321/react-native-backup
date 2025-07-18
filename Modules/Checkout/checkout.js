import React, {useState, useEffect, useCallback} from 'react';
import {Buffer} from 'buffer';
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
  BackHandler,
  ActivityIndicator,
  TouchableHighlight,
  DeviceEventEmitter,
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
const reg2 = /^[0-9]+$/;

export const MERCHANT_ID = 'PGTESTPAYUAT86';
export const SALT_KEY = '96434309-7796-489d-8924-ab56988a6076';

const Checkout = ({navigation, route}) => {
  // Add error boundary
  const {showLoading, hideLoading} = useLoading();
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text
          style={{
            fontSize: 16,
            color: '#333',
            textAlign: 'center',
            marginBottom: 20,
          }}>
          Something went wrong with the checkout.
        </Text>
        <TouchableOpacity
          onPress={() => {
            setHasError(false);
            navigation.goBack();
          }}
          style={{
            backgroundColor: '#00afb5',
            padding: 15,
            borderRadius: 8,
          }}>
          <Text style={{color: 'white', fontSize: 14}}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  // State management
  const [state, setState] = useState({
    PaymentMethodList: [],
    TipAmountList: [],
    PaymentMethodID: null,
    TipAmount: null,
    AddressID: null,
    TipAmountErrior: false,
    PaymentMethodIDerror: false,
    TotalUnitPrice: route?.params?.data?.TotalUnitPrice || 0,
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
  });

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
      Alert.alert('Error', 'Invalid checkout data. Please return to cart.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
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
        Alert.alert('Error', 'Please login to continue with checkout.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
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

      // const stateResponse = await axios.get(
      //   URL_key + 'api/AddressApi/gStateList',
      //   {
      //     headers: {
      //       'content-type': `application/json`,
      //     },
      //   },
      // );

      const preferredAddress = addressResponse.data.filter(
        data => data.IsPreferred === true,
      );

      if (preferredAddress.length > 0) {
        const address = preferredAddress[0];
        const latitude = Number(address.Latitude);
        const longitude = Number(address.Longitude);

        // Validate coordinates
        if (isValidCoordinate(latitude, longitude)) {
          // setState(prevState => ({
          //   ...prevState,
          //   Latitude: latitude,
          //   Longitude: longitude,
          //   AddressID: address.AddressID,
          // }));
        } else {
          console.warn('Invalid coordinates received:', {latitude, longitude});
          setState(prevState => ({
            ...prevState,
            error:
              'Invalid delivery address coordinates. Please update your address.',
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load address data:', error);
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
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const SystemUser = await AsyncStorage.getItem('FullName');
      const SystemDate = moment().format('YYYY-MM-DD hh:mm:ss A');

      setState(prevState => ({
        ...prevState,
        PaymentMethodIDerror: false,
        TipAmountErrior: false,
      }));

      // Validation
      if (state.TipAmount != null && reg2.test(state.TipAmount) !== true) {
        setState(prevState => ({
          ...prevState,
          TipAmountErrior: true,
        }));
        return;
      }

      if (state.PaymentMethodID == null) {
        setState(prevState => ({
          ...prevState,
          PaymentMethodIDerror: true,
        }));
        return;
      }

      // Check if PhonePe payment method is selected
      const selectedPaymentMethod = state.PaymentMethodList.find(
        method => method.PaymentMethodID === state.PaymentMethodID,
      );

      if (
        selectedPaymentMethod &&
        selectedPaymentMethod.PaymentMethod === 'UPI'
      ) {
        await initiatePhonePePayment(UserProfileID, SystemUser, SystemDate);
      } else {
        await processRegularPayment(UserProfileID, SystemUser, SystemDate);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
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

            Alert.alert(
              'Payment Successful',
              'Your order has been placed successfully!',
              [{text: 'OK', onPress: () => navigation.push('Orders')}],
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
      return;
      // Fallback: Process as regular payment
      console.log('Processing as regular payment...');

      const paymentData = {
        CartID: cartResponse.data.cartID,
        UserProfileID: UserProfileID,
        PaymentMethodID: state.PaymentMethodID,
        AddressID: state.AddressID,
        TipAmount: state.TipAmount,
        PaymentAmount: state.TotalUnitPrice,
        SystemUser: SystemUser,
        SystemDate: SystemDate,
        TransactionID: orderId,
      };

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
        Alert.alert(
          'Order Placed Successfully',
          'Your order has been placed successfully!',
          [{text: 'OK', onPress: () => navigation.push('Orders')}],
        );
      } else {
        setState(prevState => ({...prevState, fail: true}));
      }
    } catch (error) {
      setState(prevState => ({...prevState, loading: false}));
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Error',
        'Unable to process payment. Please try again.',
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

      const paymentData = {
        CartID: cartResponse.data,
        UserProfileID: UserProfileID,
        PaymentMethodID: state.PaymentMethodID,
        AddressID: state.AddressID,
        TipAmount: state.TipAmount,
        PaymentAmount: state.TotalUnitPrice,
        SystemUser: SystemUser,
        SystemDate: SystemDate,
      };

      const response = await axios.post(
        URL_key + 'api/ProductApi/sPayment',
        paymentData,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      if (response.data === 'INSERTED' || response.data === 'UPDATED') {
        navigation.push('Orders');
      } else {
        setState(prevState => ({...prevState, fail: true}));
      }
    } catch (error) {
      console.error('Regular payment error:', error);
      setState(prevState => ({...prevState, fail: true}));
    }
  };

  const handlePaymentResult = useCallback(
    async (paymentStatus, transactionId, paymentData) => {
      try {
        if (paymentStatus === 'SUCCESS') {
          await savePaymentToBackend(transactionId, paymentData);
          Alert.alert(
            'Payment Successful',
            'Your order has been placed successfully!',
            [{text: 'OK', onPress: () => navigation.push('Orders')}],
          );
        } else if (paymentStatus === 'FAILED') {
          Alert.alert(
            'Payment Failed',
            'Your payment could not be processed. Please try again.',
          );
        } else if (paymentStatus === 'CANCELLED') {
          Alert.alert('Payment Cancelled', 'You have cancelled the payment.');
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

      const backendPaymentData = {
        CartID: cartResponse.data,
        UserProfileID: UserProfileID,
        PaymentMethodID: state.PaymentMethodID,
        AddressID: state.AddressID,
        TipAmount: state.TipAmount,
        PaymentAmount: state.TotalUnitPrice,
        SystemUser: SystemUser,
        SystemDate: SystemDate,
        TransactionID: transactionId,
      };

      const response = await axios.post(
        URL_key + 'api/ProductApi/sPayment',
        backendPaymentData,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      if (response.data !== 'INSERTED' && response.data !== 'UPDATED') {
        throw new Error('Backend payment save failed');
      }
    } catch (error) {
      console.error('Backend payment save error:', error);
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
        <ScrollView>
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
              setState(prevState => ({...prevState, fail: false}))
            }
            dialogStyle={{
              backgroundColor: '#ffff',
              width: wp('70%'),
              alignSelf: 'center',
              borderRadius: wp('2%'),
            }}>
            <View style={{alignItems: 'center'}}>
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
                style={styles.SubmitButtonStyledd}
                activeOpacity={0.5}
                onPress={() =>
                  setState(prevState => ({...prevState, fail: false}))
                }>
                <Text
                  style={{
                    color: '#ffff',
                    textAlign: 'center',
                    fontSize: 15,
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </Dialog>

          <ImageBackground
            style={{width: wp('100%')}}
            activeOpacity={0.5}
            source={require('../Images/output-onlinepngtools1.png')}>
            <Text
              style={{
                fontSize: 20,
                color: '#00afb5',
                fontFamily: 'Poppins-SemiBold',
                marginTop: hp('5%'),
                marginLeft: wp('17%'),
              }}>
              Delivering to {'>'}
            </Text>

            <Icon
              onPress={() => navigation.push('Tab')}
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
                    return (
                      <LocationDisplay
                        latitude={state.Latitude}
                        longitude={state.Longitude}
                      />
                    );
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
                  backgroundColor: '#f5f5f5',
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
                {state.mapError && (
                  <TouchableOpacity
                    onPress={() => {
                      setState(prevState => ({
                        ...prevState,
                        mapError: false,
                      }));
                    }}
                    style={{
                      marginTop: 10,
                      paddingHorizontal: 15,
                      paddingVertical: 5,
                      backgroundColor: '#00afb5',
                      borderRadius: 5,
                    }}>
                    <Text style={{color: 'white', fontSize: 10}}>Retry</Text>
                  </TouchableOpacity>
                )}
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
              backgroundColor: '#f8f8f8',
              borderRadius: 8,
              padding: 15,
            }}>
            <Text
              style={{
                fontSize: 15,
                color: '#333',
                fontFamily: 'Poppins-SemiBold',
                marginBottom: hp('2%'),
              }}>
              Order Summary
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
                    fontSize: 12,
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                  }}>
                  Subtotal
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                  }}>
                  ₹ {state.Subtotal.toFixed(2)}
                </Text>
              </View>

              {state.DiscountedPrice > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: hp('1%'),
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#e74c3c',
                      fontFamily: 'Poppins-Light',
                    }}>
                    Discount
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#e74c3c',
                      fontFamily: 'Poppins-Light',
                    }}>
                    - ₹ {state.DiscountedPrice.toFixed(2)}
                  </Text>
                </View>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: hp('1%'),
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                  }}>
                  Delivery Fee
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                  }}>
                  ₹ {state.DeliveryFee.toFixed(2)}
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
                    fontSize: 12,
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                  }}>
                  Convenience Fee
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                  }}>
                  ₹ {state.ConvenienceFee.toFixed(2)}
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
                    fontSize: 12,
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                  }}>
                  Packaging Fee
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                  }}>
                  ₹ {state.PackagingFee.toFixed(2)}
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
            disabled={state.loading || !state.TotalUnitPrice}
            onPress={processPayment}>
            <View
              style={{
                backgroundColor: state.loading ? '#cccccc' : '#00afb5',
                width: wp('80%'),
                height: hp('5%'),
                alignSelf: 'center',
                marginTop: hp('5%'),
                marginBottom: hp('2%'),
                borderRadius: wp('2%'),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {state.loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  style={{
                    color: '#ffff',
                    textAlign: 'center',
                    fontSize: 15,
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  Get it delivered
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
