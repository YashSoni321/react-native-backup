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
      orderslist: null,
    };
  }
  async componentDidMount() {
    try {
      // Get UserProfileID from AsyncStorage
      var UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');

      // Fetch Order List
      const orderResponse = await axios.get(
        URL_key + 'api/ProductApi/gOrderList?UserProfileID=' + UserProfileID,
        {headers: {'content-type': 'application/json'}},
      );

      let orders = orderResponse.data;

      // Loop through each order and fetch product details for each OrderItem
      for (let order of orders) {
        for (let item of order.OrderItems) {
          const productResponse = await axios.get(
            URL_key +
              'api/ProductApi/gProductDetails?ProductID=' +
              item.ProductID,
            {headers: {'content-type': 'application/json'}},
          );

          // Extract store details from product response
          if (productResponse.data) {
            item.StoreName = productResponse.data.StoreName;
            item.StoreLocation = productResponse.data.StoreLocation;
          }
        }
      }

      // Update state with enriched orders
      console.log('-----', JSON.stringify(orders));
      this.setState({orderslist: orders});
    } catch (error) {
      console.error('Error fetching orders or product details:', error);
    }
  }

  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          <Icon
            onPress={() => {
              this.props.navigation.push('TabP');
            }}
            name="chevron-back"
            color={'#00afb5'}
            size={40}
            style={{
              marginLeft: wp('4%'),
              padding: hp('1%'),
              marginTop: hp('3%'),
            }}
          />

          <Text
            style={{
              fontSize: 20,
              // textAlign: "center",
              //   justifyContent: 'center',
              color: '#00afb5',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('-5.5%'),
              marginBottom: hp('2%'),
              marginLeft: wp('20%'),
              // marginRight: wp('20%'),
              // marginRight: wp('5%'),
            }}>
            Your Orders
          </Text>

          {this.state.orderslist == null ||
          this.state.orderslist == undefined ||
          this.state.orderslist.length == 0 ? (
            <>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'center',
                  //   justifyContent: 'center',
                  color: '#333',
                  fontFamily: 'Poppins-SemiBold',
                  marginTop: hp('25%'),
                  // marginBottom: hp('-0.5%'),
                  // marginLeft: wp('7%'),
                  // marginRight: wp('1%'),
                }}>
                Oops! No items added in orders.
              </Text>
            </>
          ) : (
            <>
              <Text
                style={{
                  color: '#333',
                  fontSize: 12,
                  fontFamily: 'Poppins-Light',
                  // textAlign: 'center',
                  marginTop: hp('2%'),
                  // marginBottom: hp('1%'),
                  marginLeft: wp('10%'),
                }}>
                This Month
              </Text>
              <FlatList
                data={this.state.orderslist}
                // horizontal={true}
                numColumns={1}
                renderItem={({item, index}) => {
                  return (
                    <>
                      <FlatList
                        data={item.OrderItems}
                        // horizontal={true}
                        numColumns={1}
                        renderItem={({item, index}) => {
                          return (
                            <>
                              <View
                                style={{
                                  width: wp('80%'),
                                  borderWidth: 1,
                                  borderColor: '#00afb5',
                                  alignSelf: 'center',
                                  marginTop: hp('2%'),
                                  borderTopLeftRadius: wp('5%'),
                                  borderTopRightRadius: wp('5%'),
                                }}>
                                <Text
                                  style={{
                                    color: '#333',
                                    fontSize: 12,
                                    fontFamily: 'Poppins-SemiBold',
                                    // textAlign: 'center',
                                    marginTop: hp('3%'),
                                    // marginBottom: hp('1%'),
                                    marginLeft: wp('10%'),
                                  }}>
                                  Arriving in 6 minutes
                                </Text>
                                <Text
                                  style={{
                                    color: '#666',
                                    fontSize: 11,
                                    fontFamily: 'Poppins-SemiBold',
                                    // textAlign: 'center',
                                    marginTop: hp('1%'),
                                    // marginBottom: hp('1%'),
                                    marginLeft: wp('10%'),
                                  }}>
                                  <Text
                                    style={{
                                      color: '#666',
                                      fontSize: 10,
                                      fontFamily: 'Poppins-SemiBold',
                                      // textAlign: 'center',
                                      marginTop: hp('1%'),
                                      // marginBottom: hp('1%'),
                                      marginLeft: wp('10%'),
                                    }}>
                                    ₹ {item.TotalPrice} | {item.StoreName}
                                  </Text>
                                  <Text
                                    style={{
                                      color: 'grey',
                                      fontSize: 9,
                                      fontFamily: 'Poppins-Light',
                                      // textAlign: 'center',
                                      marginTop: hp('1%'),
                                      // marginBottom: hp('1%'),
                                      marginLeft: wp('10%'),
                                    }}>
                                    {' '}
                                    {item.StoreLocation}
                                  </Text>
                                </Text>
                                <Image
                                  style={{
                                    width: wp('17%'),
                                    height: hp('9%'),
                                    resizeMode: 'contain',
                                    // resizeMode: 'stretch',s
                                    borderRadius: hp('5%'),
                                    // borderTopLeftRadius: hp('1%'),
                                    marginTop: hp('2%'),
                                    marginLeft: wp('10%'),
                                    marginRight: wp('3%'),
                                    // borderRadius: wp('5%'),
                                    marginBottom: hp('2%'),
                                    // marginLeft: wp('1.5%'),
                                  }}
                                  // resizeMode="center"
                                  source={
                                    {uri: item.ProductImage}
                                    // require('../Images/frock1.png')
                                  }
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignSelf: 'center',
                                }}>
                                <View
                                  style={{
                                    width: wp('40%'),
                                    borderLeftWidth: 1,
                                    borderColor: '#00afb5',
                                    alignSelf: 'center',
                                    borderBottomLeftRadius: wp('5%'),
                                    borderRightWidth: 1,
                                    borderBottomWidth: 1,
                                    height: hp('5%'),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#00afb5',
                                      fontSize: 11,
                                      fontFamily: 'Poppins-SemiBold',
                                      // textAlign: 'center',
                                      // marginTop: hp('1%'),
                                      // // marginBottom: hp('1%'),
                                      // marginLeft: wp('10%'),
                                    }}>
                                    Track Order
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  onPress={() => {
                                    this.props.navigation.push('OrderDetail', {
                                      data: {
                                        OrderID: item.OrderID,
                                      },
                                    });
                                  }}>
                                  <View
                                    style={{
                                      width: wp('40%'),
                                      borderRightWidth: 1,
                                      borderBottomWidth: 1,
                                      borderColor: '#00afb5',
                                      alignSelf: 'center',
                                      borderBottomRightRadius: wp('5%'),
                                      height: hp('5%'),
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                    <Text
                                      style={{
                                        color: '#00afb5',
                                        fontSize: 11,
                                        fontFamily: 'Poppins-SemiBold',
                                        // textAlign: 'center',
                                        // marginTop: hp('1%'),
                                        // // marginBottom: hp('1%'),
                                        // marginLeft: wp('10%'),
                                      }}>
                                      Order Details
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            </>
                          );
                        }}
                      />
                    </>
                  );
                }}
              />
            </>
          )}
          {/*          
          <View style={{ width: wp('80%'), borderWidth: 1, borderColor: "#00afb5", alignSelf: "center", marginTop: hp('2%'), borderTopLeftRadius: wp('5%'), borderTopRightRadius: wp('5%') }}>
            <Text
              style={{
                color: '#333',
                fontSize: 12,
                fontFamily: 'Poppins-Light',
                // textAlign: 'center',
                marginTop: hp('3%'),
                // marginBottom: hp('1%'),
                marginLeft: wp('10%'),
              }}>
              Arriving in 6 minutes
            </Text>
            <Text
              style={{
                color: '#666',
                fontSize: 11,
                fontFamily: 'Poppins-Light',
                // textAlign: 'center',
                marginTop: hp('1%'),
                // marginBottom: hp('1%'),
                marginLeft: wp('10%'),
              }}>
              <Text
                style={{
                  color: '#666',
                  fontSize: 11,
                  fontFamily: 'Poppins-Light',
                  // textAlign: 'center',
                  marginTop: hp('1%'),
                  // marginBottom: hp('1%'),
                  marginLeft: wp('10%'),
                }}>
                ₹ 3800 | Westside
              </Text>
              <Text
                style={{
                  color: 'grey',
                  fontSize: 9,
                  fontFamily: 'Poppins-Light',
                  // textAlign: 'center',
                  marginTop: hp('1%'),
                  // marginBottom: hp('1%'),
                  marginLeft: wp('10%'),
                }}>
                {' '} Shalpet
              </Text>
            </Text>
            <Image
              style={{
                width: wp('17%'),
                height: hp('9%'),
                resizeMode: 'stretch',
                // resizeMode: 'stretch',s
                borderRadius: hp('5%'),
                // borderTopLeftRadius: hp('1%'),
                marginTop: hp('2%'),
                marginLeft: wp('10%'),
                marginRight: wp('3%'),
                // borderRadius: wp('5%'),
                marginBottom: hp('2%'),
                // marginLeft: wp('1.5%'),
              }}
              // resizeMode="center"
              source={require('../Images/frock1.png')}
            />
          </View>
          <View style={{ flexDirection: "row", alignSelf: "center" }}>
            <View style={{ width: wp('40%'), borderLeftWidth: 1, borderColor: "#00afb5", alignSelf: "center", borderBottomLeftRadius: wp('5%'), borderRightWidth: 1, borderBottomWidth: 1, height: hp('5%'), alignItems: "center", justifyContent: "center" }}>
              <Text
                style={{
                  color: '#00afb5',
                  fontSize: 11,
                  fontFamily: 'Poppins-SemiBold',
                  // textAlign: 'center',
                  // marginTop: hp('1%'),
                  // // marginBottom: hp('1%'),
                  // marginLeft: wp('10%'),
                }}>
                Track Order
              </Text>
            </View>
            <View style={{ width: wp('40%'), borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#00afb5", alignSelf: "center", borderBottomRightRadius: wp('5%'), height: hp('5%'), alignItems: "center", justifyContent: "center" }}>
              <Text
                style={{
                  color: '#00afb5',
                  fontSize: 11,
                  fontFamily: 'Poppins-SemiBold',
                  // textAlign: 'center',
                  // marginTop: hp('1%'),
                  // // marginBottom: hp('1%'),
                  // marginLeft: wp('10%'),
                }}>
                Track Order
              </Text>
            </View>
          </View> */}
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
