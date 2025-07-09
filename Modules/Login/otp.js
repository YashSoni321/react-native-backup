import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  KeyboardAvoidingView,
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
import axios from 'axios';
import {API_KEY, URL_key} from '../Api/api';
import apiService, {validateOTP} from '../Api/api';
navigator.geolocation = require('@react-native-community/geolocation');
import {useFocusEffect} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useLoading} from '../../shared/LoadingContext';

const Otp = ({navigation, route}) => {
  // State management using useState
  const [state, setState] = useState({
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
    OTP1: route?.params?.data?.otp || null,
    EmailID: '',
    OtherCountry: '',
    invalid: false,
    time: {},
    seconds: 30,
    expired: false,
    DeviceToken: null,
    devnam: null,
  });

  const {showLoading, hideLoading, isLoading} = useLoading();

  // Timer ref
  const timerRef = useRef(0);

  console.log(state.OTP1);

  // Update state function
  const updateState = useCallback(updates => {
    setState(prevState => ({...prevState, ...updates}));
  }, []);

  // Handle input changes
  const handleInputChange = useCallback(
    (inputName, inputValue) => {
      updateState({[inputName]: inputValue});
    },
    [updateState],
  );

  // Set password visibility
  const setPasswordVisibility = useCallback(() => {
    updateState({hidePassword: !state.hidePassword});
  }, [state.hidePassword, updateState]);

  // Check function
  const check = useCallback(() => {
    updateState({OTPError: false});

    if (state.OTP == null) {
      updateState({OTPError: true});
      return;
    }

    updateState({OTPError: false});

    const a = {
      MobileNumber: state.MobileNumber,
      OTP: state.OTP,
    };
    console.log(a);

    showLoading('validateOtp', 'Validating OTP...');

    apiService
      .validateOTP(state.MobileNumber, state.OTP)
      .then(response => {
        clearInterval(timerRef.current);
        console.log(response);
        hideLoading('validateOtp');

        if (response.OTPStatus == 'VALID' && response.LoginStatus == 'VALID') {
          clearInterval(timerRef.current);
          AsyncStorage.setItem(
            'LoginUserProfileID',
            response.LoginUserProfileID.toString(),
          );
          AsyncStorage.setItem('EmailID', response.EmailID.toString());
          AsyncStorage.setItem('FullName', response.FullName.toString());
          AsyncStorage.setItem('MobileNumber', state.MobileNumber.toString());
          AsyncStorage.setItem('isLogin', 'true');
          navigation.push('Tab');
        } else if (
          response.OTPStatus == 'VALID' &&
          response.LoginStatus == 'NOTVALID'
        ) {
          AsyncStorage.removeItem('banner');
          clearInterval(timerRef.current);
          navigation.push('Signup');
        } else if (response.OTPStatus == 'NOTVALID') {
          updateState({invalid: true});
        } else {
          updateState({fail: true});
        }
      })
      .catch(err => {
        hideLoading('validateOtp');
        updateState({fail: true});
        console.log(err);
      });
  }, [
    state.OTP,
    state.MobileNumber,
    updateState,
    navigation,
    showLoading,
    hideLoading,
  ]);

  // Convert seconds to time object
  const secondsToTime = useCallback(secs => {
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
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerRef.current == 0 && state.seconds > 0) {
      timerRef.current = setInterval(countDown, 1000);
    }
  }, [state.seconds]);

  // Count down function
  const countDown = useCallback(() => {
    let seconds = state.seconds - 1;
    updateState({
      time: secondsToTime(seconds),
      seconds: seconds,
    });

    if (seconds == 0) {
      clearInterval(timerRef.current);
    }
  }, [state.seconds, updateState, secondsToTime]);

  // Handle back button
  const handleBackButtonClick = useCallback(() => {
    BackHandler.exitApp();
    return true;
  }, []);

  // Component mount effect
  useEffect(() => {
    const initializeComponent = async () => {
      startTimer();
      var MobileNumber = await AsyncStorage.getItem('MobileNumber');
      updateState({MobileNumber: MobileNumber});
      let timeLeftVar = secondsToTime(state.seconds);
      updateState({time: timeLeftVar});
    };

    initializeComponent();

    // Add back button listener
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    // Cleanup function
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
      clearInterval(timerRef.current);
    };
  }, [startTimer, updateState, secondsToTime, handleBackButtonClick]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1}}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 80 : 100}
        keyboardShouldPersistTaps="handled">
        <ScrollView>
          <SafeAreaView>
            <Dialog
              visible={state.success}
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
                    marginBottom: hp('0.5%'),
                  }}>
                  <Image
                    style={{
                      height: hp('7%'),
                      width: hp('7%'),
                      borderRadius: hp('100%'),
                      alignSelf: 'center',
                      justifyContent: 'center',
                      marginTop: hp('3%'),
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
                    updateState({success: false}, () => {
                      navigation.push('LoginPass');
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
              visible={state.expired}
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
                  fontFamily: 'CalibriRegular',
                  textAlign: 'center',
                  marginTop: hp('2%'),
                  marginBottom: hp('1%'),
                }}>
                OOPS! Your OTP Expired.
              </Text>
              <TouchableOpacity
                style={styles.SubmitButtonStyledd}
                activeOpacity={0.5}
                onPress={() => {
                  updateState({expired: false}, () => {
                    navigation.push('Login');
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
                  updateState({fail: false});
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
            <View style={{backgroundColor: '#ffffff', height: hp('100%')}}>
              <Icon
                style={{
                  marginTop: hp('5%'),
                  marginLeft: wp('5%'),
                }}
                onPress={() => {
                  navigation.push('Login');
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
                  marginTop: hp('5%'),
                  marginLeft: wp('8%'),
                  marginRight: wp('3%'),
                }}>
                Enter OTP received via SMS
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: '#333',
                  fontFamily: 'Poppins-Light',
                  marginTop: hp('0.5%'),
                  marginBottom: hp('2%'),
                  marginLeft: wp('8%'),
                }}>
                we've sent an OTP to +91 {state.MobileNumber}
              </Text>
              <Text
                style={{
                  color: '#333',
                  fontSize: 11,
                  fontFamily: 'Poppins-Light',
                  marginTop: hp('8%'),
                  marginBottom: hp('5%'),
                  marginLeft: wp('10%'),
                }}>
                OTP *
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  textAlign: 'right',
                  color: '#00afb5',
                  fontFamily: 'Poppins-SemiBold',
                  marginBottom: hp('-9%'),
                  marginRight: wp('5%'),
                }}>
                00 : {state.time.s}
              </Text>
              <View
                style={{
                  justifyContent: 'center',
                  borderBottomWidth: 2,
                  height: hp('5.5%'),
                  borderColor: '#00afb5',
                  marginTop: hp('5%'),
                  width: wp('60%'),
                  alignItems: 'center',
                  marginLeft: wp('10%'),
                }}>
                <TextInput
                  placeholder="Enter OTP"
                  fontFamily={'Poppins-Light'}
                  placeholderTextColor={'#666'}
                  color={'#333'}
                  keyboardType={'number-pad'}
                  fontSize={14}
                  maxLength={6}
                  onChangeText={value => handleInputChange('OTP', value)}
                  style={{
                    padding: hp('0.5%'),
                    width: wp('60%'),
                    alignItems: 'center',
                    alignSelf: 'center',
                    textAlign: 'center',
                  }}
                />
              </View>

              <Text
                onPress={() => {
                  navigation.push('Login');
                }}
                style={{
                  fontSize: 8,
                  color: '#333',
                  fontFamily: 'Poppins-Light',
                  marginTop: hp('1%'),
                  marginLeft: wp('10%'),
                  marginRight: wp('0%'),
                  textDecorationLine: 'underline',
                }}>
                Enter phone number again
              </Text>
              <Text
                onPress={() => {
                  navigation.push('Login');
                }}
                style={{
                  fontSize: 8,
                  textAlign: 'right',
                  color: '#333',
                  fontFamily: 'Poppins-Light',
                  marginTop: hp('-2%'),
                  marginBottom: hp('2%'),
                  marginRight: wp('5%'),
                  textDecorationLine: 'underline',
                }}>
                Resend OTP
              </Text>
              {state.OTPError == true ? (
                <Text style={styles.errorMessage}>* Please enter OTP.</Text>
              ) : null}
              {state.invalid == true ? (
                <Text style={styles.errorMessage}>
                  * Please enter valid OTP.
                </Text>
              ) : null}
              <TouchableOpacity activeOpacity={0.5} onPress={check}>
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
                  }}>
                  <Text
                    style={{
                      color: '#ffff',
                      fontSize: 11,
                      fontFamily: 'Poppins-SemiBold',
                      textAlign: 'center',
                    }}>
                    Continue
                  </Text>
                </View>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 6,
                  textAlign: 'center',
                  color: '#333',
                  fontFamily: 'Poppins-Light',
                  marginBottom: hp('9%'),
                }}>
                <Text
                  style={{
                    fontSize: 6,
                    textAlign: 'justify',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('2%'),
                    marginBottom: hp('2%'),
                    marginLeft: wp('8%'),
                    marginRight: wp('8%'),
                  }}>
                  By registering you agree to our{' '}
                </Text>
                <Text
                  onPress={() => {
                    clearInterval(timerRef.current);
                    navigation.push('Terms', {
                      data: {
                        Data: 'otp',
                        otp: state.OTP1,
                      },
                    });
                  }}
                  style={{
                    fontSize: 6,
                    textAlign: 'justify',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('2%'),
                    marginBottom: hp('2%'),
                    marginLeft: wp('8%'),
                    marginRight: wp('8%'),
                    textDecorationLine: 'underline',
                  }}>
                  Terms
                </Text>
                <Text
                  style={{
                    fontSize: 6,
                    textAlign: 'justify',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('2%'),
                    marginBottom: hp('2%'),
                    marginLeft: wp('8%'),
                    marginRight: wp('8%'),
                  }}>
                  {' '}
                  and{' '}
                </Text>
                <Text
                  onPress={() => {
                    clearInterval(timerRef.current);
                    navigation.push('Terms', {
                      data: {
                        Data: 'otp',
                        otp: state.OTP1,
                      },
                    });
                  }}
                  style={{
                    fontSize: 6,
                    textAlign: 'justify',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('2%'),
                    marginBottom: hp('2%'),
                    marginLeft: wp('8%'),
                    marginRight: wp('8%'),
                    textDecorationLine: 'underline',
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
};

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
    height: hp('90%'),
    marginTop: hp('-25%'),
    borderRadius: wp('20%'),
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
    marginTop: hp('4%'),
    fontFamily: 'Poppins-Light',
    marginLeft: wp('10%'),
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
  SubmitButtonStyled: {
    paddingTop: hp('0.5%'),
    paddingBottom: hp('0.5%'),
    backgroundColor: 'forestgreen',
    borderRadius: wp('5%'),
    width: wp('25%'),
    alignSelf: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
  },
});

export default Otp;
