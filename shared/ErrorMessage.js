import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
import {Dialog} from 'react-native-simple-dialogs';
import CustomModal from './CustomModal';

// Color scheme based on project analysis
const COLORS = {
  primary: '#00afb5',
  secondary: '#333',
  textLight: '#666',
  textDark: '#333',
  white: '#ffffff',
  error: '#ff6b6b',
  warning: '#f39c12',
  success: '#02b008',
  background: '#ffff',
  border: '#e0e0e0',
  shadow: '#000',
};

const {width, height} = Dimensions.get('window');

// Error types configuration
const ERROR_TYPES = {
  NETWORK_ERROR: {
    title: 'Connection Error',
    message:
      'Unable to connect to Fybr servers. Please check your internet connection and try again.',
    icon: 'cloud-offline',
    primaryAction: 'Retry',
    secondaryAction: null,
    type: 'error',
  },
  EMPTY_CART: {
    title: 'Your cart is empty',
    message:
      "Looks like you haven't added anything yet! Start shopping to fill your cart.",
    icon: 'cart-outline',
    primaryAction: 'Browse Stores',
    secondaryAction: null,
    type: 'info',
  },
  NO_PRODUCTS: {
    title: 'No products available',
    message:
      "This store hasn't added any products yet. Check back later or explore other stores.",
    icon: 'bag-outline',
    primaryAction: 'Browse Other Stores',
    secondaryAction: null,
    type: 'info',
  },
  LOCATION_PERMISSION_REGISTRATION: {
    title: 'Location access required',
    message:
      'Fybr delivers fashion to your doorstep instantly! To continue, enable location access so we can connect you with nearby stores.',
    icon: 'location-outline',
    primaryAction: 'Enable Location',
    secondaryAction: 'Exit App',
    type: 'warning',
  },
  LOCATION_PERMISSION_BROWSING: {
    title: 'Location access needed',
    message:
      'To find stores near you and ensure accurate delivery, please enable location access.',
    icon: 'location-outline',
    primaryAction: 'Enable Location',
    secondaryAction: 'Enter Address Manually',
    type: 'warning',
  },
  NO_ADDRESS: {
    title: 'Address required',
    message: 'Please add a delivery address to proceed with your order.',
    icon: 'home-outline',
    primaryAction: 'Add Address',
    secondaryAction: null,
    type: 'warning',
  },
  NOTIFICATION_PERMISSION: {
    title: 'Stay updated with Fybr',
    message:
      'Enable notifications to receive order updates, exclusive deals, and alerts.',
    icon: 'notifications-outline',
    primaryAction: 'Enable Notifications',
    secondaryAction: 'Skip for Now',
    type: 'info',
  },
  PAYMENT_FAILURE: {
    title: 'Payment failed',
    message:
      "Your payment couldn't be processed. Please check your payment details and try again.",
    icon: 'card-outline',
    primaryAction: 'Retry Payment',
    secondaryAction: null,
    type: 'error',
  },
  ITEM_OUT_OF_STOCK: {
    title: 'Item unavailable',
    message:
      'Some items in your cart are no longer available. Please review your cart before proceeding.',
    icon: 'alert-circle-outline',
    primaryAction: 'Update Cart',
    secondaryAction: null,
    type: 'warning',
  },
  MERCHANT_UNAVAILABLE: {
    title: 'Store currently unavailable',
    message:
      'This store is temporarily unavailable. Please try again later or shop from other stores.',
    icon: 'storefront-outline',
    primaryAction: 'Browse Other Stores',
    secondaryAction: null,
    type: 'warning',
  },
  NO_DELIVERY_PARTNERS: {
    title: 'No delivery partners available',
    message: 'All delivery partners are currently busy. Please be patient.',
    icon: 'bicycle-outline',
    primaryAction: null,
    secondaryAction: null,
    type: 'info',
  },
  ORDER_CANCELLED: {
    title: 'Order cancelled by the store',
    message:
      'Unfortunately, the store had to cancel your order. Your payment (if any) will be refunded.',
    icon: 'close-circle-outline',
    primaryAction: 'Browse Other Stores',
    secondaryAction: null,
    type: 'error',
  },
};

