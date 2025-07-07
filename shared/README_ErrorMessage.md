# Error Message Component

A comprehensive error message system for React Native apps with beautiful UI and excellent user experience.

## Features

- ✅ **12 Pre-defined Error Types** - Covers all common app scenarios
- ✅ **Custom Error Support** - Create your own error messages
- ✅ **Action Buttons** - Primary and secondary actions
- ✅ **Beautiful UI** - Follows your project's color scheme
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Modal & Dialog Support** - Choose display type
- ✅ **Functional Components** - Modern React patterns
- ✅ **Custom Hook** - Easy integration
- ✅ **Type-based Styling** - Different colors for error, warning, info

## Installation

The component uses existing libraries in your project:

- `react-native-modal` ✅ (Already installed)
- `react-native-simple-dialogs` ✅ (Already installed)
- `react-native-vector-icons` ✅ (Already installed)

## Quick Start

### Basic Usage

```javascript
import React, {useState} from 'react';
import ErrorMessage from '../shared/ErrorMessage';

const MyComponent = () => {
  const [errorVisible, setErrorVisible] = useState(false);

  return (
    <>
      <Button onPress={() => setErrorVisible(true)} title="Show Error" />

      <ErrorMessage
        visible={errorVisible}
        errorType="NETWORK_ERROR"
        onPrimaryAction={() => {
          setErrorVisible(false);
          // Handle retry logic
        }}
        onClose={() => setErrorVisible(false)}
      />
    </>
  );
};
```

### Using the Custom Hook

```javascript
import React from 'react';
import useErrorMessage from '../shared/useErrorMessage';
import ErrorMessage from '../shared/ErrorMessage';

const MyComponent = () => {
  const {
    errorVisible,
    currentError,
    showNetworkError,
    showEmptyCartError,
    hideError,
  } = useErrorMessage();

  const handleNetworkError = () => {
    showNetworkError(() => {
      // Retry network request
      console.log('Retrying...');
    });
  };

  const handleEmptyCart = () => {
    showEmptyCartError(() => {
      // Navigate to stores
      navigation.navigate('Tabs');
    });
  };

  return (
    <>
      <Button onPress={handleNetworkError} title="Network Error" />
      <Button onPress={handleEmptyCart} title="Empty Cart" />

      <ErrorMessage
        visible={errorVisible}
        errorType={currentError.type}
        onPrimaryAction={currentError.onPrimaryAction}
        onSecondaryAction={currentError.onSecondaryAction}
        onClose={hideError}
        customTitle={currentError.customTitle}
        customMessage={currentError.customMessage}
        customPrimaryAction={currentError.customPrimaryAction}
        customSecondaryAction={currentError.customSecondaryAction}
        useModal={currentError.useModal}
      />
    </>
  );
};
```

## Error Types

### 1. Network/Server Issues

```javascript
errorType = 'NETWORK_ERROR';
// Title: "Connection Error"
// Message: "Unable to connect to Fybr servers. Please check your internet connection and try again."
// Action: "Retry"
```

### 2. Empty Cart

```javascript
errorType = 'EMPTY_CART';
// Title: "Your cart is empty"
// Message: "Looks like you haven't added anything yet! Start shopping to fill your cart."
// Action: "Browse Stores"
```

### 3. No Products Available

```javascript
errorType = 'NO_PRODUCTS';
// Title: "No products available"
// Message: "This store hasn't added any products yet. Check back later or explore other stores."
// Action: "Browse Other Stores"
```

### 4. Location Permission (Registration)

```javascript
errorType = 'LOCATION_PERMISSION_REGISTRATION';
// Title: "Location access required"
// Message: "Fybr delivers fashion to your doorstep instantly! To continue, enable location access so we can connect you with nearby stores."
// Actions: "Enable Location" | "Exit App"
```

### 5. Location Permission (Browsing)

```javascript
errorType = 'LOCATION_PERMISSION_BROWSING';
// Title: "Location access needed"
// Message: "To find stores near you and ensure accurate delivery, please enable location access."
// Actions: "Enable Location" | "Enter Address Manually"
```

### 6. No Address

```javascript
errorType = 'NO_ADDRESS';
// Title: "Address required"
// Message: "Please add a delivery address to proceed with your order."
// Action: "Add Address"
```

### 7. Notification Permission

```javascript
errorType = 'NOTIFICATION_PERMISSION';
// Title: "Stay updated with Fybr"
// Message: "Enable notifications to receive order updates, exclusive deals, and alerts."
// Actions: "Enable Notifications" | "Skip for Now"
```

### 8. Payment Failure

```javascript
errorType = 'PAYMENT_FAILURE';
// Title: "Payment failed"
// Message: "Your payment couldn't be processed. Please check your payment details and try again."
// Action: "Retry Payment"
```

### 9. Item Out of Stock

```javascript
errorType = 'ITEM_OUT_OF_STOCK';
// Title: "Item unavailable"
// Message: "Some items in your cart are no longer available. Please review your cart before proceeding."
// Action: "Update Cart"
```

