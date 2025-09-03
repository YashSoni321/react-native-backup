import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  Alert,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  ActivityIndicator,
  BackHandler,
  FlatList,
  ImageBackground,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {Switch} from 'react-native-switch';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import ToggleSwitch from 'toggle-switch-react-native';
import {Dialog} from 'react-native-simple-dialogs';
import {CustomPicker} from 'react-native-custom-picker';
import {API_KEY, URL_key} from '../Api/api';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
var RNFS = require('react-native-fs');
import {
  notifications,
  messages,
  NotificationMessage,
  Android,
} from 'react-native-firebase-push-notifications';
import Normalize from '../Size/size';
class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Rolename: null,
      data: null,
      PROFILEIMAGE: null,
      RoleTypeID: null,
      AGENTCODE: null,
      amenitieslist: null,
      defaultcom: false,
      MobileNumber: null,
      EmailID: null,
      FullName: null,
      showDeleteModal: false,
      LoginUserProfileID: null,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  async componentDidMount() {
    var EmailID = await AsyncStorage.getItem('EmailID');
    var FullName = await AsyncStorage.getItem('FullName');
    var MobileNumber = await AsyncStorage.getItem('MobileNumber');
    var LoginUserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
    this.setState({
      EmailID: EmailID,
      FullName: FullName,
      MobileNumber: MobileNumber,
      LoginUserProfileID: LoginUserProfileID,
    });
  }
  renderOption(settings) {
    const {item, getLabel} = settings;
    // console.log(item)
    return (
      <View style={styles.optionContainer}>
        <Text
          style={{
            color: 'black',
            alignSelf: 'flex-start',
            marginLeft: wp('0.5%'),
            fontSize: 15,
            fontFamily: 'Poppins-Light',
            marginTop: hp('1%'),
            marginRight: wp('3%'),
            // textAlign: 'center',
          }}>
          {getLabel(item)}
        </Text>
      </View>
    );
  }
  handleInputChange = (inputName, inputValue) => {
    this.setState(state => ({...state, [inputName]: inputValue}));
  };
  renderField(settings) {
    const {selectedItem, defaultText, getLabel, clear} = settings;
    return (
      <View style={styles.container1}>
        <View>
          {!selectedItem && (
            <Text
              style={[
                styles.text,
                {
                  fontSize: 15,
                  fontFamily: 'Poppins-Light',

                  textAlign: 'left',

                  borderRadius: 20,
                  color: 'black',
                  backgroundColor: '#ffffff',
                  paddingLeft: wp('1%'),
                  paddingTop: 2,
                  marginLeft: wp('2%'),
                  width: wp('100%'),
                },
              ]}>
              {defaultText}
            </Text>
          )}
          {selectedItem && (
            <View style={styles.innerContainer}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: 15,
                    fontFamily: 'Poppins-Light',

                    textAlign: 'left',

                    borderRadius: 20,
                    color: 'black',
                    backgroundColor: '#ffffff',
                    paddingLeft: wp('1%'),
                    paddingTop: 2,
                    marginLeft: wp('2%'),
                    width: wp('100%'),
                  },
                ]}>
                {getLabel(selectedItem)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  handleInputChange = (inputName, inputValue) => {
    this.setState(state => ({
      ...state,
      [inputName]: inputValue,
    }));
  };

  chooseImage() {
    ImagePicker.openPicker({
      multiple: false,
      includeBase64: true,
      waitAnimationEnd: false,
      sortOrder: 'desc',
      includeExif: true,
      forceJpg: true,
      mediaType: 'photo',
    })
      .then(files => {
        // this.setState({
        //   files: files.map(i => {
        // console.log(files);
        //     var videoUri = this.state.base64;
        //     videoUri.push(i.data);
        //     // console.log(videoUri);
        this.setState({base64: files.data, dialogVisible: true});
        //     return {
        //       uri: i.path,
        //       width: i.width,
        //       height: i.height,
        //       mime: i.mime,
        //       // data: i.data,
        //     };
        //   }),
        // });
      })
      .catch(e => alert(e));
  }
  clickImage() {
    ImagePicker.openCamera({
      multiple: false,
      includeBase64: true,
      waitAnimationEnd: false,
      sortOrder: 'desc',
      includeExif: true,
      forceJpg: true,
      cropping: true,
      mediaType: 'photo',
    })
      .then(files => {
        // console.log(files);
        this.setState({base64: files.data, dialogVisible: true});
        // console.log(files);
        // var videoUri = this.state.base64;
        // videoUri.push(files.data);
        // this.setState({base64: videoUri});
        // console.log(videoUri);
        // console.log('videoUri');
        // this.setState({
        //   files: files.map(i => {
        //     // console.log('received image', i);
        //
        //     this.setState({base64: videoUri});
        //   }),
        // });
      })
      .catch(e => alert(e));
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
    this.props.navigation.push('Tab');
    return true;
  }

  deleteAccount = async () => {
    try {
      const response = await axios.post(
        `${URL_key}api/LoginApi/DeleteAccount`,
        {
          LoginUserProfileID: parseInt(this.state.LoginUserProfileID),
          SystemUser: this.state.FullName || 'User',
        },
      );

      if (response.status === 200) {
        await AsyncStorage.clear();
        Alert.alert('Success', 'Account deleted successfully', [
          {text: 'OK', onPress: () => this.props.navigation.push('Login')},
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  showDeleteConfirmation = () => {
    this.setState({showDeleteModal: true});
  };

  hideDeleteModal = () => {
    this.setState({showDeleteModal: false});
  };
  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        {/* NavigationEvents removed - not used in this component */}
        <ScrollView
          style={{backgroundColor: 'white', flex: 1}}
          contentContainerStyle={{paddingBottom: hp('1%')}}
          showsVerticalScrollIndicator={true}>
          <ImageBackground
            style={{width: wp('100%')}}
            activeOpacity={0.5}
            source={require('../Images/output-onlinepngtools.png')}
            resizeMode="cover">
            <Text
              style={{
                fontSize: 48,
                textAlign: 'center',
                //   justifyContent: 'center',
                color: '#00afb5',
                fontFamily: 'RedHatDisplay-SemiBold',
                marginTop: hp('2.5%'),
                marginBottom: hp('2.5%'),
              }}>
              fybr
            </Text>
          </ImageBackground>
          <View
            style={{
              // marginTop: hp('10%'),
              borderTopLeftRadius: wp('8%'),
              borderTopEndRadius: wp('8%'),
            }}>
            <View style={{flexDirection: 'row', marginLeft: wp('5%')}}>
              <View>
                {this.state.ProfileImage == null ? (
                  <>
                    <View style={styles.header}></View>
                    <Icon
                      name="person-circle"
                      color={'#00afb5'}
                      size={hp('12%')}
                      style={{marginTop: hp('1%'), marginLeft: wp('5%')}}
                    />
                  </>
                ) : (
                  <>
                    <View style={styles.header}></View>

                    <Image
                      style={styles.avatar}
                      source={{
                        uri:
                          'data:image/jpeg;base64,' + this.state.ProfileImage,
                      }}
                    />
                  </>
                )}
              </View>
              <View style={{marginLeft: wp('5%')}}>
                <Text
                  style={{
                    fontSize: 14,
                    // textAlign: 'center',
                    //   justifyContent: 'center',
                    color: '#333',
                    fontFamily: 'Poppins-Medium',
                    marginTop: hp('3.5%'),
                    marginRight: wp('43%'),
                    fontWeight: 'bold',
                    // marginBottom: hp('2%'),
                    // marginLeft: wp('10%'),
                    // marginRight: wp('1%'),
                  }}>
                  {this.state.FullName}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    // textAlign: 'center',
                    //   justifyContent: 'center',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('0.5%'),
                    marginRight: wp('43%'),
                    // marginBottom: hp('2%'),
                    // marginLeft: wp('10%'),
                    // marginRight: wp('1%'),
                  }}>
                  +91 {this.state.MobileNumber}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    // textAlign: 'center',
                    //   justifyContent: 'center',
                    color: '#333',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('0%'),
                    // marginBottom: hp('2%'),
                    // marginLeft: wp('10%'),
                    marginRight: wp('43%'),
                  }}>
                  {this.state.EmailID}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                try {
                  console.log('🔄 Navigating to Orders screen...');
                  this.props.navigation.push('Orders');
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  Alert.alert(
                    'Navigation Error',
                    'Unable to navigate. Please try again.',
                  );
                }
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignSelf: 'center',
                  marginTop: hp('2%'),
                  borderRadius: wp('2%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#00afb5',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#333',
                    marginTop: hp('0.2%'),

                    marginLeft: wp('5%'),
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    // alignSelf: 'center',
                    width: wp('55%'),
                  }}>
                  Orders
                </Text>
                <Icon
                  name="reader"
                  size={22}
                  color="#00afb5"
                  style={{alignSelf: 'center', marginLeft: wp('7%')}}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                try {
                  console.log('🔄 Navigating to Wishlist screen...');
                  this.props.navigation.push('Wishlist');
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  Alert.alert(
                    'Navigation Error',
                    'Unable to navigate. Please try again.',
                  );
                }
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignSelf: 'center',
                  marginTop: hp('2%'),
                  borderRadius: wp('2%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#00afb5',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#333',
                    marginTop: hp('0.2%'),

                    marginLeft: wp('5%'),
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    // alignSelf: 'center',
                    width: wp('55%'),
                  }}>
                  Wishlist
                </Text>
                <Icon
                  name="heart"
                  size={22}
                  color="#00afb5"
                  style={{alignSelf: 'center', marginLeft: wp('7%')}}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                try {
                  console.log('🔄 Navigating to Notification screen...');
                  this.props.navigation.push('Notification');
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  Alert.alert(
                    'Navigation Error',
                    'Unable to navigate. Please try again.',
                  );
                }
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignSelf: 'center',
                  marginTop: hp('2%'),
                  borderRadius: wp('2%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#00afb5',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#333',
                    marginTop: hp('0.2%'),

                    marginLeft: wp('5%'),
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    // alignSelf: 'center',
                    width: wp('55%'),
                  }}>
                  Notification
                </Text>
                <Icon
                  name="notifications"
                  size={22}
                  color="#00afb5"
                  style={{alignSelf: 'center', marginLeft: wp('7%')}}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPress={async () => {}}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignSelf: 'center',
                  marginTop: hp('2%'),
                  borderRadius: wp('2%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#00afb5',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#333',
                    marginTop: hp('0.2%'),

                    marginLeft: wp('5%'),
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    // alignSelf: 'center',
                    width: wp('55%'),
                  }}>
                  Saved Payment Methods
                </Text>
                <Icon
                  name="wallet"
                  size={22}
                  color="#00afb5"
                  style={{alignSelf: 'center', marginLeft: wp('7%')}}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                try {
                  console.log('🔄 Navigating to AddressList screen...');
                  this.props.navigation.push('AddressList');
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  Alert.alert(
                    'Navigation Error',
                    'Unable to navigate. Please try again.',
                  );
                }
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignSelf: 'center',
                  marginTop: hp('2%'),
                  borderRadius: wp('2%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#00afb5',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#333',
                    marginTop: hp('0.2%'),

                    marginLeft: wp('5%'),
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    // alignSelf: 'center',
                    width: wp('55%'),
                  }}>
                  Saved Addresses
                </Text>
                <Icon
                  name="location"
                  size={22}
                  color="#00afb5"
                  style={{alignSelf: 'center', marginLeft: wp('7%')}}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                try {
                  console.log('🔄 Navigating to Invite screen...');
                  this.props.navigation.push('Invite');
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  Alert.alert(
                    'Navigation Error',
                    'Unable to navigate. Please try again.',
                  );
                }
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignSelf: 'center',
                  marginTop: hp('2%'),
                  borderRadius: wp('2%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#00afb5',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#333',
                    marginTop: hp('0.2%'),

                    marginLeft: wp('5%'),
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    // alignSelf: 'center',
                    width: wp('55%'),
                  }}>
                  Referrals
                </Text>
                <Icon
                  name="card"
                  size={22}
                  color="#00afb5"
                  style={{alignSelf: 'center', marginLeft: wp('7%')}}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                try {
                  console.log('🔄 Navigating to FAQ screen...');
                  this.props.navigation.push('FAQ');
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  Alert.alert(
                    'Navigation Error',
                    'Unable to navigate. Please try again.',
                  );
                }
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignSelf: 'center',
                  marginTop: hp('2%'),
                  borderRadius: wp('2%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#00afb5',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#333',
                    marginTop: hp('0.2%'),

                    marginLeft: wp('5%'),
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    // alignSelf: 'center',
                    width: wp('55%'),
                  }}>
                  FAQ's
                </Text>
                <Icon
                  name="help-circle-sharp"
                  size={22}
                  color="#00afb5"
                  style={{alignSelf: 'center', marginLeft: wp('7%')}}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                try {
                  console.log('🔄 Navigating to Contactsupport screen...');
                  this.props.navigation.push('Contactsupport');
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  Alert.alert(
                    'Navigation Error',
                    'Unable to navigate. Please try again.',
                  );
                }
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignSelf: 'center',
                  marginTop: hp('2%'),
                  borderRadius: wp('2%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#00afb5',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#333',
                    marginTop: hp('0.2%'),

                    marginLeft: wp('5%'),
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    // alignSelf: 'center',
                    width: wp('55%'),
                  }}>
                  Contact Support
                </Text>
                <Icon
                  name="call"
                  size={22}
                  color="#00afb5"
                  style={{alignSelf: 'center', marginLeft: wp('7%')}}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={this.showDeleteConfirmation}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignSelf: 'center',
                  marginTop: hp('2%'),
                  borderRadius: wp('2%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#00afb5',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    // color: '#ff4444',

                    marginTop: hp('0.2%'),
                    marginLeft: wp('5%'),
                    fontFamily: 'Poppins-Medium',
                    width: wp('55%'),
                  }}>
                  Delete Account
                </Text>
                <Icon
                  name="trash"
                  size={22}
                  color="#00afb5"
                  style={{alignSelf: 'center', marginLeft: wp('7%')}}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                await AsyncStorage.removeItem('LoginUserProfileID');
                await AsyncStorage.removeItem('isLogin1');
                await AsyncStorage.removeItem('isLogin');
                await AsyncStorage.removeItem('MobileNumber');
                await AsyncStorage.removeItem('EmailID');
                await AsyncStorage.removeItem('FullName');
                await AsyncStorage.removeItem('CartID');
                await AsyncStorage.removeItem('Notifi');
                await AsyncStorage.removeItem('loca');
                this.props.navigation.push('Login');
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignSelf: 'center',
                  marginTop: hp('2%'),
                  borderRadius: wp('2%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#00afb5',
                  marginBottom: hp('5%'),
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#333',
                    marginTop: hp('0.2%'),

                    marginLeft: wp('5%'),
                    fontFamily: 'Poppins-Medium',
                    // textAlign: 'center',
                    // alignSelf: 'center',
                    width: wp('55%'),
                  }}>
                  Logout
                </Text>
                <Icon
                  name="log-out"
                  size={22}
                  color="#00afb5"
                  style={{alignSelf: 'center', marginLeft: wp('7%')}}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Dialog
          visible={this.state.showDeleteModal}
          title="Delete Account"
          onTouchOutside={this.hideDeleteModal}
          dialogStyle={{
            borderRadius: 20,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 8,
            paddingVertical: 10,
          }}>
          <View style={{padding: 25}}>
            <Text
              style={{
                fontSize: 16,
                color: '#444',
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
                marginBottom: 15,
              }}>
              ⚠️ Are you sure you want to delete your account?
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: '#777',
                fontFamily: 'Poppins-Regular',
                textAlign: 'center',
                marginBottom: 25,
                lineHeight: 18,
              }}>
              This action is permanent and cannot be undone.
            </Text>

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                onPress={this.hideDeleteModal}
                style={{
                  flex: 1,
                  marginRight: 10,
                  backgroundColor: '#f0f0f0',
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#444',
                    fontFamily: 'Poppins-Medium',
                    fontSize: 14,
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  this.hideDeleteModal();
                  this.deleteAccount();
                }}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  backgroundColor: '#ff3b30',
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  shadowColor: '#ff3b30',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14,
                  }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Dialog>
      </SafeAreaView>
    );
  }
}

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7e84c0',
    position: 'absolute',
    flexDirection: 'row',
    // marginTop: hp('6%'),
    marginLeft: wp('75%'),
    borderRadius: hp('3%'),
    alignSelf: 'center',
  },
  appButtonContainer2: {
    // borderWidth: 1,
    paddingTop: hp('0.1%'),
    paddingBottom: hp('0.1%'),
    // backgroundColor: 'forestgreen',
    // borderRadius: wp('3%'),
    width: wp('48%'),
    // marginLeft: wp('3%'),
    // marginBottom: hp('2%'),
    borderRadius: wp('3%'),
    padding: wp('0.5%'),
    // marginLeft: wp('57%'),
    // width: wp('35%'),
    // marginBottom: hp('3%'),
    // borderColor: 'forestgreen',
    marginTop: hp('4%'),
    alignSelf: 'center',
    // backgroundColor: 'forestgreen',
    marginBottom: hp('2%'),
    height: hp('4%'),
    // marginRight: wp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection: 'row',
  },
  SubmitButtonStyle: {
    marginTop: hp('2%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('1%'),
    backgroundColor: '#7e84c0',
    borderRadius: wp('3%'),
  },
  header: {
    // backgroundColor: '#7e84c0',
    // height: hp('12%'),
  },
  avatar: {
    width: wp('30%'),
    height: hp('12%'),
    borderRadius: hp('2%'),
    borderWidth: 4,
    borderColor: 'white',
    alignSelf: 'center',
    // position: 'absolute',
    marginTop: hp('-6%'),
  },
  separator: {
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderWidth: 1,
  },

  body: {
    marginTop: hp('1%'),
  },
  appButtonContainer1: {
    // borderWidth: 1,
    paddingTop: hp('0.1%'),
    paddingBottom: hp('0.1%'),
    // backgroundColor: 'forestgreen',
    // borderRadius: wp('3%'),
    width: wp('48%'),
    // marginLeft: wp('3%'),
    // marginBottom: hp('2%'),
    borderRadius: wp('3%'),
    padding: wp('0.5%'),
    // marginLeft: wp('57%'),
    // width: wp('35%'),
    // marginBottom: hp('3%'),
    // borderColor: 'forestgreen',
    marginTop: hp('4%'),
    alignSelf: 'center',
    // backgroundColor: 'forestgreen',
    marginBottom: hp('2%'),
    height: hp('4%'),
    // marginRight: wp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection: 'row',
  },
  name: {
    fontSize: Normalize(15),
    color: '#00afb5',
    fontFamily: 'Poppins-SemiBold',
    marginTop: hp('0.5%'),
    textAlign: 'center',
    marginLeft: wp('10%'),
  },
  errorMessage: {
    fontSize: Normalize(11),
    color: 'red',
    textAlign: 'center',
    marginLeft: wp('2%'),
    marginRight: wp('2%'),
    fontFamily: 'Poppins-Light',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row1: {
    height: hp('6%'),
    width: wp('13%'),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('0.5%'),
    borderColor: '#ffffff',
    borderWidth: 0.7,
  },
  row2: {
    height: hp('6%'),
    width: wp('43%'),
    backgroundColor: '#fff',

    justifyContent: 'center',
    // marginLeft: wp('0.5%'),
    borderColor: '#ffffff',
    borderWidth: 0.7,
  },
  row3: {
    height: hp('6%'),
    width: wp('21%'),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',

    borderColor: '#ffffff',
    borderWidth: 0.7,
  },
  row4: {
    height: hp('6%'),
    width: wp('21%'),
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center',

    borderColor: '#ffffff',
    borderWidth: 0.7,
  },
  horizontal: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('50%'),
  },
  btn: {
    width: wp('16%'),
    height: hp('2.5%'),
    backgroundColor: 'forestgreen',
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    // marginLeft: wp('1.5%'),
    marginBottom: hp('1.5%'),
    marginTop: hp('1.5%'),
    alignSelf: 'center',
  },
  btn1: {
    // width: wp('16%'),
    // height: hp('2.5%'),
    backgroundColor: 'forestgreen',
    borderRadius: wp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: hp('14%'),
    marginBottom: hp('1.5%'),
    marginTop: hp('0.7%'),
    alignSelf: 'flex-end',
  },
  btnText: {
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'Poppins-Light',
    fontSize: 13,
  },
  container1: {
    borderColor: '#ffcc00',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  text: {
    fontSize: 18,
  },
  headerFooterContainer: {
    padding: 10,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: 'grey',
    borderRadius: 5,
    marginRight: 10,
    padding: 5,
  },
  optionContainer: {
    padding: 10,
    borderBottomColor: '#7e84c0',
    borderBottomWidth: 1,
  },
  optionInnerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  box: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  itemSeparatorStyle: {
    height: 1,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#D3D3D3',
  },
  errorMessage: {
    fontSize: Normalize(11),
    color: '#ff4500',
    textAlign: 'center',
    marginTop: hp('1%'),
    fontFamily: 'Poppins-Light',
    marginLeft: wp('3%'),
    marginRight: wp('3%'),
    // marginBottom: hp('2%'),
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
    marginBottom: hp('2%'),
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

export default Profile;
