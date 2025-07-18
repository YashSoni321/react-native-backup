# PhonePe SDK Integration Guide

## Overview

This guide documents the complete integration of PhonePe Payment Gateway SDK in the React Native app for processing UPI payments.

## Prerequisites

- PhonePe merchant account and credentials
- React Native project with Android/iOS setup
- `react-native-phonepe-pg` package installed

## Installation

### 1. Install PhonePe SDK

```bash
npm install react-native-phonepe-pg
# or
yarn add react-native-phonepe-pg
```

### 2. Link the library (if using React Native < 0.60)

```bash
react-native link react-native-phonepe-pg
```

### 3. Android Setup

Add the following to your `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        // ... other configs
        minSdkVersion 21
    }
}
```

### 4. iOS Setup

Add the following to your `ios/Podfile`:

```ruby
target 'YourApp' do
  # ... other pods
  pod 'PhonePePaymentSDK'
end
```

Then run:

```bash
cd ios && pod install
```

## Configuration

### 1. PhonePe Config (`Modules/Config/phonepe-config.js`)

```javascript
export const PHONEPE_CONFIG = {
  SANDBOX: {
    MERCHANT_ID: 'PGTESTPAYUAT',
    SALT_KEY: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
    SALT_INDEX: 1,
    BASE_URL: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  },
  PRODUCTION: {
    MERCHANT_ID: 'YOUR_PRODUCTION_MERCHANT_ID',
    SALT_KEY: 'YOUR_PRODUCTION_SALT_KEY',
    SALT_INDEX: 1,
    BASE_URL: 'https://api.phonepe.com/apis/hermes',
  },
  ENVIRONMENT: 'SANDBOX', // Change to 'PRODUCTION' for live
  APP_SCHEME: 'fybr',
};
```

### 2. App URL Scheme Configuration

#### Android

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<activity>
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="fybr" />
    </intent-filter>
</activity>
```

#### iOS

Add to `ios/YourApp/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>fybr</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>fybr</string>
        </array>
    </dict>
</array>
```

## Usage

### 1. Import the SDK

```javascript
import PhonePePaymentSDK from 'react-native-phonepe-pg';
```

### 2. Initialize the SDK

```javascript
const initResult = await PhonePePaymentSDK.init(
  'SANDBOX', // Environment: 'SANDBOX' or 'PRODUCTION'
  'PGTESTPAYUAT86', // Merchant ID
  'TEST-M22031L2ZT2SN_25042', // App ID (optional)
  true, // Enable logging
);
```

### 3. Create Payment Payload

```javascript
const payload = {
  merchantId: 'PGTESTPAYUAT86',
  merchantTransactionId: 'TXN_' + Date.now() + '_' + Math.random(),
  merchantUserId: 'TEST-M22031L2ZT2SN_25042',
  amount: 3999, // Amount in paise
  redirectUrl: 'fybr://payment/redirect',
  redirectMode: 'POST',
  callbackUrl: 'fybr://payment/callback',
  mobileNumber: '7375863649',
  paymentInstrument: {
    type: 'PAY_PAGE',
  },
};
```

### 4. Generate Checksum

```javascript
import PhonePeService from '../Services/PhonePeService';

const endpoint = '/pg/v1/pay';
const checksum = await PhonePeService.generateChecksum(payload, endpoint);
```

### 5. Start Transaction

```javascript
const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

