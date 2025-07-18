# PhonePe SDK Troubleshooting Guide

## Error: KEY_NOT_CONFIGURED

### Problem Description

```
PhonePe transaction result: {
  "error": "key_error_code:ERROR_B2B_API_RETURNED_ERRORkey_error_result:{\"success\":false,\"code\":\"KEY_NOT_CONFIGURED\",\"message\":\"Key not found for the merchant\",\"data\":{}}",
  "status": "FAILURE"
}
```

### Root Cause

This error occurs when:

1. The App ID is not properly configured with PhonePe
2. The merchant account is not set up correctly
3. The App ID format is incorrect
4. The merchant credentials are not registered with PhonePe

### Solutions

#### 1. Contact PhonePe Business Support

**Primary Solution**: Contact PhonePe Business Support to get proper credentials

**Steps**:

1. Visit: https://business.phonepe.com/dashboard
2. Contact PhonePe Business Support
3. Request proper App ID for your merchant account
4. Provide your app details and package name

**Required Information**:

- Your merchant ID: `PGTESTPAYUAT`
- Your app package name (Android): `com.mynewfybrapp`
- Your app bundle ID (iOS): `com.mynewfybrapp`
- App store links (if published)

#### 2. Get Package Signature (Android)

Run this code to get your app's package signature:

```javascript
import PhonePePaymentSDK from 'react-native-phonepe-pg';
import {Platform} from 'react-native';

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

**Provide this signature to PhonePe support**.

#### 3. Alternative App ID Formats

The current implementation tries multiple App ID formats:

```javascript
const appIds = [
  'TEST-M22031L2ZT2SN_25042', // Original App ID
  null, // Try without App ID
  'N2JlMWQzZjUtZWU4OS00ZmUwLWFmMDQtMTg3ODYwMWJiMmU1', // Alternative App ID
];
```

#### 4. Test with Different App IDs

Try these common test App IDs:

```javascript
// Option 1: No App ID
await PhonePePaymentSDK.init('SANDBOX', 'PGTESTPAYUAT', null, true);

// Option 2: Common test App ID
await PhonePePaymentSDK.init(
  'SANDBOX',
  'PGTESTPAYUAT',
  'TEST-M22031L2ZT2SN_25042',
  true,
);

// Option 3: Alternative format
await PhonePePaymentSDK.init(
  'SANDBOX',
  'PGTESTPAYUAT',
  'N2JlMWQzZjUtZWU4OS00ZmUwLWFmMDQtMTg3ODYwMWJiMmU1',
  true,
);
```

#### 5. Verify Merchant Account Status

1. Log into PhonePe Business Dashboard
2. Check if your merchant account is active
3. Verify that test credentials are enabled
4. Ensure your app is registered

#### 6. Check App Configuration

**Android Manifest** (`android/app/src/main/AndroidManifest.xml`):

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

**iOS Info.plist**:

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

### Debugging Steps

#### 1. Enable Detailed Logging

```javascript
// Enable PhonePe SDK logging
await PhonePePaymentSDK.init('SANDBOX', 'PGTESTPAYUAT', appId, true);
```

#### 2. Check Console Output

Look for these logs:

```
Trying PhonePe SDK init with App ID: TEST-M22031L2ZT2SN_25042
PhonePe SDK initialized successfully with App ID: TEST-M22031L2ZT2SN_25042
```

#### 3. Verify Network Requests

Check if the SDK is making proper API calls to PhonePe servers.

### Temporary Workaround

If you need to test the app while waiting for PhonePe support:

```javascript
// Add this to your checkout component
const testPhonePeIntegration = async () => {
  try {
    // Try initialization with different parameters
    const result = await PhonePePaymentSDK.init(
      'SANDBOX',
      'PGTESTPAYUAT',
      null,
      true,
    );
    console.log('Init result:', result);

    // If successful, proceed with transaction
    if (result) {
      // Your transaction code here
    }
  } catch (error) {
    console.error('PhonePe test failed:', error);
    // Show user-friendly error message
    Alert.alert(
      'PhonePe Setup Required',
      'Please contact support to configure PhonePe payment gateway.',
    );
  }
};
```

### Production Checklist

Before going live:

- [ ] Get production App ID from PhonePe
- [ ] Update environment to 'PRODUCTION'
- [ ] Replace test credentials with live credentials
- [ ] Test with real UPI apps
- [ ] Verify callback handling
- [ ] Test error scenarios

### Contact Information

**PhonePe Business Support**:

- Website: https://business.phonepe.com/dashboard
- Email: business@phonepe.com
- Phone: 1800-102-6483

**Required Information for Support**:

1. Merchant ID: `PGTESTPAYUAT`
2. App package name: `com.mynewfybrapp`
3. Package signature (from Android)
4. App store links (if available)
5. Expected transaction volume
6. Business type and category

### Common Mistakes to Avoid

1. **Using wrong App ID format**: App IDs should be provided by PhonePe
2. **Missing package signature**: Required for Android apps
3. **Incorrect merchant ID**: Use the one provided by PhonePe
4. **Wrong environment**: Use 'SANDBOX' for testing, 'PRODUCTION' for live
5. **Missing deep link configuration**: Required for payment callbacks

### Next Steps

1. **Immediate**: Contact PhonePe Business Support
2. **Short-term**: Test with different App ID formats
3. **Medium-term**: Get proper credentials and test thoroughly
4. **Long-term**: Deploy to production with live credentials
