import {sha256} from 'react-native-sha256';
import {Buffer} from 'buffer';
import {PHONEPE_CONFIG} from '../Config/phonepe-config';

class PhonePeService {
  constructor() {
    this.config = PHONEPE_CONFIG.getCurrentConfig();
  }

  // Generate unique order ID
  generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `FYBR_${timestamp}_${random}`;
  };

  // Generate transaction ID
  generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    return `TXN_${timestamp}_${random}`;
  };

  // Generate checksum for API authentication
  generateChecksum = async (payload, endpoint) => {
    try {
      const saltKey = this.config.SALT_KEY;
      const saltIndex = this.config.SALT_INDEX;

      const stringToHash =
        Buffer.from(JSON.stringify(payload)).toString('base64') +
        endpoint +
        saltKey;
      const checksum = await sha256(stringToHash);

      return `${checksum}###${saltIndex}`;
    } catch (error) {
      console.error('Checksum generation error:', error);
      throw new Error('Failed to generate checksum');
    }
  };

  // Create payment order
  createPaymentOrder = async orderData => {
    try {
      const transactionId = this.generateTransactionId();
      const appUrls = PHONEPE_CONFIG.getAppUrls();

      const payload = {
        merchantId: this.config.MERCHANT_ID,
        merchantTransactionId: transactionId,
        merchantUserId: 'TEST-M22031L2ZT2SN_25042',
        amount: Math.round(orderData.amount * 100), // Convert to paise
        redirectUrl: appUrls.redirectUrl,
        redirectMode: 'POST',
        callbackUrl: appUrls.callbackUrl,
        mobileNumber: orderData.mobileNumber,
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };
      // const payload = {
      //   payload: {
      //     merchantId: 'PGTESTPAYUAT',
      //     merchantTransactionId: 'TXN_1751187357312_24125',
      //     merchantUserId: 'TEST-M22031L2ZT2SN_25042',
      //     amount: 399900,
      //     redirectUrl: 'fybr://payment/redirect',
      //     redirectMode: 'POST',
      //     callbackUrl: 'fybr://payment/callback',
      //     mobileNumber: '7375863649',
      //     paymentInstrument: {
      //       type: 'PAY_PAGE',
      //     },
      //   },
      //   url: 'https://api-preprod.phonepe.com/apis/pg‑sandbox/pg/v1/pay',
      // };

      const endpoint = '/pg/v1/pay';
      const checksum = await this.generateChecksum(payload, endpoint);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          accept: 'application/json',
        },
        body: JSON.stringify({
          request: Buffer.from(JSON.stringify(payload)).toString('base64'),
        }),
      };

      console.log('PhonePe API Request:', {
        url: this.config.BASE_URL + endpoint,
        payload: payload,
      });

      const response = await fetch(this.config.BASE_URL + endpoint, options);
      const responseData = await response.json();

      console.log('PhonePe API Response:', responseData);

      if (
        responseData.success === true &&
        responseData.data?.instrumentResponse?.redirectInfo?.url
      ) {
        return {
          success: true,
          paymentUrl: responseData.data.instrumentResponse.redirectInfo.url,
          transactionId: transactionId,
          merchantTransactionId: transactionId,
        };
      } else {
        return {
          success: false,
          error: responseData.message || 'Payment initiation failed',
          code: responseData.code,
        };
      }
    } catch (error) {
      console.error('PhonePe payment creation error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  };

  // Check payment status
  checkPaymentStatus = async transactionId => {
    try {
      const endpoint = `/pg/v1/status/${this.config.MERCHANT_ID}/${transactionId}`;
      const checksum = await this.generateChecksum({}, endpoint);

      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': this.config.MERCHANT_ID,
          accept: 'application/json',
        },
      };

      const response = await fetch(this.config.BASE_URL + endpoint, options);
      const responseData = await response.json();

      console.log('Payment Status Response:', responseData);

      if (responseData.success === true) {
        const paymentData = responseData.data;
        return {
          success: true,
          status: paymentData.state,
          transactionId: paymentData.merchantTransactionId,
          phonepeTransactionId: paymentData.transactionId,
          amount: paymentData.amount / 100, // Convert back to rupees
          paymentInstrument: paymentData.paymentInstrument,
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          error: responseData.message || 'Payment status check failed',
        };
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error.message || 'Status check failed',
      };
    }
  };

  // Verify payment callback
  verifyPaymentCallback = async callbackData => {
    try {
      const {response, checksumHeader} = callbackData;

      // Decode the response
      const decodedResponse = JSON.parse(
        Buffer.from(response, 'base64').toString(),
      );

      // Generate checksum for verification
      const endpoint = '/pg/v1/pay';
      const expectedChecksum = await this.generateChecksum(
        decodedResponse,
        endpoint,
      );

      // Verify checksum
      if (checksumHeader === expectedChecksum) {
        return {
          verified: true,
          paymentData: decodedResponse,
        };
      } else {
        return {
          verified: false,
          error: 'Checksum verification failed',
        };
      }
    } catch (error) {
      console.error('Callback verification error:', error);
      return {
        verified: false,
        error: error.message || 'Verification failed',
      };
    }
  };
}

export default new PhonePeService();
