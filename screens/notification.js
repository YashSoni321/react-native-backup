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

class Notification extends React.Component {
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
                NOTIFICATIONS
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                // textAlign: 'center',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-SemiBold',
                // marginTop: hp('0.5%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('1%'),
              }}>
              Today
            </Text>
            <View
              style={{
                marginLeft: wp('2%'),
                marginRight: wp('2%'),
                marginBottom: hp('2%'),
              }}>
              <FlatList
                data={this.state.categories1}
                // horizontal={true}
                renderItem={({ item, index }) => {
                  return (
                    <>
                      <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => {
                          this.props.navigation.push('Product');
                        }}>
                        <View
                          style={[
                            {
                              width: wp('95%'),
                              alignSelf: 'center',
                              //   elevation: 10,
                              //   shadowColor: '#000',
                              //   shadowOffset: {width: 0, height: 3},
                              //   shadowOpacity: 0.5,
                              //   shadowRadius: 5,

                              backgroundColor: '#f0f0f0',
                              // borderRadius: wp('3%'),
                              borderRadius: wp('3%'),
                              // borderTopRightRadius: wp('3%'),
                              //   borderBottomRightRadius: wp('3%'),
                              // marginLeft: wp('0.5%'),
                              // justifyContent: 'center',
                              // alignItems: 'center',
                              // marginLeft: wp('1%'),
                              // marginRight: wp('1%'),
                              marginTop: hp('2%'),
                              // marginBottom: hp('2%'),
                              borderColor: '#00afb5',
                              // height: hp('7%'),
                              // alignItems: 'center',
                              // justifyContent: 'center',

                              // borderWidth: 0.7,
                            },
                          ]}>
                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: hp('0.5%'),
                              alignItems: 'center',
                              // marginBottom: hp('2%'),
                            }}>
                            <Icon
                              name={'notifications-circle'}
                              color="#00afb5"
                              size={35}
                              style={{
                                // marginBottom: hp('1%'),
                                marginLeft: wp('3%'),
                              }}
                            />
                            <Text
                              onPress={() => { }}
                              style={{
                                fontSize: 13,
                                fontFamily: 'Poppins-Light',
                                alignContent: 'center',
                                textAlign: 'justify',
                                justifyContent: 'center',
                                color: '#333',
                                marginTop: hp('0.5%'),

                                marginLeft: wp('2%'),
                                marginRight: wp('2%'),
                                width: wp('74%'),
                                lineHeight: hp('2.3%'),
                                // textDecorationLine: 'underline',
                              }}>
                              Hey Demo User, we're offering 50% off Kurtas at
                              Fybr. Only until September end.
                            </Text>
                          </View>
                          <Text
                            style={{
                              // marginLeft: wp('4%'),
                              marginTop: hp('0.5%'),
                              color: '#666',
                              fontFamily: 'Poppins-SemiBold',
                              fontSize: Normalize(10),
                              marginRight: wp('3%'),
                              textAlign: 'right',
                              // width: wp('65%'),
                              marginBottom: hp('1%'),
                              // lineHeight: hp('2.5%'),
                            }}>
                            🕐{'  '}
                            04:30 PM
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  );
                }}
                numColumns={1}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                // textAlign: 'center',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-SemiBold',
                // marginTop: hp('0.5%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('1%'),
              }}>
              This Week
            </Text>
            <View
              style={{
                marginLeft: wp('2%'),
                marginRight: wp('2%'),
                marginBottom: hp('2%'),
              }}>
              <FlatList
                data={this.state.categories1}
                // horizontal={true}
                renderItem={({ item, index }) => {
                  return (
                    <>
                      <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => {
                          this.props.navigation.push('Product');
                        }}>
                        <View
                          style={[
                            {
                              width: wp('95%'),
                              alignSelf: 'center',
                              //   elevation: 10,
                              //   shadowColor: '#000',
                              //   shadowOffset: {width: 0, height: 3},
                              //   shadowOpacity: 0.5,
                              //   shadowRadius: 5,

                              backgroundColor: '#f0f0f0',
                              // borderRadius: wp('3%'),
                              borderRadius: wp('3%'),
                              // borderTopRightRadius: wp('3%'),
                              //   borderBottomRightRadius: wp('3%'),
                              // marginLeft: wp('0.5%'),
                              // justifyContent: 'center',
                              // alignItems: 'center',
                              // marginLeft: wp('1%'),
                              // marginRight: wp('1%'),
                              marginTop: hp('2%'),
                              // marginBottom: hp('2%'),
                              borderColor: '#00afb5',
                              // height: hp('7%'),
                              // alignItems: 'center',
                              // justifyContent: 'center',

                              // borderWidth: 0.7,
                            },
                          ]}>
                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: hp('0.5%'),
                              alignItems: 'center',
                              // marginBottom: hp('2%'),
                            }}>
                            <Icon
                              name={'notifications-circle'}
                              color="#00afb5"
                              size={35}
                              style={{
                                // marginBottom: hp('1%'),
                                marginLeft: wp('3%'),
                              }}
                            />
                            <Text
                              onPress={() => { }}
                              style={{
                                fontSize: 13,
                                fontFamily: 'Poppins-Light',
                                alignContent: 'center',
                                textAlign: 'justify',
                                justifyContent: 'center',
                                color: '#333',
                                marginTop: hp('0.5%'),

                                marginLeft: wp('2%'),
                                marginRight: wp('2%'),
                                width: wp('74%'),
                                lineHeight: hp('2.3%'),
                                // textDecorationLine: 'underline',
                              }}>
                              Hey Demo User, we're offering 50% off Kurtas at
                              Fybr. Only until September end.
                            </Text>
                          </View>
                          <Text
                            style={{
                              // marginLeft: wp('4%'),
                              marginTop: hp('0.5%'),
                              color: '#666',
                              fontFamily: 'Poppins-SemiBold',
                              fontSize: Normalize(10),
                              marginRight: wp('3%'),
                              textAlign: 'right',
                              // width: wp('65%'),
                              marginBottom: hp('1%'),
                              // lineHeight: hp('2.5%'),
                            }}>
                            🕐{'  '}
                            07-09-2023
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  );
                }}
                numColumns={1}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                // textAlign: 'center',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-SemiBold',
                // marginTop: hp('0.5%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('1%'),
              }}>
              This Month
            </Text>
            <View
              style={{
                marginLeft: wp('2%'),
                marginRight: wp('2%'),
                marginBottom: hp('2%'),
              }}>
              <FlatList
                data={this.state.categories1}
                // horizontal={true}
                renderItem={({ item, index }) => {
                  return (
                    <>
                      <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => {
                          this.props.navigation.push('Product');
                        }}>
                        <View
                          style={[
                            {
                              width: wp('95%'),
                              alignSelf: 'center',
                              //   elevation: 10,
                              //   shadowColor: '#000',
                              //   shadowOffset: {width: 0, height: 3},
                              //   shadowOpacity: 0.5,
                              //   shadowRadius: 5,

                              backgroundColor: '#f0f0f0',
                              // borderRadius: wp('3%'),
                              borderRadius: wp('3%'),
                              // borderTopRightRadius: wp('3%'),
                              //   borderBottomRightRadius: wp('3%'),
                              // marginLeft: wp('0.5%'),
                              // justifyContent: 'center',
                              // alignItems: 'center',
                              // marginLeft: wp('1%'),
                              // marginRight: wp('1%'),
                              marginTop: hp('2%'),
                              // marginBottom: hp('2%'),
                              borderColor: '#00afb5',
                              // height: hp('7%'),
                              // alignItems: 'center',
                              // justifyContent: 'center',

                              // borderWidth: 0.7,
                            },
                          ]}>
                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: hp('0.5%'),
                              alignItems: 'center',
                              // marginBottom: hp('2%'),
                            }}>
                            <Icon
                              name={'notifications-circle'}
                              color="#00afb5"
                              size={35}
                              style={{
                                // marginBottom: hp('1%'),
                                marginLeft: wp('3%'),
                              }}
                            />
                            <Text
                              onPress={() => { }}
                              style={{
                                fontSize: 13,
                                fontFamily: 'Poppins-Light',
                                alignContent: 'center',
                                textAlign: 'justify',
                                justifyContent: 'center',
                                color: '#333',
                                marginTop: hp('0.5%'),

                                marginLeft: wp('2%'),
                                marginRight: wp('2%'),
                                width: wp('74%'),
                                lineHeight: hp('2.3%'),
                                // textDecorationLine: 'underline',
                              }}>
                              Hey Demo User, we're offering 50% off Kurtas at
                              Fybr. Only until September end.
                            </Text>
                          </View>
                          <Text
                            style={{
                              // marginLeft: wp('4%'),
                              marginTop: hp('0.5%'),
                              color: '#666',
                              fontFamily: 'Poppins-SemiBold',
                              fontSize: Normalize(10),
                              marginRight: wp('3%'),
                              textAlign: 'right',
                              // width: wp('65%'),
                              marginBottom: hp('1%'),
                              // lineHeight: hp('2.5%'),
                            }}>
                            🕐{'  '}
                            23-09-2023
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  );
                }}
                numColumns={1}
              />
            </View>
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

export default Notification;
