import React, {useState} from 'react';
import {TouchableOpacity, Text, Alert, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CartValidation from './CartValidation';

/**
 * Reusable Add to Cart Button Component
 * Handles cart validation and product addition
 */
const AddToCartButton = ({
  productData,
  onSuccess,
  onError,
  style,
  textStyle,
  disabled = false,
  showIcon = true,
  buttonText = 'Add to Cart',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);

      // Validate required product data
      if (!productData.ProductID || !productData.StoreID) {
        Alert.alert('Error', 'Product information is incomplete.');
        return;
      }

      if (!productData.SizeID) {
        Alert.alert('Error', 'Please select a size before adding to cart.');
        return;
      }

      console.log('🛒 Adding product to cart:', productData);

      // Use cart validation utility
      const result = await CartValidation.addToCartWithValidation(productData);

      if (result.success) {
        console.log('✅ Cart operation successful:', result.message);

        // Show success message for quantity updates
        if (result.action === 'updated') {
          Alert.alert('Success', result.message, [{text: 'OK'}]);
        }

        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        console.error('❌ Cart operation failed:', result.message);

        if (result.action !== 'cancelled') {
          Alert.alert('Error', result.message || 'Failed to add item to cart.');
          if (onError) {
            onError(result);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in AddToCartButton:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      if (onError) {
        onError({success: false, message: error.message});
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleAddToCart}
      disabled={disabled || isLoading}
      style={[
        {
          backgroundColor: disabled || isLoading ? '#ccc' : '#00afb5',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: hp('1%'),
          paddingHorizontal: wp('3%'),
          borderRadius: wp('2%'),
          borderWidth: 1,
          borderColor: '#216e66',
        },
        style,
      ]}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          {showIcon && (
            <Icon
              name="cart-outline"
              color="#fff"
              size={16}
              style={{marginRight: wp('1%')}}
            />
          )}
          <Text
            style={[
              {
                color: '#fff',
                fontSize: 12,
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
              },
              textStyle,
            ]}>
            {buttonText}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default AddToCartButton;
