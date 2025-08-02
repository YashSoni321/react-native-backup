import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../Modules/Api/api';

/**
 * Cart Validation Utility
 * Handles store validation and duplicate product detection
 */
class CartValidation {
  /**
   * Check if user can add product from current store
   * @param {number} currentStoreID - Store ID of the product being added
   * @param {string} currentStoreName - Store name for display purposes
   * @returns {Promise<boolean>} - True if can add, false if blocked
   */
  static async canAddFromStore(
    currentStoreID,
    currentStoreName = 'this store',
    showModalCallback = null,
  ) {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      if (!UserProfileID) {
        if (showModalCallback) {
          showModalCallback(
            'Login Required',
            'Please login to add items to cart.',
            'warning',
          );
        }
        return false;
      }

      const cartResponse = await apiService.getProductCartList(UserProfileID);
      const cartItems = this.extractCartItems(cartResponse);

      if (cartItems.length === 0) {
        // Cart is empty, can add from any store
        return true;
      }

      // Check if all items are from the same store
      const existingStoreID = cartItems[0].StoreID;

      if (existingStoreID !== currentStoreID) {
        // Different store detected
        const existingStoreName = cartItems[0].StoreName || 'another store';

        if (showModalCallback) {
          return new Promise(resolve => {
            showModalCallback(
              'Different Store',
              `You have items in your cart from ${existingStoreName}. You can only order from one store at a time.`,
              'warning',
              'Clear Cart & Add',
              async () => {
                try {
                  await this.clearCart(UserProfileID, cartItems);
                  resolve(true);
                } catch (error) {
                  console.error('Error clearing cart:', error);
                  showModalCallback(
                    'Error',
                    'Failed to clear cart. Please try again.',
                    'error',
                  );
                  resolve(false);
                }
              },
            );
          });
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking store validation:', error);
      if (showModalCallback) {
        showModalCallback(
          'Error',
          'Failed to validate cart. Please try again.',
          'error',
        );
      }
      return false;
    }
  }

  /**
   * Check if product already exists in cart with same attributes
   * @param {Object} productData - Product data to check
   * @param {number} productData.ProductID - Product ID
   * @param {number} productData.ProductItemID - Product Item ID
   * @param {string} productData.SizeID - Selected size
   * @param {string} productData.Color - Selected color
   * @returns {Promise<Object|null>} - Existing cart item if found, null otherwise
   */
  static async findExistingProduct(productData) {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      if (!UserProfileID) {
        return null;
      }

      const cartResponse = await apiService.getProductCartList(UserProfileID);
      const cartItems = this.extractCartItems(cartResponse);

      // Find existing product with same attributes
      const existingItem = cartItems.find(item => {
        console.log('🔍 Checking item:', {
          itemProductID: item.ProductID,
          itemProductItemID: item.ProductItemID,
          itemSizeID: item.SizeID || item.Size,
          itemColor: item.Color || item.ItemColor || item.ProductColor,
          searchProductID: productData.ProductID,
          searchProductItemID: productData.ProductItemID,
          searchSizeID: productData.SizeID,
          searchColor: productData.Color,
        });

        return (
          item.ProductID === productData.ProductID &&
          item.ProductItemID === productData.ProductItemID &&
          (item.SizeID || item.Size) === productData.SizeID &&
          (item.Color || item.ItemColor || item.ProductColor) ===
            productData.Color
        );
      });

      return existingItem || null;
    } catch (error) {
      console.error('Error finding existing product:', error);
      return null;
    }
  }

