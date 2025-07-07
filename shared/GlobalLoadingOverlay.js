import React from 'react';
import {View, StyleSheet, Modal, Dimensions} from 'react-native';
import FybrLoadingSpinner from './FybrLoadingSpinner';
import {useLoading} from './LoadingContext';

const {width, height} = Dimensions.get('window');

const GlobalLoadingOverlay = () => {
  const {globalLoading} = useLoading();

  return (
    <Modal
      visible={globalLoading}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <View style={styles.spinnerContainer}>
          <FybrLoadingSpinner isVisible={true} size="large" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  spinnerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 30,
    borderRadius: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default GlobalLoadingOverlay;
