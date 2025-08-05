export const URL_key = 'https://fybrappapi.benchstep.com/';
export const API_KEY = '4567821200';
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

import axios from 'axios';

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = URL_key;
    this.timeout = 15000; // 15 seconds default timeout

    // Configure axios defaults
    axios.defaults.timeout = this.timeout;
    axios.defaults.headers.common['content-type'] = 'application/json';
  }

  // Generic GET method with error handling
  async get(endpoint, params = {}, customTimeout = null) {
    try {
      const url = this.baseURL + endpoint;
      const config = {
        timeout: customTimeout || this.timeout,
        params: params,
      };

      console.log(`🌐 API GET Request: ${url}`);
      console.log(`📋 Parameters:`, params);

      const response = await axios.get(url, config);

      console.log(`✅ API Response: ${endpoint}`, {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        data: response.data,
      });

      return response.data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: this.baseURL + endpoint,
      });

      // Throw a standardized error
      throw this.handleApiError(error, endpoint);
    }
  }

  // Handle different types of API errors
  handleApiError(error, endpoint) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return new Error(
            `Bad request for ${endpoint}: ${
              data?.message || 'Invalid parameters'
            }`,
          );
        case 401:
          return new Error(`Unauthorized for ${endpoint}: Please login again`);
        case 403:
          return new Error(`Forbidden for ${endpoint}: Access denied`);
        case 404:
          return new Error(
            `Not found for ${endpoint}: ${
              data?.message || 'Resource not available'
            }`,
          );
        case 500:
          return new Error(
            `Server error for ${endpoint}: Please try again later`,
          );
        default:
          return new Error(
            `HTTP ${status} for ${endpoint}: ${
              data?.message || 'Unknown error'
            }`,
          );
      }
    } else if (error.request) {
      // Network error
      return new Error(
        `Network error for ${endpoint}: Please check your internet connection`,
      );
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      return new Error(`Request timeout for ${endpoint}: Please try again`);
    } else {
      // Other errors
      return new Error(`Error for ${endpoint}: ${error.message}`);
    }
  }

  // Product APIs
  async getProductListByStore(storeID) {
    return this.get(`api/ProductApi/gProductListByStore?StoreID=${storeID}`);
  }
  async getProductListByStoreAndCategoryId(storeID, categoryId) {
    return this.get(
      `api/ProductApi/gProductListByStore?StoreID=${storeID}&CategoryID=${categoryId}`,
    );
  }

  async getProductCartList(userProfileID) {
    return this.get(
      `api/ProductApi/gProductCartList?UserProfileID=${userProfileID}`,
    );
  }

  async getProductDetails(productID) {
    return this.get(`api/ProductApi/gProductDetails?ProductID=${productID}`);
  }

  async getLatestCartID(userProfileID) {
    return this.get(
      `api/ProductApi/gLatestCardID?UserProfileID=${userProfileID}`,
    );
  }

  // Cart APIs
  async addToCart(cartData) {
    return this.post('api/ProductApi/sProductCartItem', cartData);
  }

  async updateCartItem(cartData) {
    return this.post('api/ProductApi/sProductCartItem', cartData);
  }

  async removeFromCart(cartData) {
    return this.post('api/ProductApi/dProductCartItem', cartData);
  }

  // Wishlist APIs
  async addToWishlist(wishlistData) {
    return this.post('api/ProductApi/sWishList', wishlistData);
  }

  // Generic POST method for cart operations
  async post(endpoint, data, customTimeout = null) {
    try {
      const url = this.baseURL + endpoint;
      const config = {
        timeout: customTimeout || this.timeout,
        headers: {
          'content-type': 'application/json',
        },
      };

      console.log(`🌐 API POST Request: ${url}`);
      console.log(`📋 Data:`, data);

      const response = await axios.post(url, data, config);

      console.log(`✅ API POST Response: ${endpoint}`, {
        status: response.status,
        data: response.data,
      });

      return response.data;
    } catch (error) {
      console.error(`❌ API POST Error: ${endpoint}`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: this.baseURL + endpoint,
      });

      throw this.handleApiError(error, endpoint);
    }
  }

  // Category APIs
  async getCategoryList() {
    return this.get(`api/CategoryApi/gCategoryList`);
  }

  async getSubCategoryList(categoryID) {
    return this.get(
      `api/CategoryApi/gSubCategoryList?CategoryID=${categoryID}`,
    );
  }

  // Store APIs
  async getStoreList() {
    return this.get(`api/StoreApi/gStoreList`);
  }

  async getStoreDetails(storeID) {
    return this.get(`api/StoreApi/gStoreDetails?StoreID=${storeID}`);
  }

  // Address APIs
  async getCustomerAddress(userProfileID) {
    return this.get(
      `api/AddressApi/gCustomerAddress?UserProfileID=${userProfileID}`,
    );
  }

  async getStateDDL() {
    return this.get(`api/AddressApi/gStateDDL`);
  }

  async getCityDDL(stateID) {
    return this.get(`api/AddressApi/gCityDDL?StateID=${stateID}`);
  }

  // Login APIs
  async validateOTP(mobileNumber, otp) {
    return this.post(`api/LoginApi/ValidateOTP`, {
      MobileNumber: mobileNumber,
      OTP: otp,
    });
  }

  async sendOTP(mobileNumber) {
    return this.get(`api/LoginApi/SendOTP`, {
      MobileNumber: mobileNumber,
    });
  }

  // Order APIs
  async getOrderList(userProfileID) {
    return this.get(`api/OrderApi/gOrderList?UserProfileID=${userProfileID}`);
  }

  async getOrderDetails(orderID) {
    return this.get(`api/OrderApi/gOrderDetails?OrderID=${orderID}`);
  }

  // User APIs
  async getUserProfile(userProfileID) {
    return this.get(`api/UserApi/gUserProfile?UserProfileID=${userProfileID}`);
  }

  // Payment APIs
  async getPaymentMethods() {
    return this.get(`api/PaymentApi/gPaymentMethods`);
  }

  // Notification APIs
  async getNotifications(userProfileID) {
    return this.get(
      `api/NotificationApi/gNotifications?UserProfileID=${userProfileID}`,
    );
  }

  // Search APIs
  async searchProducts(query, storeID = null) {
    const params = {query};
    if (storeID) params.StoreID = storeID;
    return this.get(`api/SearchApi/SearchProducts`, params);
  }

  // Utility method to test API connectivity
  async testConnection() {
    try {
      const response = await this.get('api/Health/Status');
      console.log('✅ API Connection Test Successful');
      return true;
    } catch (error) {
      console.error('❌ API Connection Test Failed:', error.message);
      return false;
    }
  }

  // Method to get API status and version
  async getApiInfo() {
    try {
      const response = await this.get('api/Health/Info');
      console.log('📊 API Info:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to get API info:', error.message);
      return null;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  getProductListByStore,
  getProductCartList,
  getProductDetails,
  getLatestCartID,
  getCategoryList,
  getSubCategoryList,
  getCustomerAddress,
  validateOTP,
  sendOTP,
  testConnection,
  getApiInfo,
} = apiService;

/*
USAGE EXAMPLES:

1. Basic API call:
   const products = await apiService.getProductListByStore(1);

2. With error handling:
   try {
     const products = await apiService.getProductListByStore(1);
     console.log('Products:', products);
   } catch (error) {
     console.error('Error:', error.message);
   }

3. Test API connection:
   const isConnected = await apiService.testConnection();
   if (isConnected) {
     console.log('API is accessible');
   }

4. Get API info:
   const apiInfo = await apiService.getApiInfo();
   console.log('API Version:', apiInfo.version);

5. Custom timeout:
   const products = await apiService.get('api/ProductApi/gProductListByStore?StoreID=1', {}, 30000);

AVAILABLE METHODS:
- getProductListByStore(storeID)
- getProductCartList(userProfileID)
- getProductDetails(productID)
- getLatestCartID(userProfileID)
- getCategoryList()
- getSubCategoryList(categoryID)
- getStoreList()
- getStoreDetails(storeID)
- getCustomerAddress(userProfileID)
- getStateDDL()
- getCityDDL(stateID)
- validateOTP(mobileNumber, otp)
- sendOTP(mobileNumber)
- getOrderList(userProfileID)
- getOrderDetails(orderID)
- getUserProfile(userProfileID)
- getPaymentMethods()
- getNotifications(userProfileID)
- getWishlist(userProfileID)
- searchProducts(query, storeID)
- testConnection()
- getApiInfo()
*/
