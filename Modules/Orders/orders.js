import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Normalize from '../Size/size';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {API_KEY, URL_key} from '../Api/api';
import axios from 'axios';

const Orders = ({navigation}) => {
  const [ordersList, setOrdersList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized styles for better performance
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#fff',
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: wp('4%'),
          paddingTop: hp('3%'),
          paddingBottom: hp('2%'),
        },
        backButton: {
          padding: hp('1%'),
        },
        title: {
          fontSize: 20,
          color: '#00afb5',
          fontFamily: 'Poppins-SemiBold',
          marginLeft: wp('15%'),
          flex: 1,
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: hp('25%'),
        },
        emptyText: {
          fontSize: 15,
          textAlign: 'center',
          color: '#333',
          fontFamily: 'Poppins-SemiBold',
        },
        sectionTitle: {
          color: '#333',
          fontSize: 12,
          fontFamily: 'Poppins-Light',
          marginTop: hp('2%'),
          marginLeft: wp('10%'),
          marginBottom: hp('1%'),
        },
        orderCard: {
          width: wp('80%'),
          borderWidth: 1,
          borderColor: '#00afb5',
          alignSelf: 'center',
          marginTop: hp('2%'),
          borderTopLeftRadius: wp('5%'),
          borderTopRightRadius: wp('5%'),
          backgroundColor: '#fff',
        },
        orderHeader: {
          paddingHorizontal: wp('10%'),
          paddingTop: hp('3%'),
        },
        deliveryTime: {
          color: '#333',
          fontSize: 12,
          fontFamily: 'Poppins-SemiBold',
          marginBottom: hp('1%'),
        },
        orderInfo: {
          color: '#666',
          fontSize: 11,
          fontFamily: 'Poppins-SemiBold',
        },
        storeLocation: {
          color: 'grey',
          fontSize: 9,
          fontFamily: 'Poppins-Light',
        },
        productImage: {
          width: wp('17%'),
          height: hp('9%'),
          resizeMode: 'contain',
          borderRadius: hp('5%'),
          marginTop: hp('2%'),
          marginLeft: wp('10%'),
          marginBottom: hp('2%'),
        },
        actionButtons: {
          flexDirection: 'row',
          alignSelf: 'center',
        },
        actionButton: {
          width: wp('40%'),
          height: hp('5%'),
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: '#00afb5',
          borderBottomWidth: 1,
        },
        leftButton: {
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomLeftRadius: wp('5%'),
        },
        rightButton: {
          borderRightWidth: 1,
          borderBottomRightRadius: wp('5%'),
        },
        buttonText: {
          color: '#00afb5',
          fontSize: 11,
          fontFamily: 'Poppins-SemiBold',
        },
        separator: {
          borderBottomColor: 'lightgrey',
          borderBottomWidth: 0.5,
          marginTop: hp('2%'),
          width: wp('100%'),
          alignSelf: 'center',
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: hp('25%'),
        },
        errorContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: hp('25%'),
          paddingHorizontal: wp('10%'),
        },
        errorText: {
          fontSize: 15,
          textAlign: 'center',
          color: '#ff4444',
          fontFamily: 'Poppins-SemiBold',
          marginBottom: hp('2%'),
        },
        retryButton: {
          backgroundColor: '#00afb5',
          paddingHorizontal: wp('5%'),
          paddingVertical: hp('1%'),
          borderRadius: wp('2%'),
        },
        retryButtonText: {
          color: '#fff',
          fontSize: 14,
          fontFamily: 'Poppins-SemiBold',
        },
      }),
    [],
  );

  // Fetch orders data
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get UserProfileID from AsyncStorage
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');

      if (!UserProfileID) {
        throw new Error('User not logged in');
      }

      // Fetch Order List
      const orderResponse = await axios.get(
        URL_key + 'api/ProductApi/gOrderList?UserProfileID=' + UserProfileID,
        {headers: {'content-type': 'application/json'}},
      );

      let orders = orderResponse.data;

      // Loop through each order and fetch product details for each OrderItem
      for (let order of orders) {
        if (order.OrderItems && Array.isArray(order.OrderItems)) {
          for (let item of order.OrderItems) {
            try {
              const productResponse = await axios.get(
                URL_key +
                  'api/ProductApi/gProductDetails?ProductID=' +
                  item.ProductID,
                {headers: {'content-type': 'application/json'}},
              );

              // Extract store details from product response
              if (productResponse.data) {
                item.StoreName = productResponse.data.StoreName;
                item.StoreLocation = productResponse.data.StoreLocation;
              }
            } catch (productError) {
              console.error(
                'Error fetching product details for ProductID:',
                item.ProductID,
                productError,
              );
              // Set default values if product details fail to load
              item.StoreName = 'Store';
              item.StoreLocation = 'Location';
            }
          }
        }
      }

      console.log('Orders data:', JSON.stringify(orders));
      setOrdersList(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle navigation back
  const handleBackPress = useCallback(() => {
    navigation.navigate('TabP');
  }, [navigation]);

  // Handle order detail navigation
  const handleOrderDetail = useCallback(
    orderId => {
      console.log('OrderId >>>>>', orderId);
      navigation.navigate('OrderDetail', {
        data: {
          OrderID: orderId,
        },
      });
    },
    [navigation],
  );

  // Render individual order item
  const renderOrderItem = useCallback(
    ({item, index}) => (
      <View key={`order-item-${index}`}>
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.deliveryTime}>Arriving in 6 minutes</Text>
            <Text style={styles.orderInfo}>
              <Text style={styles.orderInfo}>
                ₹ {item.TotalPrice} | {item.StoreName || 'Store'}
              </Text>
              <Text style={styles.storeLocation}>
                {' '}
                {item.StoreLocation || 'Location'}
              </Text>
            </Text>
          </View>
          <Image
            style={styles.productImage}
            source={{uri: item.ProductImage}}
            defaultSource={require('../Images/frock1.png')}
          />
        </View>
        <View style={styles.actionButtons}>
          <View style={[styles.actionButton, styles.leftButton]}>
            <Text style={styles.buttonText}>Track Order</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleOrderDetail(item.OrderID)}
            style={[styles.actionButton, styles.rightButton]}>
            <Text style={styles.buttonText}>Order Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [styles, handleOrderDetail],
  );

  // Render order group
  const renderOrderGroup = useCallback(
    ({item: order, index: orderIndex}) => (
      <View key={`order-group-${orderIndex}`}>
        {order.OrderItems && Array.isArray(order.OrderItems)
          ? order.OrderItems.map((orderItem, itemIndex) =>
              renderOrderItem({item: orderItem, index: itemIndex}),
            )
          : null}
      </View>
    ),
    [renderOrderItem],
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Icon
            onPress={handleBackPress}
            name="chevron-back"
            color={'#00afb5'}
            size={40}
            style={styles.backButton}
          />
          <Text style={styles.title}>Your Orders</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00afb5" />
          <Text style={styles.emptyText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Icon
            onPress={handleBackPress}
            name="chevron-back"
            color={'#00afb5'}
            size={40}
            style={styles.backButton}
          />
          <Text style={styles.title}>Your Orders</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!ordersList || ordersList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Icon
            onPress={handleBackPress}
            name="chevron-back"
            color={'#00afb5'}
            size={40}
            style={styles.backButton}
          />
          <Text style={styles.title}>Your Orders</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Oops! No items added in orders.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon
          onPress={handleBackPress}
          name="chevron-back"
          color={'#00afb5'}
          size={40}
          style={styles.backButton}
        />
        <Text style={styles.title}>Your Orders</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>This Month</Text>

        <FlatList
          data={ordersList}
          keyExtractor={(item, index) => `order-${index}`}
          renderItem={renderOrderGroup}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Orders;
