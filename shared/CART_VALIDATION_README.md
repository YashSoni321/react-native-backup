# Cart Validation Implementation

This document describes the cart validation system implemented to ensure users can only add products from one store at a time and handle duplicate products by updating quantities.

## Overview

The cart validation system consists of two main components:

1. **CartValidation Utility** (`CartValidation.js`) - Core validation logic
2. **AddToCartButton Component** (`AddToCartButton.js`) - Reusable UI component

## Features

### 1. Store Validation

- Users can only add products from one store at a time
- If cart contains items from a different store, user is prompted to either:
  - Cancel the operation
  - Clear cart and add the new item
- Automatic store detection and validation

### 2. Duplicate Product Handling

- If same product with same size/color exists in cart, quantity is updated instead of creating duplicate
- Automatic quantity calculation and update
- Success message shown when quantity is updated

### 3. Cart Management

- Clear entire cart functionality
- Proper error handling and user feedback
- Loading states during operations

## Usage

### Basic Usage with CartValidation Utility

```javascript
import CartValidation from '../shared/CartValidation';

// Add product to cart with validation
const productData = {
  ProductID: 123,
  ProductItemID: 456,
  StoreID: 789,
  SizeID: 'M',
  Color: 'Red',
  Quantity: 2,
  UnitPrice: 29.99,
  StoreName: 'Fashion Store',
};

const result = await CartValidation.addToCartWithValidation(productData);

if (result.success) {
  console.log('Success:', result.message);
  // Handle success
} else {
  console.log('Failed:', result.message);
  // Handle error
}
```

### Using AddToCartButton Component

```javascript
import AddToCartButton from '../shared/AddToCartButton';

<AddToCartButton
  productData={productData}
  onSuccess={result => {
    console.log('Added to cart:', result);
  }}
  onError={error => {
    console.log('Error:', error);
  }}
  buttonText="Add to Cart"
  disabled={false}
/>;
```

## API Reference

### CartValidation Class

#### Static Methods

##### `canAddFromStore(currentStoreID, currentStoreName)`

Checks if user can add product from current store.

**Parameters:**

- `currentStoreID` (number): Store ID of the product being added
- `currentStoreName` (string): Store name for display purposes

**Returns:** Promise<boolean> - True if can add, false if blocked

##### `findExistingProduct(productData)`

Finds existing product in cart with same attributes.

**Parameters:**

- `productData` (Object): Product data with ProductID, ProductItemID, SizeID, Color

**Returns:** Promise<Object|null> - Existing cart item if found, null otherwise

##### `addToCartWithValidation(productData)`

Main method to add product to cart with full validation.

**Parameters:**

- `productData` (Object): Complete product data

**Returns:** Promise<Object> - Result object with success status and message

##### `clearCart(UserProfileID, cartItems)`

Clears all items from cart.

**Parameters:**

- `UserProfileID` (string): User profile ID
- `cartItems` (Array): Array of cart items to remove

##### `getCurrentCartStore()`

Gets current cart store information.

**Returns:** Promise<Object|null> - Store info if cart has items, null otherwise

### AddToCartButton Component

#### Props

- `productData` (Object): Product data for cart addition
- `onSuccess` (Function): Callback for successful operation
- `onError` (Function): Callback for error
- `style` (Object): Custom button styles
- `textStyle` (Object): Custom text styles
- `disabled` (boolean): Disable button
- `showIcon` (boolean): Show cart icon
- `buttonText` (string): Custom button text

## Implementation Details

### Store Validation Flow

1. Check if user is logged in
2. Fetch current cart items
3. If cart is empty, allow adding from any store
4. If cart has items, check if they're from the same store
5. If different store, show confirmation dialog
6. If user confirms, clear cart and add new item

### Duplicate Product Detection

1. Check if product with same ProductID, ProductItemID, SizeID, and Color exists
2. If found, update quantity instead of creating new item
3. If not found, add as new item

### Error Handling

- Network errors are caught and displayed to user
- API errors are logged and handled gracefully
- User-friendly error messages
- Loading states during operations

## Integration Points

### Updated Files

1. **ProductDetails.js** - Uses CartValidation for add to cart
2. **StoreProducts.js** - Shows store validation warnings
3. **Cart.js** - Added clear cart functionality
4. **api.js** - API service methods for cart operations

### New Files

1. **CartValidation.js** - Core validation utility
2. **AddToCartButton.js** - Reusable button component
3. **CART_VALIDATION_README.md** - This documentation

## Testing

### Test Cases

1. **Empty Cart**: Should allow adding from any store
2. **Same Store**: Should allow adding products from same store
3. **Different Store**: Should prompt user to clear cart
4. **Duplicate Product**: Should update quantity instead of creating duplicate
5. **Error Handling**: Should handle network and API errors gracefully

### Manual Testing Steps

1. Add product from Store A
2. Try to add product from Store B - should show warning
3. Clear cart and add from Store B - should work
4. Add same product again - should update quantity
5. Test error scenarios (no internet, API errors)

## Future Enhancements

1. **Bulk Operations**: Support for adding multiple products at once
2. **Cart Sync**: Real-time cart synchronization across devices
3. **Offline Support**: Cache cart data for offline operations
4. **Analytics**: Track cart abandonment and conversion rates
5. **A/B Testing**: Test different validation messages and flows