  /**
   * Add product to cart with validation
   * @param {Object} productData - Product data to add
   * @param {number} productData.ProductID - Product ID
   * @param {number} productData.ProductItemID - Product Item ID
   * @param {number} productData.StoreID - Store ID
   * @param {string} productData.SizeID - Selected size
   * @param {string} productData.Color - Selected color
   * @param {number} productData.Quantity - Quantity to add
   * @param {number} productData.UnitPrice - Unit price
   * @param {string} productData.StoreName - Store name for validation
   * @returns {Promise<Object>} - Result object with success status and message
   */
  static async addToCartWithValidation(productData, showModalCallback = null) {
    try {
      // Step 1: Validate store
      const canAdd = await this.canAddFromStore(
        productData.StoreID,
        productData.StoreName,
        showModalCallback,
      );
      if (!canAdd) {
        return {
          success: false,
          message: 'Store validation failed',
          action: 'cancelled',
        };
      }

      // Step 2: Check for existing product
      const existingItem = await this.findExistingProduct(productData);

      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.Quantity + productData.Quantity;
        const result = await this.updateCartItemQuantity(
          existingItem,
          newQuantity,
        );

        if (result.success) {
          return {
            success: true,
            message: `Quantity updated for existing item. New total: ${newQuantity}`,
            action: 'updated',
            cartItem: result.cartItem,
          };
        } else {
          return {
            success: false,
            message: 'Failed to update existing item quantity',
            action: 'error',
          };
        }
      } else {
        // Add new item
        const result = await this.addNewCartItem(productData);

        if (result.success) {
          return {
            success: true,
            message: 'Item added to cart successfully',
            action: 'added',
            cartItem: result.cartItem,
          };
        } else {
          return {
            success: false,
            message: 'Failed to add item to cart',
            action: 'error',
          };
        }
      }
    } catch (error) {
      console.error('Error in addToCartWithValidation:', error);
      return {
        success: false,
        message: 'An error occurred while adding to cart',
        action: 'error',
      };
    }
  }

  /**
   * Clear all items from cart
   * @param {string} UserProfileID - User profile ID
   * @param {Array} cartItems - Array of cart items to remove
   */
  static async clearCart(UserProfileID, cartItems) {
    const SystemUser = await AsyncStorage.getItem('FullName');
    const SystemDate = new Date().toISOString();

    const deletePromises = cartItems.map(item =>
      apiService.removeFromCart({
        CartID: item.CartID,
        CartItemID: item.CartItemID,
        SystemUser,
        SystemDate,
      }),
    );

    await Promise.all(deletePromises);
    await AsyncStorage.removeItem('CartID');
  }

  /**
   * Update cart item quantity
   * @param {Object} existingItem - Existing cart item
   * @param {number} newQuantity - New quantity
   * @returns {Promise<Object>} - Result object
   */
  static async updateCartItemQuantity(existingItem, newQuantity) {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const SystemUser = await AsyncStorage.getItem('FullName');
      const SystemDate = new Date().toISOString();

      const updateData = {
        CartID: existingItem.CartID,
        CartItemID: existingItem.CartItemID,
        UserProfileID,
        ProductID: existingItem.ProductID,
        ProductItemID: existingItem.ProductItemID,
        StoreID: existingItem.StoreID,
        Quantity: newQuantity,
        UnitPrice: existingItem.UnitPrice,
        SystemUser,
        SystemDate,
        SizeID: existingItem.SizeID,
        Color: existingItem.Color,
      };

      const response = await apiService.updateCartItem(updateData);

      if (response.Result === 'UPDATED') {
        await AsyncStorage.setItem('CartID', response.CartID.toString());
        return {
          success: true,
          cartItem: {...existingItem, Quantity: newQuantity},
        };
      } else {
        return {success: false};
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return {success: false};
    }
  }

  /**
   * Add new item to cart
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} - Result object
   */
  static async addNewCartItem(productData) {
    try {
      console.log('🛒 Adding new cart item:', productData);

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const SystemUser = await AsyncStorage.getItem('FullName');
      const SystemDate = new Date().toISOString();

      if (!UserProfileID) {
        console.error('❌ UserProfileID not found');
        return {success: false, message: 'User not logged in'};
      }

      const latestCartID = await apiService.getLatestCartID(UserProfileID);
      console.log('🛒 Latest Cart ID:', latestCartID);

      const cartItem = {
        CartID: latestCartID,
        CartItemID: 0,
        UserProfileID,
        ProductID: productData.ProductID,
        ProductItemID: productData.ProductItemID,
        StoreID: productData.StoreID,
        Quantity: productData.Quantity,
        UnitPrice: productData.UnitPrice,
        SystemUser,
        SystemDate,
        SizeID: productData.SizeID,
        Color: productData.Color,
      };

      console.log('🛒 Cart item to send:', cartItem);

      const response = await apiService.addToCart(cartItem);
      console.log('🛒 Add to cart response:', response);

      if (response.Result === 'INSERTED') {
        await AsyncStorage.setItem('CartID', response.CartID.toString());
        console.log('✅ Cart item added successfully');
        return {
          success: true,
          cartItem: {...cartItem, CartItemID: response.CartItemID},
        };
      } else {
        console.error('❌ Failed to add cart item:', response);
        return {success: false, message: 'Failed to add item to cart'};
      }
    } catch (error) {
      console.error('❌ Error adding new cart item:', error);
      return {
        success: false,
        message: error.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Extract cart items from API response
   * @param {Object} cartResponse - Cart API response
   * @returns {Array} - Array of cart items
   */
  static extractCartItems(cartResponse) {
    if (!cartResponse) return [];

    console.log('🔍 Extracting cart items from response:', cartResponse);

    // Handle new API response format - array of cart objects
    if (Array.isArray(cartResponse)) {
      let cartItems = [];
      cartResponse.forEach(cart => {
        if (cart.CartItems && Array.isArray(cart.CartItems)) {
          cartItems = cartItems.concat(cart.CartItems);
        }
      });
      console.log('📦 Extracted cart items from array format:', cartItems);
      return cartItems;
    }

    // Handle old format
    if (cartResponse.CartItems) {
      const items = Array.isArray(cartResponse.CartItems)
        ? cartResponse.CartItems
        : [];
      console.log('📦 Extracted cart items from old format:', items);
      return items;
    }

    // Handle direct array of cart items
    if (Array.isArray(cartResponse)) {
      console.log('📦 Direct array of cart items:', cartResponse);
      return cartResponse;
    }

    console.log('⚠️ No cart items found in response');
    return [];
  }

  /**
   * Get current cart store information
   * @returns {Promise<Object|null>} - Store info if cart has items, null otherwise
   */
  static async getCurrentCartStore() {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      if (!UserProfileID) return null;

      const cartResponse = await apiService.getProductCartList(UserProfileID);
      const cartItems = this.extractCartItems(cartResponse);

      if (cartItems.length === 0) return null;

      return {
        StoreID: cartItems[0].StoreID,
        StoreName: cartItems[0].StoreName,
        ItemCount: cartItems.length,
      };
    } catch (error) {
      console.error('Error getting current cart store:', error);
      return null;
    }
  }
}

export default CartValidation;
