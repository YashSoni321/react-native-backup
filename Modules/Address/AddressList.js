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
  FlatList,
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
import {NavigationEvents} from 'react-navigation';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
var date = moment().format('YYYY/MM/DD ');
import ToggleSwitch from 'toggle-switch-react-native';
var time = moment().format('hh:mm A');
import ImagePicker from 'react-native-image-crop-picker';
import {CustomPicker} from 'react-native-custom-picker';
import {API_KEY, URL_key} from '../Api/api';
import axios from 'axios';
var RNFS = require('react-native-fs');
import XLSX from 'xlsx';
import publicIP from 'react-native-public-ip';
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import MenuDrawer from 'react-native-side-drawer';
import RNFetchBlob from 'rn-fetch-blob';
import {image} from './image';
import {alignSelf, marginBottom} from 'styled-system';
import StepIndicator from 'react-native-step-indicator';
import CheckBox from 'react-native-check-box';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {Marker} from 'react-native-maps';
import {UrlTile} from 'react-native-maps';
import GetLocation from 'react-native-get-location';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Geocoder from 'react-native-geocoder-reborn';
class AddressList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      AddressList: null,
      AddressList1: null,
      showaddress: false,
      StateDDl: [],
      CityDDl: [],
      StateID: null,
      CityID: null,
      Address: null,
      Addresserror: false,
      Country: null,
      Countryerror: false,
      Pincode: null,
      Pincodeerror: false,
      Locality: null,
      Localityerror: false,
      StreetName: null,
      StreetNameerror: false,
      AdminArea: null,
      AdminAreaerror: false,
      StreetNumber: null,
      StreetNumbererror: false,
      showeditaddress: false,
      StateDDl1: [],
      CityDDl1: [],
      StateID1: null,
      CityID1: null,
      Address1: null,
      Addresserror1: false,
      Country1: null,
      Countryerror1: false,
      Pincode1: null,
      Pincodeerror1: false,
      Locality1: null,
      Localityerror1: false,
      StreetName1: null,
      StreetNameerror1: false,
      AdminArea1: null,
      AdminAreaerror1: false,
      StreetNumber1: null,
      StreetNumbererror1: false,
      AddressID: null,
      isOn1: false,
      isOn: false,
      addressesss: [
        {name: 'Home', Icon: 'home', ischeck: true},
        {name: 'Work', Icon: 'business', ischeck: false},
        {name: 'Other', Icon: 'location-sharp', ischeck: false},
      ],
      AddressCategory: 'Home',
      Direction: null,
    };
  }
  async componentDidMount() {
    try {
      var MobileNumber = await AsyncStorage.getItem('MobileNumber');
      this.setState({MobileNumber: MobileNumber});
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      // Fetch user addresses
      const addressResponse = await axios.get(
        URL_key +
          'api/AddressApi/gCustomerAddress?UserProfileID=' +
          UserProfileID,
        {
          headers: {'content-type': 'application/json'},
        },
      );
      console.log(addressResponse.data);
      let AddressList = addressResponse.data;

      // Fetch all states
      const stateResponse = await axios.get(
        URL_key + 'api/AddressApi/gStateDDL',
        {
          headers: {'content-type': 'application/json'},
        },
      );

      const StateDDl = stateResponse.data;

      // Process each address to fetch StateName and CityName
      const updatedAddresses = await Promise.all(
        AddressList.map(async address => {
          // Find State Name
          const state = StateDDl.find(
            state => state.StateID == address.StateID,
          );
          const StateName = state ? state.StateName : 'Unknown';

          // Fetch Cities for this state
          const cityResponse = await axios.get(
            URL_key + 'api/AddressApi/gCityDDL?StateID=' + address.StateID,
            {
              headers: {'content-type': 'application/json'},
            },
          );

          const CityList = cityResponse.data;
          // console.log(CityList);
          // Find City Name
          const city = CityList.find(city => city.CityI == address.CityID);
          const CityName = city ? city.CityName : 'Unknown';

          return {...address, StateName, CityName};
        }),
      );

      // Update state with the new list
      this.setState({AddressList: updatedAddresses, StateDDl});
    } catch (err) {
      console.log(err);
    }
    const result = await request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );

    if (result === RESULTS.GRANTED) {
      console.log('Location permission granted');
    } else {
      console.log('Location permission denied');
    }
    publicIP()
      .then(ip => {
        console.log(ip);
        this.setState({publicIP: ip});
        // '47.122.71.234'
      })
      .catch(error => {
        console.log(error);
        // 'Unable to get IP address.'
      });
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      // timeout: 15000,
    })
      .then(location => {
        console.log(location);
        var pos = {
          lat: location.latitude,
          lng: location.longitude,
        };
        Geocoder.geocodePosition(pos)
          .then(res => {
            this.setState({
              Address: res[0].formattedAddress,
              AdminArea: res[0].adminArea,
              Country: res[0].country,
              Locality: res[0].locality,
              Pincode: res[0].postalCode,
              StreetName: res[0].streetName,
              StreetNumber: res[0].streetNumber,
            });
            console.log(res[0]);
            // alert(res[0].formattedAddress);
          })
          .catch(error => {
            console.log(error);
          });
        // this.setState({
        //   loca: location,
        //   latitude: location.latitude,
        //   longitude: location.longitude,
        // });

        this.setState({
          loca: location,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      })
      .catch(error => {
        const {code, message} = error;
        console.warn(code, message);
      });
  }
  renderOption(settings) {
    const {item, getLabel} = settings;
    const element = (data, index) => (
      <TouchableOpacity onPress={() => this.props.navigation.push('update')}>
        <View style={styles.btn}>
          <Text style={styles.btnText}>button</Text>
        </View>
      </TouchableOpacity>
    );
    // console.log(item)
    return (
      <View style={styles.optionContainer}>
        <Text
          style={{
            color: 'black',
            // alignSelf: 'center',
            marginLeft: wp('3%'),
            fontSize: Normalize(12),
            fontFamily: 'NexaLight',
            marginTop: hp('1%'),
            marginRight: wp('1%'),
            textAlign: 'left',
          }}>
          {getLabel(item)}
        </Text>
      </View>
    );
  }
  selectedValue(index, item) {
    this.setState({selectedText: item.name});
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
                  fontSize: Normalize(12),
                  fontFamily: 'WorkSans-Regular',

                  textAlign: 'left',

                  borderRadius: 20,
                  color: '#666',

                  // paddingLeft: 10,
                  paddingTop: -4,
                  marginLeft: wp('3%'),
                  // width: wp('30%'),
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
                    fontSize: Normalize(12),
                    fontFamily: 'WorkSans-Regular',

                    textAlign: 'left',

                    borderRadius: 20,
                    color: '#333',

                    paddingLeft: 2,
                    paddingTop: 2,
                    marginLeft: wp('3%'),
                    // width: wp('25%'),
                    flexWrap: 'wrap',
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {getLabel(selectedItem)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  async check1() {
    var UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
    var FullName = await AsyncStorage.getItem('FullName');
    this.setState({StateIDError1: false});
    this.setState({CityIDError1: false});
    this.setState({StreetNameerror1: false});
    this.setState({StreetNumbererror1: false});
    this.setState({Pincodeerror1: false});
    if (this.state.StreetName1 == null) {
      this.setState({StreetNameerror1: true});
    } else if (this.state.StreetNumber1 == null) {
      this.setState({StreetNumbererror1: true});
    } else if (this.state.Pincode1 == null) {
      this.setState({Pincodeerror1: true});
    } else {
      this.setState({StateIDError1: false});
      this.setState({CityIDError1: false});
      this.setState({StreetNameerror1: false});
      this.setState({StreetNumbererror1: false});
      this.setState({Pincodeerror1: false});
      const a = {
        AddressID: this.state.AddressID,
        UserProfileID: UserProfileID,
        Latitude: this.state.latitude,
        Longitude: this.state.longitude,
        IPAddress: this.state.publicIP,
        Pincode: this.state.Pincode1,
        StreetName: this.state.StreetName1,
        StreetNumber: this.state.StreetNumber1,
        CompleteAddress: this.state.CompleteAddress1,
        StateID: this.state.StateID1,
        CityID: this.state.CityID1,
        IsPreferred: this.state.isOn1 == true ? 1 : 0,
        SystemUser: FullName,
      };
      console.log(a);
      axios
        .post(URL_key + 'api/AddressApi/sCustomerAddress', a, {
          headers: {
            'content-type': `application/json`,
          },
        })
        .then(response => {
          console.log(response.data);
          console.log(response.status);
          if (response.data == 'UPDATED') {
            this.setState({showeditaddress: false});
            this.props.navigation.push('AddressList');
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
  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          <Dialog
            visible={this.state.showeditaddress}
            dialogStyle={{
              borderRadius: wp('1%'),
              width: wp('90%'),
              alignSelf: 'center',
            }}
            onTouchOutside={() => console.log('no')}>
            <ScrollView
              style={{
                marginLeft: wp('-6.3%'),
                marginRight: wp('-6.2%'),
                marginTop: hp('-2.45%'),
              }}>
              <View
                style={{
                  backgroundColor: '#00afb5',
                  // width: wp('90%'),
                  borderBottomColor: '#333',
                  borderBottomWidth: 2,

                  borderTopLeftRadius: wp('1%'),
                  borderTopRightRadius: wp('1%'),
                  flexDirection: 'row',
                  // alignItems: 'center',s
                  // justifyContent: 'center',
                }}>
                <Text
                  style={{
                    // textAlign: 'center',
                    color: '#ffff',
                    fontFamily: 'WorkSans-SemiBold',
                    fontSize: Normalize(16),
                    marginLeft: wp('4%'),
                    // marginRight: wp('23%'),
                    marginTop: hp('1.5%'),
                    marginBottom: hp('1.5%'),
                    // alignSelf: 'center',
                  }}>
                  EDIT ADDRESS
                </Text>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    this.setState({showeditaddress: false});
                  }}>
                  <Icon
                    name="close-circle"
                    color={'#ffff'}
                    style={{
                      marginTop: hp('1%'),
                      marginBottom: hp('1%'),
                      marginLeft: wp('30%'),
                    }}
                    size={hp('4.2%')}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  marginLeft: wp('8%'),
                  marginTop: hp('2%'),
                  color: '#333',
                  fontFamily: 'WorkSans-Bold',
                  fontSize: Normalize(12),
                  marginBottom: hp('1%'),
                }}>
                Road/Street/Building Name
              </Text>
              {this.state.StreetName1 == null ||
              this.state.StreetName1 == undefined ? (
                <>
                  <TextInput
                    color={'#333'}
                    fontFamily={'WorkSans-Regular'}
                    placeholderTextColor={'#666'}
                    fontSize={Normalize(12)}
                    maxLength={200}
                    // secureTextEntry={true}
                    // secureTextEntry={this.state.hidePassword1}
                    placeholder="Enter the Name"
                    onChangeText={value =>
                      this.handleInputChange('StreetName1', value)
                    }
                    style={{
                      height: hp('4.5%'),
                      shadowColor: 'white',
                      shadowRadius: 0,
                      width: wp('75%'),
                      marginLeft: wp('6%'),
                      // marginRight: wp('4%'),
                      borderRadius: wp('3%'),

                      borderWidth: 1,
                      borderColor: '#00afb5',

                      marginTop: hp('1.5%'),

                      marginBottom: hp('1%'),

                      justifyContent: 'center',
                      padding: hp('0.7%'),
                      paddingHorizontal: wp('5%'),
                      // paddingTop: hp('1%'),
                    }}
                  />
                </>
              ) : (
                <>
                  <TextInput
                    color={'#333'}
                    fontFamily={'WorkSans-Regular'}
                    placeholderTextColor={'#666'}
                    fontSize={Normalize(12)}
                    maxLength={200}
                    // secureTextEntry={true}
                    // secureTextEntry={this.state.hidePassword1}
                    // placeholder="Enter the Name"
                    value={this.state.StreetName1}
                    onChangeText={value =>
                      this.handleInputChange('StreetName1', value)
                    }
                    style={{
                      height: hp('4.5%'),
                      shadowColor: 'white',
                      shadowRadius: 0,
                      width: wp('75%'),
                      marginLeft: wp('6%'),
                      // marginRight: wp('4%'),
                      borderRadius: wp('3%'),

                      borderWidth: 1,
                      borderColor: '#00afb5',

                      marginTop: hp('1.5%'),

                      marginBottom: hp('1%'),

                      justifyContent: 'center',
                      padding: hp('0.7%'),
                      paddingHorizontal: wp('5%'),
                      // paddingTop: hp('1%'),
                    }}
                  />
                </>
              )}

              {this.state.StreetNameerror1 == true ? (
                <Text style={styles.errorMessage}>
                  * Please Enter Your street Name
                </Text>
              ) : null}

              <Text
                style={{
                  marginLeft: wp('8%'),
                  marginTop: hp('1%'),
                  color: '#333',
                  fontFamily: 'WorkSans-Bold',
                  fontSize: Normalize(12),
                  marginBottom: hp('1%'),
                }}>
                Villa/Apartment Number
              </Text>
              {this.state.StreetNumber1 == null ||
              this.state.StreetNumber1 == undefined ? (
                <>
                  <TextInput
                    color={'#333'}
                    fontFamily={'WorkSans-Regular'}
                    placeholderTextColor={'#666'}
                    fontSize={Normalize(12)}
                    maxLength={200}
                    // keyboardType={"number-pad"}
                    // secureTextEntry={true}
                    // secureTextEntry={this.state.hidePassword1}
                    placeholder="Enter the Number"
                    onChangeText={value =>
                      this.handleInputChange('StreetNumber1', value)
                    }
                    style={{
                      height: hp('4.5%'),
                      shadowColor: 'white',
                      shadowRadius: 0,
                      width: wp('75%'),
                      marginLeft: wp('6%'),
                      // marginRight: wp('4%'),
                      borderRadius: wp('3%'),

                      borderWidth: 1,
                      borderColor: '#00afb5',

                      marginTop: hp('1.5%'),

                      marginBottom: hp('1%'),

                      justifyContent: 'center',
                      padding: hp('0.7%'),
                      paddingHorizontal: wp('5%'),
                      // paddingTop: hp('1%'),
                    }}
                  />
                </>
              ) : (
                <>
                  <TextInput
                    color={'#333'}
                    fontFamily={'WorkSans-Regular'}
                    placeholderTextColor={'#666'}
                    fontSize={Normalize(12)}
                    maxLength={200}
                    // keyboardType={"number-pad"}
                    // secureTextEntry={true}
                    // secureTextEntry={this.state.hidePassword1}
                    // placeholder="Enter the Number"
                    value={this.state.StreetNumber1}
                    onChangeText={value =>
                      this.handleInputChange('StreetNumber1', value)
                    }
                    style={{
                      height: hp('4.5%'),
                      shadowColor: 'white',
                      shadowRadius: 0,
                      width: wp('75%'),
                      marginLeft: wp('6%'),
                      // marginRight: wp('4%'),
                      borderRadius: wp('3%'),

                      borderWidth: 1,
                      borderColor: '#00afb5',

                      marginTop: hp('1.5%'),

                      marginBottom: hp('1%'),

                      justifyContent: 'center',
                      padding: hp('0.7%'),
                      paddingHorizontal: wp('5%'),
                      // paddingTop: hp('1%'),
                    }}
                  />
                </>
              )}

              {this.state.StreetNumbererror1 == true ? (
                <Text style={styles.errorMessage}>
                  * Please Enter Villa/Apartment Number
                </Text>
              ) : null}
              <Text
                style={{
                  marginLeft: wp('8%'),
                  marginTop: hp('1%'),
                  color: '#333',
                  fontFamily: 'WorkSans-Bold',
                  fontSize: Normalize(12),
                  marginBottom: hp('1%'),
                }}>
                Pincode
              </Text>
              {this.state.Pincode1 == null ||
              this.state.Pincode1 == undefined ? (
                <>
                  <TextInput
                    color={'#333'}
                    fontFamily={'WorkSans-Regular'}
                    placeholderTextColor={'#666'}
                    fontSize={Normalize(12)}
                    maxLength={6}
                    // keyboardType={"number-pad"}
                    // secureTextEntry={true}
                    // secureTextEntry={this.state.hidePassword1}
                    placeholder="Enter the Number"
                    onChangeText={value =>
                      this.handleInputChange('Pincode1', value)
                    }
                    style={{
                      height: hp('4.5%'),
                      shadowColor: 'white',
                      shadowRadius: 0,
                      width: wp('75%'),
                      marginLeft: wp('6%'),
                      // marginRight: wp('4%'),
                      borderRadius: wp('3%'),

                      borderWidth: 1,
                      borderColor: '#00afb5',

                      marginTop: hp('1.5%'),

                      marginBottom: hp('1%'),

                      justifyContent: 'center',
                      padding: hp('0.7%'),
                      paddingHorizontal: wp('5%'),
                      // paddingTop: hp('1%'),
                    }}
                  />
                </>
              ) : (
                <>
                  <TextInput
                    color={'#333'}
                    fontFamily={'WorkSans-Regular'}
                    placeholderTextColor={'#666'}
                    fontSize={Normalize(12)}
                    maxLength={6}
                    // keyboardType={"number-pad"}
                    // secureTextEntry={true}
                    // secureTextEntry={this.state.hidePassword1}
                    // placeholder="Enter the Number"
                    value={this.state.Pincode1}
                    onChangeText={value =>
                      this.handleInputChange('Pincode1', value)
                    }
                    style={{
                      height: hp('4.5%'),
                      shadowColor: 'white',
                      shadowRadius: 0,
                      width: wp('75%'),
                      marginLeft: wp('6%'),
                      // marginRight: wp('4%'),
                      borderRadius: wp('3%'),

                      borderWidth: 1,
                      borderColor: '#00afb5',

                      marginTop: hp('1.5%'),

                      marginBottom: hp('1%'),

                      justifyContent: 'center',
                      padding: hp('0.7%'),
                      paddingHorizontal: wp('5%'),
                      // paddingTop: hp('1%'),
                    }}
                  />
                </>
              )}

              {this.state.Pincodeerror1 == true ? (
                <Text style={styles.errorMessage}>* Please enter pincode</Text>
              ) : null}

              <ToggleSwitch
                isOn={this.state.isOn1}
                onColor="green"
                offColor="red"
                label="Current Address"
                labelStyle={{
                  fontFamily: 'WorkSans-Bold',
                  fontSize: Normalize(12),
                  marginLeft: wp('8%'),
                }}
                size="small"
                onToggle={isOn => {
                  this.setState({isOn1: !this.state.isOn1});
                }}
              />
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  this.check1();
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
                    marginTop: hp('5%'),
                    marginBottom: hp('1.5%'),
                    borderColor: '#216e66',
                    // borderWidth: 1,
                  }}>
                  <Text
                    style={{
                      color: '#ffff',
                      fontSize: 13,
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
            </ScrollView>
          </Dialog>
          <Icon
            onPress={() => {
              this.props.navigation.push('TabP');
            }}
            name="arrow-back-outline"
            color={'#333'}
            size={30}
            style={{
              marginLeft: wp('2%'),
              padding: hp('1.5%'),
              marginTop: hp('3%'),
            }}
          />

          <Text
            style={{
              fontSize: 16,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Medium',
              marginTop: hp('-5.2%'),
              marginLeft: wp('17%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            ADDRESSES
          </Text>
          <View
            style={{
              width: wp('100%'),
              backgroundColor: '#f2f2f2',
              height: hp('8%'),
              justifyContent: 'center',
              marginTop: hp('2%'),
            }}>
            <Text
              style={{
                fontSize: 11,
                // textAlign: "center",
                //   justifyContent: 'center',
                color: '#707070',
                fontFamily: 'Poppins-SemiBold',
                // marginTop: hp('-5.2%'),
                marginLeft: wp('8%'),
                // marginRight: wp('20%'),
                // marginRight: wp('5%'),
              }}>
              SAVED ADDRESSES
            </Text>
          </View>
          {/* <Icon
                        onPress={() => {
                            this.setState({ showaddress: true })
                        }}
                        name="add-circle"
                        color={'#00afb5'}
                        size={40}
                        style={{ marginRight: wp('4%'), padding: hp('1%'), alignSelf: "flex-end" }}
                    /> */}
          <FlatList
            data={this.state.AddressList}
            // horizontal={true}
            renderItem={({item, index}) => {
              return (
                <>
                  <Icon
                    onPress={() => {
                      this.setState({showaddress: true});
                    }}
                    name={
                      item.AddressCategory == 'Home'
                        ? 'home-outline'
                        : item.AddressCategory == 'Work'
                        ? 'business-outline'
                        : 'location-outline'
                    }
                    color={'#333'}
                    size={25}
                    style={{marginLeft: wp('10%'), marginTop: hp('3%')}}
                  />
                  <Text
                    style={{
                      color: '#333',
                      fontSize: 14,
                      fontFamily: 'Poppins-Medium',
                      // textAlign: 'center',
                      marginTop: hp('-3%'),
                      // marginBottom: hp('1%'),
                      marginLeft: wp('20%'),
                    }}>
                    {item.AddressCategory}
                  </Text>
                  <Text
                    style={{
                      color: '#333',
                      fontSize: 13,
                      fontFamily: 'Poppins-Light',
                      // textAlign: 'center',
                      marginTop: hp('0.5%'),
                      // marginBottom: hp('1%'),
                      marginLeft: wp('20%'),
                      marginRight: wp('10%'),
                    }}>
                    {item.CompleteAddress}
                  </Text>
                  <Text
                    style={{
                      color: '#333',
                      fontSize: 13,
                      fontFamily: 'Poppins-Light',
                      // textAlign: 'center',
                      marginTop: hp('0.5%'),
                      // marginBottom: hp('1%'),
                      marginLeft: wp('20%'),
                      marginRight: wp('10%'),
                    }}>
                    Phone number: {this.state.MobileNumber}
                  </Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text
                      onPress={() => {
                        axios
                          .get(URL_key + 'api/AddressApi/gStateDDL', {
                            headers: {
                              'content-type': `application/json`,
                            },
                          })
                          .then(response1 => {
                            this.setState({StateDDl1: response1.data});
                            var cou = response1.data.filter(
                              data => data.StateID == item.StateID,
                            );
                            axios
                              .get(
                                URL_key +
                                  'api/AddressApi/gCityDDL?StateID=' +
                                  item.StateID,
                                {
                                  headers: {
                                    'content-type': `application/json`,
                                  },
                                },
                              )
                              .then(response2 => {
                                this.setState({CityDDl1: response2.data});
                                var cou1 = response2.data.filter(
                                  data => data.CityI == item.CityID,
                                );
                                this.setState({
                                  City1: cou1[0].CityName,
                                });
                                console.log(cou);
                              })
                              .catch(err => {
                                console.log(err);
                              });
                            this.setState({
                              State1: cou[0].StateName,
                            });
                            console.log(cou);
                          })
                          .catch(err => {
                            console.log(err);
                          });
                        this.setState({
                          showeditaddress: true,
                          AddressID: item.AddressID,
                          Latitude1: item.Latitude,
                          Longitude1: item.Longitude,
                          StreetName1: item.StreetName,
                          StreetNumber1: item.StreetNumber,
                          IPAddress1: item.IPAddress,
                          Pincode1: item.Pincode,
                          CompleteAddress1: item.CompleteAddress,
                          StateID1: item.StateID,
                          CityID1: item.CityID,
                        });
                      }}
                      style={{
                        color: '#d60202',
                        fontSize: 13,
                        fontFamily: 'Poppins-SemiBold',
                        // textAlign: 'center',
                        marginTop: hp('0.5%'),
                        // marginBottom: hp('1%'),
                        marginLeft: wp('20%'),
                        marginRight: wp('3%'),
                      }}>
                      EDIT
                    </Text>
                    <Text
                      onPress={async () => {
                        if (this.state.AddressList.length != 1) {
                          var UserProfileID = await AsyncStorage.getItem(
                            'LoginUserProfileID',
                          );
                          var SystemUser = await AsyncStorage.getItem(
                            'FullName',
                          );
                          var SystemDate = moment().format(
                            'YYYY-MM-DD hh:mm:ss A',
                          );
                          const a = {
                            UserProfileID: UserProfileID,
                            AddressID: item.AddressID,
                            SystemUser: SystemUser,
                            SystemDate: SystemDate,
                          };
                          axios
                            .post(
                              URL_key + 'api/AddressApi/dCustomerAddress',
                              a,
                              {
                                headers: {
                                  'content-type': `application/json`,
                                },
                              },
                            )
                            .then(response => {
                              console.log(response.data);
                              console.log(response.status);
                              if (response.data == 'DELETED') {
                                this.props.navigation.push('AddressList');
                              } else {
                                this.setState({fail: true});
                              }
                            })
                            .catch(err => {
                              this.setState({fail: true});
                            });
                        }
                      }}
                      style={{
                        color: '#d60202',
                        fontSize: 13,
                        fontFamily: 'Poppins-SemiBold',
                        // textAlign: 'center',
                        marginTop: hp('0.5%'),
                        // marginBottom: hp('1%'),
                        marginLeft: wp('5%'),
                        marginRight: wp('3%'),
                      }}>
                      DELETE
                    </Text>
                    {/* <Text
                                            style={{
                                                color: '#d60202',
                                                fontSize: 13,
                                                fontFamily: 'Poppins-SemiBold',
                                                // textAlign: 'center',
                                                marginTop: hp('0.5%'),
                                                // marginBottom: hp('1%'),
                                                marginLeft: wp('5%'), marginRight: wp('3%')
                                            }}>
                                            SHARE
                                        </Text> */}
                  </View>
                  <Separator />
                  {/* <View style={{ width: wp('80%'), borderWidth: 1, borderColor: "#333", alignSelf: "center", marginTop: hp('3%'), borderTopLeftRadius: wp('2%'), borderTopRightRadius: wp('2%') }}>
                                        <Text
                                            style={{
                                                color: '#333',
                                                fontSize: 12,
                                                fontFamily: 'Poppins-Light',
                                                // textAlign: 'center',
                                                marginTop: hp('2%'),
                                                // marginBottom: hp('1%'),
                                                marginLeft: wp('7%'),
                                            }}>
                                            {item.StreetNumber},
                                        </Text>
                                        <Text
                                            style={{
                                                color: '#333',
                                                fontSize: 12,
                                                fontFamily: 'Poppins-Light',
                                                // textAlign: 'center',
                                                marginTop: hp('0.5%'),
                                                // marginBottom: hp('1%'),
                                                marginLeft: wp('7%'),
                                            }}>
                                            {item.StreetName}
                                        </Text>
                                        <Text
                                            style={{
                                                color: '#333',
                                                fontSize: 12,
                                                fontFamily: 'Poppins-Light',
                                                // textAlign: 'center',
                                                marginTop: hp('0.5%'),
                                                // marginBottom: hp('1%'),
                                                marginLeft: wp('7%'),
                                            }}>
                                            {item.Pincode} {item.CityName}
                                        </Text>
                                        <Text
                                            style={{
                                                color: '#333',
                                                fontSize: 12,
                                                fontFamily: 'Poppins-Light',
                                                // textAlign: 'center',
                                                marginTop: hp('0.5%'),
                                                marginBottom: hp('2%'),
                                                marginLeft: wp('7%'),
                                            }}>
                                            {item.StateName}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: "row", alignSelf: "center" }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                axios
                                                    .get(URL_key + 'api/AddressApi/gStateDDL', {
                                                        headers: {
                                                            'content-type': `application/json`,
                                                        },
                                                    })
                                                    .then(response1 => {
                                                        this.setState({ StateDDl1: response1.data })
                                                        var cou =
                                                            response1.data.filter(
                                                                data =>
                                                                    data.StateID == item.StateID,
                                                            );
                                                        axios
                                                            .get(URL_key + 'api/AddressApi/gCityDDL?StateID=' + item.StateID, {
                                                                headers: {
                                                                    'content-type': `application/json`,
                                                                },
                                                            })
                                                            .then(response2 => {
                                                                this.setState({ CityDDl1: response2.data })
                                                                var cou1 =
                                                                    response2.data.filter(
                                                                        data =>
                                                                            data.CityI == item.CityID,
                                                                    );
                                                                this.setState({

                                                                    City1: cou1[0].CityName,

                                                                })
                                                                console.log(cou)
                                                            })
                                                            .catch(err => {
                                                                console.log(err);

                                                            });
                                                        this.setState({

                                                            State1: cou[0].StateName,

                                                        })
                                                        console.log(cou)
                                                    })
                                                    .catch(err => {
                                                        console.log(err);

                                                    });
                                                this.setState({
                                                    showeditaddress: true,
                                                    AddressID: item.AddressID,
                                                    Latitude1: item.Latitude,
                                                    Longitude1: item.Longitude,
                                                    StreetName1: item.StreetName,
                                                    StreetNumber1: item.StreetNumber,
                                                    IPAddress1: item.IPAddress,
                                                    Pincode1: item.Pincode,
                                                    CompleteAddress1: item.CompleteAddress,
                                                    StateID1: item.StateID,
                                                    CityID1: item.CityID,

                                                })
                                            }}>


                                            <View style={{ width: wp('40%'), borderLeftWidth: 1, borderColor: "#333", alignSelf: "center", borderBottomLeftRadius: wp('2%'), borderRightWidth: 1, borderBottomWidth: 1, height: hp('5%'), alignItems: "center", justifyContent: "center" }}>
                                                <Text
                                                    style={{
                                                        color: '#333',
                                                        fontSize: 11,
                                                        fontFamily: 'Poppins-SemiBold',
                                                        // textAlign: 'center',
                                                        // marginTop: hp('1%'),
                                                        // // marginBottom: hp('1%'),
                                                        // marginLeft: wp('10%'),
                                                    }}>
                                                    Edit
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={async () => {
                                                var UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
                                                var SystemUser = await AsyncStorage.getItem('FullName');
                                                var SystemDate = moment().format('YYYY-MM-DD hh:mm:ss A');
                                                const a = {

                                                    UserProfileID: UserProfileID,
                                                    AddressID: item.AddressID,
                                                    SystemUser: SystemUser,
                                                    SystemDate: SystemDate
                                                }
                                                axios
                                                    .post(URL_key + 'api/AddressApi/dCustomerAddress', a, {
                                                        headers: {
                                                            'content-type': `application/json`,
                                                        },
                                                    })
                                                    .then(response => {
                                                        console.log(response.data)
                                                        console.log(response.status)
                                                        if (response.data == "DELETED") {

                                                            this.props.navigation.push("AddressList")
                                                        } else {
                                                            this.setState({ fail: true })
                                                        }
                                                    }).catch(err => {
                                                        this.setState({ fail: true })
                                                    })
                                            }}>


                                            <View style={{ width: wp('40%'), borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#333", alignSelf: "center", borderBottomRightRadius: wp('2%'), height: hp('5%'), alignItems: "center", justifyContent: "center" }}>
                                                <Text
                                                    style={{
                                                        color: '#333',
                                                        fontSize: 11,
                                                        fontFamily: 'Poppins-SemiBold',
                                                        // textAlign: 'center',
                                                        // marginTop: hp('1%'),
                                                        // // marginBottom: hp('1%'),
                                                        // marginLeft: wp('10%'),
                                                    }}>
                                                    Remove
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View> */}
                </>
              );
            }}
          />
          <TouchableOpacity
            onPress={() => {
              this.RBSheet.open();
            }}>
            <View
              style={{
                width: wp('90%'),
                borderWidth: 1,
                height: hp('5%'),
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: '#00afb5',
                marginTop: hp('2%'),
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  color: '#00afb5',
                  fontSize: 12,
                  fontFamily: 'Poppins-SemiBold',
                  // textAlign: 'center',
                  // marginTop: hp('1%'),
                  // // marginBottom: hp('1%'),
                  // marginLeft: wp('10%'),
                }}>
                ADD NEW ADDRESS
              </Text>
            </View>
          </TouchableOpacity>
          <RBSheet
            ref={ref => {
              this.RBSheet = ref;
            }}
            // closeOnDragDown={true}
            closeOnPressMask={true}
            closeOnPressBack={true}
            height={hp('100%')}
            // openDuration={250}
            customStyles={{
              container: {
                // justifyContent: "center",
                // alignItems: "center"
              },
            }}>
            <ScrollView>
              <Icon
                style={{
                  // width: wp('10%'),
                  // marginRight: hp('2%'),
                  marginTop: hp('2%'),
                  marginLeft: wp('5%'),
                  // paddingLeft: wp('-4%'),
                  // position: "absolute", top: hp('1%'), left: wp('5%')
                }}
                onPress={() => {
                  this.RBSheet.close();
                }}
                activeOpacity={0.5}
                name="close-circle-outline"
                color={'grey'}
                size={hp('3%')}
              />

              <View
                style={{
                  width: wp('90%'),
                  borderRadius: wp('1%'),
                  backgroundColor: '#fefaf2',
                  alignSelf: 'center',
                  borderWidth: 1,
                  borderColor: '#c2ad89',
                  marginTop: hp('1%'),
                  marginBottom: hp('1%'),
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#c2ad89',
                    fontSize: 11,
                    fontFamily: 'Poppins-SemiBold',
                    // textAlign: 'center',
                    marginTop: hp('1%'),
                    marginBottom: hp('1%'),
                    marginLeft: wp('3%'),
                    marginRight: wp('3%'),
                    // lineHeight: hp('2.5%'),
                  }}>
                  A detailed address will help our Delivery Partner reach your
                  doorstep easily
                </Text>
              </View>
              {/* <Text
                                style={{
                                    color: 'gray',
                                    fontSize: 12,
                                    fontFamily: 'Poppins-Light',
                                    // textAlign: 'center',
                                    marginTop: hp('3%'),
                                    marginBottom: hp('-1%'), marginLeft: wp('9%')
                                    // lineHeight: hp('2.5%'),
                                }}>
                                HOUSE / FLAT / BLOCK NO.
                            </Text> */}
              <TextInput
                color={'#333'}
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'#666'}
                fontSize={Normalize(10)}
                maxLength={200}
                // keyboardType={"number-pad"}
                // secureTextEntry={true}
                // secureTextEntry={this.state.hidePassword1}
                placeholder="HOUSE / FLAT / BLOCK NO."
                // value={this.state.StreetNumber}
                onChangeText={value =>
                  this.handleInputChange('StreetNumber', value)
                }
                style={{
                  height: hp('4.5%'),
                  shadowColor: 'white',
                  shadowRadius: 0,
                  width: wp('85%'),
                  marginLeft: wp('8%'),
                  // marginRight: wp('4%'),
                  // borderRadius: wp('3%'),

                  borderBottomWidth: 1,
                  borderColor: 'grey',

                  marginTop: hp('1%'),

                  marginBottom: hp('1%'),

                  justifyContent: 'center',
                  padding: hp('0.7%'),
                  // paddingHorizontal: wp('5%'),
                  // paddingTop: hp('1%'),
                }}
              />
              {this.state.StreetNumbererror == true ? (
                <Text style={styles.errorMessage}>
                  * Please enter street number.
                </Text>
              ) : null}
              <TextInput
                color={'#333'}
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'#666'}
                fontSize={Normalize(10)}
                maxLength={200}
                // keyboardType={"number-pad"}
                // secureTextEntry={true}
                // secureTextEntry={this.state.hidePassword1}
                placeholder="APARTMENT / ROAD / AREA"
                // value={this.state.StreetName}
                onChangeText={value =>
                  this.handleInputChange('StreetName', value)
                }
                style={{
                  height: hp('4.5%'),
                  shadowColor: 'white',
                  shadowRadius: 0,
                  width: wp('85%'),
                  marginLeft: wp('8%'),
                  // marginRight: wp('4%'),
                  // borderRadius: wp('3%'),

                  borderBottomWidth: 1,
                  borderColor: 'grey',

                  marginTop: hp('3%'),

                  marginBottom: hp('1%'),

                  justifyContent: 'center',
                  padding: hp('0.7%'),
                  // paddingHorizontal: wp('5%'),
                  // paddingTop: hp('1%'),
                }}
              />
              {this.state.StreetNameerror == true ? (
                <Text style={styles.errorMessage}>
                  * Please enter street name.
                </Text>
              ) : null}
              <TextInput
                color={'#333'}
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'#666'}
                fontSize={Normalize(10)}
                maxLength={6}
                keyboardType={'number-pad'}
                // secureTextEntry={true}
                // secureTextEntry={this.state.hidePassword1}
                placeholder="PINCODE"
                onChangeText={value => this.handleInputChange('Pincode', value)}
                style={{
                  height: hp('4.5%'),
                  shadowColor: 'white',
                  shadowRadius: 0,
                  width: wp('85%'),
                  marginLeft: wp('8%'),
                  // marginRight: wp('4%'),
                  // borderRadius: wp('3%'),

                  borderBottomWidth: 1,
                  borderColor: 'grey',

                  marginTop: hp('3%'),

                  marginBottom: hp('1%'),

                  justifyContent: 'center',
                  padding: hp('0.7%'),
                  // paddingHorizontal: wp('5%'),
                  // paddingTop: hp('1%'),
                }}
              />
              {this.state.Pincodeerror == true ? (
                <Text style={styles.errorMessage}>* Please enter Pincode.</Text>
              ) : null}
              <TextInput
                color={'#333'}
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'#666'}
                fontSize={Normalize(10)}
                maxLength={200}
                // keyboardType={"number-pad"}
                // secureTextEntry={true}
                // secureTextEntry={this.state.hidePassword1}
                placeholder="COMPLETE ADDRESS"
                // value={this.state.Address}
                onChangeText={value => this.handleInputChange('Address', value)}
                style={{
                  height: hp('4.5%'),
                  shadowColor: 'white',
                  shadowRadius: 0,
                  width: wp('85%'),
                  marginLeft: wp('8%'),
                  // marginRight: wp('4%'),
                  // borderRadius: wp('3%'),

                  borderBottomWidth: 1,
                  borderColor: 'grey',

                  marginTop: hp('3%'),

                  marginBottom: hp('1%'),

                  justifyContent: 'center',
                  padding: hp('0.7%'),
                  // paddingHorizontal: wp('5%'),
                  // paddingTop: hp('1%'),
                }}
              />
              {this.state.Addresserror == true ? (
                <Text style={styles.errorMessage}>
                  * Please enter complete address.
                </Text>
              ) : null}
              <Text
                style={{
                  color: 'gray',
                  fontSize: 12,
                  fontFamily: 'Poppins-Light',
                  // textAlign: 'center',
                  marginTop: hp('3%'),
                  marginBottom: hp('-1%'),
                  marginLeft: wp('9%'),
                  // lineHeight: hp('2.5%'),
                }}>
                DIRECTIONS TO REACH (OPTIONAL)
              </Text>
              <TextInput
                color={'#333'}
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'#666'}
                fontSize={Normalize(11)}
                maxLength={200}
                // keyboardType={"number-pad"}
                // secureTextEntry={true}
                // secureTextEntry={this.state.hidePassword1}
                placeholder="e.g. Ring the bell on the red gate"
                // value={this.state.StreetNumber}
                onChangeText={value =>
                  this.handleInputChange('Direction', value)
                }
                style={{
                  height: hp('17%'),
                  shadowColor: 'white',
                  shadowRadius: 0,
                  width: wp('85%'),
                  marginLeft: wp('8%'),
                  // marginRight: wp('4%'),
                  borderRadius: wp('1.5%'),

                  borderWidth: 1,
                  borderColor: 'grey',

                  marginTop: hp('2%'),

                  marginBottom: hp('1%'),

                  justifyContent: 'center',
                  padding: hp('0.7%'),
                  paddingHorizontal: wp('5%'),
                  textAlignVertical: 'top',
                  // paddingTop: hp('1%'),
                }}
              />
              <Text
                style={{
                  color: 'gray',
                  fontSize: 12,
                  fontFamily: 'Poppins-Light',
                  // textAlign: 'center',
                  marginTop: hp('3%'),
                  marginLeft: wp('9%'),
                  // lineHeight: hp('2.5%'),
                }}>
                SAVE THIS ADDRESS AS
              </Text>
              <View
                style={{
                  marginLeft: wp('5%'),
                  marginRight: wp('5%'),
                  marginTop: hp('3%'),
                }}>
                <FlatList
                  data={this.state.addressesss}
                  horizontal={true}
                  renderItem={({item, index}) => {
                    return (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            if (item.ischeck == false) {
                              const updatedData = this.state.addressesss.map(
                                (item, i) => ({
                                  ...item,
                                  ischeck: i === index, // Set ischeck true only for the clicked item
                                }),
                              );
                              const selectedItem = updatedData.find(
                                item => item.ischeck,
                              );
                              console.log(
                                'Selected Item Name:',
                                selectedItem.name,
                              ); // Logs
                              this.setState({
                                addressesss: updatedData,
                                AddressCategory: selectedItem.name,
                              });
                            }
                          }}>
                          <View
                            style={{
                              width: wp('26%'),
                              height: hp('5%'),
                              backgroundColor:
                                item.ischeck == true ? '#297801' : '#f2f4f4',
                              borderRadius: wp('5%'),
                              flexDirection: 'row',
                              marginLeft: wp('2%'),
                              marginRight: wp('2%'),
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Icon
                              style={{}}
                              onPress={() => {
                                this.props.navigation.push('Login');
                              }}
                              activeOpacity={0.5}
                              name={item.Icon}
                              color={item.ischeck == true ? '#ffff' : '#333'}
                              size={hp('2.5%')}
                            />
                            <Text
                              style={{
                                color: item.ischeck == true ? '#ffff' : '#333',
                                fontSize: 12,
                                fontFamily: 'Poppins-SemiBold',
                                // textAlign: 'center',
                                marginTop: hp('0.2%'),
                                marginLeft: wp('2%'),
                                // lineHeight: hp('2.5%'),
                              }}>
                              {item.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </>
                    );
                  }}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={async () => {
                  var UserProfileID = await AsyncStorage.getItem(
                    'LoginUserProfileID',
                  );
                  var FullName = await AsyncStorage.getItem('FullName');
                  if (
                    this.state.StreetName == null ||
                    this.state.StreetName == undefined
                  ) {
                    this.setState({StreetNameerror: true});
                  } else if (
                    this.state.StreetNumber == null ||
                    this.state.StreetNumber == undefined
                  ) {
                    this.setState({StreetNumbererror: true});
                  } else {
                    const a = {
                      AddressID: 0,
                      UserProfileID: UserProfileID,
                      Latitude: this.state.latitude,
                      Longitude: this.state.longitude,
                      IPAddress: this.state.publicIP,
                      Pincode: this.state.Pincode,
                      StreetName: this.state.StreetName,
                      StreetNumber: this.state.StreetNumber,
                      CompleteAddress: this.state.Address,
                      StateID: 0,
                      CityID: 0,
                      IsPreferred: 0,
                      SystemUser: FullName,
                      Direction: this.state.Direction,
                      AddressCategory: this.state.AddressCategory,
                    };
                    console.log(a);
                    axios
                      .post(URL_key + 'api/AddressApi/sCustomerAddress', a, {
                        headers: {
                          'content-type': `application/json`,
                        },
                      })
                      .then(response => {
                        console.log(response.data);
                        console.log(response.status);
                        if (response.data == 'INSERTED') {
                          this.setState({showaddress: false});
                          this.props.navigation.push('AddressList');
                        } else {
                          this.setState({fail: true});
                        }
                      })
                      .catch(err => {
                        console.log(err);
                        this.setState({fail: true});
                      });
                  }
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
                    marginTop: hp('5%'),
                    marginBottom: hp('1.5%'),
                    borderColor: '#216e66',
                    // borderWidth: 1,
                  }}>
                  <Text
                    style={{
                      color: '#ffff',
                      fontSize: 13,
                      fontFamily: 'Poppins-SemiBold',
                      textAlign: 'center',
                      // marginTop: hp('-2%'),
                      // marginBottom: hp('2.5%'),
                      // marginLeft:wp('5%'),marginRight:wp('3%'),
                    }}>
                    SAVE AND PROCEED
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </RBSheet>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
const Separator = () => <View style={styles.separator} />;
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: '#e6e6e6',
    borderBottomWidth: 1,
    marginTop: hp('2%'),
    width: wp('100%'),
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
    marginLeft: wp('8%'),
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontal: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('50%'),
  },
  separator1: {
    borderBottomColor: '#00afb5',
    borderBottomWidth: 0.5,
    marginBottom: hp('2%'),
    marginTop: hp('1%'),
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
    borderBottomColor: '#00afb5',
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
});

export default AddressList;