### 10. Merchant Unavailable

```javascript
errorType = 'MERCHANT_UNAVAILABLE';
// Title: "Store currently unavailable"
// Message: "This store is temporarily unavailable. Please try again later or shop from other stores."
// Action: "Browse Other Stores"
```

### 11. No Delivery Partners

```javascript
errorType = 'NO_DELIVERY_PARTNERS';
// Title: "No delivery partners available"
// Message: "All delivery partners are currently busy. Please be patient."
// No actions (informational only)
```

### 12. Order Cancelled

```javascript
errorType = 'ORDER_CANCELLED';
// Title: "Order cancelled by the store"
// Message: "Unfortunately, the store had to cancel your order. Your payment (if any) will be refunded."
// Action: "Browse Other Stores"
```

## Props

| Prop                    | Type     | Default | Description                          |
| ----------------------- | -------- | ------- | ------------------------------------ |
| `visible`               | boolean  | false   | Show/hide the error message          |
| `errorType`             | string   | -       | Pre-defined error type               |
| `onPrimaryAction`       | function | -       | Callback for primary button          |
| `onSecondaryAction`     | function | -       | Callback for secondary button        |
| `onClose`               | function | -       | Callback when error is closed        |
| `customTitle`           | string   | -       | Custom title (overrides errorType)   |
| `customMessage`         | string   | -       | Custom message (overrides errorType) |
| `customPrimaryAction`   | string   | -       | Custom primary action text           |
| `customSecondaryAction` | string   | -       | Custom secondary action text         |
| `showCloseButton`       | boolean  | true    | Show close button                    |
| `useModal`              | boolean  | false   | Use modal instead of dialog          |

## Hook Methods

### Basic Methods

- `showError(errorType, options)` - Show any error type
- `hideError()` - Hide the error
- `showCustomError(title, message, primaryAction, secondaryAction, useModal)`

### Pre-defined Methods

- `showNetworkError(onRetry)`
- `showEmptyCartError(onBrowseStores)`
- `showNoProductsError(onBrowseOtherStores)`
- `showLocationPermissionError(isRegistration, onSecondaryAction)`
- `showNoAddressError(onAddAddress)`
- `showNotificationPermissionError(onEnableNotifications, onSkip)`
- `showPaymentFailureError(onRetryPayment)`
- `showItemOutOfStockError(onUpdateCart)`
- `showMerchantUnavailableError(onBrowseOtherStores)`
- `showNoDeliveryPartnersError()`
- `showOrderCancelledError(onBrowseOtherStores)`

## Color Scheme

The component uses your project's color scheme:

- **Primary**: `#00afb5` (Fybr brand color)
- **Secondary**: `#333` (Dark text)
- **Text Light**: `#666` (Light text)
- **Error**: `#ff6b6b` (Red for errors)
- **Warning**: `#f39c12` (Orange for warnings)
- **Success**: `#02b008` (Green for success)

## Examples

### Real-world Usage in Cart Component

```javascript
import React from 'react';
import useErrorMessage from '../shared/useErrorMessage';
import ErrorMessage from '../shared/ErrorMessage';

const CartComponent = ({navigation}) => {
  const {errorVisible, currentError, showEmptyCartError, hideError} =
    useErrorMessage();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showEmptyCartError(() => {
        navigation.navigate('Tabs');
      });
      return;
    }
    // Proceed with checkout
  };

  return (
    <>
      {/* Your cart UI */}
      <ErrorMessage
        visible={errorVisible}
        errorType={currentError.type}
        onPrimaryAction={currentError.onPrimaryAction}
        onClose={hideError}
      />
    </>
  );
};
```

### Network Error Handling

```javascript
const handleApiCall = async () => {
  try {
    const response = await api.getData();
    // Handle success
  } catch (error) {
    showNetworkError(() => {
      handleApiCall(); // Retry the same call
    });
  }
};
```

### Location Permission

```javascript
const handleLocationPermission = () => {
  if (!hasLocationPermission) {
    showLocationPermissionError(true, () => {
      // Handle exit app
      BackHandler.exitApp();
    });
  }
};
```

## Best Practices

1. **Use Modal for Critical Errors**: Set `useModal={true}` for network errors and location permission during registration
2. **Provide Meaningful Actions**: Always provide actionable buttons when possible
3. **Handle Secondary Actions**: Use secondary actions for alternative flows
4. **Custom Messages**: Use custom messages for specific scenarios
5. **Consistent Styling**: The component automatically follows your project's design system

## Integration Tips

1. **Add to Navigation**: Include ErrorMessage in your main navigation stack
2. **Global Error Handling**: Use the hook in your main app component
3. **API Error Handling**: Wrap API calls with error handling
4. **Permission Handling**: Use for location, notification, and camera permissions
5. **Payment Flow**: Handle payment failures gracefully

This error message system provides a professional, user-friendly way to handle all error scenarios in your Fybr app!
