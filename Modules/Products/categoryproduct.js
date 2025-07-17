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
import GetLocation from 'react-native-get-location';
import LinearGradient from 'react-native-linear-gradient';
import MenuDrawer from 'react-native-side-drawer';
import RNFetchBlob from 'rn-fetch-blob';
import {image} from './image';
import {marginBottom} from 'styled-system';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {Marker} from 'react-native-maps';
import RBSheet from 'react-native-raw-bottom-sheet';
import CheckBox from 'react-native-check-box';
class CategoryProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: 18.1124,
      longitude: 79.0193,
      longitudeDelta: 0.0922,
      latitudeDelta: 0.0421,
      loca: null,
      num: 1,
      amt: 1299,
      aamt: 1299,
      coup: true,
      ischeck: false,
      disc: 0,
      CategoryID: this.props.route?.params?.data?.CategoryID || null,
      SubCategoryID: this.props.route?.params?.data?.SubCategoryID || null,
      ChildSubCategoryID:
        this.props.route?.params?.data?.ChildSubCategoryID || null,

      categories: null,
      categories1: null,
    };
  }
  async componentDidMount() {
    var UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
    const a = {
      CategoryID: this.state.CategoryID,
      SubCategoryID: this.state.SubCategoryID,
      ChildSubCategoryID: this.state.ChildSubCategoryID,
    };
    console.log(a);
    axios
      .post(URL_key + 'api/ProductApi/gProductList', a, {
        headers: {
          'content-type': `application/json`,
        },
      })
      .then(response => {
        const groupedProducts = response.data.reduce((acc, product) => {
          const key = `${product.StoreName} - ${product.StoreLocation}`;

          if (!acc[key]) {
            acc[key] = {
              StoreName: product.StoreName,
              StoreLocation: product.StoreLocation,
              Products: [],
            };
          }
          acc[key].Products.push(product);
          return acc;
        }, {});

        // Convert object to an array
        const groupedArray = Object.values(groupedProducts);

        console.log(groupedArray);
        this.setState({categories1: groupedArray});
        this.setState({categories: groupedArray});
        // console.log(response.data)
      })
      .catch(err => {
        console.log(err);
      });
  }
  SearchFilterFunction(text) {
    if (text) {
      const textData = text.toUpperCase();

      const newData = this.state.categories.filter(store => {
        // Check if store name matches
        const storeMatch =
          store.StoreName && store.StoreName.toUpperCase().includes(textData);

        // Check if any product in the Products array matches
        const productMatch = store.Products.some(
          product =>
            product.ProductName &&
            product.ProductName.toUpperCase().includes(textData),
        );

        return storeMatch || productMatch;
      });

      console.log(newData);

      this.setState({
        categories1: newData,
        selectedIndex: 11,
        search: text,
      });
    } else {
      this.setState({categories1: this.state.categories});
    }
  }

  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          <ImageBackground
            style={{width: wp('100%')}}
            activeOpacity={0.5}
            source={require('../Images/output-onlinepngtools1.png')}
            resizeMode="cover">
            {/* <TouchableOpacity
                            onPress={() => {
                                this.props.navigation.push("tab")
                            }}>
                            <Icon
                                onPress={() => {
                                    this.props.navigation.push("tab")
                                }}
                                name="chevron-back"
                                color={'#00afb5'}
                                size={40}
                                style={{ marginLeft: wp('1%'), padding: hp('1%'), marginTop: hp('5%'), }}
                            />
                        </TouchableOpacity> */}

            {/* <Text
                            style={{
                                color: '#333',
                                fontSize: 12,
                                fontFamily: 'Poppins-SemiBold',
                                // textAlign: 'center',
                                marginTop: hp('-6%'),
                                // marginBottom: hp('1%'),
                                marginLeft: wp('17%'),
                            }}>
                                  Delivering to >
                        </Text>
                        <Text
                            style={{
                                color: '#00afb5',
                                fontSize: 14,
                                fontFamily: 'Poppins-SemiBold',
                                // textAlign: 'center',
                                // marginTop: hp('4%'),
                                // marginBottom: hp('1%'),
                                marginLeft: wp('17%'),
                            }}>
                            {this.state.StateName}
                        </Text>
                        <Text
                            style={{
                                color: '#333',
                                fontSize: 12,
                                fontFamily: 'Poppins-Light',
                                // textAlign: 'center',
                                // marginTop: hp('4%'),
                                // marginBottom: hp('1%'),
                                marginLeft: wp('17%'), width: wp('52%')
                            }}>
                            {this.state.StreetName}
                        </Text> */}
            <Text
              style={{
                fontSize: 45,
                textAlign: 'right',
                //   justifyContent: 'center',
                color: '#00afb5',
                fontFamily: 'RedHatDisplay-Bold',
                marginTop: hp('5%'),
                // marginBottom: hp('1.5%'),
                // marginRight: wp('20%'),
                marginRight: wp('5%'),
              }}>
              fybr
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('Tab');
              }}>
              <Icon
                onPress={() => {
                  this.props.navigation.navigate('Tab');
                }}
                name="chevron-back"
                color={'#00afb5'}
                size={40}
                style={{
                  marginLeft: wp('3%'),
                  padding: hp('1%'),
                  marginTop: hp('-9%'),
                }}
              />
            </TouchableOpacity>
            <View style={{flexDirection: 'row'}}>
              <View
                style={{
                  justifyContent: 'center',
                  // borderWidth: wp('0.2%'),
                  borderRadius: wp('3%'),
                  // padding: 5,
                  height: hp('5.2%'),
                  // marginBottom: hp('3%'),
                  borderColor: '#00afb5',
                  marginTop: hp('2%'),
                  backgroundColor: '#ffff',

                  width: wp('85%'),
                  alignSelf: 'center',
                  flexDirection: 'row',
                  marginBottom: hp('1%'),
                  // paddingLeft: wp('12%'),a
                  // alignItems: 'center',
                  textAlignVertical: 'top',
                  marginLeft: wp('7%'),
                  borderWidth: 0.5,
                }}>
                {/* <Icon
                                    name="camera-sharp"
                                    color={'#00afb5'}
                                    size={24}
                                    style={{ marginLeft: wp('0%'), padding: hp('1%'), }}
                                />
                                <View style={{ height: hp('2%'), borderColor: "#00afb5", borderWidth: 0.5, alignSelf: "center", marginLeft: wp('1%') }}>

                                </View> */}
                <TextInput
                  placeholder={'Search for products '}
                  fontFamily={'Poppins-Light'}
                  placeholderTextColor={'#00afb5'}
                  color={'black'}
                  fontSize={10}
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
                    // marginLeft: wp('1%'),
                    // marginLeft: wp('1%'),
                  }}
                />
                <Icon
                  style={{marginLeft: wp('1%'), padding: hp('1%')}}
                  onPress={() => {
                    // this.setState({Filter:true})
                    // this.RBSheet1.open();
                  }}
                  // activeOpacity={0.5}

                  name="search"
                  color={'gray'}
                  size={20}
                />
              </View>
            </View>
          </ImageBackground>

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

                // backgroundColor: '#ffff',
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
            ]}></View>

          <View
            style={{
              marginLeft: wp('4%'),
              marginRight: wp('4%'),
              marginTop: hp('0%'),
              marginBottom: hp('2%'),
            }}>
            <FlatList
              data={this.state.categories1}
              // horizontal={true}
              renderItem={({item, index}) => {
                return (
                  <>
                    <Text
                      style={{
                        fontSize: 15,
                        // textAlign: 'center',
                        //   justifyContent: 'center',
                        color: '#333',
                        fontFamily: 'Poppins-SemiBold',
                        // marginTop: hp('2%'),
                        marginBottom: hp('-0.5%'),
                        marginLeft: wp('7%'),
                        marginRight: wp('1%'),
                      }}>
                      <Text
                        style={{
                          fontSize: 14,
                          // textAlign: 'center',
                          //   justifyContent: 'center',
                          color: '#333',
                          fontFamily: 'Poppins-SemiBold',
                          // marginTop: hp('2%'),
                          marginBottom: hp('-0.5%'),
                          marginLeft: wp('7%'),
                          marginRight: wp('1%'),
                        }}>
                        {item.StoreName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          // textAlign: 'center',
                          //   justifyContent: 'center',
                          color: 'grey',
                          fontFamily: 'Poppins-Light',
                          marginTop: hp('2%'),
                          marginBottom: hp('-0.5%'),
                        }}>
                        {'  '}
                        {item.StoreLocation}
                      </Text>
                    </Text>
                    <View
                      style={{
                        marginLeft: wp('4%'),
                        marginRight: wp('4%'),
                        marginTop: hp('2%'),
                        marginBottom: hp('2%'),
                      }}>
                      <FlatList
                        data={item.Products}
                        // horizontal={true}
                        renderItem={({item, index}) => {
                          return (
                            <>
                              <TouchableOpacity
                                onPress={() => {
                                  this.props.navigation.push('ProductDetails', {
                                    data: {
                                      ProductID: item.ProductID,
                                      Pagename: 'categoryproduct',
                                    },
                                  });
                                }}>
                                {/* {console.log(item)} */}
                                <View
                                  style={[
                                    {
                                      // width: wp('30%'),
                                      alignSelf: 'center',
                                      //   elevation: 10,
                                      //   shadowColor: '#000',
                                      //   shadowOffset: {width: 0, height: 3},
                                      //   shadowOpacity: 0.5,
                                      //   shadowRadius: 5,

                                      // backgroundColor: '#ffff',
                                      // borderRadius: wp('3%'),
                                      borderRadius: wp('5%'),
                                      // borderTopRightRadius: wp('3%'),
                                      //   borderBottomRightRadius: wp('3%'),
                                      // marginLeft: wp('0.5%'),
                                      // justifyContent: 'center',
                                      // alignItems: 'center',
                                      marginLeft: wp('1%'),
                                      marginRight: wp('1%'),
                                      marginTop: hp('1%'),
                                      // marginBottom: hp('2%'),
                                      // borderColor: '#00afb5',
                                      // height: hp('7%'),
                                      // alignItems: 'center',
                                      // justifyContent: 'center',
                                      // flexDirection: 'row',
                                      // borderWidth: 0.7,
                                    },
                                  ]}>
                                  {item.ProductImage == null ||
                                  item.ProductImage == undefined ||
                                  item.ProductImage == '' ? (
                                    <>
                                      <Image
                                        style={{
                                          width: wp('39%'),
                                          height: hp('15%'),
                                          resizeMode: 'stretch',
                                          // resizeMode: 'stretch',s
                                          // borderTopRightRadius: hp('1%'),
                                          // borderTopLeftRadius: hp('1%'),
                                          // marginTop: hp('2%'),
                                          // marginLeft: wp('3%'),
                                          marginRight: wp('3%'),
                                          // borderRadius: wp('5%'),
                                          // marginBottom: hp('2%'),
                                          // marginLeft: wp('1.5%'),
                                        }}
                                        // source={{ uri: item.ProductImage }}
                                        // resizeMode="center"
                                        source={require('../Images/tshirt.jpg')}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <Image
                                        style={{
                                          width: wp('39%'),
                                          height: hp('15%'),
                                          resizeMode: 'stretch',
                                          // resizeMode: 'stretch',s
                                          // borderTopRightRadius: hp('1%'),
                                          // borderTopLeftRadius: hp('1%'),
                                          // marginTop: hp('2%'),
                                          // marginLeft: wp('3%'),
                                          marginRight: wp('3%'),
                                          // borderRadius: wp('5%'),
                                          // marginBottom: hp('2%'),
                                          // marginLeft: wp('1.5%'),
                                        }}
                                        source={{uri: item.ProductImage}}
                                        // resizeMode="center"
                                        // source={require('../Images/tshirt.jpg')}
                                      />
                                    </>
                                  )}

                                  <Text
                                    // onPress={() => {
                                    //   Linking.openURL(item.name);
                                    // }}
                                    style={{
                                      fontSize: 12,
                                      fontFamily: 'Poppins-SemiBold',

                                      color: '#333',
                                      marginTop: hp('0.5%'),
                                      // marginBottom: hp('1%'),
                                      // marginLeft: wp('4%'),
                                      width: wp('39%'),
                                      // marginRight: wp('2%'),
                                      // textDecorationLine: 'underline',
                                    }}>
                                    {item.ProductName}
                                  </Text>
                                  <Text
                                    // onPress={() => {
                                    //   Linking.openURL(item.name);
                                    // }}
                                    style={{
                                      fontSize: 8,
                                      fontFamily: 'Poppins-Light',

                                      color: 'grey',
                                      // marginTop: hp('0.5%'),
                                      // marginBottom: hp('1%'),
                                      // marginLeft: wp('4%'),
                                      width: wp('39%'),
                                      // marginRight: wp('2%'),
                                      // textDecorationLine: 'underline',
                                    }}>
                                    {item.ProductColor}
                                  </Text>
                                  <Text
                                    // onPress={() => {
                                    //   Linking.openURL(item.name);
                                    // }}
                                    style={{
                                      fontSize: 8,
                                      fontFamily: 'Poppins-Light',

                                      color: '#333',
                                      // marginTop: hp('0.5%'),
                                      // marginBottom: hp('1%'),
                                      // marginLeft: wp('4%'),
                                      width: wp('39%'),
                                      // marginRight: wp('2%'),
                                      // textDecorationLine: 'underline',
                                    }}>
                                    ₹ {item.ProductPrice}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </>
                          );
                        }}
                        numColumns={2}
                      />
                    </View>
                  </>
                );
              }}
            />
          </View>
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

export default CategoryProduct;
