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
  DeviceEventEmitter, KeyboardAvoidingView
} from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Normalize from '../Size/size';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';
navigator.geolocation = require('@react-native-community/geolocation');
import { useFocusEffect } from '@react-navigation/native';
import { API_KEY, URL_key } from '../Api/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
class Otp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      OTPError: false,
      OTP: null,
      hidePassword: true,
      PasswordError: false,
      EmailError: false,
      success: false,
      fail: false,
      notexist: false,
      passwordwrong: false,
      loader: false,
      MobileNumber: null,
                  OTP1: this.props.route?.params?.data?.otp || null,
      // OTP1: '12345',
      EmailID: '',
      OtherCountry: '',
      invalid: false,
      time: {},
      seconds: 30,
      expired: false,
      DeviceToken: null,
      devnam: null,
    };
    console.log(this.state.OTP1);
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
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
    this.setState({ OTPError: false });
    if (this.state.OTP == null) {
      this.setState({ OTPError: true });
    } else {
      this.setState({ OTPError: false });
      const a = {
        MobileNumber: this.state.MobileNumber,
        OTP: this.state.OTP

      };
      console.log(a)
      axios
        .post(URL_key + 'api/LoginApi/ValidateOTP', a, {
          headers: {
            'content-type': `application/json`,
          },
        })
        .then(response => {
          clearInterval(this.timer);
          console.log(response.data);


          if (
            response.data.OTPStatus == 'VALID' &&
            response.data.LoginStatus == 'VALID'
          ) {
            clearInterval(this.timer);
            AsyncStorage.setItem(
              'LoginUserProfileID',
              response.data.LoginUserProfileID.toString(),
            );
            AsyncStorage.setItem('EmailID', response.data.EmailID.toString());
            AsyncStorage.setItem('FullName', response.data.FullName.toString());
            AsyncStorage.setItem(
              'MobileNumber',
              this.state.MobileNumber.toString(),
            );
            AsyncStorage.setItem('isLogin', 'true');
            this.props.navigation.push('Tab');
          } else if (
            response.data.OTPStatus == 'VALID' &&
            (response.data.LoginStatus == 'NOTVALID')
          ) {
            AsyncStorage.removeItem('banner');
            clearInterval(this.timer);
            this.props.navigation.push('signup');
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
          console.log(err);
        });
      // this.props.navigation.push('Otp');
    }
  }
  async componentDidMount() {
    this.startTimer();
    var MobileNumber = await AsyncStorage.getItem('MobileNumber');
    // console.log(MobileNumber);
    this.setState({ MobileNumber: MobileNumber });
    let timeLeftVar = this.secondsToTime(this.state.seconds);
    this.setState({ time: timeLeftVar });
  }
  secondsToTime(secs) {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      h: hours,
      m: minutes,
      s: seconds,
    };
    return obj;
  }
  startTimer() {
    if (this.timer == 0 && this.state.seconds > 0) {
      this.timer = setInterval(this.countDown, 1000);
    }
  }

  countDown() {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds - 1;
    this.setState(
      {
        time: this.secondsToTime(seconds),
        seconds: seconds,
      },
      () => {
        if (this.state.time.m == 0 && this.state.time.s == 0) {
          clearInterval(this.timer);
          // this.setState({ expired: true });
        }
      },
    );
    // console.log(this.state.time);
    // Check if we're at zero.
    if (seconds == 0) {
      clearInterval(this.timer);
    }
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 80 : 100}
          keyboardShouldPersistTaps="handled"
        >
          <ScrollView>
            <SafeAreaView>
                                  {/* NavigationEvents replaced with useFocusEffect in functional components */}
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
                      source={require('../Images/accepted-removebg-preview.png')}
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
              <Dialog
                visible={this.state.expired}
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
                    source={require('../Images/1024px-Cross_red_circle.svg-removebg-preview.png')}
                  />
                </View>
                <Text
                  style={{
                    color: 'red',
                    fontSize: 15,
                    fontFamily: 'CalibriRegular',
                    textAlign: 'center',
                    marginTop: hp('2%'),
                    marginBottom: hp('1%'),
                    // lineHeight: hp('2.5%'),
                  }}>
                  OOPS! Your OTP Expired.
                </Text>
                <TouchableOpacity
                  style={styles.SubmitButtonStyledd}
                  activeOpacity={0.5}
                  onPress={() => {
                    this.setState({ expired: false }, () => {
                      this.props.navigation.push('Login');
                    });
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: 'white',
                      fontFamily: 'CalibriBold',
                      fontSize: 16,
                    }}>
                    {' '}
                    OK{' '}
                  </Text>
                </TouchableOpacity>
              </Dialog>
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
              <View style={{ backgroundColor: "#ffffff", height: hp('100%') }}>

                <Icon
                  style={
                    {
                      // width: wp('10%'),
                      // marginRight: hp('2%'),
                      marginTop: hp('5%'),
                      marginLeft: wp('5%'),
                      // paddingLeft: wp('-4%'),
                    }
                  }
                  onPress={() => {
                    this.props.navigation.push('Login')
                  }}
                  activeOpacity={0.5}
                  name="chevron-back"
                  color={'#00afb5'}
                  size={hp('5%')}
                />

                <Text
                  style={{
                    color: '#00afb5',
                    fontSize: 14,
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    marginTop: hp('5%'),
                    // marginBottom: hp('1%'),
                    marginLeft: wp('8%'), marginRight: wp('3%'),
                  }}>
                  Enter OTP received via SMS
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    // textAlign: "justify",
                    //   justifyContent: 'center',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('0.5%'),
                    marginBottom: hp('2%'),
                    marginLeft: wp('8%'),
                    // marginRight: wp('8%'),
                  }}>
                  we've sent an OTP to +91 {this.state.MobileNumber}
                </Text>
                <Text
                  style={{
                    color: '#333',
                    fontSize: 11,
                    fontFamily: 'Poppins-Light',
                    // textAlign: 'center',
                    marginTop: hp('8%'),
                    marginBottom: hp('5%'),
                    marginLeft: wp('10%'),
                    // marginRight: wp('3%'),
                  }}>
                  OTP *
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    textAlign: "right",
                    //   justifyContent: 'center',
                    color: '#00afb5',
                    fontFamily: 'Poppins-SemiBold',
                    // marginTop: hp('-3.7%'),
                    marginBottom: hp('-9%'),
                    // marginLeft: wp('10%'),
                    marginRight: wp('5%'),
                  }}>
                  00 : {this.state.time.s}
                </Text>
                <View
                  style={{
                    justifyContent: 'center',
                    borderBottomWidth: 2,
                    // borderRadius: wp('5%'),
                    // padding: 5,
                    height: hp('5.5%'),
                    // marginBottom: hp('3%'),
                    borderColor: '#00afb5',
                    marginTop: hp('5%'),
                    // backgroundColor: '#ffff',

                    width: wp('60%'),
                    // alignSelf: 'center',
                    // flexDirection: 'row',
                    // paddingLeft: wp('12%'),a
                    alignItems: 'center',
                    marginLeft: wp('10%'),
                    // backgroundColor: '#52c4ff',
                  }}>

                  <TextInput
                    placeholder="Enter OTP"
                    fontFamily={'Poppins-Light'}
                    placeholderTextColor={'#666'}
                    color={'#333'}
                    keyboardType={'number-pad'}
                    fontSize={14}
                    maxLength={6}
                    onChangeText={value =>
                      this.handleInputChange('OTP', value)
                    }
                    style={{
                      // paddingLeft: wp('1%'),
                      padding: hp('0.5%'),
                      // marginLeft: wp('2%'),
                      width: wp('60%'),
                      alignItems: 'center',
                      alignSelf: 'center', textAlign: "center"
                    }}
                  />
                </View>


                <Text
                  onPress={() => {
                    this.props.navigation.push("Login")
                  }}
                  style={{
                    fontSize: 8,
                    // textAlign: "justify",
                    //   justifyContent: 'center',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('1%'),
                    // marginBottom: hp('2%'),
                    marginLeft: wp('10%'),
                    marginRight: wp('0%'), textDecorationLine: "underline"
                  }}>
                  Enter phone number again
                </Text>
                <Text
                  onPress={() => {
                    this.props.navigation.push("Login")
                    // console.log("khdsk")
                  }}
                  style={{
                    fontSize: 8,
                    textAlign: "right",
                    //   justifyContent: 'center',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('-2%'),
                    marginBottom: hp('2%'),
                    // marginLeft: wp('10%'),
                    marginRight: wp('5%'), textDecorationLine: "underline"
                  }}>
                  Resend OTP
                </Text>
                {this.state.OTPError == true ? (
                  <Text style={styles.errorMessage}>
                    * Please enter OTP.
                  </Text>
                ) : null}
                {this.state.invalid == true ? (
                  <Text style={styles.errorMessage}>
                    * Please enter valid OTP.
                  </Text>
                ) : null}
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    this.check()
                    // this.props.navigation.push("signup")
                  }}>
                  <View
                    style={{
                      backgroundColor: '#00afb5',
                      width: wp('80%'),
                      height: hp('5%'),
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'center',
                      borderRadius: wp('2%'),
                      marginTop: hp('12%'),
                      marginBottom: hp('1.5%'),
                      borderColor: '#216e66',
                      // borderWidth: 1,
                    }}>
                    <Text
                      style={{
                        color: '#ffff',
                        fontSize: 11,
                        fontFamily: 'Poppins-SemiBold',
                        textAlign: 'center',
                        // marginTop: hp('-2%'),
                        // marginBottom: hp('2.5%'),
                        // marginLeft:wp('5%'),marginRight:wp('3%'),
                      }}>
                      Continue
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 6,
                    textAlign: "center",
                    //   justifyContent: 'center',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    // marginTop: hp('2%'),
                    marginBottom: hp('9%'),
                    // marginLeft: wp('8%'),
                    // marginRight: wp('8%'),
                  }}>
                  <Text
                    style={{
                      fontSize: 6,
                      textAlign: "justify",
                      //   justifyContent: 'center',
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                      marginTop: hp('2%'),
                      marginBottom: hp('2%'),
                      marginLeft: wp('8%'),
                      marginRight: wp('8%'),
                    }}>
                    By registering you agree to our {' '}
                  </Text>
                  <Text
                    onPress={() => {
                      clearInterval(this.timer);
                      this.props.navigation.push('Terms', {
                        data: {
                          Data: "otp",
                          otp: this.state.OTP1,
                        },
                      });

                    }}
                    style={{
                      fontSize: 6,
                      textAlign: "justify",
                      //   justifyContent: 'center',
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                      marginTop: hp('2%'),
                      marginBottom: hp('2%'),
                      marginLeft: wp('8%'),
                      marginRight: wp('8%'), textDecorationLine: "underline"
                    }}>
                    Terms
                  </Text>
                  <Text
                    style={{
                      fontSize: 6,
                      textAlign: "justify",
                      //   justifyContent: 'center',
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                      marginTop: hp('2%'),
                      marginBottom: hp('2%'),
                      marginLeft: wp('8%'),
                      marginRight: wp('8%'),
                    }}>
                    {' '}and{' '}
                  </Text>
                  <Text
                    onPress={() => {
                      clearInterval(this.timer);
                      this.props.navigation.push('Terms', {
                        data: {
                          Data: "otp",
                          otp: this.state.OTP1,
                        },
                      });

                    }}
                    style={{
                      fontSize: 6,
                      textAlign: "justify",
                      //   justifyContent: 'center',
                      color: '#333',
                      fontFamily: 'Poppins-Light',
                      marginTop: hp('2%'),
                      marginBottom: hp('2%'),
                      marginLeft: wp('8%'),
                      marginRight: wp('8%'), textDecorationLine: "underline"
                    }}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </SafeAreaView>
          </ScrollView>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const Separator = () => <View style={styles.separator} />;
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: '#333',
    borderBottomWidth: 0.7,
    marginTop: hp('5%'),
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
    fontSize: Normalize(11),
    color: 'red',
    // textAlign: 'center',
    marginTop: hp('4%'),
    fontFamily: 'Poppins-Light',
    marginLeft: wp('10%'),
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

export default Otp;
