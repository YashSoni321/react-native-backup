import React from 'react';
import {View, StyleSheet, Modal, Dimensions, Text} from 'react-native';
import FybrLoadingSpinner from './FybrLoadingSpinner';
import {useLoading} from './LoadingContext';

const {width, height} = Dimensions.get('window');

const GlobalLoadingOverlay = () => {
  const {globalLoading, loadingStates, getLoadingMessage} = useLoading();

  // Check if any loading state is active (global or specific keys)
  const hasAnyLoading = globalLoading || Object.keys(loadingStates).length > 0;

  // Get the first loading message if available
  const loadingMessage = globalLoading
    ? 'Loading...'
    : Object.values(loadingStates)[0]?.message || 'Loading...';

  return (
    <Modal
      visible={hasAnyLoading}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <View style={styles.spinnerContainer}>
          <FybrLoadingSpinner isVisible={true} size="large" />
          {loadingMessage && (
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          )}
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
    alignItems: 'center',
    minWidth: 150,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
});

export default GlobalLoadingOverlay;