const transactionResult = await PhonePePaymentSDK.startTransaction(
  base64Payload, // Base64 encoded payload
  checksum, // Generated checksum
  null, // Package name (null for default)
  'fybr', // App schema
);
```

### 6. Handle Transaction Result

```javascript
if (transactionResult.status === 'SUCCESS') {
  // Payment successful
  console.log('Payment completed successfully');
} else if (transactionResult.status === 'FAILURE') {
  // Payment failed
  console.log('Payment failed:', transactionResult.error);
} else if (transactionResult.status === 'INTERRUPTED') {
  // Payment cancelled by user
  console.log('Payment cancelled by user');
}
```

## Complete Integration Example

### Checkout Component (`Modules/Checkout/checkout.js`)

```javascript
const initiatePhonePePayment = async (
  UserProfileID,
  SystemUser,
  SystemDate,
) => {
  try {
    setState(prevState => ({...prevState, loading: true}));

    // Get cart ID
    const cartResponse = await axios.get(
      URL_key + 'api/ProductApi/gLatestCardID?UserProfileID=' + UserProfileID,
      {headers: {'content-type': 'application/json'}},
    );

    // Initialize PhonePe SDK
    const initResult = await PhonePePaymentSDK.init(
      'SANDBOX',
      'PGTESTPAYUAT',
      'TEST-M22031L2ZT2SN_25042',
      true,
    );

    if (!initResult) {
      throw new Error('Failed to initialize PhonePe SDK');
    }

    // Generate order data
    const orderId = PhonePeService.generateOrderId();
    const totalAmount = Math.round(
      (parseFloat(state.TotalUnitPrice || 0) +
        parseFloat(state.TipAmount || 0)) *
        100,
    );
    const mobileNumber =
      (await AsyncStorage.getItem('MobileNumber')) || '9999999999';

    // Create payment payload
    const payload = {
      merchantId: 'PGTESTPAYUAT86',
      merchantTransactionId: orderId,
      merchantUserId: 'TEST-M22031L2ZT2SN_25042',
      amount: totalAmount,
      redirectUrl: 'fybr://payment/redirect',
      redirectMode: 'POST',
      callbackUrl: 'fybr://payment/callback',
      mobileNumber: mobileNumber,
      paymentInstrument: {type: 'PAY_PAGE'},
    };

    // Generate checksum
    const endpoint = '/pg/v1/pay';
    const checksum = await PhonePeService.generateChecksum(payload, endpoint);

    // Base64 encode payload
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      'base64',
    );

    // Start transaction
    const transactionResult = await PhonePePaymentSDK.startTransaction(
      base64Payload,
      checksum,
      null,
      'fybr',
    );

    setState(prevState => ({...prevState, loading: false}));

    // Handle result
    if (transactionResult.status === 'SUCCESS') {
      await savePaymentToBackend(orderId, {
        cartID: cartResponse.data.cartID,
        UserProfileID,
        SystemUser,
        SystemDate,
        PaymentMethodID: state.PaymentMethodID,
        TipAmount: state.TipAmount,
        AddressID: state.AddressID,
        TotalUnitPrice: state.TotalUnitPrice,
        TransactionID: orderId,
      });

      Alert.alert(
        'Payment Successful',
        'Your order has been placed successfully!',
        [{text: 'OK', onPress: () => navigation.push('Orders')}],
      );
    } else if (transactionResult.status === 'FAILURE') {
      Alert.alert(
        'Payment Failed',
        transactionResult.error || 'Payment failed',
      );
    } else if (transactionResult.status === 'INTERRUPTED') {
      Alert.alert('Payment Cancelled', 'You have cancelled the payment.');
    }
  } catch (error) {
    setState(prevState => ({...prevState, loading: false}));
    console.error('PhonePe payment error:', error);
    Alert.alert(
      'Payment Error',
      'Failed to initiate PhonePe payment: ' + error.message,
    );
  }
};
```

## Helper Methods

### Get Package Signature (Android Only)

```javascript
const getPackageSignature = async () => {
  if (Platform.OS === 'android') {
    try {
      const packageSignature =
        await PhonePePaymentSDK.getPackageSignatureForAndroid();
      console.log('Package Signature:', packageSignature);
      return packageSignature;
    } catch (error) {
      console.error('Error getting package signature:', error);
      return null;
    }
  }
  return null;
};
```

## PhonePe Service (`Modules/Services/PhonePeService.js`)

The service provides utility methods for:

- Generating order IDs
- Creating transaction IDs
- Generating checksums
- Creating payment orders
- Checking payment status
- Verifying payment callbacks

## Error Handling

### Common Errors and Solutions

1. **SDK Initialization Failed**

   - Check merchant credentials
   - Verify environment settings
   - Ensure proper app configuration

2. **Transaction Failed**

   - Verify payload format
   - Check checksum generation
   - Ensure proper amount format (in paise)

3. **Deep Link Issues**
   - Verify URL scheme configuration
   - Check Android manifest and iOS Info.plist
   - Test deep link handling

## Testing

### Sandbox Testing

- Use test merchant credentials
- Test with small amounts
- Verify all payment flows

### Production Checklist

- [ ] Update environment to 'PRODUCTION'
- [ ] Replace test credentials with live credentials
- [ ] Test with real UPI apps
- [ ] Verify callback handling
- [ ] Test error scenarios

## Security Considerations

1. **Never expose sensitive credentials in client-side code**
2. **Use proper checksum validation**
3. **Implement server-side payment verification**
4. **Handle payment callbacks securely**
5. **Validate all payment responses**

## Troubleshooting

### Build Issues

- Ensure minSdkVersion is set to 21 or higher
- Check for conflicting dependencies
- Verify proper linking of native modules

### Runtime Issues

- Check console logs for detailed error messages
- Verify network connectivity
- Ensure proper app permissions

### Payment Issues

- Verify merchant account status
- Check transaction limits
- Ensure proper amount formatting

## Support

For PhonePe SDK related issues:

- Refer to official PhonePe documentation
- Contact PhonePe business support
- Check PhonePe developer portal

For app-specific issues:

- Review console logs
- Check network requests
- Verify configuration settings
