import {sha256} from 'react-native-sha256';
import {Buffer} from 'buffer';
import {PHONEPE_CONFIG} from '../Config/phonepe-config';
import {SALT_KEY} from '../Checkout/checkout';

class PhonePeService {
  constructor() {
    this.config = PHONEPE_CONFIG.getCurrentConfig();
  }

  // Generate checksum for API authentication
  generateChecksum = async (payload, endpoint) => {
    try {
      const config = {
        MERCHANT_ID: 'PGTESTPAYUAT', // Test merchant ID
        SALT_KEY: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399', // Test salt key
        SALT_INDEX: 1,
        BASE_URL: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
        REDIRECT_URL: 'https://merchant.com/redirect',
        CALLBACK_URL: 'https://merchant.com/callback',
      };
      const saltKey = SALT_KEY;
      const saltIndex = 1;

      const stringToHash =
        Buffer.from(JSON.stringify(payload)).toString('base64') +
        endpoint +
        saltKey;
      const checksum = await sha256(stringToHash);
      console.log('checksumAndSalthIndex', `${checksum}###${saltIndex}`);

      return `${checksum}###${saltIndex}`;
    } catch (error) {
      console.error('Checksum generation error:', error);
      throw new Error('Failed to generate checksum');
    }
  };
}

export default new PhonePeService();
