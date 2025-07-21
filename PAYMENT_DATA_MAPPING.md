# Payment Data Mapping Guide

## Overview

This guide maps all the data being sent to backend APIs during the payment process to ensure no fields are missing or incorrectly calculated.

## Data Flow

### 1. Cart → Checkout Data Transfer

**From Cart Component (`Modules/Dashboard/cart.js`)**

```javascript
const checkoutData = {
  TotalUnitPrice: totalAmount, // Final total amount (including all fees)
  Subtotal: subtotal, // Original cart total
  DiscountedPrice: discount, // Total discount
  DeliveryFee: deliveryFee, // Delivery charges
  ConvenienceFee: convenienceFee, // Convenience charges
  PackagingFee: packagingFee, // Packaging charges
  CartItems: state.Nearbystores1, // Cart items grouped by store
  ItemCount: totalItemCount, // Total number of items
  StoreCount: state.Nearbystores1.length, // Number of stores
  OriginalTotal: subtotal, // Original cart total
  FinalTotal: totalAmount, // Final amount after all calculations
};
```

### 2. Checkout → Payment API Data

**To `/api/ProductApi/sPayment`**

```javascript
const paymentData = {
  // Required Fields
  CartID: cartResponse.data, // Latest cart ID from API
  UserProfileID: UserProfileID, // User ID from AsyncStorage
  PaymentMethodID: state.PaymentMethodID, // Selected payment method
  AddressID: state.AddressID, // Selected delivery address
  TipAmount: tipAmount, // Tip amount (parsed as number)
  PaymentAmount: finalPaymentAmount, // Final payment amount (base + tip)
  SystemUser: SystemUser, // User name from AsyncStorage
  SystemDate: SystemDate, // Current timestamp

  // Additional Fields (for backend processing)
  Subtotal: route?.params?.data?.Subtotal || 0,
  DiscountedPrice: route?.params?.data?.DiscountedPrice || 0,
  DeliveryFee: route?.params?.data?.DeliveryFee || 0,
  ConvenienceFee: route?.params?.data?.ConvenienceFee || 0,
  PackagingFee: route?.params?.data?.PackagingFee || 0,
  ItemCount: route?.params?.data?.ItemCount || 0,
  StoreCount: route?.params?.data?.StoreCount || 0,
  OriginalTotal: route?.params?.data?.OriginalTotal || 0,
  FinalTotal: finalPaymentAmount,

  // PhonePe specific
  TransactionID: orderId, // Generated transaction ID
};
```

## Amount Calculations

### Cart Total Calculation

```javascript
// In cart.js
const subtotal = state.TotalUnitPrice || 0; // Original cart total
const discount = state.TotalDiscountPrice || 0; // Total discount
const deliveryFee = state.totalDeliveryFee || 0; // Delivery charges
const convenienceFee = state.totalConvenienceFee || 0; // Convenience charges
const packagingFee = state.totalPackagingFee || 0; // Packaging charges

const totalAmount =
  subtotal - discount + deliveryFee + convenienceFee + packagingFee;
```

### Payment Amount Calculation

```javascript
// In checkout.js
const baseAmount = state.TotalUnitPrice || 0; // Base amount from cart
const tipAmount = parseFloat(state.TipAmount || 0); // Tip amount (user input)
const finalPaymentAmount = baseAmount + tipAmount; // Final payment amount
```

## Validation Checklist

### Before Payment Processing

- [ ] `UserProfileID` exists in AsyncStorage
- [ ] `PaymentMethodID` is selected
- [ ] `AddressID` is selected
- [ ] `CartID` is valid
- [ ] All amounts are positive numbers
- [ ] Tip amount is valid (if provided)

### Data Validation

- [ ] `PaymentAmount` = `Subtotal` - `DiscountedPrice` + `DeliveryFee` + `ConvenienceFee` + `PackagingFee` + `TipAmount`
- [ ] `FinalTotal` = `PaymentAmount`
- [ ] `ItemCount` > 0
- [ ] `StoreCount` > 0
- [ ] `CartItems` array is not empty

## Debug Information

### Console Logs

The system now logs detailed information at each step:

1. **Cart Checkout**: Logs cart state and calculated amounts
2. **Payment Processing**: Logs payment data and API responses
3. **Address Loading**: Logs address selection and validation
4. **API Calls**: Tracks all API requests and responses

### Debug Button

Use the bug icon in the checkout screen to view:

- Recent debug logs
- Payment data being sent
- API responses
- Error information

## Common Issues and Solutions

### Issue 1: Missing AddressID

**Symptoms**: Payment fails with "Address not selected" error
**Solution**: Ensure user has a valid delivery address

### Issue 2: Incorrect Payment Amount

**Symptoms**: Backend receives wrong amount
**Solution**: Check amount calculations in cart and checkout

### Issue 3: Missing Cart Items

**Symptoms**: Order created without items
**Solution**: Validate cart data before checkout

### Issue 4: Invalid Payment Method

**Symptoms**: Payment method validation fails
**Solution**: Ensure payment method is properly selected

## API Endpoints Used

### 1. Get Latest Cart ID

```
GET /api/ProductApi/gLatestCardID?UserProfileID={UserProfileID}
```

### 2. Process Payment

```
POST /api/ProductApi/sPayment
Body: paymentData object
```

### 3. Get User Address

```
GET /api/AddressApi/gCustomerAddress?UserProfileID={UserProfileID}
```

## Testing Checklist

### Manual Testing

1. **Add items to cart** and verify totals
2. **Proceed to checkout** and check data transfer
3. **Select payment method** and address
4. **Process payment** and verify API calls
5. **Check order creation** in backend

### Debug Testing

1. **Use debug button** to view payment data
2. **Check console logs** for detailed information
3. **Verify API responses** match expected format
4. **Test error scenarios** (invalid data, network issues)

## Data Mapping Summary

| Field           | Source       | Type   | Required | Description             |
| --------------- | ------------ | ------ | -------- | ----------------------- |
| CartID          | API          | Number | Yes      | Latest cart ID          |
| UserProfileID   | AsyncStorage | String | Yes      | User identifier         |
| PaymentMethodID | State        | Number | Yes      | Selected payment method |
| AddressID       | State        | Number | Yes      | Delivery address        |
| TipAmount       | State        | Number | No       | User tip amount         |
| PaymentAmount   | Calculated   | Number | Yes      | Final payment amount    |
| SystemUser      | AsyncStorage | String | Yes      | User name               |
| SystemDate      | Generated    | String | Yes      | Current timestamp       |
| Subtotal        | Route params | Number | Yes      | Original cart total     |
| DiscountedPrice | Route params | Number | Yes      | Total discount          |
| DeliveryFee     | Route params | Number | Yes      | Delivery charges        |
| ConvenienceFee  | Route params | Number | Yes      | Convenience charges     |
| PackagingFee    | Route params | Number | Yes      | Packaging charges       |
| ItemCount       | Route params | Number | Yes      | Total items             |
| StoreCount      | Route params | Number | Yes      | Number of stores        |
| OriginalTotal   | Route params | Number | Yes      | Original total          |
| FinalTotal      | Calculated   | Number | Yes      | Final amount            |
| TransactionID   | Generated    | String | No       | Payment transaction ID  |

## Next Steps

1. **Test the payment flow** with the debug tools
2. **Verify all data** is being sent correctly
3. **Check backend logs** to ensure data is received
4. **Validate order creation** in the database
5. **Test error scenarios** to ensure proper handling

The enhanced data mapping and validation should resolve any issues with missing or incorrect data being sent to the backend APIs.
