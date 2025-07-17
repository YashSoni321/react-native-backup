/**
 * Cart Validation Test Examples
 * This file demonstrates how to use the CartValidation utility
 */

import CartValidation from './CartValidation';

// Example 1: Basic store validation
export const testStoreValidation = async () => {
  console.log('🧪 Testing Store Validation...');

  // Simulate adding product from Store A
  const storeAProduct = {
    ProductID: 1,
    ProductItemID: 101,
    StoreID: 1,
    SizeID: 'M',
    Color: 'Red',
    Quantity: 1,
    UnitPrice: 29.99,
    StoreName: 'Fashion Store A',
  };

  const result1 = await CartValidation.addToCartWithValidation(storeAProduct);
  console.log('✅ Store A result:', result1);

  // Try to add product from Store B (should show warning)
  const storeBProduct = {
    ProductID: 2,
    ProductItemID: 201,
    StoreID: 2,
    SizeID: 'L',
    Color: 'Blue',
    Quantity: 1,
    UnitPrice: 39.99,
    StoreName: 'Fashion Store B',
  };

  const result2 = await CartValidation.addToCartWithValidation(storeBProduct);
  console.log('⚠️ Store B result:', result2);
};

// Example 2: Duplicate product handling
export const testDuplicateProduct = async () => {
  console.log('🧪 Testing Duplicate Product Handling...');

  const productData = {
    ProductID: 1,
    ProductItemID: 101,
    StoreID: 1,
    SizeID: 'M',
    Color: 'Red',
    Quantity: 1,
    UnitPrice: 29.99,
    StoreName: 'Fashion Store A',
  };

  // Add product first time
  const result1 = await CartValidation.addToCartWithValidation(productData);
  console.log('✅ First add result:', result1);

  // Add same product again (should update quantity)
  const result2 = await CartValidation.addToCartWithValidation(productData);
  console.log('🔄 Second add result:', result2);
};

// Example 3: Get current cart store info
export const testGetCurrentCartStore = async () => {
  console.log('🧪 Testing Get Current Cart Store...');

  const storeInfo = await CartValidation.getCurrentCartStore();
  console.log('📊 Current cart store info:', storeInfo);
};

// Example 4: Clear cart functionality
export const testClearCart = async () => {
  console.log('🧪 Testing Clear Cart...');

  try {
    const UserProfileID = 'test-user-id';
    const cartItems = [
      {
        CartID: 1,
        CartItemID: 1,
        ProductID: 1,
        StoreID: 1,
      },
    ];

    await CartValidation.clearCart(UserProfileID, cartItems);
    console.log('✅ Cart cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
  }
};

// Example 5: Find existing product
export const testFindExistingProduct = async () => {
  console.log('🧪 Testing Find Existing Product...');

  const productData = {
    ProductID: 1,
    ProductItemID: 101,
    SizeID: 'M',
    Color: 'Red',
  };

  const existingProduct = await CartValidation.findExistingProduct(productData);
  console.log('🔍 Existing product found:', existingProduct);
};

// Example 6: Complete workflow test
export const testCompleteWorkflow = async () => {
  console.log('🧪 Testing Complete Workflow...');

  // Step 1: Add product from Store A
  const productA = {
    ProductID: 1,
    ProductItemID: 101,
    StoreID: 1,
    SizeID: 'M',
    Color: 'Red',
    Quantity: 2,
    UnitPrice: 29.99,
    StoreName: 'Store A',
  };

  console.log('📦 Adding product from Store A...');
  const result1 = await CartValidation.addToCartWithValidation(productA);
  console.log('Result 1:', result1);

  // Step 2: Add same product again (should update quantity)
  console.log('📦 Adding same product again...');
  const result2 = await CartValidation.addToCartWithValidation(productA);
  console.log('Result 2:', result2);

  // Step 3: Try to add product from Store B (should show warning)
  const productB = {
    ProductID: 2,
    ProductItemID: 201,
    StoreID: 2,
    SizeID: 'L',
    Color: 'Blue',
    Quantity: 1,
    UnitPrice: 39.99,
    StoreName: 'Store B',
  };

  console.log('📦 Trying to add product from Store B...');
  const result3 = await CartValidation.addToCartWithValidation(productB);
  console.log('Result 3:', result3);

  // Step 4: Get current cart store info
  console.log('📊 Getting current cart store info...');
  const storeInfo = await CartValidation.getCurrentCartStore();
  console.log('Store Info:', storeInfo);
};

// Export all test functions
export const runAllTests = async () => {
  console.log('🚀 Starting Cart Validation Tests...\n');

  try {
    await testStoreValidation();
    console.log('\n');

    await testDuplicateProduct();
    console.log('\n');

    await testGetCurrentCartStore();
    console.log('\n');

    await testFindExistingProduct();
    console.log('\n');

    await testCompleteWorkflow();
    console.log('\n');

    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
};

// Usage example:
// import { runAllTests } from './CartValidation.test';
// runAllTests();
