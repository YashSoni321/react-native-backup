import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  FlatList,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {URL_key} from '../Api/api';
import axios from 'axios';

class OrderDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      OrderID: this.props.route?.params?.data?.OrderID || null,
      orderslist: null,
      selectedImageIndex: 0,
    };
  }

  async componentDidMount() {
    try {
      // Fetch Order List
      const orderResponse = await axios.get(
        `${URL_key}api/ProductApi/gOrderDetail?OrderID=${this.state.OrderID}`,
        {headers: {'content-type': 'application/json'}},
      );

      let orders = orderResponse.data;

      // Loop through each order and fetch product details for each OrderItem
      for (let order of orders) {
        for (let item of order.OrderItems) {
          try {
            const productResponse = await axios.get(
              `${URL_key}api/ProductApi/gProductDetails?ProductID=${item.ProductID}`,
              {headers: {'content-type': 'application/json'}},
            );

            if (productResponse.data) {
              // Extract store and product details
              item.StoreName = productResponse.data.StoreName;
              item.StoreLocation = productResponse.data.StoreLocation;
              item.GoogleMapLink = productResponse.data.GoogleMapLink;
              item.ProductName = productResponse.data.ProductName;
              item.ProductColor = productResponse.data.ProductColor;
              item.ProductImage = productResponse.data.ProductImage;
              item.ProductImages = productResponse.data.ProductImages;
              item.IsReturnAvailable = productResponse.data.IsReturnAvailable;
              item.ReturnDays = productResponse.data.ReturnDays;

              // Find matching ProductItem based on ProductItemID
              const matchingItem = productResponse.data.ProductItems.find(
                productItem => productItem.ProductItemID === item.ProductItemID,
              );

              if (matchingItem) {
                item.ItemName = matchingItem.ItemName;
                item.ItemColor = matchingItem.ItemColor;
                item.Size = matchingItem.Size;
              }
            }
          } catch (err) {
            console.error(
              `Error fetching product details for ProductID: ${item.ProductID}`,
              err,
            );
          }
        }
      }

      this.setState({
        orderslist: orders,
        PaymentAmount: orders[0]?.PaymentAmount || '',
        PaymentMode: orders[0]?.PaymentMode || '',
        Pincode: orders[0]?.Pincode || '',
        StreetName: orders[0]?.StreetName || '',
        StreetNumber: orders[0]?.StreetNumber || '',
        StateName: orders[0]?.StateName || '',
        CityName: orders[0]?.CityName || '',
        OrderDate: orders[0]?.OrderDate
          ? moment(orders[0].OrderDate).format('dddd, MMMM DD, YYYY, hh:mm A')
          : '',
        OrderStatus: orders[0]?.OrderStatus || '',
        BaseDeliveryFee: orders[0]?.BaseDeliveryFee || 0,
        AdditionDistanceFee: orders[0]?.AdditionDistanceFee || 0,
        ConvenienceFee: orders[0]?.ConvenienceFee || 0,
        PackagingFee: orders[0]?.PackagingFee || 0,
        RainyWeatherBaseFee: orders[0]?.RainyWeatherBaseFee || 0,
      });
    } catch (error) {
      console.error('Error fetching orders or product details:', error);
    }
  }

  openMap = googleMapLink => {
    if (googleMapLink) {
      Linking.openURL(googleMapLink);
    }
  };

  render() {
    const {orderslist} = this.state;
    const firstOrder = orderslist?.[0];

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <ImageBackground
            style={{width: wp('100%')}}
            activeOpacity={0.5}
            source={require('../Images/output-onlinepngtools1.png')}
            resizeMode="cover">
            <Text style={styles.headerTitle}>fybr</Text>
            <Icon
              onPress={() => {
                this.props.navigation.push('Orders');
              }}
              name="chevron-back"
              color={'#00afb5'}
              size={40}
              style={styles.backButton}
            />
          </ImageBackground>

          {/* Order Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Order Status: {this.state.OrderStatus}
            </Text>
          </View>

          {/* Products List */}
          <View style={styles.productsContainer}>
            <FlatList
              data={this.state.orderslist}
              renderItem={({item: order}) => (
                <FlatList
                  data={order.OrderItems}
                  renderItem={({item}) => (
                    <View style={styles.productCard}>
                      <View style={styles.productRow}>
                        <View style={styles.imageContainer}>
                          {item.ProductImages && (
                            <FlatList
                              horizontal
                              data={item.ProductImages}
                              showsHorizontalScrollIndicator={false}
                              pagingEnabled
                              renderItem={({item: image}) => (
                                <Image
                                  style={styles.productImage}
                                  source={{uri: image.ProductImage}}
                                />
                              )}
                              keyExtractor={(item, index) => index.toString()}
                            />
                          )}
                        </View>
                        <View style={styles.productDetails}>
                          <Text style={styles.productName}>
                            {item.ProductName}
                          </Text>
                          <Text style={styles.productColor}>
                            {item.ProductColor}
                          </Text>
                          <Text style={styles.productSize}>
                            Size: {item.Size}
                          </Text>
                          <Text style={styles.productPrice}>
                            ₹ {item.TotalPrice}
                          </Text>

                          {/* Store Details */}
                          <TouchableOpacity
                            style={styles.storeContainer}
                            onPress={() => this.openMap(item.GoogleMapLink)}>
                            <Text style={styles.storeName}>
                              {item.StoreName}
                            </Text>
                            <Text style={styles.storeLocation}>
                              {item.StoreLocation}
                            </Text>
                            <Icon name="location" size={16} color="#00afb5" />
                          </TouchableOpacity>

                          {/* Return Policy */}
                          {item.IsReturnAvailable && (
                            <Text style={styles.returnPolicy}>
                              {item.ReturnDays} days return available
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>

          {/* Payment Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <Text style={styles.paymentMode}>
              Mode: {this.state.PaymentMode}
            </Text>

            <View style={styles.feeContainer}>
              <Text style={styles.feeLabel}>Base Delivery Fee</Text>
              <Text style={styles.feeAmount}>
                ₹ {this.state.BaseDeliveryFee}
              </Text>
            </View>

            <View style={styles.feeContainer}>
              <Text style={styles.feeLabel}>Additional Distance Fee</Text>
              <Text style={styles.feeAmount}>
                ₹ {this.state.AdditionDistanceFee}
              </Text>
            </View>

            <View style={styles.feeContainer}>
              <Text style={styles.feeLabel}>Convenience Fee</Text>
              <Text style={styles.feeAmount}>
                ₹ {this.state.ConvenienceFee}
              </Text>
            </View>

            <View style={styles.feeContainer}>
              <Text style={styles.feeLabel}>Packaging Fee</Text>
              <Text style={styles.feeAmount}>₹ {this.state.PackagingFee}</Text>
            </View>

            {this.state.RainyWeatherBaseFee > 0 && (
              <View style={styles.feeContainer}>
                <Text style={styles.feeLabel}>Rainy Weather Fee</Text>
                <Text style={styles.feeAmount}>
                  ₹ {this.state.RainyWeatherBaseFee}
                </Text>
              </View>
            )}

            <View style={[styles.feeContainer, styles.totalContainer]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                ₹ {this.state.PaymentAmount}
              </Text>
            </View>
          </View>

          {/* Delivery Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <Text style={styles.orderDate}>{this.state.OrderDate}</Text>
            <Text style={styles.address}>
              {this.state.StreetNumber}, {this.state.StreetName},{'\n'}
              {this.state.CityName}, {this.state.StateName} -{' '}
              {this.state.Pincode}
            </Text>
          </View>

          {/* Support Section */}
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>Need help with this order?</Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => this.props.navigation.push('Contactsupport')}>
              <View style={styles.supportContent}>
                <View>
                  <Text style={styles.supportButtonText}>Contact Support</Text>
                  <Text style={styles.supportSubtext}>
                    Chat with our support team
                  </Text>
                </View>
                <Icon
                  name="chatbox-ellipses-outline"
                  color={'#00afb5'}
                  size={30}
                  style={styles.supportIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 45,
    textAlign: 'center',
    color: '#00afb5',
    fontFamily: 'RedHatDisplay-Bold',
    marginTop: hp('3%'),
  },
  backButton: {
    marginLeft: wp('1%'),
    padding: hp('1%'),
    marginTop: hp('-9.0%'),
    marginBottom: hp('2%'),
  },
  statusContainer: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#00afb5',
    textAlign: 'center',
  },
  productsContainer: {
    marginBottom: hp('2%'),
  },
  productCard: {
    width: wp('95%'),
    alignSelf: 'center',
    borderRadius: wp('3%'),
    marginTop: hp('2%'),
    borderColor: '#00afb5',
    backgroundColor: '#fff',
    elevation: 2,
    padding: 10,
  },
  productRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: wp('40%'),
    height: hp('15%'),
  },
  productImage: {
    width: wp('35%'),
    height: hp('15%'),
    resizeMode: 'cover',
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    paddingLeft: 10,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  productColor: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    color: 'gray',
  },
  productSize: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#00afb5',
    marginTop: 4,
  },
  storeContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginRight: 5,
  },
  storeLocation: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    color: '#666',
    marginRight: 5,
  },
  returnPolicy: {
    fontSize: 11,
    fontFamily: 'Poppins-Light',
    color: '#00afb5',
    marginTop: 4,
  },
  section: {
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 10,
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  feeLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Light',
    color: '#666',
  },
  feeAmount: {
    fontSize: 13,
    fontFamily: 'Poppins-Light',
    color: '#666',
  },
  totalContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#00afb5',
  },
  orderDate: {
    fontSize: 13,
    fontFamily: 'Poppins-Light',
    color: '#666',
    marginBottom: 5,
  },
  address: {
    fontSize: 13,
    fontFamily: 'Poppins-Light',
    color: '#666',
    lineHeight: 20,
  },
  supportSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 10,
  },
  supportButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
  },
  supportContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  supportSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    color: '#666',
    marginTop: 2,
  },
  supportIcon: {
    marginLeft: 10,
  },
});

export default OrderDetail;
