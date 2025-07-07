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
import messaging from '@react-native-firebase/messaging';
import RNLocalize from 'react-native-localize';
import {NetworkInfo} from 'react-native-network-info';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import PhoneInput from 'react-native-phone-number-input';

import axios from 'axios';

navigator.geolocation = require('@react-native-community/geolocation');
import DeviceInfo from 'react-native-device-info';
import { useFocusEffect } from '@react-navigation/native';
import {API_KEY, URL_key} from '../Api/api';

// Remote logging for production debugging
const sendRemoteLog = async logData => {
  try {
    if (__DEV__) return; // Only log in production

    const logPayload = {
      ...logData,
      timestamp: new Date().toISOString(),
      deviceInfo: {
        deviceId: DeviceInfo.getDeviceId(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
      },
      buildType: 'production',
    };

    // Send to your API endpoint for logging
    await axios.post(
      URL_key + 'api/DeviceDetailsApi/SaveLogDetails',
      logPayload,
      {
        headers: {'content-type': 'application/json'},
        timeout: 5000,
      },
    );
  } catch (error) {
    console.log('Remote logging failed:', error.message);
  }
};

class Login extends React.Component {
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
      DeviceID: DeviceInfo.getDeviceId(),
      DeviceName: DeviceInfo.getSystemName(),
      DeviceType: DeviceInfo.getDeviceType(),
      Brand: DeviceInfo.getBrand(),
      BuidNumber: DeviceInfo.getBuildNumber(),
      Model: DeviceInfo.getModel(),
      ReadableVersion: DeviceInfo.getReadableVersion(),
      SystemName: DeviceInfo.getSystemName(),
      SystemVersion: DeviceInfo.getSystemVersion(),
      Version: DeviceInfo.getVersion(),
      DeviceLocal: null,
      DeviceCountry: null,
      IPAddress: null,
      UniqueID: DeviceInfo.getUniqueId(),
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
  setPasswordVisibility = () => {
    this.setState({hidePassword: !this.state.hidePassword});
  };
  check() {
    const mreg = /^[0-9]*$/;
    this.setState({MobileNumberError: false, reg: false});
    if (this.state.MobileNumber == null) {
      this.setState({MobileNumberError: true});
    } else if (this.state.MobileNumber.length != 10) {
      this.setState({reg: true});
    } else if (mreg.test(this.state.MobileNumber.trim()) != true) {
      this.setState({reg: true});
    } else {
      this.setState({MobileNumberError: false, reg: false});
      // this.props.navigation.push('Tab');
      const a = {
        MobileNumber: this.state.MobileNumber,
        EmailID: null,
      };
      console.log(a);
      axios
        .post(URL_key + 'api/LoginApi/GenerateOTP', a, {
          headers: {
            'content-type': `application/json`,
          },
        })
        .then(response => {
          console.log(response.data);
          console.log(response.status);
          if (response.data.Status == 'GENERATED') {
            AsyncStorage.setItem(
              'MobileNumber',
              this.state.MobileNumber.toString(),
            );

            // AsyncStorage.setItem('OtherCountry', 'no');
            var o = response.data.OTP;
            // this.props.navigation.push('otp', {
            //   data: {
            //     otp: o,
            //   },
            // });
            this.sendOtp(this.state.MobileNumber, o);
          } else {
            this.setState({fail: true});
          }
        })
        .catch(err => {
          console.log(err);
          this.setState({fail: true});
        });
      console.log(a);
      // this.props.navigation.push('Otp');
    }
  }
  sendOtp = async (phoneNumber, otp) => {
    try {
      const userID = 'Fybr001';
      const password = 'Group@123';
      const senderID = 'FYBOTP';
      const entityID = '1201174436729076112';
      const templateID = '1207174506047333643';

      // EXACTLY matching your DLT template (only replacing {#var#} with OTP)
      const message = `Your Fybr OTP is ${otp}. Do not share it with anyone. It is valid for 10 minutes. - Fybr Retail Private Limited`;

      console.log('📝 Message template:', message);

      const encodedMessage = encodeURIComponent(message);
      console.log('🔐 Encoded message:', encodedMessage);

      // Construct final URL with encoded message
      const url = `https://servermsg.com/api/SmsApi/SendSingleApi?UserID=${userID}&Password=${password}&SenderID=${senderID}&Phno=${phoneNumber}&Msg=${encodedMessage}&EntityID=${entityID}&TemplateID=${templateID}`;

      console.log('🌐 Full SMS API URL:', url);

      // Check network connectivity first
      console.log('🔍 Checking network connectivity...');

      // Test with a simple fetch first to check network
      try {
        const testResponse = await fetch('https://httpbin.org/get', {
          method: 'GET',
          timeout: 5000,
        });
        console.log(
          '✅ Network connectivity test passed:',
          testResponse.status,
        );
      } catch (networkError) {
        console.error(
          '❌ Network connectivity test failed:',
          networkError.message,
        );

        return null;
      }

      console.log('⏳ Sending SMS request...');

      // Try with fetch first (more reliable in production)
      let response;
      try {
        const fetchResponse = await fetch(url, {
          method: 'GET',
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'FybrApp/1.0',
            Accept: 'application/json, text/plain, */*',
          },
        });

        console.log('✅ Fetch Response Status:', fetchResponse.status);
        console.log('✅ Fetch Response OK:', fetchResponse.ok);

        const responseText = await fetchResponse.text();
        console.log('📄 Raw Response Text:', responseText);

        try {
          response = {
            status: fetchResponse.status,
            data: JSON.parse(responseText),
          };
        } catch (parseError) {
          console.log('⚠️ JSON parse failed, treating as text response');
          response = {
            status: fetchResponse.status,
            data: {rawResponse: responseText},
          };
        }
      } catch (fetchError) {
        console.log('⚠️ Fetch failed, trying axios as fallback...');
        console.error('Fetch Error:', fetchError.message);

        // Fallback to axios
        response = await axios.get(url, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'FybrApp/1.0',
          },
        });
      }

      console.log('✅ SMS API Response Status:', response.status);
      console.log(
        '📊 SMS API Response Data:',
        JSON.stringify(response.data, null, 2),
      );

      // Check different possible response formats
      let smsStatus = null;
      if (response.data) {
        // Check various status field variations
        smsStatus =
          response.data.Status ||
          response.data.status ||
          response.data.SUCCESS ||
          response.data.success ||
          response.data.result ||
          response.data.Result;

        console.log('🔍 Extracted Status:', smsStatus);
        console.log('🔍 Response keys:', Object.keys(response.data));

        // Special handling for raw text responses
        if (response.data.rawResponse) {
          console.log('📄 Raw response detected, analyzing...');
          const rawText = response.data.rawResponse.toLowerCase();
          if (
            rawText.includes('ok') ||
            rawText.includes('success') ||
            rawText.includes('sent')
          ) {
            smsStatus = 'ok';
            console.log('✅ Detected success from raw response');
          }
        }
      }

      // More comprehensive status checking
      const isSuccess =
        smsStatus &&
        (smsStatus.toString().toLowerCase() === 'ok' ||
          smsStatus.toString().toLowerCase() === 'success' ||
          smsStatus.toString().toLowerCase() === 'sent' ||
          smsStatus === '1' ||
          smsStatus === 1);

      console.log('✨ Is SMS Success:', isSuccess);

      if (isSuccess) {
        console.log('🎉 SMS sent successfully! Navigating to OTP screen...');

        // Show success message in production builds

        this.props.navigation.push('Otp', {data: {otp}});
      } else {
        console.log('❌ SMS failed with status:', smsStatus);
        console.log('💡 Full response for debugging:', response.data);

        // Enhanced error details for production
        const errorDetails = {
          status: smsStatus,
          responseStatus: response.status,
          buildType: __DEV__ ? 'dev' : 'prod',
          timestamp: new Date().toISOString(),
          phoneNumber:
            phoneNumber.substring(0, 3) + 'XXXX' + phoneNumber.substring(7), // Masked for privacy
        };

        console.log('🐛 Error Details:', errorDetails);

        await sendRemoteLog({
          event: 'sms_send_failed',
          ...errorDetails,
          fullResponse: JSON.stringify(response.data),
        });

        // Show detailed error to user
      }

      return response.data;
    } catch (error) {
      console.error('🚨 SMS Error Details:');
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      console.error('Build Type:', __DEV__ ? 'Development' : 'Production');

      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
        console.error('Response Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request made but no response:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // Production-specific error handling
      const errorMessage = __DEV__
        ? `Debug Error: ${error.message}`
        : 'Unable to send OTP. Please check your internet connection and try again.';

      // Show user-friendly error with more details in production

      return null;
    }
  };

  async componentDidMount() {
    // DeviceInfo.getUniqueId().then(uniqueId => {
    //   // iOS: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
    //   // Android: "dd96dec43fb81c97"
    //   // Windows: "{2cf7cb3c-da7a-d508-0d7f-696bb51185b4}"

    // });
    // console.log();
    const value = await AsyncStorage.getItem('isLogin');
    console.log(value);
    if (value !== null || value == 'true') {
      this.props.navigation.push('Tab');
    } else {
      this.props.navigation.navigate('Login');
    }
    var today = new Date();
    var curHr = today.getHours();

    if (curHr < 12) {
      this.setState({wishes: 'Good Morning'});
      // console.log('good morning')
    } else if (curHr < 18) {
      this.setState({wishes: 'Good Afternoon'});
      // console.log('good afternoon')
    } else {
      this.setState({wishes: 'Good Evening'});
      // console.log('good evening')
    }
    NetworkInfo.getIPAddress().then(ipAddress => {
      this.setState({IPAddress: ipAddress}, () => {
        var SystemDate = moment().format('YYYY/MM/DD 00:00:00');
        const a = {
          DeviceID: this.state.DeviceID,
          DeviceName: this.state.DeviceName,
          DeviceLocal: this.state.DeviceLocal,
          DeviceCountry: this.state.DeviceCountry,
          DeviceType: this.state.DeviceType,
          Brand: this.state.Brand,
          BuidNumber: this.state.BuidNumber,
          IPAddress: this.state.IPAddress,
          Model: this.state.Model,
          SystemName: this.state.SystemName,
          SystemVersion: this.state.SystemVersion,
          UniqueID: this.state.UniqueID,
          Version: this.state.Version,
          SystemUser: 'test',
          SystemDate: SystemDate,
        };
        console.log(a);
        // axios
        //   .post(URL_key + 'api/DeviceDetailsApi/SaveDeviceDetails', a, {
        //     headers: {
        //       'content-type': `application/json`,
        //     },
        //   })
        //   .then(response => {
        //     console.log(response.data);
        //   });
      });
    });
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
        style={{flex: 1}}>
        <KeyboardAwareScrollView
          contentContainerStyle={{flexGrow: 1}}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 80 : 100}
          keyboardShouldPersistTaps="handled">
          <ScrollView>
            <SafeAreaView>
              {/* NavigationEvents replaced with useFocusEffect in functional components */}
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
                    this.setState({fail: false}, () => {
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
              <View style={{backgroundColor: '#ffffff', height: hp('100%')}}>
                <Icon
                  style={{
                    // width: wp('10%'),
                    // marginRight: hp('2%'),
                    marginTop: hp('5%'),
                    marginLeft: wp('4%'),
                    // paddingLeft: wp('-4%'),
                  }}
                  onPress={() => {
                    this.props.navigation.push('Landing');
                  }}
                  activeOpacity={0.5}
                  name="chevron-back"
                  color={'#00afb5'}
                  size={hp('5%')}
                />

                <Text
                  style={{
                    color: '#00afb5',
                    fontSize: 13,
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    marginTop: hp('7%'),
                    marginBottom: hp('1%'),
                    marginLeft: wp('8%'),
                    marginRight: wp('3%'),
                  }}>
                  Enter your number to continue
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    // textAlign: "justify",
                    //   justifyContent: 'center',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    // marginTop: hp('2%'),
                    marginBottom: hp('2%'),
                    marginLeft: wp('8%'),
                    // marginRight: wp('8%'),
                  }}>
                  By entering your number, you're account will be registered
                  with fybr.
                </Text>
                <Text
                  style={{
                    color: '#333',
                    fontSize: 11,
                    fontFamily: 'Poppins-Light',
                    // textAlign: 'center',
                    marginTop: hp('8%'),
                    // marginBottom: hp('1%'),
                    marginLeft: wp('8%'),
                    // marginRight: wp('3%'),
                  }}>
                  Phone number *
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <View style={{marginTop: hp('3%'), marginLeft: wp('10%')}}>
                    <Image
                      style={{
                        //  borderWidth: 1,
                        height: hp('3%'),
                        width: hp('3%'),
                        // borderColor: 'forestgreen',
                        // borderRadius: hp('100%'),
                        // alignSelf: 'center',
                        // justifyContent: 'center',
                        // marginTop: hp('-1%'),
                        // marginBottom: hp('1%'),
                      }}
                      resizeMode="contain"
                      source={require('../Images/Flag.png')}
                    />
                  </View>
                  <Icon
                    style={{
                      // width: wp('10%'),
                      // marginRight: hp('2%'),
                      marginTop: hp('3.5%'),
                      marginLeft: wp('1%'),
                      // paddingLeft: wp('-4%'),
                    }}
                    onPress={() => {
                      // this.props.navigation.push('Landing')
                    }}
                    activeOpacity={0.5}
                    name="chevron-down-sharp"
                    color={'#00afb5'}
                    size={hp('2%')}
                  />

                  <TextInput
                    placeholder="8 9 X X X  X X X X X"
                    fontFamily={'Poppins-Light'}
                    placeholderTextColor={'grey'}
                    color={'#333'}
                    keyboardType={'number-pad'}
                    fontSize={15}
                    maxLength={10}
                    onChangeText={text => {
                      // console.log(text);
                      // setValue(text);
                      const mreg = /^[0-9]*$/;
                      if (mreg.test(text) != true) {
                        this.setState({regm: true});
                      } else {
                        this.setState({MobileNumber: text});
                      }
                    }}
                    style={{
                      // paddingLeft: wp('1%'),
                      // padding: hp('1%'),
                      // marginLeft: wp('2%'),
                      width: wp('60%'),
                      alignItems: 'center',
                      alignSelf: 'center',
                      textAlign: 'center',
                      // borderBottomWidth: 2,
                      borderColor: '#00afb5',
                      marginTop: hp('1.3%'),
                      // borderWidth: 2,
                      // height: hp('4.5%'),
                    }}
                  />
                </View>
                <View
                  style={{
                    justifyContent: 'center',
                    borderBottomWidth: 2,
                    // borderWidth: 1,
                    // borderRadius: wp('5%'),
                    // padding: 5,
                    // height: hp('4.5%'),
                    // marginBottom: hp('3%'),
                    borderColor: '#00afb5',
                    marginTop: hp('-1.5%'),
                    // backgroundColor: '#ffff',

                    width: wp('60%'),
                    // alignSelf: 'center',
                    // flexDirection: 'row',
                    // paddingLeft: wp('12%'),a
                    alignItems: 'center',
                    marginLeft: wp('23%'),
                    // backgroundColor: '#52c4ff',
                  }}></View>

                {/* <PhoneInput
              // ref={phoneInput}
              defaultValue={this.state.value}
              defaultCode="IN"
              layout="first"

              onChangeText={text => {
                // console.log(text);
                // setValue(text);
                const mreg = /^[0-9]*$/;
                if (mreg.test(text) != true) {
                  this.setState({ regm: true });
                } else {
                  this.setState({ MobileNumber: text });
                }
              }}
              onChangeFormattedText={text => {
                // setFormattedValue(text);
                // console.log(text);
              }}
              onChangeCountry={text => {
                // if (text.name != 'India') {
                //   this.setState({otherc: true});
                // } else {
                //   this.setState({otherc: false});
                // }
                // console.log(text);
              }}
              containerStyle={{
                justifyContent: 'center',
                borderBottomWidth: wp('0.3%'),
                // borderRadius: wp('2%'),
                // padding: 5,
                // height: hp('8%'),
                marginBottom: hp('2%'),
                borderColor: '#00afb5',
                marginTop: hp('2%'),
                backgroundColor: 'transparent',

                width: wp('75%'),
                // alignSelf: 'center',
                flexDirection: 'row',
                // paddingLeft: wp('12%'),a
                alignItems: 'center', marginLeft: wp('7%'),
              }}
              textContainerStyle={{
                justifyContent: 'center',
                // borderWidth: wp('0.3%'),
                borderRadius: wp('2%'),
                // padding: 5,
                height: hp('5.5%'),
                // marginBottom: hp('3%'),
                // borderColor: '#333',
                // marginTop: hp('3%'),
                backgroundColor: 'transparent',

                width: wp('75%'),
                // alignSelf: 'center',
                // flexDirection: 'row',
                // paddingLeft: wp('12%'),a
                alignItems: 'center',
                // padding: 52,
              }}
            // textInputProps={{paddingTop: hp('2%')}}
            // textInputStyle={{paddingTop: hp('2%')}}
            /> */}

                {this.state.MobileNumberError == true ? (
                  <Text style={styles.errorMessage}>
                    * Please enter mobile number.
                  </Text>
                ) : null}
                {this.state.reg == true ? (
                  <Text style={styles.errorMessage}>
                    * Please enter valid mobile number.
                  </Text>
                ) : null}

                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    this.check();
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
                      marginTop: hp('15%'),
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

                {/* Production Debug SMS Test Button - Only shows in production builds */}

                <Text
                  style={{
                    fontSize: 6,
                    textAlign: 'center',
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
                      textAlign: 'justify',
                      //   justifyContent: 'center',
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
                      this.props.navigation.push('Terms', {
                        data: {
                          Data: 'login',
                          otp: '102111',
                        },
                      });
                    }}
                    style={{
                      fontSize: 6,
                      textAlign: 'justify',
                      //   justifyContent: 'center',
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
                      //   justifyContent: 'center',
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
                      this.props.navigation.push('Terms', {
                        data: {
                          Data: 'login',
                          otp: '102111',
                        },
                      });
                    }}
                    style={{
                      fontSize: 6,
                      textAlign: 'justify',
                      //   justifyContent: 'center',
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
  }
}

const Separator = () => <View style={styles.separator} />;
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: '#333',
    borderBottomWidth: 0.7,
    marginTop: hp('2%'),
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
    marginTop: hp('2%'),
    fontFamily: 'Poppins-Light',
    marginBottom: hp('-2.5%'),
    marginLeft: wp('5%'),
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

export default Login;
