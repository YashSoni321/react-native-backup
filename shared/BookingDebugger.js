import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';

/**
 * Booking Debugger Utility
 * Helps track and debug booking creation issues
 */
class BookingDebugger {
  static debugLogs = [];

  /**
   * Add a debug log entry
   * @param {string} step - The step in the booking process
   * @param {Object} data - Data to log
   * @param {string} type - Type of log (info, error, success)
   */
  static log(step, data = {}, type = 'info') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      step,
      data,
      type,
    };

    this.debugLogs.push(logEntry);
    console.log(`🔍 [${type.toUpperCase()}] ${step}:`, data);

    // Keep only last 50 logs
    if (this.debugLogs.length > 50) {
      this.debugLogs = this.debugLogs.slice(-50);
    }
  }

  /**
   * Get all debug logs
   * @returns {Array} Array of debug logs
   */
  static getLogs() {
    return this.debugLogs;
  }

  /**
   * Clear all debug logs
   */
  static clearLogs() {
    this.debugLogs = [];
  }

  /**
   * Validate booking prerequisites
   * @returns {Promise<Object>} Validation result
   */
  static async validateBookingPrerequisites() {
    try {
      this.log('Validating booking prerequisites', {}, 'info');

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const FullName = await AsyncStorage.getItem('FullName');
      const MobileNumber = await AsyncStorage.getItem('MobileNumber');
      const CartID = await AsyncStorage.getItem('CartID');

      const validation = {
        UserProfileID: !!UserProfileID,
        FullName: !!FullName,
        MobileNumber: !!MobileNumber,
        CartID: !!CartID,
        UserProfileIDValue: UserProfileID,
        FullNameValue: FullName,
        MobileNumberValue: MobileNumber,
        CartIDValue: CartID,
      };

      this.log('Booking prerequisites validation result', validation, 'info');

      if (!UserProfileID || !FullName || !MobileNumber) {
        this.log(
          'Booking prerequisites validation failed',
          validation,
          'error',
        );
        return {
          isValid: false,
          missingFields: Object.keys(validation).filter(
            key => !validation[key],
          ),
          message: 'User session is incomplete. Please login again.',
        };
      }

      return {
        isValid: true,
        validation,
        message: 'All prerequisites are valid',
      };
    } catch (error) {
      this.log(
        'Error validating booking prerequisites',
        {error: error.message},
        'error',
      );
      return {
        isValid: false,
        error: error.message,
        message: 'Failed to validate booking prerequisites',
      };
    }
  }

  /**
   * Track payment process
   * @param {string} step - Payment step
   * @param {Object} data - Payment data
   */
  static trackPayment(step, data = {}) {
    this.log(`Payment: ${step}`, data, 'info');
  }

  /**
   * Track cart operations
   * @param {string} step - Cart operation step
   * @param {Object} data - Cart data
   */
  static trackCart(step, data = {}) {
    this.log(`Cart: ${step}`, data, 'info');
  }

  /**
   * Track API calls
   * @param {string} endpoint - API endpoint
   * @param {Object} requestData - Request data
   * @param {Object} responseData - Response data
   * @param {boolean} isSuccess - Whether the call was successful
   */
  static trackApiCall(
    endpoint,
    requestData = {},
    responseData = {},
    isSuccess = true,
  ) {
    this.log(
      `API: ${endpoint}`,
      {
        request: requestData,
        response: responseData,
        success: isSuccess,
      },
      isSuccess ? 'info' : 'error',
    );
  }

  /**
   * Show debug information
   */
  static showDebugInfo() {
    const logs = this.getLogs();
    const recentLogs = logs.slice(-10); // Show last 10 logs

    console.log('🔍 === BOOKING DEBUG INFO ===');
    console.log('Recent logs:', recentLogs);
    console.log('Total logs:', logs.length);
    console.log('=============================');

    // Show in alert for easy viewing
    const logText = recentLogs
      .map(log => `${log.timestamp}: ${log.step}`)
      .join('\n');

    Alert.alert('Booking Debug Info', `Recent logs:\n${logText}`, [
      {text: 'OK'},
    ]);
  }

  /**
   * Export debug logs
   * @returns {string} JSON string of debug logs
   */
  static exportLogs() {
    return JSON.stringify(this.debugLogs, null, 2);
  }
}

export default BookingDebugger;
