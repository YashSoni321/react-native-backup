import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FormInput,
  Text,
  View,
  Image,
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
import apiService, {
  getProductListByStore,
  getProductCartList,
  getCategoryList,
  getSubCategoryList,
  getCustomerAddress,
  getStateDDL,
  testConnection,
} from '../Api/api';
import axios from 'axios';
import CartValidation from '../../shared/CartValidation';
var RNFS = require('react-native-fs');
import GetLocation from 'react-native-get-location';
import LinearGradient from 'react-native-linear-gradient';
import MenuDrawer from 'react-native-side-drawer';

import NoProducts from './NoProducts';
import {getUserDeliveryTime} from '../Common/CalculateDistance';
import CustomModal from '../../shared/CustomModal';

const StoreProducts = ({navigation, route}) => {
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onPrimaryPress: null,
  });

  const [state, setState] = useState({
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
    StoreID: route?.params?.data?.StoreID || null,
    StoreName: route?.params?.data?.StoreName || null,
    StoreImage: route?.params?.data?.StoreImage || null,
    StoreLocation: route?.params?.data?.StoreLocation || null,
    Timing: route?.params?.data?.Timing || null,
    DeliveryCharges: route?.params?.data?.DeliveryCharges || null,
    ProductList: null,
    ProductList1: null,
    StreetName: '',
    Pincode: '',
    search: '',
    selectedIndex: 0,
    subcategory: null,
    CategoryName: '',
    showcategory: false,
    isLoading: false,
    error: null,
  });

  // Modal functions
  const showModal = (title, message, type = 'info', onPrimaryPress = null) => {
    setModalConfig({
      visible: true,
      title,
      message,
      type,
      onPrimaryPress,
    });
  };

  const hideModal = () => {
    setModalConfig(prev => ({...prev, visible: false}));
  };

  // Error handling function
  const handleError = (error, context = 'Unknown operation') => {
    console.error(`Error in ${context}:`, error);
    setState(prevState => ({
      ...prevState,
      error: `${context} failed. Please try again.`,
      isLoading: false,
    }));
  };

  // Search filter function
  const SearchFilterFunction = text => {
    try {
      setState(prevState => ({...prevState, search: text}));

      if (text) {
        // Get the base data to search from (either all products or filtered by category)
        const baseData = state.showcategory
          ? state.ProductList?.filter(
              product =>
                product.CategoryID ===
                state.categories1?.find(
                  cat => cat.CategoryName === state.CategoryName,
                )?.CategoryID,
            ) || []
          : state.ProductList || [];

        const newData = baseData.filter(function (data) {
          const textData = text.toUpperCase();
          return (
            data.ProductName &&
            data.ProductName.toUpperCase().indexOf(textData) >= 0
          );
        });

        console.log('Search results:', newData);
        setState(prevState => ({
          ...prevState,
          ProductList1: newData,
          selectedIndex: 0,
        }));
      } else {
        // If search is cleared, restore the category filter or all products
        const restoredData = state.showcategory
          ? state.ProductList?.filter(
              product =>
                product.CategoryID ===
                state.categories1?.find(
                  cat => cat.CategoryName === state.CategoryName,
                )?.CategoryID,
            ) || []
          : state.ProductList || [];

        setState(prevState => ({
          ...prevState,
          ProductList1: restoredData,
          selectedIndex: 0,
        }));
      }
    } catch (error) {
      handleError(error, 'Search operation');
    }
  };

  // Handle category press
  const handleCategoryPress = async item => {
    try {
      console.log('Category pressed:', item.CategoryID, item.CategoryName);

      // Show loading state
      setState(prevState => ({
        ...prevState,
        isLoading: true,
        selectedIndex: 0,
      }));

      // Fetch subcategories for the selected category
      const response = await apiService.getSubCategoryList(item.CategoryID);
      console.log('Fetch subcategories for the selected category', response);
      console.log('this.state.ProductList', state.ProductList);
      // Filter products by the selected category
      const filteredProducts =
        state.ProductList?.filter(
          product => product.CategoryID === item.CategoryID,
        ) || [];

      console.log('Filtered products for category:', filteredProducts);

      setState(prevState => ({
        ...prevState,
        subcategory: response,
        CategoryName: item.CategoryName,
        showcategory: true,
        ProductList1: filteredProducts,
        isLoading: false,
        search: '', // Clear search when category is selected
      }));
    } catch (error) {
      handleError(error, 'Fetching subcategories');
    }
  };

  // Handle show all products (reset filter)
  const handleShowAllProducts = () => {
    try {
      setState(prevState => ({
        ...prevState,
        ProductList1: state.ProductList,
        showcategory: false,
        CategoryName: '',
        subcategory: null,
        selectedIndex: 0,
        search: '', // Clear search
      }));
    } catch (error) {
      handleError(error, 'Resetting product filter');
    }
  };

  // Handle product press
  const handleProductPress = item => {
    try {
      navigation.push('ProductDetails', {
        data: {
          ProductID: item.ProductID,
          Pagename: 'StoreProducts',
        },
      });
    } catch (error) {
      handleError(error, 'Product navigation');
    }
  };

  // Handle go back to stores
  const handleGoBack = () => {
    try {
      navigation.push('Tabs');
    } catch (error) {
      handleError(error, 'Navigation');
    }
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      console.log('🔄 Starting fetchData with API service...');
      setState(prevState => ({...prevState, isLoading: true, error: null}));

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      console.log('👤 UserProfileID:', UserProfileID);

      if (!UserProfileID) {
        console.error('❌ UserProfileID not found in AsyncStorage');
        setState(prevState => ({
          ...prevState,
          isLoading: false,
          error: 'User not logged in. Please login again.',
        }));
        return;
      }

      // Test API connection first
      const isConnected = await testConnection();
      if (!isConnected) {
        console.warn('⚠️ API connection test failed, but continuing...');
      }

      // Check if user has items in cart from a different store
      try {
        console.log('🛒 Checking cart items...');
        const currentCartStore = await CartValidation.getCurrentCartStore();

        if (currentCartStore && currentCartStore.StoreID !== state.StoreID) {
          console.log(
            '🛒 Different store detected:',
            currentCartStore.StoreName,
            'vs',
            state.StoreName,
          );
          showModal(
            'Different Store',
            `You have ${currentCartStore.ItemCount} item(s) in your cart from ${currentCartStore.StoreName}. You can browse products but will need to clear your cart before adding items from this store.`,
            'warning',
          );
        }
      } catch (cartError) {
        console.warn('⚠️ Cart check failed:', cartError.message);
        // Continue with the main flow even if cart check fails
      }

      // Fetch categories
      console.log('📂 Fetching categories...');
      const categoriesResponse = await apiService.getCategoryList();
      console.log('📂 Categories response:', categoriesResponse);

      // Fetch products by store
      console.log('🏪 StoreID for products API:', state.StoreID);
      const productsResponse = await apiService.getProductListByStore(
        state.StoreID || 1,
      );
      console.log('📦 Products response:', productsResponse);

      // Fetch address data
      console.log('📍 Fetching address data...');
      const addressResponse = await apiService.getCustomerAddress(
        UserProfileID,
      );
      console.log('📍 Address response:', addressResponse);

      // Fetch state data
      console.log('🏛️ Fetching state data...');
      const stateResponse = await apiService.getStateDDL();
      console.log('🏛️ State response:', stateResponse);

      const stateData =
        stateResponse?.filter(
          data => data.StateID === addressResponse[0]?.StateID,
        ) || [];

      console.log('✅ All data fetched successfully');
      console.log('📦 Final products count:', productsResponse?.length || 0);

      setState(prevState => ({
        ...prevState,
        categories1: categoriesResponse || [],
        ProductList: productsResponse || [],
        ProductList1: productsResponse || [],
        StreetName: addressResponse[0]?.StreetName || '',
        Pincode: addressResponse[0]?.AddressCategory || '',
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('❌ fetchData error:', error);
      handleError(error, 'Fetching data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const fetchDeliveryLocationTime = async () => {
      const time = await getUserDeliveryTime(state.StoreID);
      setDeliveryTime(time);
    };
    if (state.StoreID) {
      fetchDeliveryLocationTime();
    }
  }, [state.StoreID]);

  // Error alert
  // useEffect(() => {
  //   if (state.error) {
  //     Alert.alert('Error', state.error, [
  //       {
  //         text: 'OK',
  //         onPress: () => setState(prevState => ({...prevState, error: null})),
  //       },
  //     ]);
  //   }
  // }, [state.error]);

  return (
    <SafeAreaView>
      <ScrollView>
        <ImageBackground
          style={{width: wp('100%')}}
          activeOpacity={0.5}
          source={require('../Images/output-onlinepngtools1.png')}
          resizeMode="cover">
          <Text
            style={{
              color: '#333',
              fontSize: 11,
              fontFamily: 'Poppins-Medium',
              marginTop: hp('4%'),
              marginLeft: wp('15%'),
            }}>
            Delivering to &gt;
          </Text>
          <Text
            style={{
              color: '#00afb5',
              fontSize: 12,
              fontFamily: 'Poppins-SemiBold',
              marginLeft: wp('15.5%'),
            }}>
            {state.Pincode}
          </Text>
          <Text
            style={{
              color: '#333',
              fontSize: 10,
              fontFamily: 'Poppins-Light',
              marginLeft: wp('15%'),
              width: wp('52%'),
            }}>
            {state.StreetName}
          </Text>

          <Text
            style={{
              fontSize: 40,
              textAlign: 'right',
              color: '#00afb5',
              fontFamily: 'RedHatDisplay-SemiBold',
              marginTop: hp('-8%'),
              marginBottom: hp('1.5%'),
              marginRight: wp('7%'),
            }}>
            fybr
          </Text>

          <Icon
            onPress={() => {
              navigation.push('Tabs');
            }}
            name="chevron-back"
            color={'#00afb5'}
            size={30}
            style={{
              marginLeft: wp('1%'),
              padding: hp('1%'),
              marginTop: hp('-7.5%'),
              marginBottom: hp('6%'),
            }}
          />
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                justifyContent: 'center',
                borderRadius: wp('3%'),
                height: hp('5.2%'),
                borderColor: '#00afb5',
                backgroundColor: '#ffff',
                width: wp('85%'),
                alignSelf: 'center',
                flexDirection: 'row',
                marginBottom: hp('1%'),
                textAlignVertical: 'top',
                marginLeft: wp('7%'),
                borderWidth: 0.5,
              }}>
              <TextInput
                placeholder={'Search for products in ' + state.StoreName}
                fontFamily={'Poppins-Light'}
                placeholderTextColor={'#00afb5'}
                color={'black'}
                fontSize={10}
                value={state.search}
                onChangeText={SearchFilterFunction}
                style={{
                  padding: hp('1%'),
                  width: wp('65%'),
                }}
              />
              <Icon
                style={{marginLeft: wp('1%'), padding: hp('1%')}}
                onPress={() => {}}
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
              borderRadius: wp('3%'),
              marginLeft: wp('1%'),
              marginRight: wp('1%'),
              marginTop: hp('2%'),
              borderColor: '#00afb5',
            },
          ]}>
          <View style={{flexDirection: 'row'}}>
            <View>
              {state.StoreImage == null ||
              state.StoreImage == undefined ||
              state.StoreImage == '' ? (
                <Image
                  style={{
                    width: wp('25%'),
                    height: hp('10%'),
                    marginTop: hp('1%'),
                    marginLeft: wp('6%'),
                    marginRight: wp('4%'),
                    marginBottom: hp('1%'),
                  }}
                  source={require('../Images/Zudio.jpg')}
                />
              ) : (
                <Image
                  style={{
                    width: wp('25%'),
                    height: hp('10%'),
                    marginTop: hp('1%'),
                    marginLeft: wp('6%'),
                    marginRight: wp('4%'),
                    marginBottom: hp('1%'),
                  }}
                  source={{uri: state.StoreImage}}
                />
              )}
            </View>

            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Poppins-Medium',
                  alignContent: 'center',
                  textAlign: 'left',
                  justifyContent: 'center',
                  color: '#333',
                  marginTop: hp('0.5%'),
                  marginLeft: wp('1%'),
                  marginRight: wp('2%'),
                  width: wp('55%'),
                }}>
                {state.StoreName}
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: 'Poppins-Light',
                  alignContent: 'center',
                  textAlign: 'left',
                  justifyContent: 'center',
                  color: 'gray',
                  marginLeft: wp('1%'),
                  marginRight: wp('2%'),
                  width: wp('55%'),
                }}>
                {state.StoreLocation}
              </Text>

              <Text
                style={{
                  fontSize: 9,
                  fontFamily: 'Poppins-Medium',
                  alignContent: 'center',
                  textAlign: 'left',
                  justifyContent: 'center',
                  color: '#00afb5',
                  marginTop: hp('1%'),
                  marginLeft: wp('1%'),
                  marginRight: wp('2%'),
                  width: wp('74%'),
                }}>
                ⏰ {state.Timing} ₹{state.DeliveryCharges}
                {/* 🚚 Delivery in {state.DeliveryTime || '30 mins'} •{' '} */}
                Delivery in{' '}
                {deliveryTime === null ? 'Calculating...' : deliveryTime}
                {/* {state.Distance || '0.0'} km away */}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={{
            fontSize: 13,
            color: '#333',
            fontFamily: 'Poppins-SemiBold',
            marginTop: hp('2%'),
            marginBottom: hp('-1%'),
            marginLeft: wp('7%'),
            marginRight: wp('1%'),
          }}>
          Categories
        </Text>

        <View
          style={{
            marginLeft: wp('4%'),
            marginRight: wp('4%'),
          }}>
          <FlatList
            data={[
              {CategoryName: 'All', CategoryID: 'all'},
              ...state.categories1,
            ]}
            horizontal={true}
            renderItem={({item, index}) => {
              const isSelected =
                item.CategoryID === 'all'
                  ? !state.showcategory
                  : state.CategoryName === item.CategoryName;
              return (
                <TouchableOpacity
                  onPress={() => {
                    if (item.CategoryID === 'all') {
                      handleShowAllProducts();
                    } else {
                      handleCategoryPress(item);
                    }
                  }}>
                  <View style={{width: wp('16.5%')}}>
                    <View
                      style={[
                        {
                          width: wp('13.5%'),
                          alignSelf: 'center',
                          elevation: 10,
                          shadowColor: '#000',
                          shadowOffset: {width: 0, height: 3},
                          shadowOpacity: 0.5,
                          shadowRadius: 5,
                          backgroundColor: isSelected ? '#00afb5' : '#f0f0f0',
                          borderRadius: wp('2%'),
                          marginLeft: wp('1%'),
                          marginRight: wp('1%'),
                          marginTop: hp('2%'),
                          borderColor: isSelected ? '#00afb5' : '#ddd',
                          borderWidth: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      ]}>
                      <Icon
                        name={item.CategoryID === 'all' ? 'apps' : 'man'}
                        color={isSelected ? '#ffff' : '#666'}
                        size={25}
                        style={{
                          marginTop: hp('1.3%'),
                          marginBottom: hp('1.3%'),
                        }}
                      />
                    </View>

                    <Text
                      style={{
                        fontSize: 9,
                        fontFamily: isSelected
                          ? 'Poppins-Medium'
                          : 'Poppins-Light',
                        alignContent: 'center',
                        textAlign: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#00afb5' : '#333',
                        marginTop: hp('0.5%'),
                        marginBottom: hp('1%'),
                      }}>
                      {item.CategoryName}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Show current filter status */}
        {state.showcategory && (
          <View
            style={{
              marginLeft: wp('7%'),
              marginRight: wp('7%'),
              marginTop: hp('1%'),
              marginBottom: hp('1%'),
            }}>
            <Text
              style={{
                fontSize: 11,
                fontFamily: 'Poppins-Light',
                color: '#666',
                textAlign: 'center',
              }}>
              Showing products in:{' '}
              <Text style={{fontFamily: 'Poppins-Medium', color: '#00afb5'}}>
                {state.CategoryName}
              </Text>
            </Text>
          </View>
        )}

        <View
          style={{
            marginLeft: wp('4%'),
            marginRight: wp('4%'),
            marginTop: hp('0%'),
            marginBottom: hp('2%'),
          }}>
          {state.isLoading ? (
            <View style={{marginTop: hp('10%'), alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#00afb5" />
              <Text style={{marginTop: hp('2%'), fontFamily: 'Poppins-Light'}}>
                Loading products...
              </Text>
            </View>
          ) : state.ProductList1?.length === 0 ? (
            <NoProducts
              storeName={state.StoreName}
              onGoBack={handleGoBack}
              searchTerm={state.search}
            />
          ) : (
            <FlatList
              data={state.ProductList1}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity onPress={() => handleProductPress(item)}>
                    <View
                      style={[
                        {
                          alignSelf: 'center',
                          borderRadius: wp('5%'),
                          marginLeft: wp('1%'),
                          marginRight: wp('1%'),
                          marginTop: hp('1%'),
                        },
                      ]}>
                      {item.ProductImage == null ||
                      item.ProductImage == undefined ? (
                        <Image
                          style={{
                            width: wp('39%'),
                            height: hp('15%'),
                            resizeMode: 'stretch',
                            marginLeft: wp('3%'),
                            marginRight: wp('3%'),
                          }}
                          source={require('../Images/tshirt.jpg')}
                        />
                      ) : (
                        <>
                          {item.ProductImage.length == 0 ||
                          item.ProductImage == '' ? (
                            <Image
                              style={{
                                width: wp('39%'),
                                height: hp('15%'),
                                resizeMode: 'stretch',
                                marginLeft: wp('3%'),
                                marginRight: wp('3%'),
                              }}
                              source={require('../Images/tshirt.jpg')}
                            />
                          ) : (
                            <Image
                              style={{
                                width: wp('39%'),
                                height: hp('15%'),
                                resizeMode: 'stretch',
                                marginLeft: wp('3%'),
                                marginRight: wp('3%'),
                              }}
                              source={{uri: item.ProductImage}}
                            />
                          )}
                        </>
                      )}

                      <Text
                        style={{
                          fontSize: 9,
                          fontFamily: 'Poppins-Light',
                          color: '#333',
                          marginTop: hp('0.5%'),
                          marginLeft: wp('4%'),
                          width: wp('39%'),
                        }}>
                        {item.ProductName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 8,
                          fontFamily: 'Poppins-Light',
                          color: 'grey',
                          marginLeft: wp('4%'),
                        }}>
                        {item.ProductColor}
                      </Text>
                      <Text
                        style={{
                          fontSize: 8,
                          fontFamily: 'Poppins-Light',
                          color: '#333',
                          marginLeft: wp('4%'),
                        }}>
                        ₹ {item.ProductPrice}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              numColumns={2}
            />
          )}
        </View>
      </ScrollView>

      <CustomModal
        visible={modalConfig.visible}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onPrimaryPress={modalConfig.onPrimaryPress}
      />
    </SafeAreaView>
  );
};

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

export default StoreProducts;
