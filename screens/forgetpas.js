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
} from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Normalize from './size';
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

var date = moment().format('YYYY/MM/DD ');
var time = moment().format('hh:mm A');
import ImagePicker from 'react-native-image-crop-picker';
import { CustomPicker } from 'react-native-custom-picker';

import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import axios from 'axios';
import GetLocation from 'react-native-get-location';
import publicIP from 'react-native-public-ip';
import RNLocation from 'react-native-location';
import * as geolib from 'geolib';
import LinearGradient from 'react-native-linear-gradient';
navigator.geolocation = require('@react-native-community/geolocation');
import DeviceInfo from 'react-native-device-info';
import { NavigationEvents } from 'react-navigation';
// import messaging from '@react-native-firebase/messaging';
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import firebase from '../screens/firebase';
import { API_KEY, URL_key } from './api';
class ForgetPas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Name: null,
      Nameerror: false,
      Email: null,
      EmailError: false,
      MobileNumber: null,
      MobileNumbererror: false,
      Password: null,
      PasswordError: false,
      ConfirmPassword: null,
      ConfirmPasswordError: false,
      hidePassword: true,
      reg: false,
      fail: false,
      notexist: false,
      passwordwrong: false,
      loader: false,
      IsNotificationEnable: '',
      wishes: null,
      matcerror: false,
      mreg: false,
      OTP: null,
      OTPError: false,
      verified: false,
      invalid: false,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  handleInputChange = (inputName, inputValue) => {
    this.setState(state => ({ ...state, [inputName]: inputValue }));
    // if (inputName == 'UserName') {
    //   this.setState({EmailError: true});
    // } else if (inputName == 'Password') {
    //   this.setState({PasswordError: true});
    // } else {
    //   this.setState({EmailError: false});
    //   this.setState({PasswordError: false});
    // }
  };
  setPasswordVisibility = () => {
    this.setState({ hidePassword: !this.state.hidePassword });
  };
  check() {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const reg1 =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    const reg2 = /^[0-9]*$/;
    this.setState({
      Nameerror: false,
      EmailError: false,
      reg: false,
      MobileNumbererror: false,
      PasswordError: false,
      mreg: false,
      ConfirmPasswordError: false,
      matcerror: false,
      Mobiecan: false,
      regp1: false,
      regp2: false,
      verie: false,
    });
    if (this.state.MobileNumber == null) {
      this.setState({ MobileNumbererror: true });
    } else if (this.state.MobileNumber.length != 10) {
      this.setState({ mreg: true });
    } else if (reg2.test(this.state.MobileNumber) != true) {
      this.setState({ mreg: true });
    } else if (this.state.verified == false) {
      this.setState({ verie: true });
    } else if (this.state.Password == null) {
      this.setState({ PasswordError: true });
    } else if (reg1.test(this.state.Password) != true) {
      this.setState({ regp1: true });
    } else if (this.state.ConfirmPassword == null) {
      this.setState({ ConfirmPasswordError: true });
    } else if (reg1.test(this.state.ConfirmPassword) != true) {
      this.setState({ regp2: true });
    } else if (this.state.ConfirmPassword != this.state.Password) {
      this.setState({ matcerror: true });
    } else {
      this.setState({
        Nameerror: false,
        EmailError: false,
        reg: false,
        MobileNumbererror: false,
        PasswordError: false,
        mreg: false,
        ConfirmPasswordError: false,
        matcerror: false,
        Mobiecan: false,
        regp1: false,
        regp2: false,
        verie: false,
      });
      var SystemDate = moment().format('YYYY-MM-DD 00:00:00');
      const a = {
        MobileNumber: this.state.MobileNumber,
        SystemDate: SystemDate,
        Password: this.state.Password,
        PasswordSalt: this.state.Password,
        SystemUser: 'System',
      };
      console.log(a);
      axios
        .post(URL_key + 'api/UserSignUpApi/ResetPassword', a, {
          headers: {
            'content-type': `application/json`,
          },
        })
        .then(response => {
          console.log(response.data);
          console.log(response.status);
          if (response.data == 'NOTEXISTS') {
            this.setState({
              fail1: true,
              verie: false,
              orxc: false,
              verified: false,
            });
          } else if (response.data == 'UPDATED') {
            AsyncStorage.setItem(
              'MobileNumber',
              this.state.MobileNumber.toString(),
            );
            this.setState({ success: true });
          } else {
            this.setState({
              fail: true,
              verie: false,
              orxc: false,
              verified: false,
            });
          }
        })
        .catch(err => {
          console.log(err);
          this.setState({ fail: true });
        });
    }
  }
  async componentDidMount() {
    var today = new Date();
    var curHr = today.getHours();

    if (curHr < 12) {
      this.setState({ wishes: 'Good Morning' });
      // console.log('good morning')
    } else if (curHr < 18) {
      this.setState({ wishes: 'Good Afternoon' });
      // console.log('good afternoon')
    } else {
      this.setState({ wishes: 'Good Evening' });
      // console.log('good evening')
    }

    // const token = await notifications.getToken();
    // console.log(token)
  }
  componentWillMount() {
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
  render() {
    return (
      <ScrollView>
        <SafeAreaView>
          <NavigationEvents
            onWillFocus={this._onFocus}
            onWillBlur={this._onBlurr}
          />
          <Dialog
            visible={this.state.fail}
            dialogStyle={{
              borderRadius: wp('5%'),
              width: wp('80%'),
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
                  //  borderWidth: 1,
                  height: hp('6%'),
                  width: hp('6%'),
                  // borderColor: 'forestgreen',
                  borderRadius: hp('100%'),
                  alignSelf: 'center',
                  justifyContent: 'center',
                  // marginTop: hp('-1%'),
                  // marginBottom: hp('1%'),
                }}
                resizeMode="contain"
                source={require('../assets/1024px-Cross_red_circle.svg-removebg-preview.png')}
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
                this.setState({ fail: false }, () => {
                  // this.props.navigation.push('signup');
                });
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 16,
                }}>
                {' '}
                OK{' '}
              </Text>
            </TouchableOpacity>
          </Dialog>
          <Dialog
            visible={this.state.fail1}
            dialogStyle={{
              borderRadius: wp('5%'),
              width: wp('80%'),
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
                  //  borderWidth: 1,
                  height: hp('6%'),
                  width: hp('6%'),
                  // borderColor: 'forestgreen',
                  borderRadius: hp('100%'),
                  alignSelf: 'center',
                  justifyContent: 'center',
                  // marginTop: hp('-1%'),
                  // marginBottom: hp('1%'),
                }}
                resizeMode="contain"
                source={require('../assets/1024px-Cross_red_circle.svg-removebg-preview.png')}
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
              OOPS !! Mobile Number does not exist.
            </Text>
            <TouchableOpacity
              style={styles.SubmitButtonStyledd}
              activeOpacity={0.5}
              onPress={() => {
                this.setState({ fail1: false }, () => {
                  // this.props.navigation.push('signup');
                });
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 16,
                }}>
                {' '}
                OK{' '}
              </Text>
            </TouchableOpacity>
          </Dialog>
          <Dialog
            visible={this.state.success}
            dialogStyle={{
              borderRadius: wp('5%'),
              width: wp('95%'),
              alignSelf: 'center',
            }}
            onTouchOutside={() => console.log('no')}>
            <ScrollView>
              <View
                style={{
                  alignItems: 'center',
                  // marginTop: hp('2%'),
                  marginBottom: hp('0.5%'),
                }}>
                <Image
                  style={{
                    //  borderWidth: 1,
                    height: hp('7%'),
                    width: hp('7%'),
                    // borderColor: 'forestgreen',
                    borderRadius: hp('100%'),
                    alignSelf: 'center',
                    justifyContent: 'center',
                    marginTop: hp('3%'),
                    // marginBottom: hp('1%'),
                  }}
                  resizeMode="contain"
                  source={require('../assets/accepted-removebg-preview.png')}
                />
              </View>
              <Text
                style={{
                  color: 'green',
                  fontSize: 15,
                  fontFamily: 'WorkSans-Bold',
                  textAlign: 'center',
                  marginTop: hp('2%'),
                  marginBottom: hp('1%'),
                  lineHeight: hp('2.5%'),
                  marginLeft: wp('3%'),
                  marginRight: wp('3%'),
                }}>
                Password Updated Successfully.
              </Text>

              <TouchableOpacity
                style={styles.SubmitButtonStyled}
                activeOpacity={0.5}
                onPress={() => {
                  this.setState({ success: false }, () => {
                    this.props.navigation.push('LoginPass', {
                      // data: {
                      //   StudentID: this.state.StudentID,
                      //   StudentDetailID: this.state.StudentDetailID,
                      // },
                    });
                  });
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: 'white',
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 16,
                  }}>
                  {' '}
                  OK{' '}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Dialog>
          <ImageBackground
            style={{ width: wp('100%') }}
            activeOpacity={0.5}
            source={require('../assets/output-onlinepngtools1.png')}
            resizeMode="cover">
            <Image
              style={{
                //  borderWidth: 1,
                height: hp('12%'),
                width: wp('85%'),
                // borderColor: 'forestgreen',
                // borderRadius: hp('100%'),
                alignSelf: 'center',
                justifyContent: 'center',
                // backgroundColor:"lightgrey"s
                marginTop: hp('3%'),
                // marginBottom: hp('1%'),
                //   marginLeft:wp('17.5%')
              }}
              resizeMode="contain"
              source={require('../assets/FYBR-Logo-removebg-preview.png')}
            />
            <Text
              style={{
                color: '#00afb5',
                fontSize: 18,
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
                marginTop: hp('2%'),
                marginBottom: hp('1%'),
                // marginLeft:wp('5%'),marginRight:wp('3%'),
              }}>
              Hi, {this.state.wishes}
            </Text>
            <Text
              style={{
                color: '#333',
                fontSize: 20,
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
                marginTop: hp('2%'),
                // marginBottom: hp('1%'),
                // marginLeft: wp('10%'),
                // marginRight: wp('3%'),
              }}>
              RESET PASSWORD
            </Text>

            <View
              style={{
                justifyContent: 'center',
                borderWidth: wp('0.2%'),
                borderRadius: wp('5%'),
                // padding: 5,
                height: hp('5.5%'),
                // marginBottom: hp('3%'),
                borderColor: '#00afb5',
                marginTop: hp('5%'),
                backgroundColor: '#ffff',

                width: wp('65%'),
                // alignSelf: 'center',
                flexDirection: 'row',
                // paddingLeft: wp('12%'),a
                alignItems: 'center',
                marginLeft: wp('10%'),
                // backgroundColor: '#52c4ff',
              }}>
              <Icon
                style={
                  {
                    // width: wp('10%'),
                    // marginRight: hp('2%'),
                    // marginTop: hp('-4.2%'),
                    //   marginLeft: wp('2%'),
                    // paddingLeft: wp('-4%'),
                  }
                }
                // onPress={this.setPasswordVisibility}
                activeOpacity={0.5}
                name="phone-portrait"
                color={'#00afb5'}
                size={hp('3%')}
              />
              <TextInput
                placeholder="Enter Mobile Number"
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'#666'}
                color={'#333'}
                keyboardType={'number-pad'}
                fontSize={14}
                maxLength={10}
                onChangeText={value =>
                  this.handleInputChange('MobileNumber', value)
                }
                style={{
                  // paddingLeft: wp('1%'),
                  padding: hp('0.5%'),
                  marginLeft: wp('2%'),
                  width: wp('50%'),
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                this.setState({ mreg: false });
                const reg2 = /^[0-9]*$/;
                if (this.state.MobileNumber == null) {
                  this.setState({ MobileNumbererror: true });
                } else if (reg2.test(this.state.MobileNumber) != true) {
                  this.setState({ mreg: true });
                } else {
                  const a = {
                    MobileNumber: this.state.MobileNumber,
                  };

                  axios
                    .post(URL_key + 'api/UserSignUpApi/GenerateOTP', a, {
                      headers: {
                        'content-type': `application/json`,
                      },
                    })
                    .then(response => {
                      console.log(response.data);
                      console.log(response.status);
                      if (response.data.Status == 'GENERATED') {
                        this.setState({ orxc: true });

                        // AsyncStorage.setItem('OtherCountry', 'no');
                      } else {
                        this.setState({ fail: true });
                      }
                    })
                    .catch(err => {
                      console.log(err);
                      this.setState({ fail: true });
                    });
                }
              }}>
              <View
                style={{
                  width: wp('20%'),
                  backgroundColor:
                    this.state.orxc == true ? 'green' : '#00afb5',
                  alignSelf: 'flex-end',
                  marginTop: hp('-4%'),
                  borderRadius: wp('5%'),
                  marginRight: wp('2%'),
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 12,
                    marginTop: hp('0.3%'),
                    marginBottom: hp('0.3%'),
                  }}>
                  {this.state.orxc == true ? 'OTP SENT' : 'GET OTP'}
                </Text>
              </View>
            </TouchableOpacity>
            {this.state.MobileNumbererror == true ? (
              <Text style={styles.errorMessage}>
                * Please enter mobile number.
              </Text>
            ) : null}
            {this.state.mreg == true ? (
              <Text style={styles.errorMessage}>
                * Please enter valid mobile number.
              </Text>
            ) : null}
            {this.state.verie == true ? (
              <Text style={styles.errorMessage}>
                * Please verify mobile number.
              </Text>
            ) : null}
            <View
              style={{
                justifyContent: 'center',
                borderWidth: wp('0.2%'),
                borderRadius: wp('5%'),
                // padding: 5,
                height: hp('5.5%'),
                // marginBottom: hp('3%'),
                borderColor: '#00afb5',
                marginTop: hp('4%'),
                backgroundColor: '#ffff',

                width: wp('65%'),
                // alignSelf: 'center',
                flexDirection: 'row',
                // paddingLeft: wp('12%'),a
                alignItems: 'center',
                marginLeft: wp('10%'),
                // backgroundColor: '#52c4ff',
              }}>
              <Icon
                style={
                  {
                    // width: wp('10%'),
                    // marginRight: hp('2%'),
                    // marginTop: hp('-4.2%'),
                    //   marginLeft: wp('2%'),
                    // paddingLeft: wp('-4%'),
                  }
                }
                // onPress={this.setPasswordVisibility}
                activeOpacity={0.5}
                name="checkmark-done-circle-sharp"
                color={'#00afb5'}
                size={hp('3%')}
              />
              <TextInput
                placeholder="Enter OTP"
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'#666'}
                color={'#333'}
                keyboardType={'number-pad'}
                fontSize={14}
                maxLength={6}
                onChangeText={value => this.handleInputChange('OTP', value)}
                style={{
                  // paddingLeft: wp('1%'),
                  padding: hp('0.5%'),
                  marginLeft: wp('2%'),
                  width: wp('50%'),
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                this.setState({ verie: false });
                if (this.state.OTP == null) {
                  this.setState({ OTPError: true });
                } else {
                  const a = {
                    MobileNumber: this.state.MobileNumber,
                    OTP: this.state.OTP,
                  };

                  axios
                    .post(URL_key + 'api/UserSignUpApi/ValidateOTP', a, {
                      headers: {
                        'content-type': `application/json`,
                      },
                    })
                    .then(response => {
                      console.log(response.data);
                      console.log(response.status);
                      if (response.data.OTPStatus == 'VALID') {
                        this.setState({ verified: true });
                      } else if (response.data.OTPStatus == 'NOTVALID') {
                        this.setState({ invalid: true });
                      } else {
                        // console.log("czxbhj")
                        this.setState({ fail: true });
                      }
                    })
                    .catch(err => {
                      // clearInterval(this.timer);
                      this.setState({ fail: true });
                    });
                }
              }}>
              <View
                style={{
                  width: wp('20%'),
                  backgroundColor:
                    this.state.verified == true ? 'green' : '#00afb5',
                  alignSelf: 'flex-end',
                  marginTop: hp('-4%'),
                  borderRadius: wp('5%'),
                  marginRight: wp('2%'),
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 12,
                    marginTop: hp('0.3%'),
                    marginBottom: hp('0.3%'),
                  }}>
                  {this.state.verified == true ? 'VERIFIED' : 'VERIFY'}
                </Text>
              </View>
            </TouchableOpacity>
            {this.state.OTPError == true ? (
              <Text style={styles.errorMessage}>* Please enter OTP.</Text>
            ) : null}
            {this.state.invalid == true ? (
              <Text style={styles.errorMessage}>* Invalid OTP.</Text>
            ) : null}

            <View
              style={{
                justifyContent: 'center',
                borderWidth: wp('0.2%'),
                borderRadius: wp('5%'),
                // padding: 5,
                height: hp('5.5%'),
                // marginBottom: hp('3%'),
                borderColor: '#00afb5',
                marginTop: hp('4%'),
                backgroundColor: '#ffff',

                width: wp('80%'),
                alignSelf: 'center',
                flexDirection: 'row',
                // paddingLeft: wp('12%'),a
                alignItems: 'center',
                // backgroundColor: '#52c4ff',
              }}>
              <Icon
                style={
                  {
                    // width: wp('10%'),
                    // marginRight: hp('2%'),
                    // marginTop: hp('-4.2%'),
                    //   marginLeft: wp('2%'),
                    // paddingLeft: wp('-4%'),
                  }
                }
                // onPress={this.setPasswordVisibility}
                activeOpacity={0.5}
                name="lock-closed"
                color={'#00afb5'}
                size={hp('3%')}
              />
              <TextInput
                placeholder="Enter Password"
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'#666'}
                color={'#333'}
                secureTextEntry={this.state.hidePassword}
                // keyboardType={'number-pad'}
                fontSize={14}
                maxLength={102}
                onChangeText={value =>
                  this.handleInputChange('Password', value)
                }
                style={{
                  // paddingLeft: wp('1%'),
                  padding: hp('0.5%'),
                  marginLeft: wp('2%'),
                  width: wp('55%'),
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              />
              {this.state.hidePassword == true ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Icon
                    style={
                      {
                        // width: hp('5%'),
                        // marginRight: hp('1%'),
                        // marginTop: hp('-2%'),
                      }
                    }
                    onPress={this.setPasswordVisibility}
                    activeOpacity={0.5}
                    name="ios-eye-off-outline"
                    color={'#333'}
                    size={22}
                  />
                </View>
              ) : (
                <View style={{ alignItems: 'flex-end' }}>
                  <Icon
                    style={
                      {
                        // width: hp('5%'),
                        // marginRight: hp('1%'),
                        // marginTop: hp('-2%'),
                      }
                    }
                    onPress={this.setPasswordVisibility}
                    activeOpacity={0.5}
                    name="ios-eye-outline"
                    color={'#333'}
                    size={22}
                  />
                </View>
              )}
            </View>
            {this.state.PasswordError == true ? (
              <Text style={styles.errorMessage}>* Please enter password.</Text>
            ) : null}
            {this.state.regp1 == true ? (
              <Text style={styles.errorMessage}>
                * Your password should contain at least 1 lowercase,1
                uppercase,1 numeric character,1 special character and minimum 8
                characters and maximum 15 characters.
              </Text>
            ) : null}
            <View
              style={{
                justifyContent: 'center',
                borderWidth: wp('0.2%'),
                borderRadius: wp('5%'),
                // padding: 5,
                height: hp('5.5%'),
                // marginBottom: hp('3%'),
                borderColor: '#00afb5',
                marginTop: hp('4%'),
                backgroundColor: '#ffff',

                width: wp('80%'),
                alignSelf: 'center',
                flexDirection: 'row',
                // paddingLeft: wp('12%'),a
                alignItems: 'center',
                // backgroundColor: '#52c4ff',
              }}>
              <Icon
                style={
                  {
                    // width: wp('10%'),
                    // marginRight: hp('2%'),
                    // marginTop: hp('-4.2%'),
                    //   marginLeft: wp('2%'),
                    // paddingLeft: wp('-4%'),
                  }
                }
                // onPress={this.setPasswordVisibility}
                activeOpacity={0.5}
                name="lock-closed"
                color={'#00afb5'}
                size={hp('3%')}
              />
              <TextInput
                placeholder="Enter Confirm Password"
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'#666'}
                color={'#333'}
                // keyboardType={'number-pad'}
                secureTextEntry={this.state.hidePassword}
                fontSize={14}
                maxLength={102}
                onChangeText={value =>
                  this.handleInputChange('ConfirmPassword', value)
                }
                style={{
                  // paddingLeft: wp('1%'),
                  padding: hp('0.5%'),
                  marginLeft: wp('2%'),
                  width: wp('55%'),
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              />
              {this.state.hidePassword == true ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Icon
                    style={
                      {
                        // width: hp('5%'),
                        // marginRight: hp('1%'),
                        // marginTop: hp('-2%'),
                      }
                    }
                    onPress={this.setPasswordVisibility}
                    activeOpacity={0.5}
                    name="ios-eye-off-outline"
                    color={'#333'}
                    size={22}
                  />
                </View>
              ) : (
                <View style={{ alignItems: 'flex-end' }}>
                  <Icon
                    style={
                      {
                        // width: hp('5%'),
                        // marginRight: hp('1%'),
                        // marginTop: hp('-2%'),
                      }
                    }
                    onPress={this.setPasswordVisibility}
                    activeOpacity={0.5}
                    name="ios-eye-outline"
                    color={'#333'}
                    size={22}
                  />
                </View>
              )}
            </View>
            {this.state.ConfirmPasswordError == true ? (
              <Text style={styles.errorMessage}>
                * Please enter confirm password.
              </Text>
            ) : null}
            {this.state.matcerror == true ? (
              <Text style={styles.errorMessage}>
                * Password & Confirm password are not same.
              </Text>
            ) : null}
            {this.state.regp2 == true ? (
              <Text style={styles.errorMessage}>
                * Your password should contain at least 1 lowercase,1
                uppercase,1 numeric character,1 special character and minimum 8
                characters and maximum 15 characters.
              </Text>
            ) : null}
            {this.state.notexist == true ? (
              <Text style={styles.errorMessage}>
                * Mobile number already exists.
              </Text>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                // this.setState({loader:true})
                // this.props.navigation.push('Otp');
                this.check();
              }}>
              <LinearGradient
                colors={['#00afb5', '#00dee8']}
                style={{
                  marginTop: hp('7%'),
                  paddingTop: hp('0.5%'),
                  paddingBottom: hp('0.5%'),
                  backgroundColor: '#7e84c0',
                  borderRadius: wp('10%'),
                  marginLeft: wp('20%'),
                  marginRight: wp('20%'),
                  borderColor: 'white',
                  marginBottom: hp('4%'),
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
                  UPDATE{' '}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Separator />
            <Text
              onPress={() => this.props.navigation.push('LoginPass')}
              style={{
                fontFamily: 'Poppins-Light',
                fontSize: 13,
                textAlign: 'center',
                justifyContent: 'center',
                marginTop: hp('4%'),
                color: '#333',
              }}>
              Already have an Account?
            </Text>
            <View>
              <Text
                onPress={() => this.props.navigation.push('LoginPass')}
                style={{
                  fontSize: 13,
                  textAlign: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Poppins-SemiBold',
                  marginTop: hp('1%'),
                  color: '#00afb5',
                  marginBottom: hp('5%'),
                }}>
                Login
              </Text>
            </View>
          </ImageBackground>
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
    marginTop: hp('1.5%'),
    width: wp('70%'),
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
    marginTop: hp('3.5%'),
    fontFamily: 'Poppins-Light',
    marginLeft: wp('3%'),
    marginRight: wp('3%'),
    // marginBottom: hp('1%'),
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
  SubmitButtonStyled: {
    paddingTop: hp('0.5%'),
    paddingBottom: hp('0.5%'),
    backgroundColor: 'forestgreen',
    borderRadius: wp('5%'),
    width: wp('25%'),
    alignSelf: 'center',
    marginTop: hp('2%'),
    // marginLeft: wp('3%'),
    marginBottom: hp('3%'),
  },
});

export default ForgetPas;
