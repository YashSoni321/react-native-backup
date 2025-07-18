# PhonePe React Native SDK Integration

This document provides a comprehensive guide for integrating the PhonePe React Native SDK into your application.

## Table of Contents

1. [Installation](#installation)
2. [Android Configuration](#android-configuration)
3. [iOS Configuration](#ios-configuration)
4. [Basic Usage](#basic-usage)
5. [Advanced Features](#advanced-features)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)

## Installation

### 1. Install the PhonePe SDK

```bash
npm i https://phonepe.mycloudrepo.io/public/repositories/phonepe-mobile-react-native-sdk/releases/v2/react-native-phonepe-pg.tgz --legacy-peer-deps
```

### 2. Link the Native Modules

For React Native 0.60+, the linking is automatic. For older versions, run:

```bash
npx react-native link react-native-phonepe-pg
```

## Android Configuration

### 1. Add PhonePe Repository

Update your `android/settings.gradle`:

```gradle
// PhonePe repository configuration
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_PROJECT)
    repositories {
        google()
        mavenCentral()
        maven {
            url "https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android"
        }
    }
}
```

### 2. Update App-level build.gradle

Add repository configuration to `android/app/build.gradle`:

```gradle
// PhonePe repository configuration
repositories {
    google()
    mavenCentral()
    maven {
        url "https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android"
    }
}
```

### 3. Update PhonePe Module build.gradle

Add repository to `node_modules/react-native-phonepe-pg/android/build.gradle`:

```gradle
repositories {
    mavenCentral()
    google()
    maven {
        url "https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android"
    }
}
```

### 4. Build the Project

```bash
cd android
./gradlew assembleDebug -x lint
```

**Note**: We use `-x lint` to skip lint checks that may fail due to third-party module issues. For a complete build with lint checks, you can use:

```bash
./gradlew build
```

**Quick Build Script**: Use the provided script for easier builds:

```bash
cd android
./build-without-lint.sh
```

## iOS Configuration

### 1. Install Pods

```bash
cd ios
pod install
```

### 2. Update Info.plist (if needed)

Add URL schemes for deep linking:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>phonepe</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>fybr</string>
        </array>
    </dict>
</array>
```

## Basic Usage

### 1. Import the SDK

```javascript
import PhonePePaymentSDK from 'react-native-phonepe-pg';
```

### 2. Initialize the SDK

```javascript
const initializePhonePe = async () => {
  try {
    const environment = 'UAT'; // or 'PROD' for production
    const merchantId = 'PGTESTPAYUAT86';
    const appId = 'APP_STORE'; // or 'PLAY_STORE' for Android
    const saltKey = 'YOUR_SALT_KEY';
    const saltIndex = 1;

    const result = await PhonePePaymentSDK.init(
      environment,
      merchantId,
      appId,
      saltKey,
      saltIndex,
    );

    console.log('PhonePe SDK initialized:', result);
    return result;
  } catch (error) {
    console.error('PhonePe SDK initialization error:', error);
    return false;
  }
};
```

### 3. Start a Payment Transaction

```javascript
const startPayment = async () => {
  try {
    // Initialize SDK first
    const initialized = await initializePhonePe();
    if (!initialized) {
      return;
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.floor(
      Math.random() * 10000,
    )}`;

    // Payment parameters
    const paymentParams = {
      merchantId: 'PGTESTPAYUAT86',
      merchantTransactionId: transactionId,
      merchantUserId: 'USER_ID',
      amount: 10000, // Amount in paise (₹100)
      redirectUrl: 'your-app://payment/redirect',
      redirectMode: 'POST',
      callbackUrl: 'your-app://payment/callback',
      mobileNumber: '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // Start the payment
    const result = await PhonePePaymentSDK.startTransaction(
      JSON.stringify(paymentParams),
      'PAY_PAGE',
    );

    // Handle the result
    if (result && result.data) {
      const response = JSON.parse(result.data);

      if (response.success) {
        console.log('Payment successful:', response.data.merchantTransactionId);
      } else {
        console.log('Payment failed:', response.message);
      }
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

## Advanced Features

### 1. Check PhonePe App Availability

```javascript
const checkPhonePeAvailability = async () => {
  try {
    const result = await PhonePePaymentSDK.isPhonePeInstalled();
    console.log('PhonePe installed:', result);
    return result;
  } catch (error) {
    console.error('Error checking PhonePe availability:', error);
    return false;
  }
};
```

### 2. Get UPI Apps (Android Only)

```javascript
const getUPIApps = async () => {
  try {
    const upiApps = await PhonePePaymentSDK.getUPIApps();
    console.log('Available UPI apps:', upiApps);
    return upiApps;
  } catch (error) {
    console.error('Error getting UPI apps:', error);
    return [];
  }
};
```

### 3. Get Package Signature (Android Only)

```javascript
const getPackageSignature = async () => {
  try {
    const signature = await PhonePePaymentSDK.getPackageSignature();
    console.log('Package signature:', signature);
    return signature;
  } catch (error) {
    console.error('Error getting package signature:', error);
    return null;
  }
};
```

## Error Handling

### Common Error Codes

- `KEY_NOT_CONFIGURED`: Merchant credentials not configured
- `INVALID_MERCHANT_ID`: Invalid merchant ID
- `INVALID_AMOUNT`: Invalid payment amount
- `NETWORK_ERROR`: Network connectivity issues
- `USER_CANCELLED`: User cancelled the payment

### Error Handling Example

```javascript
const handlePaymentError = error => {
  switch (error.code) {
    case 'KEY_NOT_CONFIGURED':
      Alert.alert(
        'Configuration Error',
        'Please contact support to configure merchant credentials.',
      );
      break;
    case 'INVALID_AMOUNT':
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      break;
    case 'NETWORK_ERROR':
      Alert.alert('Network Error', 'Please check your internet connection.');
      break;
    default:
      Alert.alert('Payment Error', error.message || 'An error occurred.');
  }
};
```

## Testing

### 1. Test Credentials

For testing, use these credentials:

```javascript
const TEST_CONFIG = {
  MERCHANT_ID: 'PGTESTPAYUAT',
  SALT_KEY: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
  SALT_INDEX: 1,
  ENVIRONMENT: 'UAT',
};
```

### 2. Test Card Details

- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 123456

### 3. Test UPI

- **UPI ID**: success@upi
- **Amount**: Any amount

## Production Deployment

### 1. Update Configuration

Replace test credentials with production credentials:

```javascript
const PROD_CONFIG = {
  MERCHANT_ID: 'YOUR_PRODUCTION_MERCHANT_ID',
  SALT_KEY: 'YOUR_PRODUCTION_SALT_KEY',
  SALT_INDEX: 1,
  ENVIRONMENT: 'PROD',
};
```

### 2. Update Environment

Change environment from 'UAT' to 'PROD':

```javascript
const environment = 'PROD';
```

### 3. Update URLs

Replace test URLs with production URLs:

```javascript
const redirectUrl = 'https://your-domain.com/payment/redirect';
const callbackUrl = 'https://your-domain.com/payment/callback';
```

## Integration with Existing Code

Your project already has a comprehensive PhonePe integration in:

- `Modules/Checkout/checkout.js` - Main checkout flow
- `Modules/Services/PhonePeService.js` - Payment service
- `Modules/Payment/PhonePePayment.js` - Payment WebView
- `Modules/Config/phonepe-config.js` - Configuration

The new SDK example is in:

- `Modules/Payment/PhonePeSDKExample.js` - Direct SDK usage

## Troubleshooting

### Common Issues

1. **Build Failures**: Ensure all repository configurations are added
2. **SDK Not Found**: Check if the package is properly installed
3. **Payment Failures**: Verify merchant credentials and environment
4. **Deep Link Issues**: Ensure URL schemes are properly configured
5. **Lint Errors**: Use `-x lint` flag to skip lint checks

### Build Issues

#### Lint Errors with Third-party Modules

If you encounter lint errors with modules like `react-native-location`, use:

```bash
cd android
./gradlew assembleDebug -x lint
```

#### React Native Vector Icons Issue

The project includes a fix for React Native Vector Icons dependency issues. If you still encounter problems, ensure the task dependency fix is in your `android/app/build.gradle`.

### Debug Steps

1. Check console logs for detailed error messages
2. Verify network connectivity
3. Test with different payment amounts
4. Check PhonePe app installation status
5. Use the provided build script: `./build-without-lint.sh`

## Support

For technical support:

- PhonePe Developer Documentation: https://developer.phonepe.com/
- PhonePe Business Support: business.phonepe.com/dashboard
- React Native SDK Issues: Check the SDK repository

## License

This integration follows the PhonePe SDK license terms. Please refer to the official PhonePe documentation for licensing details.
