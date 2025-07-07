import React, {useState, useEffect} from 'react';
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
import {API_KEY, URL_key} from '../Api/api';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import InputSpinner from 'react-native-input-spinner';
var RNFS = require('react-native-fs');
import {
  notifications,
  messages,
  NotificationMessage,
  Android,
} from 'react-native-firebase-push-notifications';
import Normalize from '../Size/size';

const ProductDetails = ({navigation, route}) => {
  const [state, setState] = useState({
    Size: [
      {
        name: '',
        Icon: 'man',
        nav: 'protab',
      },
    ],
    ProductsDetails: null,
    ProductID: navigation.getParam('data').ProductID,
    Pagename: navigation.getParam('data').Pagename,
    ProductItemID: null,
    StoreID: null,
    UnitPrice: null,
    selectedSize: null,
    selectedColor: null,
    quantity: 1,
    fail: false,
    StreetName: '',
    Pincode: '',
  });

  useEffect(() => {
    fetchUserAddress();
    fetchProductDetails();
  }, []);

  const fetchUserAddress = async () => {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const response = await axios.get(
        URL_key +
          'api/AddressApi/gCustomerAddress?UserProfileID=' +
          UserProfileID,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      const stateResponse = await axios.get(
        URL_key + 'api/AddressApi/gStateDDL',
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      const cou = stateResponse.data.filter(
        data => data.StateID == response.data[0].StateID,
      );

      setState(prev => ({
        ...prev,
        StreetName: response.data[0].StreetName,
        Pincode: response.data[0].AddressCategory,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(
        URL_key + 'api/ProductApi/gProductDetails?ProductID=' + state.ProductID,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      setState(prev => ({
        ...prev,
        ProductsDetails: response.data,
        UnitPrice: response.data.ProductPrice,
        StoreID: response.data.StoreID,
        ProductItemID:
          response.data.ProductItems == null ||
          response.data.ProductItems == undefined ||
          response.data.ProductItems.length == 0
            ? null
            : response.data.ProductItems[0].ProductItemID,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleQuantityChange = async num => {
    if (num === 0) {
      // Handle removal if needed
      return;
    }
    setState(prev => ({
      ...prev,
      quantity: num,
    }));
  };

  const handleSizeSelect = size => {
    setState(prev => ({
      ...prev,
      selectedSize: size,
    }));
  };

  const handleColorSelect = color => {
    setState(prev => ({
      ...prev,
      selectedColor: color,
    }));
  };

  const getPricingDetails = () => {
    const {ProductsDetails, selectedSize} = state;

    if (!ProductsDetails) return {itemPrice: 0, discountedPrice: 0};

    if (!selectedSize) {
      return {
        itemPrice: ProductsDetails.ProductPrice,
        discountedPrice: 0,
      };
    }

    const matchedItem = ProductsDetails.ProductItems?.find(
      item => item.Size === selectedSize,
    );

    if (!matchedItem) {
      return {
        itemPrice: ProductsDetails.ProductPrice,
        discountedPrice: 0,
      };
    }

    const {ItemPrice, DiscountedPrice} = matchedItem;

    if (ItemPrice === 0 && DiscountedPrice === 0) {
      return {
        itemPrice: ProductsDetails.ProductPrice,
        discountedPrice: 0,
      };
    }

    if (ItemPrice === 0 && DiscountedPrice > 0) {
      return {
        itemPrice: 0,
        discountedPrice: DiscountedPrice,
      };
    }

    return {
      itemPrice: ItemPrice,
      discountedPrice: DiscountedPrice < ItemPrice ? DiscountedPrice : 0,
    };
  };

  const getUniqueColorItems = () => {
    const data =
      state.ProductsDetails == null
        ? state.ItemColor
        : state.ProductsDetails?.ProductItems || [];

    return data?.filter(
      (item, index, self) =>
        item?.ItemColor &&
        index === self.findIndex(t => t.ItemColor === item.ItemColor),
    );
  };

  const addToCart = async () => {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const SystemUser = await AsyncStorage.getItem('FullName');
      const SystemDate = moment().format('YYYY-MM-DD hh:mm:ss A');

      // First check if there are items in cart from a different store
      const cartResponse = await axios.get(
        `${URL_key}api/ProductApi/gProductCartList?UserProfileID=${UserProfileID}`,
        {headers: {'content-type': 'application/json'}},
      );

      const cartItems = cartResponse.data.CartItems || [];

      if (cartItems.length > 0) {
        // Get first item's store ID to compare
        const existingStoreId = cartItems[0].StoreID;

        if (existingStoreId !== state.StoreID) {
          Alert.alert(
            'Different Store',
            'You have items in your cart from a different store. Would you like to clear your cart and add this item?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Clear Cart & Add',
                onPress: async () => {
                  // Clear cart
                  for (const item of cartItems) {
                    await axios.post(
                      `${URL_key}api/ProductApi/dProductCartItem`,
                      {
                        CartID: item.CartID,
                        CartItemID: item.CartItemID,
                        SystemUser,
                        SystemDate,
                      },
                      {
                        headers: {
                          'content-type': 'application/json',
                        },
                      },
                    );
                  }
                  // Now add new item
                  await addItemToCart();
                },
              },
            ],
          );
          return;
        }
      }

      // If cart is empty or same store, proceed with adding item
      await addItemToCart();
    } catch (err) {
      setState(prev => ({...prev, fail: true}));
    }
  };

  const addItemToCart = async () => {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const SystemUser = await AsyncStorage.getItem('FullName');
      const SystemDate = moment().format('YYYY-MM-DD hh:mm:ss A');

      // Check if same product with same size/color exists
      const cartResponse = await axios.get(
        `${URL_key}api/ProductApi/gProductCartList?UserProfileID=${UserProfileID}`,
        {headers: {'content-type': 'application/json'}},
      );

      const cartItems = cartResponse.data.CartItems || [];
      const existingItem = cartItems.find(
        item =>
          item.ProductID === state.ProductID &&
          item.ProductItemID === state.ProductItemID &&
          item.SizeID === state.selectedSize &&
          item.Color === state.selectedColor,
      );

      if (existingItem) {
        // Update quantity of existing item
        const res = await axios.post(
          `${URL_key}api/ProductApi/sProductCartItem`,
          {
            CartID: existingItem.CartID,
            CartItemID: existingItem.CartItemID,
            UserProfileID,
            ProductID: state.ProductID,
            ProductItemID: state.ProductItemID,
            StoreID: state.StoreID,
            Quantity: existingItem.Quantity + state.quantity,
            UnitPrice: state.UnitPrice,
            SystemUser,
            SystemDate,
            SizeID: state.selectedSize,
            Color: state.selectedColor,
          },
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        );

        if (res.data.Result === 'UPDATED') {
          await AsyncStorage.setItem('CartID', res.data.CartID.toString());
          navigation.push('tabc');
        } else {
          setState(prev => ({...prev, fail: true}));
        }
      } else {
        // Add as new item
        const latestCart = await axios.get(
          URL_key +
            'api/ProductApi/gLatestCardID?UserProfileID=' +
            UserProfileID,
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        );

        const cartItem = {
          CartID: latestCart.data,
          CartItemID: 0,
          UserProfileID,
          ProductID: state.ProductID,
          ProductItemID: state.ProductItemID,
          StoreID: state.StoreID,
          Quantity: state.quantity,
          UnitPrice: state.UnitPrice,
          SystemUser,
          SystemDate,
          SizeID: state.selectedSize,
          Color: state.selectedColor,
        };

        const response = await axios.post(
          `${URL_key}api/ProductApi/sProductCartItem`,
          cartItem,
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        );

        if (response.data.Result === 'INSERTED') {
          await AsyncStorage.setItem('CartID', response.data.CartID.toString());
          navigation.push('tabc');
        } else {
          setState(prev => ({...prev, fail: true}));
        }
      }
    } catch (err) {
      setState(prev => ({...prev, fail: true}));
    }
  };

  const addToWishlist = async () => {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const SystemUser = await AsyncStorage.getItem('FullName');
      const SystemDate = moment().format('YYYY-MM-DD hh:mm:ss A');

      const wishlistItem = {
        UserProfileID: UserProfileID,
        ProductID: state.ProductID,
        ProductItemID: state.ProductItemID,
        IsActive: 1,
        SystemUser: SystemUser,
        SystemDate: SystemDate,
      };

      const response = await axios.post(
        URL_key + 'api/ProductApi/sWishList',
        wishlistItem,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      if (response.data === 'INSERTED') {
        navigation.push('Wishlist');
      } else {
        setState(prev => ({...prev, fail: true}));
      }
    } catch (err) {
      setState(prev => ({...prev, fail: true}));
    }
  };

  const {itemPrice, discountedPrice} = getPricingDetails();

  return (
    <SafeAreaView>
      <NavigationEvents onWillFocus={() => {}} onWillBlur={() => {}} />
      <Dialog
        visible={state.fail}
        dialogStyle={{
          borderRadius: wp('5%'),
          width: wp('75%'),
          alignSelf: 'center',
        }}
        onTouchOutside={() => console.log('no')}>
        <View
          style={{
            alignItems: 'center',
            marginTop: hp('2%'),
            marginBottom: hp('0.5%'),
          }}>
          <Image
            style={{
              height: hp('6%'),
              width: hp('6%'),
              borderRadius: hp('100%'),
              alignSelf: 'center',
              justifyContent: 'center',
            }}
            resizeMode="contain"
            source={require('../Images/1024px-Cross_red_circle.svg-removebg-preview.png')}
          />
        </View>
        <Text
          style={{
            color: 'red',
            fontSize: 15,
            fontFamily: 'Poppins-Light',
            textAlign: 'center',
            marginTop: hp('2%'),
            marginBottom: hp('1%'),
            lineHeight: hp('2.5%'),
          }}>
          Error !! Please Try Again.
        </Text>
        <TouchableOpacity
          style={styles.SubmitButtonStyledd}
          activeOpacity={0.5}
          onPress={() => setState(prev => ({...prev, fail: false}))}>
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
              fontFamily: 'Poppins-SemiBold',
              fontSize: 16,
            }}>
            {' '}
            OK{' '}
          </Text>
        </TouchableOpacity>
      </Dialog>
      <ScrollView>
        <Text
          style={{
            color: '#333',
            fontSize: 11,
            fontFamily: 'Poppins-Medium',
            marginTop: hp('5%'),
            marginLeft: wp('17%'),
          }}>
          Delivering to {'>'}
        </Text>
        <Text
          style={{
            color: '#00afb5',
            fontSize: 12,
            fontFamily: 'Poppins-Medium',
            marginLeft: wp('17%'),
          }}>
          {state.Pincode}
        </Text>
        <Text
          style={{
            color: '#333',
            fontSize: 10,
            fontFamily: 'Poppins-Light',
            marginLeft: wp('17%'),
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
          onPress={() => navigation.navigate(state.Pagename)}
          name="chevron-back"
          color={'#00afb5'}
          size={40}
          style={{
            marginLeft: wp('1%'),
            padding: hp('1%'),
            marginTop: hp('-10%'),
            marginBottom: hp('4%'),
          }}
        />

        {/* Product Images */}
        <View style={{marginLeft: wp('7%')}}>
          {state.ProductsDetails && (
            <>
              {state.ProductsDetails.ProductImages ? (
                <FlatList
                  data={state.ProductsDetails.ProductImages}
                  horizontal={true}
                  renderItem={({item}) => (
                    <Image
                      style={{
                        width: wp('75%'),
                        height: hp('45%'),
                        marginLeft: wp('4%'),
                        marginRight: wp('4%'),
                        borderRadius: wp('8%'),
                      }}
                      source={{uri: item.ProductImage}}
                    />
                  )}
                />
              ) : (
                <Image
                  style={{
                    width: wp('75%'),
                    height: hp('45%'),
                    marginLeft: wp('4%'),
                    marginRight: wp('4%'),
                    borderRadius: wp('8%'),
                  }}
                  source={require('../Images/tshirt.jpg')}
                />
              )}
            </>
          )}
        </View>

        {/* Product Name and Color */}
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Poppins-Bold',
            color: '#333',
            marginTop: hp('3%'),
            marginLeft: wp('12%'),
          }}>
          {state.ProductsDetails?.ProductName}
        </Text>
        <Text
          style={{
            fontSize: 10,
            fontFamily: 'Poppins-Light',
            color: 'grey',
            marginLeft: wp('12%'),
          }}>
          {state.ProductsDetails?.ProductColor}
        </Text>

        {/* Price Display */}
        <View>
          <Text
            style={{
              fontSize: 11,
              fontFamily: 'Poppins-SemiBold',
              color: '#333',
              marginTop: hp('1.5%'),
              marginLeft: wp('12%'),
            }}>
            MRP ₹{itemPrice}
          </Text>
          {discountedPrice > 0 && discountedPrice < itemPrice && (
            <Text
              style={{
                fontSize: 11,
                fontFamily: 'Poppins-SemiBold',
                color: '#d32f2f',
                marginTop: hp('0.5%'),
                marginLeft: wp('12%'),
              }}>
              Discounted Price: ₹{discountedPrice}
            </Text>
          )}
        </View>
        {/* Size Selection */}
        <Text
          style={{
            fontSize: 11,
            fontFamily: 'Poppins-SemiBold',
            color: '#333',
            marginTop: hp('1.5%'),
            marginLeft: wp('12%'),
          }}>
          Size
        </Text>
        <View
          style={{
            marginLeft: wp('8%'),
            marginRight: wp('3%'),
          }}>
          <FlatList
            data={
              state.ProductsDetails == null
                ? state.Size
                : state.ProductsDetails.ProductItems
            }
            horizontal={true}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.sizeButton,
                  state.selectedSize === item.Size && styles.selectedSizeButton,
                ]}
                onPress={() => handleSizeSelect(item.Size)}>
                <Text
                  style={[
                    styles.sizeButtonText,
                    state.selectedSize === item.Size && styles.selectedSizeText,
                  ]}>
                  {item.Size}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Color Selection */}
        <Text
          style={{
            fontSize: 11,
            fontFamily: 'Poppins-SemiBold',
            color: '#333',
            marginTop: hp('1.5%'),
            marginLeft: wp('12%'),
          }}>
          Colors
        </Text>
        <View style={{marginLeft: wp('8%'), marginRight: wp('3%')}}>
          <FlatList
            data={getUniqueColorItems()}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              const color = item?.ItemColor?.toLowerCase?.();

              // Fallback color if invalid (optional)
              if (!color) return null;

              return (
                <TouchableOpacity
                  onPress={() => handleColorSelect(item.ItemColor)}
                  style={[
                    styles.colorButton,
                    {backgroundColor: color},
                    state.selectedColor?.toLowerCase?.() === color &&
                      styles.selectedColorButton,
                  ]}></TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Delivery Info */}
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Poppins-SemiBold',
            color: '#333',
            marginTop: hp('1.5%'),
            textAlign: 'center',
          }}>
          Delivering in 10 minutes
        </Text>
        <Text
          style={{
            fontSize: 8,
            fontFamily: 'Poppins-Light',
            color: '#333',
            marginTop: hp('1.5%'),
            textAlign: 'center',
            marginLeft: wp('12%'),
            marginRight: wp('12%'),
          }}>
          Delivery time depends on clear weather and the availability of our
          delivery partners.
        </Text>

        {/* Product Details */}
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Poppins-SemiBold',
            color: '#333',
            marginTop: hp('2.5%'),
            marginLeft: wp('12%'),
          }}>
          {` Product Details >`}
        </Text>
        <Text
          style={{
            fontSize: 10,
            fontFamily: 'Poppins-Light',
            color: '#333',
            marginLeft: wp('12%'),
            marginRight: wp('12%'),
            marginBottom: hp('2.5%'),
          }}>
          {state.ProductsDetails?.Description}
        </Text>

        {/* Ratings & Reviews */}
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Poppins-SemiBold',
            color: '#333',
            marginTop: hp('1.5%'),
            marginLeft: wp('12%'),
          }}>
          Ratings & Reviews
        </Text>
        <Text
          style={{
            fontSize: 9,
            fontFamily: 'Poppins-Light',
            color: '#333',
            marginTop: hp('1.5%'),
            textAlign: 'center',
            marginLeft: wp('12%'),
            marginRight: wp('12%'),
            marginBottom: hp('2.5%'),
          }}>
          *Looks like the product is waiting for its first fan! Be the first to
          try it and let others know what you think*
        </Text>

        {/* Action Buttons */}
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity activeOpacity={0.5} onPress={addToCart}>
            <View style={styles.cartButton}>
              <Icon
                name="cart-outline"
                color={'#00afb5'}
                size={20}
                style={{marginLeft: wp('1%'), padding: hp('1%')}}
              />
              <Text style={styles.cartButtonText}>Add to Cart</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onPress={addToWishlist}>
            <View style={styles.wishlistButton}>
              <Icon
                name="heart-sharp"
                color={'#ffff'}
                size={20}
                style={{marginLeft: wp('1%'), padding: hp('1%')}}
              />
              <Text style={styles.wishlistButtonText}>Wishlist</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  SubmitButtonStyledd: {
    paddingTop: hp('0.5%'),
    paddingBottom: hp('0.5%'),
    backgroundColor: 'red',
    borderRadius: wp('5%'),
    width: wp('25%'),
    alignSelf: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
  },
  quantityContainer: {
    marginTop: hp('1.5%'),
    marginLeft: wp('12%'),
    marginRight: wp('12%'),
  },
  sizeButton: {
    width: wp('10%'),
    height: hp('4%'),
    borderRadius: wp('3%'),
    backgroundColor: 'lightgray',
    marginLeft: wp('3%'),
    marginRight: wp('1%'),
    marginTop: hp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSizeButton: {
    backgroundColor: '#00afb5',
  },
  sizeButtonText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  selectedSizeText: {
    color: 'white',
  },
  colorButton: {
    width: wp('11%'),
    height: hp('5%'),
    borderRadius: wp('3%'),
    // backgroundColor: 'lightgray',
    marginLeft: wp('3%'),
    marginRight: wp('1%'),
    marginTop: hp('1%'),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
  },
  // selectedColorButton: {
  //   backgroundColor: '#00afb5',
  // },
  // colorButton: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 10, // Rounded square
  //   marginHorizontal: 5,
  //   borderWidth: 2,
  //   borderColor: '#ccc',
  // },
  selectedColorButton: {
    borderColor: '#00afb5', // Or any highlight color
    borderWidth: 3,
  },
  colorButtonText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  selectedColorText: {
    color: 'white',
  },
  cartButton: {
    backgroundColor: 'transparent',
    width: wp('50%'),
    height: hp('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1%'),
    borderColor: '#00afb5',
    borderWidth: 1,
    flexDirection: 'row',
  },
  cartButtonText: {
    color: '#00afb5',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  wishlistButton: {
    backgroundColor: '#00afb5',
    width: wp('50%'),
    height: hp('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1%'),
    borderColor: '#00afb5',
    borderWidth: 1,
    flexDirection: 'row',
  },
  wishlistButtonText: {
    color: '#ffff',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});

export default ProductDetails;
