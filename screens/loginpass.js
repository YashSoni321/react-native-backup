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
class LoginPass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      MobileNumber: null,
      Password: null,
      hidePassword: true,
      PasswordError: false,
      MobileNumberError: false,
      reg: false,
      fail: false,
      notexist: false,
      passwordwrong: false,
      loader: false,
      IsNotificationEnable: '',
      wishes: null,
      MobileNumber: null,

      reg: false,
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
    const mreg = /^[0-9]*$/;
    this.setState({ MobileNumberError: false, PasswordError: false });
    if (this.state.MobileNumber == null) {
      this.setState({ MobileNumberError: true });
    } else if (this.state.Password == null) {
      this.setState({ PasswordError: true });
    } else {
      this.setState({ MobileNumberError: false, PasswordError: false });
      // this.props.navigation.push('Tab');
      const a = {
        MobileNumber: this.state.MobileNumber,
        Password: this.state.Password,
      };

      axios
        .post(URL_key + 'api/UserSignUpApi/ValidateLogin', a, {
          headers: {
            'content-type': `application/json`,
          },
        })
        .then(response => {
          console.log(response.data);
          console.log(response.status);
          if (response.data.LoginStatus == 'VALID') {
            AsyncStorage.setItem(
              'LoginUserProfileID',
              response.data.UserProfileID.toString(),
            );
            AsyncStorage.setItem('EmailID', response.data.EmailID.toString());
            AsyncStorage.setItem('FullName', response.data.FullName.toString());
            AsyncStorage.setItem(
              'MobileNumber',
              this.state.MobileNumber.toString(),
            );
            AsyncStorage.setItem('isLogin', 'true');
            this.props.navigation.push('Tab');
          } else {
            this.setState({ fail1: true });
          }
        })
        .catch(err => {
          console.log(err);
          this.setState({ fail: true });
        });
      console.log(a);
      // this.props.navigation.push('Otp');
    }
  }
  async componentDidMount() {
    // const value = await AsyncStorage.getItem('isLogin');
    // console.log(value);
    // if (value !== null || value == 'true') {
    //   this.props.navigation.push('Tab');
    // } else {
    //   this.props.navigation.navigate('login');
    // }
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
    var MobileNumber = await AsyncStorage.getItem('MobileNumber');
    // console.log(MobileNumber);
    this.setState({ MobileNumber: MobileNumber });
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
              OOPS !! Invalid Login
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
          <ImageBackground
            style={{ height: hp('100%') }}
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
                marginTop: hp('4%'),
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
                marginTop: hp('3%'),
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
                marginTop: hp('4%'),
                // marginBottom: hp('1%'),
                // marginLeft: wp('10%'),
                // marginRight: wp('3%'),
              }}>
              LOGIN
            </Text>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() =>
                this.setState({
                  MobileNumberError: !this.state.MobileNumberError,
                })
              }>
              <View
                style={{
                  // justifyContent: 'center',
                  borderWidth: wp('0.3%'),
                  borderRadius: wp('5%'),
                  // padding: 5,
                  height: hp('5%'),
                  // marginBottom: hp('3%'),
                  borderColor: '#00afb5',
                  marginTop: hp('7%'),
                  backgroundColor: '#fffedb',

                  width: wp('80%'),
                  alignSelf: 'center',
                  flexDirection: 'row',
                  // paddingLeft: wp('12%'),a
                  alignItems: 'center',
                }}>
                <Icon
                  style={{
                    // width: wp('10%'),
                    // marginRight: hp('2%'),
                    // marginTop: hp('-4.2%'),
                    // marginLeft: wp('-16%'),
                    // paddingLeft: wp('-4%'),
                    paddingLeft: wp('5%'),
                  }}
                  // onPress={this.setPasswordVisibility}
                  activeOpacity={0.5}
                  name="ios-phone-portrait"
                  color={'#00afb5'}
                  size={hp('3%')}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#333',
                    fontFamily: 'WorkSans-Regular',
                    fontSize: Normalize(12),
                    marginLeft: wp('3%'),
                  }}>
                  {this.state.MobileNumber}
                </Text>
              </View>
            </TouchableOpacity>
            {this.state.MobileNumberError == true ? (
              <Text style={styles.errorMessage}>
                * Mobile Number cannot change.
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
                marginTop: hp('7%'),
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
                    // marginLeft: wp('2%'),s
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
                // keyboardType={'number-pad'}
                // fontSize={14}
                maxLength={200}
                onChangeText={value =>
                  this.handleInputChange('Password', value)
                }
                style={{
                  // paddingLeft: wp('1%'),
                  padding: hp('0.5%'),
                  marginLeft: wp('2%'),
                  width: wp('60%'),
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              />
            </View>
            <Text
              onPress={() => {
                console.log('szjj');
                this.props.navigation.push('forgetpas');
              }}
              style={{
                fontSize: 13,
                textAlign: 'right',
                justifyContent: 'center',
                fontFamily: 'Poppins-SemiBold',
                marginTop: hp('2%'),
                color: '#00afb5',
                marginRight: wp('10%'),
                // marginBottom: hp('5%'),
              }}>
              Forgot Password?
            </Text>
            {this.state.PasswordError == true ? (
              <Text style={styles.errorMessage}>* Please enter password</Text>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                // this.setState({loader:true})
                // this.props.navigation.push('signup');
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
                  LOGIN{' '}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Separator />
            <Text
              onPress={() => this.props.navigation.push('signup1')}
              style={{
                fontFamily: 'Poppins-Light',
                fontSize: 13,
                textAlign: 'center',
                justifyContent: 'center',
                marginTop: hp('5%'),
                color: '#333',
              }}>
              Don't have an Account?
            </Text>
            <View>
              <Text
                onPress={() => {
                  console.log('szjj');
                  this.props.navigation.push('signup1');
                }}
                style={{
                  fontSize: 13,
                  textAlign: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Poppins-SemiBold',
                  marginTop: hp('1%'),
                  color: '#00afb5',
                  marginBottom: hp('5%'),
                }}>
                Sign Up
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
    marginTop: hp('3%'),
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

export default LoginPass;
