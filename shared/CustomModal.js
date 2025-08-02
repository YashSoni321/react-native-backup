import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';

const {width, height} = Dimensions.get('window');

const CustomModal = ({
  visible,
  onClose,
  title,
  message,
  type = 'info', // 'success', 'error', 'warning', 'info'
  showIcon = true,
  primaryButtonText = 'OK',
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          name: 'checkmark-circle',
          color: '#4CAF50',
          backgroundColor: '#E8F5E8',
        };
      case 'error':
        return {
          name: 'close-circle',
          color: '#F44336',
          backgroundColor: '#FFEBEE',
        };
      case 'warning':
        return {
          name: 'warning',
          color: '#FF9800',
          backgroundColor: '#FFF3E0',
        };
      default:
        return {
          name: 'information-circle',
          color: '#2196F3',
          backgroundColor: '#E3F2FD',
        };
    }
  };

  const getModalStyle = () => {
    switch (type) {
      case 'success':
        return {
          borderLeftColor: '#4CAF50',
          backgroundColor: '#FFFFFF',
        };
      case 'error':
        return {
          borderLeftColor: '#F44336',
          backgroundColor: '#FFFFFF',
        };
      case 'warning':
        return {
          borderLeftColor: '#FF9800',
          backgroundColor: '#FFFFFF',
        };
      default:
        return {
          borderLeftColor: '#2196F3',
          backgroundColor: '#FFFFFF',
        };
    }
  };

  const iconConfig = getIconConfig();
  const modalStyle = getModalStyle();

  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    } else {
      onClose();
    }
  };

  const handleSecondaryPress = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityValue,
          },
        ]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}>
          <Animated.View
            style={[
              styles.modalContainer,
              modalStyle,
              {
                transform: [{scale: scaleValue}],
              },
            ]}>
            {showIcon && (
              <View
                style={[
                  styles.iconContainer,
                  {backgroundColor: iconConfig.backgroundColor},
                ]}>
                <Icon
                  name={iconConfig.name}
                  size={wp('8%')}
                  color={iconConfig.color}
                />
              </View>
            )}

            <View style={styles.contentContainer}>
              {title && <Text style={styles.title}>{title}</Text>}

              {message && <Text style={styles.message}>{message}</Text>}
            </View>

            <View style={styles.buttonContainer}>
              {secondaryButtonText && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleSecondaryPress}
                  activeOpacity={0.7}>
                  <Text style={styles.secondaryButtonText}>
                    {secondaryButtonText}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  {backgroundColor: iconConfig.color},
                ]}
                onPress={handlePrimaryPress}
                activeOpacity={0.7}>
                <Text style={styles.primaryButtonText}>
                  {primaryButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp('80%'),
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    borderLeftWidth: 4,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  iconContainer: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: hp('2%'),
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  title: {
    fontSize: wp('4.5%'),
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  message: {
    fontSize: wp('3.5%'),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: hp('2.5%'),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('2%'),
  },
  button: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#00afb5',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontFamily: 'Poppins-SemiBold',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: wp('3.5%'),
    fontFamily: 'Poppins-Medium',
  },
});

export default CustomModal;
