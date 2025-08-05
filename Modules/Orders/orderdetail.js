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
      storeDetails: null,
    };
  }

  safeNumber(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
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
            console.log('productResponse', productResponse.data);
            const storeDetails = {
              storeId: productResponse.data.StoreID,
              storeName: productResponse.data.StoreName,
              storeLocation: productResponse.data.StoreLocation,
            };
            this.setState({storeDetails: storeDetails});
            if (productResponse.data) {
              // this.setState({ StoreDetails: productResponse,})
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
      console.log('OrderItems', JSON.stringify(orders));

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
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={{width: '90%', margin: 'auto', shadowOpacity: 0}}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <ImageBackground
            style={{width: wp('100%'), height: hp('15%')}}
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

          <View>
            <Text
              style={{
                color: 'black',
                fontSize: 14,
                marginLeft: wp('5%'),
                marginTop: wp('13%'),
              }}>
              From{' '}
              <Text
                style={{
                  color: 'black',
                  fontWeight: '600',
                  fontSize: 17,
                  marginLeft: wp('5%'),
                }}>
                {/* Westside */}
                {this.state.storeDetails?.storeName || 'Store Name'}{' '}
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: 12,
                  marginLeft: wp('5%'),
                }}>
                {/* Westside */}
                {this.state.storeDetails?.storeLocation || 'Store Location'}
              </Text>
            </Text>
          </View>

          {/* Products List */}
          <View style={styles.productsContainer}>
            {/* <FlatList
              data={this.state.orderslist}
              renderItem={({item: order}) => (
               
              )}
              keyExtractor={(item, index) => index.toString()}
            /> */}
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
                              keyExtractor={(_, index) => index.toString()}
                            />
                          )}
                        </View>
                        <View
                          style={{
                            display: 'flex',
                            // flexDirection: 'row',
                            // justifyContent: 'space-between',
                            alignItems: 'center',
                            // marginHorizontal: wp('5%'),
                            // marginVertical: hp('2%'),
                          }}>
                          {/* Left Section - Product Details */}
                          <View style={{flex: 1}}>
                            <Text style={styles.productName}>
                              {item.ProductName}
                            </Text>
                            <View>
                              <Text style={styles.productColor}>
                                {item.ProductColor}
                              </Text>
                              <View
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                }}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: hp('1%'),
                                  }}>
                                  <View
                                    style={{
                                      height: hp('2%'),
                                      width: hp('2%'),
                                      borderRadius: wp('100%'),
                                      borderWidth: 1,
                                      borderColor: '#00afb5',
                                      marginRight: wp('2%'),
                                      backgroundColor:
                                        item.ProductColor.toLowerCase(),
                                    }}
                                  />
                                  <Text style={styles.productSize}>
                                    {item.Size}
                                  </Text>
                                </View>
                                <View>
                                  <Text style={styles.productPrice}>
                                    ₹ {item.TotalPrice}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>

                          {/* Right Section - Total Price */}
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
          <View style={{marginHorizontal: wp('5%'), marginTop: hp('2%')}}>
            <Text style={{fontWeight: '600', fontSize: 14}}>
              Mode of Payment
            </Text>
            <Text style={{marginTop: hp('0.5%'), fontSize: 13}}>
              {/* Cash on Delivery */} {this.state.PaymentMode}
            </Text>
          </View>
          <View style={{marginHorizontal: wp('5%'), marginTop: hp('2%')}}>
            <Text style={{fontWeight: '600', fontSize: 14}}>
              Payment Summary
            </Text>

            {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: hp('1%'),
              }}>
              <Text>Subtotal</Text>
              <Text>
                ₹{' '}
                {Number(this.state.PaymentAmount) -
                  Number(this.state.ConvenienceFee) +
                  Number(this.state.PackagingFee) +
                  Number(this.state.BaseDeliveryFee) +
                  Number(this.state.AdditionDistanceFee)}
              </Text>
            </View> */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: hp('1%'),
              }}>
              <Text>Subtotal</Text>
              <Text>
                ₹{' '}
                {(
                  this.safeNumber(this.state.PaymentAmount) -
                  this.safeNumber(this.state.ConvenienceFee) +
                  this.safeNumber(this.state.PackagingFee) +
                  this.safeNumber(this.state.BaseDeliveryFee) +
                  this.safeNumber(this.state.AdditionDistanceFee)
                ).toFixed(2)}{' '}
                {/* Rounds to 2 decimal places */}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: hp('1%'),
              }}>
              <Text>Charges & Fees</Text>
              <Text>
                ₹{' '}
                {Number(this.state.ConvenienceFee) +
                  Number(this.state.PackagingFee) +
                  Number(this.state.BaseDeliveryFee) +
                  Number(this.state.AdditionDistanceFee)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: hp('2%'),
              }}>
              <Text style={{fontWeight: '600'}}>Total Amount</Text>
              <Text style={{fontWeight: '600'}}>
                ₹ {this.state.PaymentAmount}
              </Text>
            </View>
          </View>

          <View style={{marginHorizontal: wp('5%'), marginTop: hp('2%')}}>
            <Text style={{fontWeight: '600', fontSize: 14}}>Order Details</Text>
            <Text style={{marginTop: hp('1%'), fontSize: 13}}>
              {/* Monday, October 14, 2024, 07:04 PM */}
              {this.state.OrderDate}
            </Text>
            <Text style={{fontSize: 14}}>
              {/* Delivered to 8-1-363/50 Aditya Nagar Colony, Tolichowki */}
              {this.state.StreetNumber}, {this.state.StreetName},{'\n'}
              {this.state.CityName}, {this.state.StateName} -{' '}
              {this.state.Pincode}
            </Text>
          </View>

          <View style={{marginHorizontal: wp('5%'), marginTop: hp('3%')}}>
            <Text style={{fontWeight: '600', fontSize: 14}}>
              Need help with this order?
            </Text>

            <TouchableOpacity
              style={{
                marginTop: hp('2%'),
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: hp('2%'),
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onPress={() => this.props.navigation.push('Contactsupport')}>
              <View>
                <Text style={{fontWeight: '600'}}>Contact Support</Text>
                <Text style={{color: 'grey'}}>Chat with our support team</Text>
              </View>
              <Icon name="chatbox-ellipses-outline" size={30} color="#00afb5" />
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
    borderRadius: wp('3%'),
    marginTop: hp('2%'),
    backgroundColor: '#fff',
  },
  productRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: wp('30%'),
    height: hp('15%'),
    marginRight: wp('2%'),
    marginLeft: wp('1%'),
  },
  productImage: {
    // width: wp('25%'),
    // height: hp('15%'),
    // resizeMode: 'cover',
    // borderRadius: 8,
    width: wp('30%'),
    height: hp('14%'),
    resizeMode: 'stretch',
    marginLeft: wp('1%'),
    marginRight: wp('2%'),
  },
  productDetails: {
    flex: 1,
    paddingLeft: 10,
    display: 'flex',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  productColor: {
    fontSize: 12,
    color: 'grey',
    marginTop: hp('0.5%'),
  },
  productSize: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  productPrice: {
    fontSize: 14,
    color: '#000',
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
