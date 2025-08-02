import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ImageBackground,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {CustomPicker} from 'react-native-custom-picker';
import {API_KEY, URL_key} from '../Api/api';
import apiService, {
  getProductDetails,
  getProductCartList,
  getCustomerAddress,
  getStateDDL,
  getLatestCartID,
  addToCart,
  updateCartItem,
  removeFromCart,
  addToWishlist,
} from '../Api/api';
import moment from 'moment';
import CartValidation from '../../shared/CartValidation';
import {getColorHex} from '../../shared/ColorUtils';
import {getUserDeliveryTime} from '../Common/CalculateDistance';
import CustomModal from '../../shared/CustomModal';

const ProductDetails = ({navigation, route}) => {
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    primaryButtonText: 'OK',
    onPrimaryPress: null,
  });
  const [state, setState] = useState({
    Size: [
      {
        name: '',
        Icon: 'man',
        nav: 'protab',
      },
    ],
    ProductsDetails: null,
    ProductID: route?.params?.data?.ProductID || null,
    Pagename: route?.params?.data?.Pagename || null,
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

  // Update state when route params change
  useEffect(() => {
    if (route?.params?.data) {
      setState(prevState => ({
        ...prevState,
        ProductID: route.params.data.ProductID || null,
        Pagename: route.params.data.Pagename || null,
      }));
    }
  }, [route?.params?.data]);

  useEffect(() => {
    // Only fetch data if ProductID is available
    if (state.ProductID) {
      fetchUserAddress();
      fetchProductDetails();
    } else {
      console.error('❌ ProductID is not available');
    }
  }, [state.ProductID]);

  const fetchUserAddress = async () => {
    try {
      console.log('📍 Fetching user address...');
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');

      if (!UserProfileID) {
        console.error('❌ UserProfileID not found');
        return;
      }

      const response = await apiService.getCustomerAddress(UserProfileID);
      const stateResponse = await apiService.getStateDDL();

      setState(prev => ({
        ...prev,
        StreetName: response[0]?.StreetName || '',
        Pincode: response[0]?.AddressCategory || '',
      }));
    } catch (err) {
      console.error('❌ Error fetching user address:', err);
      // Don't show error to user for address fetch failure
    }
  };

  const fetchProductDetails = async () => {
    try {
      console.log(
        '📦 Fetching product details for ProductID:',
        state.ProductID,
      );

      if (!state.ProductID) {
        console.error('❌ ProductID is null');
        return;
      }

      const response = await apiService.getProductDetails(state.ProductID);
      console.log('📦 Product details response:', response);

      setState(prev => ({
        ...prev,
        ProductsDetails: response,
        UnitPrice: response?.ProductPrice || 0,
        StoreID: response?.StoreID || null,
        ProductItemID:
          response?.ProductItems == null ||
          response?.ProductItems == undefined ||
          response?.ProductItems.length == 0
            ? null
            : response.ProductItems[0].ProductItemID,
      }));
    } catch (err) {
      console.error('❌ Error fetching product details:', err);
      setState(prev => ({...prev, fail: true}));
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
    console.log('ColorhandleColorSelect', color);

    setState(prev => ({
      ...prev,
      selectedColor: color,
    }));
  };

  const fetchDeliveryLocationTime = async () => {
    const time = await getUserDeliveryTime(state.StoreID);
    setDeliveryTime(time);
  };

  useEffect(() => {
    if (state.StoreID) {
      fetchDeliveryLocationTime();
    }
  }, [state.StoreID]);

  // Update the getPricingDetails function to handle products without variants
  const getPricingDetails = () => {
    const {ProductsDetails} = state;

    if (!ProductsDetails) return {itemPrice: 0, discountedPrice: 0};

    // If no ProductItems, use main product price and discount
    if (!ProductsDetails.ProductItems?.length) {
      return {
        itemPrice: ProductsDetails.ProductPrice || 0,
        discountedPrice: ProductsDetails.DiscountedPrice || 0,
      };
    }

    // Rest of the existing logic for products with variants
    if (!state.selectedSize) {
      return {
        itemPrice: ProductsDetails.ProductPrice,
        discountedPrice: ProductsDetails.DiscountedPrice || 0,
      };
    }

    const matchedItem = ProductsDetails.ProductItems?.find(
      item => item.Size === state.selectedSize,
    );

    if (!matchedItem) {
      return {
        itemPrice: ProductsDetails.ProductPrice,
        discountedPrice: ProductsDetails.DiscountedPrice || 0,
      };
    }

    return {
      itemPrice: matchedItem.ItemPrice || ProductsDetails.ProductPrice,
      discountedPrice:
        matchedItem.DiscountedPrice || ProductsDetails.DiscountedPrice || 0,
    };
  };

  const getUniqueColorItems = () => {
    const data =
      state.ProductsDetails == null
        ? state.ItemColor
        : state.ProductsDetails?.ProductItems || [];

    const renderData = data?.filter(
      (item, index, self) =>
        item?.ItemColor &&
        index === self.findIndex(t => t.ItemColor === item.ItemColor),
    );
    console.log('🔍 Unique color items:', renderData);

    return renderData;
  };

  // Update the addToCart function to handle products without variants
  const addToCart = async () => {
    try {
      console.log('🛒 Starting add to cart process...');

      // Validate required data
      if (!state.ProductID) {
        console.error('❌ ProductID is missing');
        showModal(
          'Error',
          'Product information is missing. Please try again.',
          'error',
        );
        return;
      }

      if (!state.ProductsDetails) {
        console.error('❌ Product details missing');
        showModal(
          'Error',
          'Product information is missing. Please try again.',
          'error',
        );
        return;
      }

      // Only validate size if product has size variants
      if (
        state.ProductsDetails.ProductItems?.length > 0 &&
        !state.selectedSize
      ) {
        console.error('❌ Size not selected');
        showModal(
          'Error',
          'Please select a size before adding to cart.',
          'warning',
        );
        return;
      }

      if (!state.StoreID) {
        console.error('❌ StoreID is missing');
        showModal(
          'Error',
          'Store information is missing. Please try again.',
          'error',
        );
        return;
      }

      // Prepare product data for cart
      const productData = {
        ProductID: state.ProductID,
        ProductItemID:
          state.ProductsDetails.ProductItems?.length > 0
            ? state.ProductItemID
            : null,
        StoreID: state.StoreID,
        SizeID:
          state.ProductsDetails.ProductItems?.length > 0
            ? state.selectedSize
            : null,
        Color:
          state.ProductsDetails.ProductItems?.length > 0
            ? state.selectedColor
            : state.ProductsDetails.ProductColor,
        Quantity: state.quantity,
        UnitPrice:
          state.ProductsDetails.ProductItems?.length > 0
            ? state.UnitPrice
            : state.ProductsDetails.ProductPrice,
        StoreName: state.ProductsDetails?.StoreName || 'this store',
      };

      console.log('🛒 Product data for cart:', productData);

      const result = await CartValidation.addToCartWithValidation(
        productData,
        showModal,
      );

      if (result.success) {
        console.log('✅ Cart operation successful:', result.message);
        showModal('Success! 🎉', result.message, 'success', 'View Cart', () => {
          hideModal();
          navigation.push('TabC');
        });
      } else {
        console.error('❌ Cart operation failed:', result.message);
        if (result.action !== 'cancelled') {
          showModal(
            'Error',
            result.message || 'Failed to add item to cart.',
            'error',
          );
          setState(prev => ({...prev, fail: true}));
        }
      }
    } catch (err) {
      console.error('❌ Error in addToCart:', err);
      showModal(
        'Error',
        'An unexpected error occurred. Please try again.',
        'error',
      );
      setState(prev => ({...prev, fail: true}));
    }
  };

  const addToWishlist = async () => {
    try {
      console.log('❤️ Adding to wishlist...');

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      if (!UserProfileID) {
        console.error('❌ User not logged in');
        showModal(
          'Login Required',
          'Please login to add items to wishlist.',
          'warning',
        );
        return;
      }

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

      console.log('❤️ Wishlist item data:', wishlistItem);

      const response = await apiService.addToWishlist(wishlistItem);
      console.log('❤️ Wishlist response:', response);

      if (response === 'INSERTED') {
        console.log('✅ Item added to wishlist successfully');
        showModal(
          'Added to Wishlist! ❤️',
          'Item has been successfully added to your wishlist.',
          'success',
          'View Wishlist',
          () => {
            hideModal();
            navigation.push('Wishlist');
          },
        );
      } else {
        console.error('❌ Failed to add to wishlist:', response);
        showModal(
          'Error',
          'Failed to add item to wishlist. Please try again.',
          'error',
        );
        setState(prev => ({...prev, fail: true}));
      }
    } catch (err) {
      console.error('❌ Error adding to wishlist:', err);
      showModal(
        'Error',
        'An unexpected error occurred while adding to wishlist.',
        'error',
      );
      setState(prev => ({...prev, fail: true}));
    }
  };

  const {itemPrice, discountedPrice} = getPricingDetails();

  const showModal = (
    title,
    message,
    type = 'info',
    primaryButtonText = 'OK',
    onPrimaryPress = null,
  ) => {
    setModalConfig({
      visible: true,
      title,
      message,
      type,
      primaryButtonText,
      onPrimaryPress,
    });
  };

  const hideModal = () => {
    setModalConfig(prev => ({...prev, visible: false}));
  };

  return (
    <SafeAreaView>
      {/* Custom Modal */}
      <CustomModal
        visible={modalConfig.visible}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        primaryButtonText={modalConfig.primaryButtonText}
        onPrimaryPress={modalConfig.onPrimaryPress}
      />
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
              fontSize: 12,
              fontFamily: 'Poppins-SemiBold',
              color: '#333',
              marginTop: hp('1.5%'),
              fontWeight: 'bold',
              marginLeft: wp('12%'),
            }}>
            MRP ₹{itemPrice}
          </Text>
          {Number(discountedPrice) > 0 &&
            Number(discountedPrice) <= Number(itemPrice) && (
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

        {/* Size Selection - Only show if product has size variants */}
        {state.ProductsDetails?.ProductItems?.length > 0 && (
          <>
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
                data={state.ProductsDetails.ProductItems}
                horizontal={true}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.sizeButton,
                      state.selectedSize === item.Size &&
                        styles.selectedSizeButton,
                    ]}
                    onPress={() => handleSizeSelect(item.Size)}>
                    <Text
                      style={[
                        styles.sizeButtonText,
                        state.selectedSize === item.Size &&
                          styles.selectedSizeText,
                      ]}>
                      {item.Size}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </>
        )}

        {/* Color Selection - Only show if product has color variants */}
        {state.ProductsDetails?.ProductItems?.length > 0 &&
          getUniqueColorItems().length > 0 && (
            <>
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
                    if (!color) return null;

                    return (
                      <TouchableOpacity
                        onPress={() => handleColorSelect(item.ItemColor)}
                        style={[
                          styles.colorButton,
                          {backgroundColor: getColorHex(item.ItemColor)},
                          state.selectedColor?.toLowerCase?.() === color &&
                            styles.selectedColorButton,
                        ]}
                        aria-label={`Select color ${color}`}>
                        {color}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </>
          )}

        {/* Delivery Info */}
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Poppins-SemiBold',
            color: '#333',
            marginTop: hp('1.5%'),
            textAlign: 'center',
          }}>
          Delivering in{' '}
          {deliveryTime === null ? 'Calculating...' : deliveryTime}
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
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff', // ensure buttons are not transparent
          flexDirection: 'row',
          justifyContent: 'space-between',
          // padding: wp('4%'),
          // borderTopWidth: 1,
          // borderColor: '#ddd',
        }}>
        <TouchableOpacity activeOpacity={0.5} onPress={addToCart}>
          <View style={styles.cartButton}>
            <Icon
              name="cart-outline"
              color={'#00afb5'}
              size={20}
              style={{marginLeft: wp('1%'), padding: hp('0%')}}
            />
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.5} onPress={addToWishlist}>
          <View style={styles.wishlistButton}>
            <Icon
              name="heart-sharp"
              color={'#fff'}
              size={20}
              style={{marginLeft: wp('1%'), padding: hp('1%')}}
            />
            <Text style={styles.wishlistButtonText}>Wishlist</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
