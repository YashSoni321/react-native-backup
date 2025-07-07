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
import { Dialog } from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Normalize from './size';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { NavigationEvents } from 'react-navigation';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
var date = moment().format('YYYY/MM/DD ');
var time = moment().format('hh:mm A');
import ImagePicker from 'react-native-image-crop-picker';
import { CustomPicker } from 'react-native-custom-picker';
import { API_KEY, URL_key } from './api';
import axios from 'axios';
var RNFS = require('react-native-fs');
import GetLocation from 'react-native-get-location';
import LinearGradient from 'react-native-linear-gradient';
import MenuDrawer from 'react-native-side-drawer';
import RNFetchBlob from 'rn-fetch-blob';
import { image } from './image';
import { marginBottom } from 'styled-system';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker } from 'react-native-maps';
class ShippAddress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories1: [
        {
          name: 'Wallets',
          Icon: 'wallet',
          nav: 'Receivables',
        },
        {
          name: 'Grocery',
          Icon: 'color-filter',
          nav: 'Receivables',
        },
      ],
      latitude: 18.1124,
      longitude: 79.0193,
      longitudeDelta: 0.0922,
      latitudeDelta: 0.0421,
      loca: null,
    };
  }
  async componentDidMount() {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      // timeout: 15000,
    })
      .then(location => {
        this.setState({
          loca: location,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      });
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
  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          <View
            style={{
              backgroundColor: '#ffff',
            }}>
            <Image
              style={{
                //  borderWidth: 1,
                height: hp('12%'),
                width: wp('80%'),
                // borderColor: 'forestgreen',
                // borderRadius: hp('100%'),
                alignSelf: 'center',
                justifyContent: 'center',
                marginTop: hp('0.5%'),
                marginBottom: hp('3%'),
                // backgroundColor:"lightgrey"s
                // marginTop: hp('15%'),
                // marginBottom: hp('1%'),
                //   marginLeft:wp('17.5%')
              }}
              resizeMode="contain"
              source={require('../assets/FYBR-Logo.jpg')}
            />
            <Icon
              onPress={() => {
                this.props.navigation.navigate('tabc');
              }}
              name={'chevron-back'}
              color="#333"
              size={35}
              style={{
                marginTop: hp('-11.5%'),
                marginLeft: wp('2%'),
                marginBottom: hp('6%'),
              }}
            />
          </View>
          <View style={{ backgroundColor: '#00afb5' }}>
            <View
              style={{
                backgroundColor: '#ffff',
                width: wp('65%'),
                height: hp('5%'),
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                borderRadius: wp('5%'),
                marginTop: hp('-2.5%'),
                marginBottom: hp('1.5%'),
                borderColor: '#216e66',
                borderWidth: 1,
              }}>
              <Text
                style={{
                  color: '#333',
                  fontSize: 18,
                  fontFamily: 'Poppins-Light',
                  textAlign: 'center',
                  // marginTop: hp('-2%'),
                  // marginBottom: hp('2.5%'),
                  // marginLeft:wp('5%'),marginRight:wp('3%'),
                }}>
                SHIPPING ADDRESS
              </Text>
            </View>

            <Text
              style={{
                fontSize: 14,
                // textAlign: 'center',
                //   justifyContent: 'center',
                color: 'lightgrey',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('1%'),
                marginLeft: wp('6%'),
                marginRight: wp('1%'),
              }}>
              Flat , House no., Building
            </Text>
            <View
              style={{
                justifyContent: 'center',
                // borderWidth: wp('0.2%'),
                borderRadius: wp('2%'),
                // borderWidth: 1,
                // padding: 5,
                height: hp('5%'),
                // marginBottom: hp('3%'),
                borderColor: '#00afb5',
                marginTop: hp('2%'),
                backgroundColor: '#f0f0f0',

                width: wp('90%'),
                alignSelf: 'center',
                flexDirection: 'row',
                marginBottom: hp('1%'),
                // paddingLeft: wp('12%'),a
                // alignItems: 'center',
                textAlignVertical: 'top',
                alignSelf: 'center',
              }}>
              <Icon
                name="at-circle-outline"
                color={'#00afb5'}
                size={25}
                style={{ marginTop: hp('0.7%'), marginLeft: wp('3%') }}
              />
              <TextInput
                placeholder="Enter Flat , House no..."
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'grey'}
                color={'black'}
                fontSize={14}
                maxLength={250}
                multiline={true}
                onChangeText={value =>
                  this.handleInputChange('ADDRESSLINE1', value)
                }
                style={{
                  // borderWidth: 1,
                  padding: hp('1%'),
                  width: wp('75%'),
                  marginLeft: wp('1%'),
                  textAlignVertical: 'top',
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                // textAlign: 'center',
                //   justifyContent: 'center',
                color: 'lightgrey',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('1%'),
                marginLeft: wp('6%'),
                marginRight: wp('1%'),
              }}>
              Area, Street, Sector, Village
            </Text>
            <View
              style={{
                justifyContent: 'center',
                // borderWidth: wp('0.2%'),
                borderRadius: wp('2%'),
                // borderWidth: 1,
                // padding: 5,
                height: hp('5%'),
                // marginBottom: hp('3%'),
                borderColor: '#00afb5',
                marginTop: hp('2%'),
                backgroundColor: '#f0f0f0',

                width: wp('90%'),
                alignSelf: 'center',
                flexDirection: 'row',
                marginBottom: hp('1%'),
                // paddingLeft: wp('12%'),a
                // alignItems: 'center',
                textAlignVertical: 'top',
                alignSelf: 'center',
              }}>
              <Icon
                name="shield-checkmark-outline"
                color={'#00afb5'}
                size={25}
                style={{ marginTop: hp('0.7%'), marginLeft: wp('3%') }}
              />
              <TextInput
                placeholder="Enter Area, Street, Sector..."
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'grey'}
                color={'black'}
                fontSize={14}
                maxLength={250}
                multiline={true}
                onChangeText={value =>
                  this.handleInputChange('ADDRESSLINE1', value)
                }
                style={{
                  // borderWidth: 1,
                  padding: hp('1%'),
                  width: wp('75%'),
                  marginLeft: wp('1%'),
                  textAlignVertical: 'top',
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                // textAlign: 'center',
                //   justifyContent: 'center',
                color: 'lightgrey',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('1%'),
                marginLeft: wp('6%'),
                marginRight: wp('1%'),
              }}>
              Town/City
            </Text>
            <View
              style={{
                justifyContent: 'center',
                // borderWidth: wp('0.2%'),
                borderRadius: wp('2%'),
                // borderWidth: 1,
                // padding: 5,
                height: hp('5%'),
                // marginBottom: hp('3%'),
                borderColor: '#00afb5',
                marginTop: hp('2%'),
                backgroundColor: '#f0f0f0',

                width: wp('90%'),
                alignSelf: 'center',
                flexDirection: 'row',
                marginBottom: hp('1%'),
                // paddingLeft: wp('12%'),a
                // alignItems: 'center',
                textAlignVertical: 'top',
                alignSelf: 'center',
              }}>
              <Icon
                name="male-outline"
                color={'#00afb5'}
                size={25}
                style={{ marginTop: hp('0.7%'), marginLeft: wp('3%') }}
              />
              <TextInput
                placeholder="Enter Town/City"
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'grey'}
                color={'black'}
                fontSize={14}
                maxLength={250}
                multiline={true}
                onChangeText={value =>
                  this.handleInputChange('ADDRESSLINE1', value)
                }
                style={{
                  // borderWidth: 1,
                  padding: hp('1%'),
                  width: wp('75%'),
                  marginLeft: wp('1%'),
                  textAlignVertical: 'top',
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                // textAlign: 'center',
                //   justifyContent: 'center',
                color: 'lightgrey',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('1%'),
                marginLeft: wp('6%'),
                marginRight: wp('1%'),
              }}>
              State
            </Text>
            <View
              style={{
                justifyContent: 'center',
                // borderWidth: wp('0.2%'),
                borderRadius: wp('2%'),
                // borderWidth: 1,
                // padding: 5,
                height: hp('5%'),
                // marginBottom: hp('3%'),
                borderColor: '#00afb5',
                marginTop: hp('2%'),
                backgroundColor: '#f0f0f0',

                width: wp('90%'),
                alignSelf: 'center',
                flexDirection: 'row',
                marginBottom: hp('1%'),
                // paddingLeft: wp('12%'),a
                // alignItems: 'center',
                textAlignVertical: 'top',
                alignSelf: 'center',
              }}>
              <Icon
                name="sync-circle-outline"
                color={'#00afb5'}
                size={25}
                style={{ marginTop: hp('0.7%'), marginLeft: wp('3%') }}
              />
              <TextInput
                placeholder="Enter State"
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'grey'}
                color={'black'}
                fontSize={14}
                maxLength={250}
                multiline={true}
                onChangeText={value =>
                  this.handleInputChange('ADDRESSLINE1', value)
                }
                style={{
                  // borderWidth: 1,
                  padding: hp('1%'),
                  width: wp('75%'),
                  marginLeft: wp('1%'),
                  textAlignVertical: 'top',
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                // textAlign: 'center',
                //   justifyContent: 'center',
                color: 'lightgrey',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('1%'),
                marginLeft: wp('6%'),
                marginRight: wp('1%'),
              }}>
              Pincode
            </Text>
            <View
              style={{
                justifyContent: 'center',
                // borderWidth: wp('0.2%'),
                borderRadius: wp('2%'),
                // borderWidth: 1,
                // padding: 5,
                height: hp('5%'),
                // marginBottom: hp('3%'),
                borderColor: '#00afb5',
                marginTop: hp('2%'),
                backgroundColor: '#f0f0f0',

                width: wp('90%'),
                alignSelf: 'center',
                flexDirection: 'row',
                marginBottom: hp('1%'),
                // paddingLeft: wp('12%'),a
                // alignItems: 'center',
                textAlignVertical: 'top',
                alignSelf: 'center',
              }}>
              <Icon
                name="location-outline"
                color={'#00afb5'}
                size={25}
                style={{ marginTop: hp('0.7%'), marginLeft: wp('3%') }}
              />
              <TextInput
                placeholder="Enter Pincode"
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'grey'}
                color={'black'}
                fontSize={14}
                maxLength={6}
                multiline={true}
                onChangeText={value =>
                  this.handleInputChange('ADDRESSLINE1', value)
                }
                style={{
                  // borderWidth: 1,
                  padding: hp('1%'),
                  width: wp('75%'),
                  marginLeft: wp('1%'),
                  textAlignVertical: 'top',
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                // textAlign: 'center',
                //   justifyContent: 'center',
                color: 'lightgrey',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('1%'),
                marginLeft: wp('6%'),
                marginRight: wp('1%'),
              }}>
              Choose your current location
            </Text>
            <MapView
              style={{
                flex: 1,
                height: hp('40%'),
                width: wp('90%'),
                alignSelf: 'center',
                marginTop: hp('2%'),
                // borderRadius: wp('5%'),
              }}
              initialRegion={{
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              loadingEnabled
              //   minZoomLevel={3}
              //   maxZoomLevel={10}
              showsIndoors={false}
              showsTraffic={false}
              showsBuildings={false}
              showsScale={true}
              showsUserLocation
              provider={PROVIDER_GOOGLE}
              onPress={e => {
                this.setState({
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                });
                console.log(e.nativeEvent.coordinate);
              }}

            // onRegionChange={(e) => {
            //     this.setState({latitude:e.latitude,longitude:e.longitude,latitudeDelta:e.latitudeDelta,longitudeDelta:e.longitudeDelta})
            //     console.log(e)
            // }}
            >
              <Marker
                draggable
                coordinate={{
                  latitude: this.state.latitude,
                  longitude: this.state.longitude,
                }}
                onDrag={e => console.log(e)}
              //   image={{uri: 'custom_pin'}}
              />
            </MapView>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                // this.setState({currentPosition: 1});
                this.props.navigation.push('tabc');
                // this.check();
              }}>
              <LinearGradient
                colors={['#00afb5', '#4bc6fa']}
                style={{
                  marginTop: hp('7%'),
                  paddingTop: hp('0.7%'),
                  paddingBottom: hp('0.7%'),
                  backgroundColor: '#7e84c0',
                  borderRadius: wp('3%'),
                  marginLeft: wp('13%'),
                  marginRight: wp('13%'),
                  borderColor: 'white',
                  marginBottom: hp('15%'),
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
                  SAVE ADDRESS{' '}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShippAddress;
