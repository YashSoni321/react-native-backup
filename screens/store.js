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
import {NavigationEvents} from 'react-navigation';
import ToggleSwitch from 'toggle-switch-react-native';
import {Dialog} from 'react-native-simple-dialogs';
import {CustomPicker} from 'react-native-custom-picker';
import {API_KEY, URL_key} from './api';
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
import Normalize from './size';
import HeaderWithAddress from '../Modules/Common/HeaderWithCommon';

class Store extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories1: [
        {
          name: 'Men',
          Icon: 'man',
          nav: 'protab',
        },
        {
          name: 'Women',
          Icon: 'woman',
          nav: 'protab',
        },
        {name: 'Shoes', Icon: 'file-tray-sharp', nav: 'payments'},
        // {name: 'Leads', Icon: 'ios-magnet-outline', nav: 'leads'},

        {
          name: 'Dresses',
          Icon: 'shirt',
          nav: 'Receivables',
        },
        {
          name: 'Wallets',
          Icon: 'wallet',
          nav: 'Receivables',
        },
        {
          name: 'Accessories',
          Icon: 'color-filter',
          nav: 'Receivables',
        },
      ],
    };
  }
  render() {
    return (
      <SafeAreaView>
        <NavigationEvents
          onWillFocus={this._onFocus}
          onWillBlur={this._onBlurr}
        />
        <ScrollView>
          {/* <ImageBackground
            style={{ width: wp('100%') }}
            activeOpacity={0.5}
            source={require('../assets/output-onlinepngtools.png')}
            resizeMode="cover">
            <Image
              style={{
                //  borderWidth: 1,
                height: hp('12%'),
                width: wp('80%'),
                // borderColor: 'forestgreen',
                // borderRadius: hp('100%'),
                alignSelf: 'center',
                justifyContent: 'center',
                marginTop: hp('2%'),
                marginBottom: hp('2%'),
                // backgroundColor:"lightgrey"s
                // marginTop: hp('15%'),
                // marginBottom: hp('1%'),
                //   marginLeft:wp('17.5%')
              }}
              resizeMode="contain"
              source={require('../assets/FYBR-Logo-removebg-preview.png')}
            />
          </ImageBackground> */}
          <HeaderWithAddress
            navigation={this.props.navigation}
            showBackButton={true}
            handleBackPress={() => this.props.navigation.push('Tabs')}
          />
          <View
            style={{
              backgroundColor: '#ffff',
              width: wp('60%'),
              height: hp('5%'),
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              borderRadius: wp('5%'),
              marginTop: hp('-2.5%'),
              marginBottom: hp('1.5%'),
              borderWidth: 1,
              borderColor: '#00afb5',
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
              ALL STORES
            </Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <View
              style={{
                // justifyContent: 'center',
                // borderWidth: wp('0.2%'),
                borderRadius: wp('10%'),
                // padding: 5,
                height: hp('5.2%'),
                // marginBottom: hp('3%'),
                borderColor: '#f77f77',
                marginTop: hp('1%'),
                backgroundColor: '#ffff',

                width: wp('85%'),
                alignSelf: 'center',
                flexDirection: 'row',
                marginBottom: hp('1%'),
                // paddingLeft: wp('12%'),a
                // alignItems: 'center',
                textAlignVertical: 'top',
                alignSelf: 'center',
                marginLeft: wp('2%'),
              }}>
              {/* <Icon
                name="search-sharp"
                color={'grey'}
                size={24}
                style={{marginTop: hp('-0.2%'), marginLeft: wp('0%')}}
              /> */}
              <TextInput
                placeholder="Search for stores"
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'grey'}
                color={'black'}
                fontSize={13}
                // maxLength={10}
                // keyboardType={'number-pad'}
                onChangeText={
                  value => this.SearchFilterFunction(value)
                  // this.handleInputChange('MobileNo', value)
                }
                style={{
                  // borderWidth: 1,
                  padding: hp('1%'),
                  width: wp('65%'),
                  marginLeft: wp('3%'),
                  // marginLeft: wp('1%'),
                }}
              />
            </View>
            <View
              style={{
                height: hp('5%'),
                width: hp('5%'),
                borderRadius: wp('100%'),
                backgroundColor: '#216e66',
                marginTop: hp('1.1%'),
                marginLeft: wp('-7%'),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon
                style={{}}
                onPress={() => {
                  // this.setState({Filter:true})
                  // this.RBSheet1.open();
                }}
                // activeOpacity={0.5}

                name="search"
                color={'#ffff'}
                size={25}
              />
            </View>
          </View>
          <View
            style={{
              marginLeft: wp('2%'),
              marginRight: wp('2%'),
              marginBottom: hp('2%'),
            }}>
            <FlatList
              data={this.state.categories1}
              // horizontal={true}
              renderItem={({item, index}) => {
                return (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => {
                        this.props.navigation.push('storedetails');
                      }}>
                      <View
                        style={[
                          {
                            width: wp('93%'),
                            alignSelf: 'center',
                            //   elevation: 10,
                            //   shadowColor: '#000',
                            //   shadowOffset: {width: 0, height: 3},
                            //   shadowOpacity: 0.5,
                            //   shadowRadius: 5,

                            backgroundColor: '#ffff',
                            // borderRadius: wp('3%'),
                            borderRadius: wp('3%'),
                            // borderTopRightRadius: wp('3%'),
                            //   borderBottomRightRadius: wp('3%'),
                            // marginLeft: wp('0.5%'),
                            // justifyContent: 'center',
                            // alignItems: 'center',
                            marginLeft: wp('1%'),
                            marginRight: wp('1%'),
                            marginTop: hp('2%'),
                            // marginBottom: hp('2%'),
                            borderColor: '#00afb5',
                            // height: hp('7%'),
                            // alignItems: 'center',
                            // justifyContent: 'center',
                            // flexDirection: 'row',
                            // borderWidth: 0.7,
                          },
                        ]}>
                        <View style={{flexDirection: 'row'}}>
                          <View>
                            <Image
                              style={{
                                width: wp('30%'),
                                height: hp('13%'),
                                // resizeMode: 'stretch',
                                // resizeMode: 'stretch',s
                                // borderTopRightRadius: hp('1%'),
                                // borderTopLeftRadius: hp('1%'),
                                marginTop: hp('1%'),
                                marginLeft: wp('3%'),
                                marginRight: wp('4%'),
                                // borderRadius: wp('5%'),
                                marginBottom: hp('1%'),
                                // marginLeft: wp('1.5%'),
                              }}
                              // resizeMode="center"
                              source={require('../assets/Zudio.jpg')}
                            />
                          </View>

                          <View>
                            <Text
                              style={{
                                fontSize: 15,
                                fontFamily: 'Poppins-SemiBold',
                                alignContent: 'center',
                                textAlign: 'left',
                                justifyContent: 'center',
                                color: '#00afb5',
                                marginTop: hp('1%'),

                                // marginLeft: wp('1%'),
                                marginRight: wp('2%'),
                                width: wp('74%'),

                                // textDecorationLine: 'underline',
                              }}>
                              Zudio
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Poppins-Light',
                                alignContent: 'center',
                                textAlign: 'left',
                                justifyContent: 'center',
                                color: '#666',
                                marginTop: hp('0.5%'),

                                // marginLeft: wp('3%'),
                                marginRight: wp('2%'),
                                width: wp('74%'),

                                // textDecorationLine: 'underline',
                              }}>
                              Preston Prime Mall
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Poppins-Light',
                                alignContent: 'center',
                                textAlign: 'left',
                                justifyContent: 'center',
                                color: '#666',
                                marginTop: hp('1%'),

                                // marginLeft: wp('3%'),
                                marginRight: wp('2%'),
                                width: wp('74%'),

                                // textDecorationLine: 'underline',
                              }}>
                              ⭐ ⭐ ⭐ ⭐ ⭐ (299+)
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Poppins-Light',
                                alignContent: 'center',
                                textAlign: 'left',
                                justifyContent: 'center',
                                color: '#666',
                                marginTop: hp('1%'),

                                // marginLeft: wp('3%'),
                                marginRight: wp('2%'),
                                width: wp('74%'),

                                // textDecorationLine: 'underline',
                              }}>
                              ⏰ 20 mins
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </>
                );
              }}
              numColumns={1}
            />
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

export default Store;
