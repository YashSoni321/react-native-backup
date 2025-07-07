import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  BackHandler,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import {WebView} from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import PhonePeService from '../Services/PhonePeService';
import {PHONEPE_CONFIG} from '../Config/phonepe-config';

const PhonePePayment = ({navigation, route}) => {
  const [loading, setLoading] = useState(true);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const {paymentUrl, transactionId, orderData, onPaymentResult} = route.params;

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, []);

  const handleBackPress = useCallback(() => {
    if (!paymentCompleted) {
      Alert.alert(
        'Cancel Payment',
        'Are you sure you want to cancel the payment?',
        [
          {text: 'No', style: 'cancel'},
          {text: 'Yes', onPress: () => handlePaymentCancel()},
        ],
      );
      return true;
    }
    return false;
  }, [paymentCompleted]);

  const handlePaymentCancel = useCallback(() => {
    setPaymentCompleted(true);
    if (onPaymentResult) {
      onPaymentResult('CANCELLED', transactionId);
    }
    navigation.goBack();
  }, [transactionId, onPaymentResult, navigation]);

  const handlePaymentSuccess = useCallback(
    async txnId => {
      try {
        setPaymentCompleted(true);
        setLoading(true);

        // Verify payment status with PhonePe
        const statusResult = await PhonePeService.checkPaymentStatus(txnId);

        if (statusResult.success && statusResult.status === 'COMPLETED') {
          if (onPaymentResult) {
            onPaymentResult('SUCCESS', txnId, statusResult);
          }
          navigation.navigate('orders');
        } else {
          handlePaymentFailure(txnId, statusResult.error);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        handlePaymentFailure(txnId, 'Payment verification failed');
      } finally {
        setLoading(false);
      }
    },
    [transactionId, onPaymentResult, navigation],
  );

  const handlePaymentFailure = useCallback(
    (txnId, error) => {
      setPaymentCompleted(true);
      if (onPaymentResult) {
        onPaymentResult('FAILED', txnId, {error});
      }
      Alert.alert(
        'Payment Failed',
        error || 'Your payment could not be processed. Please try again.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    },
    [onPaymentResult, navigation],
  );

  const handleWebViewNavigationStateChange = useCallback(
    navState => {
      const {url} = navState;
      setCurrentUrl(url);

      console.log('WebView URL changed:', url);

      // Check for redirect URLs
      const appScheme = PHONEPE_CONFIG.APP_SCHEME;

      if (url.includes(`${appScheme}://payment/redirect`)) {
        // Parse URL parameters
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const status = urlParams.get('code');
        const txnId = urlParams.get('transactionId') || transactionId;

        if (status === 'PAYMENT_SUCCESS') {
          handlePaymentSuccess(txnId);
        } else if (status === 'PAYMENT_ERROR') {
          handlePaymentFailure(txnId, 'Payment failed');
        } else {
          handlePaymentCancel();
        }
      }

      // Check for common success/failure patterns in URL
      if (url.includes('success') || url.includes('payment-success')) {
        handlePaymentSuccess(transactionId);
      } else if (
        url.includes('failure') ||
        url.includes('payment-failed') ||
        url.includes('error')
      ) {
        handlePaymentFailure(transactionId, 'Payment failed');
      } else if (url.includes('cancel') || url.includes('payment-cancelled')) {
        handlePaymentCancel();
      }
    },
    [
      transactionId,
      handlePaymentSuccess,
      handlePaymentFailure,
      handlePaymentCancel,
    ],
  );

  const handleWebViewMessage = useCallback(
    event => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        console.log('WebView message:', data);

        if (data.type === 'PAYMENT_RESULT') {
          if (data.status === 'SUCCESS') {
            handlePaymentSuccess(data.transactionId || transactionId);
          } else if (data.status === 'FAILED') {
            handlePaymentFailure(
              data.transactionId || transactionId,
              data.error,
            );
          } else {
            handlePaymentCancel();
          }
        }
      } catch (error) {
        console.log('Failed to parse WebView message:', error);
      }
    },
    [
      transactionId,
      handlePaymentSuccess,
      handlePaymentFailure,
      handlePaymentCancel,
    ],
  );

  const injectedJavaScript = `
    // Monitor for payment completion indicators
    (function() {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      function sendPaymentResult(status, error = null) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PAYMENT_RESULT',
          status: status,
          transactionId: '${transactionId}',
          error: error,
          url: window.location.href
        }));
      }
      
      // Override history methods to catch navigation
      history.pushState = function() {
        originalPushState.apply(history, arguments);
        checkPaymentStatus();
      };
      
      history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        checkPaymentStatus();
      };
      
      function checkPaymentStatus() {
        const url = window.location.href.toLowerCase();
        
        if (url.includes('success') || url.includes('payment-success') || url.includes('completed')) {
          sendPaymentResult('SUCCESS');
        } else if (url.includes('failure') || url.includes('failed') || url.includes('error')) {
          sendPaymentResult('FAILED', 'Payment failed');
        } else if (url.includes('cancel') || url.includes('cancelled')) {
          sendPaymentResult('CANCELLED');
        }
      }
      
      // Check initial page
      setTimeout(checkPaymentStatus, 1000);
      
      // Monitor for specific PhonePe completion elements
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              const text = node.textContent || node.innerText || '';
              
              if (text.includes('Payment Successful') || text.includes('Transaction Successful')) {
                sendPaymentResult('SUCCESS');
              } else if (text.includes('Payment Failed') || text.includes('Transaction Failed')) {
                sendPaymentResult('FAILED', 'Payment failed');
              }
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    })();
  `;

  if (loading && paymentCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00afb5" />
          <Text style={styles.loadingText}>Verifying payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#00afb5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PhonePe Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {webViewLoading && (
        <View style={styles.webViewLoading}>
          <ActivityIndicator size="large" color="#00afb5" />
          <Text style={styles.loadingText}>Loading payment page...</Text>
        </View>
      )}

      <WebView
        source={{uri: paymentUrl}}
        style={[styles.webView, {opacity: webViewLoading ? 0 : 1}]}
        onLoadStart={() => setWebViewLoading(true)}
        onLoadEnd={() => setWebViewLoading(false)}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onMessage={handleWebViewMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={false}
        onError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          Alert.alert(
            'Payment Error',
            'Failed to load payment page. Please try again.',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        }}
        onHttpError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.error('WebView HTTP error:', nativeEvent);
          if (nativeEvent.statusCode >= 400) {
            Alert.alert(
              'Payment Error',
              `Payment service temporarily unavailable (${nativeEvent.statusCode}). Please try again later.`,
              [{text: 'OK', onPress: () => navigation.goBack()}],
            );
          }
        }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: wp('2%'),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  placeholder: {
    width: wp('10%'),
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default PhonePePayment;
