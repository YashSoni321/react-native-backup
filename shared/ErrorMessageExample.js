import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import ErrorMessage from './ErrorMessage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ErrorMessageExample = ({navigation}) => {
  const [errorVisible, setErrorVisible] = useState(false);
  const [currentErrorType, setCurrentErrorType] = useState(null);

  const showError = errorType => {
    setCurrentErrorType(errorType);
    setErrorVisible(true);
  };

  const handlePrimaryAction = () => {
    setErrorVisible(false);
    // Handle the primary action based on error type
    switch (currentErrorType) {
      case 'NETWORK_ERROR':
        // Retry network request
        console.log('Retrying network request...');
        break;
      case 'EMPTY_CART':
        // Navigate to stores
        navigation.navigate('Tabs');
        break;
      case 'NO_PRODUCTS':
        // Navigate to other stores
        navigation.navigate('Tabs');
        break;
      case 'NO_ADDRESS':
        // Navigate to add address
        navigation.navigate('AddAddress');
        break;
      case 'PAYMENT_FAILURE':
        // Retry payment
        console.log('Retrying payment...');
        break;
      case 'ITEM_OUT_OF_STOCK':
        // Update cart
        console.log('Updating cart...');
        break;
      case 'MERCHANT_UNAVAILABLE':
      case 'ORDER_CANCELLED':
        // Navigate to other stores
        navigation.navigate('Tabs');
        break;
      default:
        break;
    }
  };

  const handleSecondaryAction = () => {
    setErrorVisible(false);
    // Handle secondary action
    switch (currentErrorType) {
      case 'LOCATION_PERMISSION_BROWSING':
        // Navigate to manual address entry
        navigation.navigate('AddAddress');
        break;
      case 'NOTIFICATION_PERMISSION':
        // Skip notification permission
        console.log('Skipping notification permission...');
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setErrorVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error Message Examples</Text>

      {/* Network Error */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('NETWORK_ERROR')}>
        <Text style={styles.buttonText}>Network Error</Text>
      </TouchableOpacity>

      {/* Empty Cart */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('EMPTY_CART')}>
        <Text style={styles.buttonText}>Empty Cart</Text>
      </TouchableOpacity>

      {/* No Products */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('NO_PRODUCTS')}>
        <Text style={styles.buttonText}>No Products Available</Text>
      </TouchableOpacity>

      {/* Location Permission - Registration */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('LOCATION_PERMISSION_REGISTRATION')}>
        <Text style={styles.buttonText}>
          Location Permission (Registration)
        </Text>
      </TouchableOpacity>

      {/* Location Permission - Browsing */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('LOCATION_PERMISSION_BROWSING')}>
        <Text style={styles.buttonText}>Location Permission (Browsing)</Text>
      </TouchableOpacity>

      {/* No Address */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('NO_ADDRESS')}>
        <Text style={styles.buttonText}>No Address</Text>
      </TouchableOpacity>

      {/* Notification Permission */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('NOTIFICATION_PERMISSION')}>
        <Text style={styles.buttonText}>Notification Permission</Text>
      </TouchableOpacity>

      {/* Payment Failure */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('PAYMENT_FAILURE')}>
        <Text style={styles.buttonText}>Payment Failure</Text>
      </TouchableOpacity>

      {/* Item Out of Stock */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('ITEM_OUT_OF_STOCK')}>
        <Text style={styles.buttonText}>Item Out of Stock</Text>
      </TouchableOpacity>

      {/* Merchant Unavailable */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('MERCHANT_UNAVAILABLE')}>
        <Text style={styles.buttonText}>Merchant Unavailable</Text>
      </TouchableOpacity>

      {/* No Delivery Partners */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('NO_DELIVERY_PARTNERS')}>
        <Text style={styles.buttonText}>No Delivery Partners</Text>
      </TouchableOpacity>

      {/* Order Cancelled */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => showError('ORDER_CANCELLED')}>
        <Text style={styles.buttonText}>Order Cancelled</Text>
      </TouchableOpacity>

      {/* Custom Error */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setCurrentErrorType('CUSTOM');
          setErrorVisible(true);
        }}>
        <Text style={styles.buttonText}>Custom Error</Text>
      </TouchableOpacity>

      {/* Error Message Component */}
      <ErrorMessage
        visible={errorVisible}
        errorType={currentErrorType}
        onPrimaryAction={handlePrimaryAction}
        onSecondaryAction={handleSecondaryAction}
        onClose={handleClose}
        customTitle={
          currentErrorType === 'CUSTOM' ? 'Custom Error Title' : undefined
        }
        customMessage={
          currentErrorType === 'CUSTOM'
            ? 'This is a custom error message with custom title and actions.'
            : undefined
        }
        customPrimaryAction={
          currentErrorType === 'CUSTOM' ? 'Custom Action' : undefined
        }
        customSecondaryAction={
          currentErrorType === 'CUSTOM' ? 'Cancel' : undefined
        }
        useModal={
          currentErrorType === 'NETWORK_ERROR' ||
          currentErrorType === 'LOCATION_PERMISSION_REGISTRATION'
        } // Use modal for critical errors
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'),
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: hp('3%'),
    fontFamily: 'Poppins-Bold',
  },
  button: {
    backgroundColor: '#00afb5',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1%'),
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: wp('4%'),
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ErrorMessageExample;
