import React from 'react';
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
import {
  notifications,
  messages,
  NotificationMessage,
  Android,
} from 'react-native-firebase-push-notifications';
import RNLocalize from 'react-native-localize';
import {NetworkInfo} from 'react-native-network-info';

import PhoneInput from 'react-native-phone-number-input';
import axios from 'axios';

navigator.geolocation = require('@react-native-community/geolocation');
import DeviceInfo from 'react-native-device-info';
import {useFocusEffect} from '@react-navigation/native';
import {API_KEY, URL_key} from '../Api/api';
class Terms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Terms: null,
      Data: this.props.route?.params?.data?.Data || null,
      OTP1: this.props.route?.params?.data?.otp || null,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  handleInputChange = (inputName, inputValue) => {
    this.setState(state => ({...state, [inputName]: inputValue}));
    // if (inputName == 'UserName') {
    //   this.setState({EmailError: true});
    // } else if (inputName == 'Password') {
    //   this.setState({PasswordError: true});
    // } else {
    //   this.setState({EmailError: false});
    //   this.setState({PasswordError: false});
    // }
  };
  componentWillMount() {
    console.log('Terms Data', this.state.Data);
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }
  handleBackButtonClick() {
    // this.props.navigation.push('agent');

    BackHandler.exitApp();
    return true;
  }
  async componentDidMount() {
    axios
      .get(URL_key + 'api/ProductApi/gFybrTerms', {
        headers: {
          'content-type': `application/json`,
        },
      })
      .then(response => {
        this.setState({Terms: response.data[0].Content});
        // console.log(response.data[0].Content)
      })
      .catch(err => {
        console.log(err);
      });
  }
  render() {
    return (
      <ScrollView>
        <SafeAreaView>
          {/* NavigationEvents replaced with useFocusEffect in functional components */}
          <Icon
            onPress={() => {
              if (this.state.Data == 'otp') {
                this.props.navigation.push(this.state.Data, {
                  data: {
                    otp: this.state.OTP1,
                  },
                });
              } else {
                this.props.navigation.push(this.state.Data);
              }
            }}
            name="chevron-back"
            color={'#00afb5'}
            size={40}
            style={{
              marginLeft: wp('4%'),
              padding: hp('1%'),
              marginTop: hp('3%'),
            }}
          />
          <Text
            style={{
              fontSize: 20,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#00afb5',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('-5.5%'),
              marginBottom: hp('2%'),
              marginLeft: wp('20%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            TERMS & CONDITION
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Effective Date: November 01, 2024
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Welcome to Fybr! These Terms and Conditions ("Terms") govern your
            access to and use of our platform, services, and products. By
            registering an account on Fybr, you agree to these Terms. If you do
            not agree, please refrain from using our services.
          </Text>
          <Separator />
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            1. Registration and Account Responsibilities
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Eligibility
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            You must be at least 18 years old to register and use Fybr. By
            creating an account, you confirm that you meet this age requirement.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Account Information
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            You agree to provide accurate, complete, and up-to-date information
            during registration. Failure to do so may result in the suspension
            or termination of your account.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Account Security
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. Notify us immediately of any unauthorized use of your
            account.
          </Text>
          <Separator />
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            2. Use of Services
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Permitted Use
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            You may use Fybr solely for personal, non-commercial purposes in
            accordance with these Terms.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Prohibited Activities
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            You agree not to:
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Misuse the platform for fraudulent activities.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Interfere with the platform’s security or operation.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Use bots or automated systems to access Fybr.
          </Text>
          <Separator />
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            3. Orders and Payments
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Order Accuracy
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            Ensure that the details of your order are accurate. Fybr is not
            responsible for errors caused by incorrect information provided
            during checkout.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Payment
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            All payments must be made via the methods provided on the platform.
            Fybr reserves the right to cancel orders if payment is not received
            or verified.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Refund and Cancellation
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            Please refer to the store's Refund and Cancellation Policy for
            details.
          </Text>
          <Separator />

          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            4. Delivery
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Delivery Timeframes
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            Fybr provides one day delivery for all orders. However, delays due
            to unforeseen circumstances are not our responsibility.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Delivery Charges
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            Convenience and delivery charges, if applicable, will be displayed
            at checkout.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Failed Deliveries
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            If a delivery fails due to customer unavailability or incorrect
            address, additional fees may apply.
          </Text>
          <Separator />
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            5. Returns and Refunds
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Store-Specific Policies
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            Fybr follows the return and refund policies of the respective stores
            from which the products are purchased. Customers are encouraged to
            review the store’s policy, which will be accessible on the product
            or store page, before initiating a return or refund request.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Requesting a Return or Refund
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            All requests must be made through the Fybr platform. Once a request
            is submitted, Fybr will facilitate communication with the store to
            process the return or refund in accordance with the store’s policy.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Conditions for Returns
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            Returns will only be accepted if they meet the criteria outlined in
            the respective store’s policy. Examples may include:
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Items in unused, original condition.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Requests made within the store’s 3 days after delivery.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Refund Processing
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            Refunds will be initiated within 3–4 business days. Processing of
            the refund is handled directly by the respective store, in
            accordance with their policies. Fybr acts solely as a facilitator
            and is not responsible for any delays or discrepancies caused by the
            store.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              // marginTop: hp('1%'),
              marginBottom: hp('0%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Exceptions
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            {' '}
            Some products, such as personalized or intimate items, may not be
            eligible for returns. Customers should refer to the store’s policy
            for specific details.
          </Text>
          <Separator />

          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            6. Privacy and Data Protection
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Wevalue your privacy. Our Privacy Policy explains how we collect,
            use, and protect your personal information. By registering, you
            agree to this policy.
          </Text>
          <Separator />
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            7. Limitation of Liability
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Fybr is not liable for:
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Any indirect, incidental, or consequential damages.
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Delays or failures beyond our control, including natural disasters
            or technical issues.
          </Text>
          <Separator />

          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            8. Changes to Terms and Services
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            Fybr reserves the right to update these Terms and modify or
            discontinue services at any time. Users will be notified of
            significant changes. Continued use of the platform constitutes
            acceptance of updated Terms.
          </Text>
          <Separator />

          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            9. Governing Law
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            These Terms are governed by the laws of Hyderabad. Any disputes
            shall be resolved in the courts of Hyderabad.
          </Text>
          <Separator />

          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            10. Contact Information
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            For questions or concerns, please contact us at:
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            <Text
              style={{
                fontSize: 13,
                // textAlign: "center",
                //   justifyContent: 'center',
                color: '#333',
                fontFamily: 'Poppins-Medium',
                // marginTop: hp('1%'),
                marginBottom: hp('2%'),
                marginLeft: wp('10%'),
                marginRight: wp('5%'),
                // marginRight: wp('5%'),
              }}>
              Email :{'  '}
            </Text>
            <Text
              onPress={() => Linking.openURL('mailto:info@fybrnow.com')}
              style={{
                fontSize: 13,
                // textAlign: "center",
                //   justifyContent: 'center',
                color: 'blue',
                fontFamily: 'Poppins-Light',
                // marginTop: hp('1%'),
                marginBottom: hp('2%'),
                marginLeft: wp('10%'),
                marginRight: wp('5%'),
                // marginRight: wp('5%'),
              }}>
              info@fybrnow.com
            </Text>
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              // marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
              // marginRight: wp('5%'),
            }}>
            By registering on Fybr, you acknowledge and agree to these Terms and
            Conditions
          </Text>
        </SafeAreaView>
      </ScrollView>
    );
  }
}

const Separator = () => <View style={styles.separator} />;
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: '#333',
    borderBottomWidth: 0.7,
    marginTop: hp('0%'),
    width: wp('80%'),
    alignSelf: 'center',
  },
  SubmitButtonStyle: {
    marginTop: hp('5%'),
    paddingTop: hp('0.5%'),
    paddingBottom: hp('0.5%'),
    backgroundColor: '#9f8054',
    borderRadius: wp('10%'),
    marginLeft: wp('20%'),
    marginRight: wp('20%'),
    borderColor: 'white',

    borderWidth: 1,
  },
  linearGradient: {
    flex: 1,
    // paddingLeft: 15,
    // paddingRight: 15,
    // borderRadius: 5,
    height: hp('90%'),
    // width: hp('60%'),
    // borderRadius: wp('20'),
    marginTop: hp('-25%'),
    // width: wp('110%'),
    borderRadius: wp('20%'),
    // marginLeft: wp('-14%'),
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  errorMessage: {
    fontSize: Normalize(12),
    color: 'red',
    textAlign: 'center',
    marginTop: hp('2%'),
    fontFamily: 'Poppins-Light',
    marginBottom: hp('-2.5%'),
  },
  SubmitButtonStyledd: {
    paddingTop: hp('0.5%'),
    paddingBottom: hp('0.5%'),
    backgroundColor: 'red',
    borderRadius: wp('5%'),
    width: wp('25%'),
    alignSelf: 'center',
    marginTop: hp('2%'),
    // marginLeft: wp('3%'),
    marginBottom: hp('3%'),
  },
});

export default Terms;
