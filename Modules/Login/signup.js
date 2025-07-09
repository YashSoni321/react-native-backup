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
import axios from 'axios';
// navigator.geolocation = require('@react-native-community/geolocation');
import {useFocusEffect} from '@react-navigation/native';
import {API_KEY, URL_key} from '../Api/api';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      FullName: null,
      Nameerror: false,
      EmailID: null,
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
    });
    if (this.state.FullName == null) {
      this.setState({Nameerror: true});
    }
    if (this.state.EmailID == null) {
      this.setState({EmailError: true});
    } else if (reg.test(this.state.EmailID) != true) {
      this.setState({reg: true});
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
      });

      const a = {
        FullName: this.state.FullName,
        MobileNumber: this.state.MobileNumber,
        EmailID: this.state.EmailID,
      };
      console.log(a);
      axios
        .post(URL_key + 'api/LoginApi/CustomerSignUp', a, {
          headers: {
            'content-type': `application/json`,
          },
        })
        .then(response => {
          console.log(response.data);
          console.log(response.status);
          if (response.data.LoginStatus == 'INSERTED') {
            console.log('inserted check', {
              stateData: this.state,
              responseData: response.data,
            });
            AsyncStorage.setItem(
              'MobileNumber',
              this.state.MobileNumber.toString(),
            );
            AsyncStorage.setItem(
              'LoginUserProfileID',
              response.data.UserProfileID.toString(),
            );
            AsyncStorage.setItem('EmailID', this.state.EmailID.toString());
            AsyncStorage.setItem('FullName', this.state.FullName.toString());
            AsyncStorage.setItem('isLogin', 'true');
            this.props.navigation.push('AddAddress');
          } else if (response.data.LoginStatus == 'USER ALREADY EXISTS') {
            this.setState({notexist: true});
          } else {
            this.setState({fail: true});
          }
        })
        .catch(err => {
          console.log(err);
          this.setState({fail: true});
        });
    }
  }
  async componentDidMount() {
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
    var MobileNumber = await AsyncStorage.getItem('MobileNumber');
    // console.log(MobileNumber);
    this.setState({MobileNumber: MobileNumber});
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
              <Icon
                style={{
                  // width: wp('10%'),
                  // marginRight: hp('2%'),
                  marginTop: hp('5%'),
                  marginLeft: wp('5%'),
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
                  marginTop: hp('5%'),
                  marginBottom: hp('1%'),
                  marginLeft: wp('8%'),
                  marginRight: wp('3%'),
                }}>
                What's your name & email?
              </Text>
              <Text
                style={{
                  color: '#333',
                  fontSize: 11,
                  fontFamily: 'Poppins-Light',
                  // textAlign: 'center',
                  marginTop: hp('8%'),
                  // marginBottom: hp('1%'),
                  marginLeft: wp('10%'),
                  // marginRight: wp('3%'),
                }}>
                Name *
              </Text>

              <View
                style={{
                  // justifyContent: 'center',
                  borderBottomWidth: 2,
                  // borderRadius: wp('5%'),
                  // padding: 5,
                  height: hp('5.5%'),
                  // marginBottom: hp('3%'),
                  borderColor: '#00afb5',
                  marginTop: hp('1%'),
                  // backgroundColor: '#ffff',

                  width: wp('70%'),
                  // alignSelf: 'center',
                  // flexDirection: 'row',
                  // paddingLeft: wp('12%'),a
                  // alignItems: 'center',
                  marginLeft: wp('10%'),
                  // backgroundColor: '#52c4ff',
                }}>
                <TextInput
                  placeholder="Enter your Full name"
                  fontFamily={'Poppins-Light'}
                  placeholderTextColor={'#666'}
                  color={'#333'}
                  // keyboardType={'number-pad'}
                  fontSize={14}
                  maxLength={100}
                  onChangeText={value =>
                    this.handleInputChange('FullName', value)
                  }
                  style={{
                    // paddingLeft: wp('1%'),
                    padding: hp('0.5%'),
                    // marginLeft: wp('2%'),
                    // width: wp('50%'),
                    // alignItems: 'center',
                    // alignSelf: 'center',
                  }}
                />
              </View>
              {this.state.Nameerror == true ? (
                <Text style={styles.errorMessage}>
                  * Please enter fullname.
                </Text>
              ) : null}
              <Text
                style={{
                  color: '#333',
                  fontSize: 11,
                  fontFamily: 'Poppins-Light',
                  // textAlign: 'center',
                  marginTop: hp('6%'),
                  // marginBottom: hp('1%'),
                  marginLeft: wp('10%'),
                  // marginRight: wp('3%'),
                }}>
                Email *
              </Text>

              <View
                style={{
                  // justifyContent: 'center',
                  borderBottomWidth: 2,
                  // borderRadius: wp('5%'),
                  // padding: 5,
                  height: hp('5.5%'),
                  // marginBottom: hp('3%'),
                  borderColor: '#00afb5',
                  marginTop: hp('1%'),
                  // backgroundColor: '#ffff',

                  width: wp('70%'),
                  // alignSelf: 'center',
                  // flexDirection: 'row',
                  // paddingLeft: wp('12%'),a
                  // alignItems: 'center',
                  marginLeft: wp('10%'),
                  // backgroundColor: '#52c4ff',
                }}>
                <TextInput
                  placeholder="Enter your email"
                  fontFamily={'Poppins-Light'}
                  placeholderTextColor={'#666'}
                  color={'#333'}
                  // keyboardType={'number-pad'}
                  fontSize={14}
                  maxLength={100}
                  onChangeText={value =>
                    this.handleInputChange('EmailID', value)
                  }
                  style={{
                    // paddingLeft: wp('1%'),
                    padding: hp('0.5%'),
                    // marginLeft: wp('2%'),
                    // width: wp('50%'),
                    // alignItems: 'center',
                    // alignSelf: 'center',
                  }}
                />
              </View>
              {this.state.EmailError == true ? (
                <Text style={styles.errorMessage}>* Please enter email.</Text>
              ) : null}
              {this.state.reg == true ? (
                <Text style={styles.errorMessage}>
                  * Please enter valid email.
                </Text>
              ) : null}
              {this.state.notexist == true ? (
                <Text style={styles.errorMessage}>* User Already Exists.</Text>
              ) : null}
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  this.check();
                  // this.props.navigation.push("tab")
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
                    marginTop: hp('17%'),
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
    marginTop: hp('0.5%'),
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
    marginTop: hp('3.5%'),
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
});

export default Signup;
