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
import Normalize from './size';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {NavigationEvents} from 'react-navigation';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
var date = moment().format('YYYY/MM/DD ');
var time = moment().format('hh:mm A');
import ImagePicker from 'react-native-image-crop-picker';
import {CustomPicker} from 'react-native-custom-picker';
import {API_KEY, URL_key} from './api';
import axios from 'axios';
var RNFS = require('react-native-fs');
import XLSX from 'xlsx';
import publicIP from 'react-native-public-ip';
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import MenuDrawer from 'react-native-side-drawer';
import RNFetchBlob from 'rn-fetch-blob';
import {image} from './image';
import {marginBottom} from 'styled-system';
import StepIndicator from 'react-native-step-indicator';
import CheckBox from 'react-native-check-box';
const customStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#333',
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: '#02b008',
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: '#02b008',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: '#02b008',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 12,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: '#00afb5',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#c4c4c4',
  labelColor: '#c4c4c4',
  labelSize: 14,
  currentStepLabelColor: '#ffff',
  labelFontFamily: 'Poppins-Light',

  // marginBottom: hp('10%'),
};
const labels = [
  '  Order Placed (12-09-2023 09:00 AM)',
  '  Order Packed (12-09-2023 10:00 AM)',
  ' On the Way (12-09-2023 11:00 AM)',
  ' Order Delivered (12-09-2023 12:00 PM)',
];
class Orders extends React.Component {
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
      categories: [
        {
          name: 'Grocery',
          Icon: 'color-filter',
          nav: 'Receivables',
        },
      ],
      currentPosition: 2,
      num: 1,
      amt: 1299,
      aamt: 1299,
      coup: false,
      ischeck: false,
      disc: 0,
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
                marginTop: hp('1%'),
                marginBottom: hp('2%'),
                // backgroundColor:"lightgrey"s
                // marginTop: hp('15%'),
                // marginBottom: hp('1%'),
                //   marginLeft:wp('17.5%')
              }}
              resizeMode="contain"
              source={require('../assets/FYBR-Logo.jpg')}
            />
          </View>
          <View style={{backgroundColor: '#00afb5'}}>
            <View
              style={{
                backgroundColor: '#ffff',
                width: wp('40%'),
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
                ORDERS
              </Text>
            </View>
            <View
              style={{
                // marginLeft: wp('2%'),
                // marginRight: wp('2%'),
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
                          this.RBSheet.open();
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

                              // backgroundColor: '#ffff',
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
                          <View style={{flexDirection: 'row'}}>
                            <View>
                              <Image
                                style={{
                                  width: wp('30%'),
                                  height: hp('18%'),
                                  resizeMode: 'stretch',
                                  // resizeMode: 'stretch',s
                                  // borderTopRightRadius: hp('1%'),
                                  // borderTopLeftRadius: hp('1%'),
                                  // marginTop: hp('2%'),
                                  marginLeft: wp('0.5%'),
                                  marginRight: wp('0.5%'),
                                  borderRadius: wp('5%'),
                                  // marginBottom: hp('2%'),
                                  // marginLeft: wp('1.5%'),
                                }}
                                // resizeMode="center"
                                source={require('../assets/bb.jpg')}
                              />
                            </View>
                            <View>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: 'Poppins-Light',
                                  alignContent: 'center',
                                  textAlign: 'left',
                                  justifyContent: 'center',
                                  color: '#ffff',
                                  marginTop: hp('0.8%'),

                                  marginLeft: wp('3%'),
                                  marginRight: wp('2%'),
                                  width: wp('74%'),

                                  // textDecorationLine: 'underline',
                                }}>
                                Studiofit Dark Brown Dazed Abs
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: 'Poppins-SemiBold',
                                  alignContent: 'center',
                                  textAlign: 'left',
                                  justifyContent: 'center',
                                  color: '#ffff',
                                  marginTop: hp('1%'),

                                  marginLeft: wp('3%'),
                                  marginRight: wp('2%'),
                                  width: wp('74%'),

                                  // textDecorationLine: 'underline',
                                }}>
                                ₹ {this.state.amt}.00
                              </Text>

                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: 'Poppins-Light',
                                  alignContent: 'center',
                                  textAlign: 'left',
                                  justifyContent: 'center',
                                  color: '#ffff',
                                  marginTop: hp('1%'),

                                  marginLeft: wp('3%'),
                                  marginRight: wp('2%'),
                                  width: wp('74%'),

                                  // textDecorationLine: 'underline',
                                }}>
                                Order date 01-sep-2023
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: 'Poppins-Light',
                                  alignContent: 'center',
                                  textAlign: 'left',
                                  justifyContent: 'center',
                                  color: '#ffff',
                                  marginTop: hp('1%'),

                                  marginLeft: wp('3%'),
                                  marginRight: wp('2%'),
                                  width: wp('74%'),

                                  // textDecorationLine: 'underline',
                                }}>
                                Order# 54597454189
                              </Text>

                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: 'Poppins-SemiBold',
                                  alignContent: 'center',
                                  textAlign: 'left',
                                  justifyContent: 'center',
                                  color: '#02c942',
                                  marginTop: hp('1%'),

                                  marginLeft: wp('3%'),
                                  marginRight: wp('2%'),
                                  width: wp('74%'),

                                  // textDecorationLine: 'underline',
                                }}>
                                Order Packed{'  '}✔
                              </Text>
                              {/* <View
                            style={{
                              flexDirection: 'row',
                              alignSelf: 'flex-end',
                              marginRight: wp('20%'),
                              marginTop: hp('-4.1%'),
                              marginBottom: hp('1%'),
                            }}>
                            <Text
                              onPress={() => {
                                if (this.state.num == 1) {
                                } else {
                                  this.setState(
                                    {
                                      num: this.state.num - 1,
                                    },
                                    () => {
                                      this.setState(
                                        {
                                          amt: this.state.aamt * this.state.num,
                                        },
                                        () => {
                                          console.log(this.state.amt);
                                        },
                                      );
                                    },
                                  );
                                }
                              }}
                              style={{
                                fontSize: 18,
                                fontFamily: 'Poppins-Light',
                                alignContent: 'center',
                                textAlign: 'left',
                                justifyContent: 'center',
                                color: 'black',
                                marginTop: hp('1%'),

                                // marginLeft: wp('3%'),
                                // marginRight: wp('2%'),
                                // width: wp('74%'),

                                // textDecorationLine: 'underline',
                              }}>
                              —
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                fontFamily: 'Poppins-Light',
                                alignContent: 'center',
                                textAlign: 'left',
                                justifyContent: 'center',
                                color: 'black',
                                marginTop: hp('1.5%'),

                                marginLeft: wp('4%'),
                                // marginRight: wp('2%'),
                                // width: wp('74%'),

                                // textDecorationLine: 'underline',
                              }}>
                              {this.state.num}
                            </Text>
                            <Text
                              onPress={() => {
                                this.setState(
                                  {
                                    num: this.state.num + 1,
                                  },
                                  () => {
                                    this.setState({
                                      amt: this.state.amt * this.state.num,
                                    });
                                  },
                                );
                              }}
                              style={{
                                fontSize: 18,
                                fontFamily: 'Poppins-Light',
                                alignContent: 'center',
                                textAlign: 'left',
                                justifyContent: 'center',
                                color: 'black',
                                marginTop: hp('1%'),

                                marginLeft: wp('4%'),
                                // marginRight: wp('2%'),
                                // width: wp('74%'),

                                // textDecorationLine: 'underline',
                              }}>
                              +
                            </Text>
                          </View> */}
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <Separator />
                    </>
                  );
                }}
                numColumns={1}
              />
            </View>
          </View>
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
              <View style={{backgroundColor: '#00afb5'}}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  // style={{position: 'absolute'}}
                  onPress={() => this.RBSheet.close()}>
                  <Icon
                    name="close-circle-sharp"
                    color={'lightgrey'}
                    size={hp('4%')}
                    style={{marginLeft: wp('7%'), marginTop: hp('2.5%')}}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 14,
                    // textAlign: 'center',
                    //   justifyContent: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-SemiBold',
                    marginTop: hp('2%'),
                    marginBottom: hp('1%'),
                    marginLeft: wp('5%'),
                    marginRight: wp('1%'),
                  }}>
                  Shopping Cart
                </Text>
                <View
                  style={{
                    // marginLeft: wp('2%'),
                    // marginRight: wp('2%'),
                    marginBottom: hp('2%'),
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

                        // backgroundColor: '#ffff',
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
                        marginBottom: hp('2%'),
                        borderColor: '#00afb5',
                        // height: hp('7%'),
                        // alignItems: 'center',
                        // justifyContent: 'center',

                        // borderWidth: 0.7,
                      },
                    ]}>
                    <View style={{flexDirection: 'row'}}>
                      <View>
                        <Image
                          style={{
                            width: wp('30%'),
                            height: hp('20%'),
                            resizeMode: 'stretch',
                            // resizeMode: 'stretch',s
                            // borderTopRightRadius: hp('1%'),
                            // borderTopLeftRadius: hp('1%'),
                            // marginTop: hp('2%'),
                            marginLeft: wp('0.5%'),
                            marginRight: wp('0.5%'),
                            borderRadius: wp('5%'),
                            // marginBottom: hp('2%'),
                            // marginLeft: wp('1.5%'),
                          }}
                          // resizeMode="center"
                          source={require('../assets/bb.jpg')}
                        />
                      </View>
                      <View>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-Light',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#ffff',
                            marginTop: hp('0.9%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('74%'),

                            // textDecorationLine: 'underline',
                          }}>
                          Studiofit Dark Brown Dazed Abs
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-SemiBold',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#ffff',
                            marginTop: hp('0.7%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('74%'),

                            // textDecorationLine: 'underline',
                          }}>
                          ₹ {this.state.amt}.00
                        </Text>

                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-Light',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#ffff',
                            marginTop: hp('0.7%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('74%'),

                            // textDecorationLine: 'underline',
                          }}>
                          Size XS
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-Light',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#ffff',
                            marginTop: hp('0.7%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('74%'),

                            // textDecorationLine: 'underline',
                          }}>
                          Ordered date 01-sep-2023
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-Light',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#ffff',
                            marginTop: hp('0.7%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('74%'),

                            // textDecorationLine: 'underline',
                          }}>
                          Order# 54597454189
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-SemiBold',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#02c942',
                            marginTop: hp('0.7%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('74%'),

                            // textDecorationLine: 'underline',
                          }}>
                          Order Packed{'  '}✔
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Separator />
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    // textAlign: 'center',
                    //   justifyContent: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-SemiBold',
                    marginTop: hp('0.5%'),
                    // marginBottom: hp('-0.5%'),
                    marginLeft: wp('5%'),
                    marginRight: wp('1%'),
                  }}>
                  Track Your Order
                </Text>
                <View
                  style={{
                    height: hp('35%'),
                    marginLeft: wp('5%'),
                    // width: wp('90%'),
                  }}>
                  <StepIndicator
                    customStyles={customStyles}
                    currentPosition={this.state.currentPosition}
                    labels={labels}
                    stepCount={4}
                    direction={'vertical'}
                  />
                </View>

                <Separator />
                <Text
                  style={{
                    fontSize: 14,
                    // textAlign: 'center',
                    //   justifyContent: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-SemiBold',
                    marginTop: hp('0.5%'),
                    // marginBottom: hp('-0.5%'),
                    marginLeft: wp('5%'),
                    marginRight: wp('1%'),
                  }}>
                  Coupons
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({coup: !this.state.coup});
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Icon
                      name={'bookmarks-outline'}
                      color="lightgrey"
                      size={20}
                      style={{
                        marginTop: hp('2%'),
                        marginLeft: wp('5%'),
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        // textAlign: 'center',
                        //   justifyContent: 'center',
                        color: '#ffff',
                        fontFamily: 'Poppins-Light',
                        marginTop: hp('2%'),
                        // marginBottom: hp('-0.5%'),
                        marginLeft: wp('2%'),
                        marginRight: wp('1%'),
                      }}>
                      Apply COUPON
                    </Text>
                  </View>

                  <Icon
                    name={'chevron-down-sharp'}
                    color="lightgrey"
                    size={25}
                    style={{
                      marginTop: hp('-3.2%'),
                      marginRight: wp('5%'),
                      alignSelf: 'flex-end',
                      marginBottom: hp('2%'),
                    }}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    marginLeft: wp('2%'),
                    marginRight: wp('2%'),
                    marginBottom: hp('2%'),
                  }}>
                  <FlatList
                    data={this.state.categories}
                    // horizontal={true}
                    renderItem={({item, index}) => {
                      return (
                        <>
                          <View
                            style={[
                              {
                                width: wp('95%'),
                                alignSelf: 'center',
                                // backgroundColor: '#ffff',
                                // borderRadius: wp('3%'),
                                borderRadius: wp('3%'),
                                marginTop: hp('1%'),
                                // marginBottom: hp('2%'),
                                borderColor: '#00afb5',
                              },
                            ]}>
                            <CheckBox
                              style={{
                                flex: 1,
                                padding: 5,
                                // marginTop: hp('2%'),
                                marginLeft: wp('3%'),
                              }}
                              checkedImage={
                                <Image
                                  source={require('../assets/check.png')}
                                  style={{
                                    height: hp('3.5%'),
                                    width: wp('7.2%'),
                                  }}
                                />
                              }
                              unCheckedImage={
                                <Image
                                  source={require('../assets/z-removebg-preview.png')}
                                  style={{
                                    height: hp('3.2%'),
                                    width: wp('6.75%'),
                                  }}
                                />
                              }
                              onClick={() => {
                                // this.setState(
                                //   {ischeck: !this.state.ischeck},
                                //   () => {
                                //     if (this.state.ischeck == true) {
                                //       this.setState({disc: 180});
                                //     } else {
                                //       this.setState({disc: 0});
                                //     }
                                //   },
                                // );
                              }}
                              isChecked={true}
                              rightText={
                                'Go green - Opt for not returning online and get a treat - futher 5% off.'
                              }
                              rightTextStyle={{
                                color: '#ffff',
                                fontFamily: 'Poppins-Light',

                                marginTop: hp('-0.3%'),
                                //   lineHeight: 25,
                                fontSize: 14,
                                marginLeft: wp('5%'),
                                marginRight: wp('2%'),
                              }}
                              checkBoxColor={'white'}
                            />
                          </View>
                        </>
                      );
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    // textAlign: 'center',
                    //   justifyContent: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-SemiBold',
                    marginTop: hp('2%'),
                    // marginBottom: hp('-0.5%'),
                    marginLeft: wp('5%'),
                    marginRight: wp('1%'),
                  }}>
                  Total Amount
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    // textAlign: 'center',
                    //   justifyContent: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('2%'),
                    // marginBottom: hp('-0.5%'),
                    marginLeft: wp('5%'),
                    marginRight: wp('1%'),
                  }}>
                  Total MRP
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    textAlign: 'right',
                    //   justifyContent: 'center',
                    color: 'lightgrey',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('-2.5%'),
                    // marginBottom: hp('-0.5%'),
                    // marginLeft: wp('5%'),
                    marginRight: wp('5%'),
                  }}>
                  ₹ {this.state.amt * 2}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    // textAlign: 'center',
                    //   justifyContent: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('2%'),
                    // marginBottom: hp('-0.5%'),
                    marginLeft: wp('5%'),
                    marginRight: wp('1%'),
                  }}>
                  Discount on MRP
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    textAlign: 'right',
                    //   justifyContent: 'center',
                    color: 'lightgrey',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('-2.5%'),
                    // marginBottom: hp('-0.5%'),
                    // marginLeft: wp('5%'),
                    marginRight: wp('5%'),
                  }}>
                  - ₹ 180
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    // textAlign: 'center',
                    //   justifyContent: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('2%'),
                    // marginBottom: hp('-0.5%'),
                    marginLeft: wp('5%'),
                    marginRight: wp('1%'),
                  }}>
                  Total amount
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    textAlign: 'right',
                    //   justifyContent: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-Light',
                    marginTop: hp('-2.5%'),
                    // marginBottom: hp('-0.5%'),
                    // marginLeft: wp('5%'),
                    marginRight: wp('5%'),
                  }}>
                  ₹ {(this.state.amt - 180) * 2}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    this.RBSheet.close();
                    // this.props.navigation.push('signup');
                    // this.check();
                  }}>
                  <LinearGradient
                    colors={['#00afb5', '#348db3']}
                    style={{
                      marginTop: hp('5%'),
                      paddingTop: hp('0.7%'),
                      paddingBottom: hp('0.7%'),
                      backgroundColor: '#00afb5',
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
                      BACK TO ORDERS{' '}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
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
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 0.5,
    marginTop: hp('2%'),
    width: wp('100%'),
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Orders;
