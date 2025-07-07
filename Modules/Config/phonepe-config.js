export const PHONEPE_CONFIG = {
  // Sandbox Environment
  SANDBOX: {
    MERCHANT_ID: 'PGTESTPAYUAT', // Test merchant ID
    SALT_KEY: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399', // Test salt key
    SALT_INDEX: 1,
    BASE_URL: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
    REDIRECT_URL: 'https://merchant.com/redirect',
    CALLBACK_URL: 'https://merchant.com/callback',
  },

  // Production Environment
  PRODUCTION: {
    MERCHANT_ID: 'YOUR_MERCHANT_ID', // Replace with actual merchant ID
    SALT_KEY: 'YOUR_SALT_KEY', // Replace with actual salt key
    SALT_INDEX: 1,
    BASE_URL: 'https://api.phonepe.com/apis/hermes',
    REDIRECT_URL: 'https://yourdomain.com/redirect',
    CALLBACK_URL: 'https://yourdomain.com/callback',
  },

  // Current environment
  ENVIRONMENT: 'SANDBOX', // Change to 'PRODUCTION' for live

  // App scheme for deep linking
  APP_SCHEME: 'fybr',

  // Payment settings
  PAYMENT_MODES: ['UPI', 'CARD', 'NB'],
  CURRENCY_CODE: 'INR',

  // Get current config based on environment
  getCurrentConfig() {
    return this[this.ENVIRONMENT];
  },

  // Generate callback and redirect URLs for app
  getAppUrls() {
    return {
      redirectUrl: `${this.APP_SCHEME}://payment/redirect`,
      callbackUrl: `${this.APP_SCHEME}://payment/callback`,
    };
  },
};