const ErrorMessage = ({
  visible = false,
  errorType,
  onPrimaryAction,
  onSecondaryAction,
  onClose,
  customTitle,
  customMessage,
  customPrimaryAction,
  customSecondaryAction,
  showCloseButton = true,
  useModal = false, // Use modal for full-screen errors, dialog for smaller ones
}) => {
  const errorConfig = ERROR_TYPES[errorType] || {};

  const title = customTitle || errorConfig.title || 'Error';
  const message =
    customMessage ||
    errorConfig.message ||
    'Something went wrong. Please try again.';
  const primaryAction = customPrimaryAction || errorConfig.primaryAction;
  const secondaryAction = customSecondaryAction || errorConfig.secondaryAction;
  const icon = errorConfig.icon || 'alert-circle-outline';
  const type = errorConfig.type || 'error';

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      case 'success':
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return '#fff5f5';
      case 'warning':
        return '#fffbf0';
      case 'success':
        return '#f0fff4';
      default:
        return COLORS.background;
    }
  };

  const handlePrimaryAction = () => {
    if (
      errorType === 'LOCATION_PERMISSION_REGISTRATION' ||
      errorType === 'LOCATION_PERMISSION_BROWSING'
    ) {
      openLocationSettings();
    } else if (errorType === 'NOTIFICATION_PERMISSION') {
      openNotificationSettings();
    } else if (onPrimaryAction) {
      onPrimaryAction();
    }
  };

  const handleSecondaryAction = () => {
    if (
      errorType === 'LOCATION_PERMISSION_REGISTRATION' &&
      secondaryAction === 'Exit App'
    ) {
      // For exit app confirmation, we'll use the existing modal structure
      // since this is a critical action that needs special handling
      if (onSecondaryAction) {
        onSecondaryAction();
      }
    } else if (onSecondaryAction) {
      onSecondaryAction();
    }
  };

  const openLocationSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const openNotificationSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const renderContent = () => (
    <View style={[styles.container, {backgroundColor: getBackgroundColor()}]}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={wp('12%')} color={getIconColor()} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.buttonContainer}>
        {primaryAction && (
          <TouchableOpacity
            style={[styles.primaryButton, {backgroundColor: COLORS.primary}]}
            onPress={handlePrimaryAction}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>{primaryAction}</Text>
          </TouchableOpacity>
        )}

        {secondaryAction && (
          <TouchableOpacity
            style={[styles.secondaryButton, {borderColor: COLORS.primary}]}
            onPress={handleSecondaryAction}
            activeOpacity={0.8}>
            <Text style={[styles.secondaryButtonText, {color: COLORS.primary}]}>
              {secondaryAction}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showCloseButton && onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={wp('6%')} color={COLORS.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (useModal) {
    return (
      <Modal
        isVisible={visible}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        style={styles.modal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.5}>
        {renderContent()}
      </Modal>
    );
  }

  return (
    <Dialog
      visible={visible}
      onTouchOutside={onClose}
      contentStyle={styles.dialogContent}
      animationType="fade">
      {renderContent()}
    </Dialog>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContent: {
    backgroundColor: 'transparent',
    borderRadius: wp('4%'),
    padding: 0,
    margin: wp('5%'),
  },
  container: {
    backgroundColor: COLORS.background,
    borderRadius: wp('4%'),
    padding: wp('6%'),
    alignItems: 'center',
    minWidth: wp('80%'),
    maxWidth: wp('90%'),
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: hp('2%'),
  },
  title: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: hp('1%'),
    fontFamily: 'Poppins-Bold',
  },
  message: {
    fontSize: wp('4%'),
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: wp('6%'),
    marginBottom: hp('3%'),
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    width: '100%',
    gap: hp('1%'),
  },
  primaryButton: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp('6%'),
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: wp('4%'),
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  secondaryButton: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    minHeight: hp('6%'),
  },
  secondaryButtonText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  closeButton: {
    position: 'absolute',
    top: wp('3%'),
    right: wp('3%'),
    padding: wp('2%'),
  },
});

export default ErrorMessage;
