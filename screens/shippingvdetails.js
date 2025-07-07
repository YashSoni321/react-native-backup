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
import XLSX from 'xlsx';
import publicIP from 'react-native-public-ip';
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import MenuDrawer from 'react-native-side-drawer';
import RNFetchBlob from 'rn-fetch-blob';
import { image } from './image';
import { marginBottom } from 'styled-system';

class ShippingVDetails extends React.Component {
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
    };
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
                SHIPPING DETAILS
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
              First Name
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
                alignItems: 'center',
                textAlignVertical: 'top',
                alignSelf: 'center',
              }}>
              <Icon
                name="person-circle-outline"
                color={'#00afb5'}
                size={25}
                style={{ marginTop: hp('-0.2%'), marginLeft: wp('3%') }}
              />
              <TextInput
                placeholder="Enter First Name"
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'grey'}
                color={'black'}
                fontSize={14}
                maxLength={250}
                onChangeText={value => this.handleInputChange('VILLAGE', value)}
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
              Last Name
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
                name="person-circle-outline"
                color={'#00afb5'}
                size={25}
                style={{ marginTop: hp('0.7%'), marginLeft: wp('3%') }}
              />
              <TextInput
                placeholder="Enter Last Name"
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
              Email
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
                name="mail"
                color={'#00afb5'}
                size={25}
                style={{ marginTop: hp('0.7%'), marginLeft: wp('3%') }}
              />
              <TextInput
                placeholder="Enter Email"
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
              Mobile Number
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
                name="phone-portrait"
                color={'#00afb5'}
                size={25}
                style={{ marginTop: hp('0.7%'), marginLeft: wp('3%') }}
              />
              <TextInput
                placeholder="Enter Mobile Number"
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
              Alternate Number
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
                name="phone-portrait"
                color={'#00afb5'}
                size={25}
                style={{ marginTop: hp('0.7%'), marginLeft: wp('3%') }}
              />
              <TextInput
                placeholder="Enter Alternate Number"
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
                  SAVE DETAILS{' '}
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

export default ShippingVDetails;
