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
import CheckBox from 'react-native-check-box';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { UrlTile } from 'react-native-maps';

const customStyles = {
  stepCount: 4,
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
  labelSize: 12,
  currentStepLabelColor: '#ffff',
  labelFontFamily: 'Poppins-Light',

  // marginBottom: hp('10%'),
};
const labels = ['Cart', 'Details', 'Payment'];
class PaymentSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories1: [
        {
          name: 'Credit Card',
          Icon: 'wallet',
          ischeck: true,
        },
        {
          name: 'Debit Card',
          Icon: 'color-filter',
          ischeck: false,
        },
        {
          name: 'UPI',
          Icon: 'wallet',
          ischeck: false,
        },
        {
          name: 'Cash',
          Icon: 'color-filter',
          ischeck: false,
        },
      ],
      categories: [
        {
          name: 'Grocery',
          Icon: 'color-filter',
          nav: 'Receivables',
        },
      ],
      currentPosition: 0,
      num: 1,
      amt: 1299,
      aamt: 1299,
      coup: false,
      ischeck: false,
      disc: 0,
      latitude: 18.1124,
      longitude: 79.0193,
      longitudeDelta: 0.0922,
      latitudeDelta: 0.0421,
      loca: null,
    };
  }
  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          <ImageBackground
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
            <Icon
              onPress={() => {
                this.props.navigation.push('tabc');
              }}
              name={'chevron-back'}
              color="#333"
              size={35}
              style={{
                marginTop: hp('-11.5%'),
                marginLeft: wp('2%'),
                marginBottom: hp('7%'),
              }}
            />
          </ImageBackground>

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
              CHECKOUT
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.push('shippaddress');
            }}>
            <View style={{ flexDirection: 'row' }}>
              <Icon
                name={'location-sharp'}
                color="#00afb5"
                size={30}
                style={{
                  marginTop: hp('1.5%'),
                  // marginBottom: hp('1%'),
                  marginLeft: wp('5%'),
                }}
              />

              <Text
                style={{
                  fontSize: 14,
                  // textAlign: 'center',
                  //   justifyContent: 'center',
                  color: '#00afb5',
                  fontFamily: 'Poppins-SemiBold',
                  marginTop: hp('2%'),
                  marginBottom: hp('1%'),
                  marginLeft: wp('3%'),
                  marginRight: wp('1%'),
                }}>
                Shipping Address
              </Text>
              <Image
                style={{
                  //  borderWidth: 1,
                  height: hp('3%'),
                  width: hp('3%'),
                  // borderColor: 'forestgreen',
                  borderRadius: hp('100%'),

                  // backgroundColor:"lightgrey"s
                  marginRight: hp('2%'),
                  marginTop: hp('2%'),
                  marginBottom: hp('1%'),
                  marginLeft: wp('4%'),
                  alignSelf: 'flex-end',
                  // marginBottom: hp('1%'),
                  //   marginLeft:wp('17.5%')
                }}
                resizeMode="contain"
                source={require('../assets/edit.png')}
              />
            </View>
          </TouchableOpacity>
          <MapView
            style={{
              flex: 1,
              height: hp('20%'),
              width: wp('90%'),
              alignSelf: 'center',
              marginTop: hp('1%'),
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
          <View style={{ marginBottom: hp('1%'), marginTop: hp('1.5%') }}>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Light',
                alignContent: 'center',
                textAlign: 'left',
                justifyContent: 'center',
                color: '#333',
                marginTop: hp('1%'),

                marginLeft: wp('5%'),
                marginRight: wp('2%'),
                width: wp('84%'),

                // textDecorationLine: 'underline',
              }}>
              📍 Plot No :41/1A_6 lakshmi illam,
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Light',
                alignContent: 'center',
                textAlign: 'left',
                justifyContent: 'center',
                color: '#333',
                marginTop: hp('1%'),

                marginLeft: wp('11%'),
                marginRight: wp('2%'),
                width: wp('74%'),

                // textDecorationLine: 'underline',
              }}>
              MGR nagar, MANNARGUDI,
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Light',
                alignContent: 'center',
                textAlign: 'left',
                justifyContent: 'center',
                color: '#333',
                marginTop: hp('1%'),

                marginLeft: wp('11%'),
                marginRight: wp('2%'),
                width: wp('74%'),

                // textDecorationLine: 'underline',
              }}>
              TAMIL NADU , 625553
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Light',
                alignContent: 'center',
                textAlign: 'left',
                justifyContent: 'center',
                color: '#333',
                marginTop: hp('1%'),

                marginLeft: wp('5%'),
                marginRight: wp('2%'),
                width: wp('74%'),

                // textDecorationLine: 'underline',
              }}>
              ⏰ Delivered within 20 Minutes
            </Text>
          </View>
          <Separator />
          <Text
            style={{
              fontSize: 14,
              // textAlign: 'center',
              //   justifyContent: 'center',
              color: '#00afb5',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('1%'),
              marginLeft: wp('7%'),
              marginRight: wp('1%'),
            }}>
            Pay With
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
                    <View
                      style={[
                        {
                          width: wp('50%'),
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
                              height: hp('3.3%'),
                              width: wp('6.75%'),
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
                          let newMarkers = this.state.categories1.map(el =>
                            el.ischeck === true ? { ...el, ischeck: false } : el,
                          );
                          newMarkers[index].ischeck = true;
                          this.setState({
                            categories1: newMarkers,
                          });
                          //   console.log(newMarkers);
                        }}
                        isChecked={item.ischeck}
                        rightText={item.name}
                        rightTextStyle={{
                          color: '#666',
                          fontFamily: 'Poppins-Light',

                          marginTop: hp('-0.3%'),
                          //   lineHeight: 25,
                          fontSize: 14,
                          marginLeft: wp('4%'),
                          marginRight: wp('2%'),
                        }}
                        checkBoxColor={'white'}
                      />
                    </View>
                  </>
                );
              }}
              numColumns={2}
            />
          </View>
          <Separator />
          <Text
            style={{
              fontSize: 14,
              // textAlign: 'center',
              //   justifyContent: 'center',
              color: '#00afb5',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('2%'),
              marginBottom: hp('1%'),
              marginLeft: wp('7%'),
              marginRight: wp('1%'),
            }}>
            Payment Summary
          </Text>
          <Text
            style={{
              fontSize: 14,
              // textAlign: 'center',
              //   justifyContent: 'center',
              color: '#00afb5',
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
              color: '#333',
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
              color: '#333',
              fontFamily: 'Poppins-Light',
              marginTop: hp('-2.5%'),
              // marginBottom: hp('-0.5%'),
              // marginLeft: wp('5%'),
              marginRight: wp('5%'),
            }}>
            ₹ {this.state.amt}
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: 'center',
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              marginTop: hp('2%'),
              // marginBottom: hp('-0.5%'),
              marginLeft: wp('5%'),
              marginRight: wp('1%'),
            }}>
            Charges
          </Text>
          <Text
            style={{
              fontSize: 13,
              textAlign: 'right',
              //   justifyContent: 'center',
              color: '#333',
              fontFamily: 'Poppins-Light',
              marginTop: hp('-2.5%'),
              // marginBottom: hp('-0.5%'),
              // marginLeft: wp('5%'),
              marginRight: wp('5%'),
            }}>
            ₹ 180
          </Text>
          <Text
            style={{
              fontSize: 13,
              // textAlign: 'center',
              //   justifyContent: 'center',
              color: '#333',
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
              color: '#333',
              fontFamily: 'Poppins-Light',
              marginTop: hp('-2.5%'),
              // marginBottom: hp('-0.5%'),
              // marginLeft: wp('5%'),
              marginRight: wp('5%'),
            }}>
            ₹ {this.state.amt + 180}
          </Text>

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              this.setState({ currentPosition: 2 });
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
                marginBottom: hp('5%'),
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
                PLACE ORDER{' '}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const Separator = () => <View style={styles.separator} />;
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: '#666',
    borderBottomWidth: 0.5,
    marginTop: hp('1%'),
    width: wp('100%'),
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentSummary;
