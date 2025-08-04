import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import PhonePePaymentSDK from 'react-native-phonepe-pg';
import {MERCHANT_ID, SALT_KEY} from '../Checkout/checkout';
import CustomModal from '../../shared/CustomModal';

const PhonePeSDKExample = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [isPhonePeAvailable, setIsPhonePeAvailable] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onPrimaryPress: null,
  });

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

  useEffect(() => {
    checkPhonePeAvailability();
  }, []);

  // Check if PhonePe app is installed
  const checkPhonePeAvailability = async () => {
    try {
      const result = await PhonePePaymentSDK.isPhonePeInstalled();
      setIsPhonePeAvailable(result);
      console.log('PhonePe installed:', result);
    } catch (error) {
      console.error('Error checking PhonePe availability:', error);
      setIsPhonePeAvailable(false);
    }
  };

  // Initialize PhonePe SDK
  const initializePhonePe = async () => {
    try {
      const environment = 'UAT'; // or 'PROD' for production
      const merchantId = MERCHANT_ID; // Your merchant ID
      const appId = 'APP_STORE'; // or 'PLAY_STORE' for Android
      const saltKey = SALT_KEY; // Your salt key
      const saltIndex = 1; // Your salt index

      const result = await PhonePePaymentSDK.init(
        environment,
        merchantId,
        appId,
        saltKey,
        saltIndex,
      );

      console.log('PhonePe SDK initialized:', result);
      return result;
    } catch (error) {
      console.error('PhonePe SDK initialization error:', error);
      showModal('Error', 'Failed to initialize PhonePe SDK', 'error');
      return false;
    }
  };

  // Start PhonePe payment
  const startPhonePePayment = async () => {
    try {
      setLoading(true);

      // Initialize SDK first
      const initialized = await initializePhonePe();
      if (!initialized) {
        setLoading(false);
        return;
      }

      // Generate unique transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.floor(
        Math.random() * 10000,
      )}`;

      // Payment parameters
      const paymentParams = {
        merchantId: 'PGTESTPAYUAT86',
        merchantTransactionId: transactionId,
        merchantUserId: 'TEST_USER_123',
        amount: 10000, // Amount in paise (₹100)
        redirectUrl: 'fybr://payment/redirect',
        redirectMode: 'POST',
        callbackUrl: 'fybr://payment/callback',
        mobileNumber: '9999999999',
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      console.log('Starting PhonePe payment with params:', paymentParams);

      // Start the payment
      const result = await PhonePePaymentSDK.startTransaction(
        JSON.stringify(paymentParams),
        'PAY_PAGE',
      );

      console.log('PhonePe payment result:', result);

      // Handle the result
      if (result && result.data) {
        const response = JSON.parse(result.data);
        console.log('Payment response:', response);

        if (response.success) {
          showModal(
            'Payment Successful',
            `Transaction ID: ${response.data.merchantTransactionId}`,
            'success',
            () => {
              navigation.goBack();
              hideModal();
            },
          );
        } else {
          showModal(
            'Payment Failed',
            response.message || 'Payment failed',
            'error',
          );
        }
      } else {
        showModal(
          'Payment Cancelled',
          'Payment was cancelled by user',
          'warning',
        );
      }
    } catch (error) {
      console.error('PhonePe payment error:', error);
      showModal('Error', 'Payment failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get UPI apps (Android only)
  const getUPIApps = async () => {
    try {
      const upiApps = await PhonePePaymentSDK.getUPIApps();
      console.log('Available UPI apps:', upiApps);
      showModal('UPI Apps', JSON.stringify(upiApps, null, 2), 'info');
    } catch (error) {
      console.error('Error getting UPI apps:', error);
      showModal('Error', 'Failed to get UPI apps', 'error');
    }
  };

  // Get package signature (Android only)
  const getPackageSignature = async () => {
    try {
      const signature = await PhonePePaymentSDK.getPackageSignature();
      console.log('Package signature:', signature);
      showModal('Package Signature', signature, 'info');
    } catch (error) {
      console.error('Error getting package signature:', error);
      showModal('Error', 'Failed to get package signature', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PhonePe SDK Example</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>PhonePe App Status:</Text>
          <Text
            style={[
              styles.statusValue,
              {color: isPhonePeAvailable ? '#4CAF50' : '#F44336'},
            ]}>
            {isPhonePeAvailable ? 'Installed' : 'Not Installed'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={startPhonePePayment}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Start PhonePe Payment (₹100)</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={checkPhonePeAvailability}>
          <Text style={styles.secondaryButtonText}>
            Check PhonePe Availability
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={getUPIApps}>
          <Text style={styles.secondaryButtonText}>Get UPI Apps (Android)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={getPackageSignature}>
          <Text style={styles.secondaryButtonText}>
            Get Package Signature (Android)
          </Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Integration Notes:</Text>
          <Text style={styles.infoText}>
            • This example uses the PhonePe React Native SDK directly{'\n'}•
            Make sure to replace merchant credentials with your own{'\n'}• Test
            with UAT environment first{'\n'}• Handle payment callbacks properly
            {'\n'}• Implement proper error handling
          </Text>
        </View>
      </View>

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
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#00afb5',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: wp('4%'),
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: wp('4%'),
    borderRadius: 8,
    marginBottom: hp('3%'),
  },
  statusLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00afb5',
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#00afb5',
  },
  secondaryButtonText: {
    color: '#00afb5',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: wp('4%'),
    borderRadius: 8,
    marginTop: hp('3%'),
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: hp('1%'),
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default PhonePeSDKExample;
