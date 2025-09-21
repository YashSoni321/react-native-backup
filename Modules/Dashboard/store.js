import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  ActivityIndicator,
  BackHandler,
  FlatList,
  ImageBackground,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

import {URL_key} from '../Api/api';
var RNFS = require('react-native-fs');

import NoResults from './NoResults';
import ErrorMessage from '../../shared/ErrorMessage';
import {useLoading} from '../../shared/LoadingContext';
import {getUserLocation} from '../Common/locationHelper';
import CustomModal from '../../shared/CustomModal';
import HeaderWithAddress from '../Common/HeaderWithCommon';

const Store = ({navigation}) => {
  const {showLoading, hideLoading} = useLoading();
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onPrimaryPress: null,
  });

  const showModal = (title, message, type = 'info', onPrimaryPress = null) => {
    setModalConfig({
      visible: true,
      title,
      message,
      type,
      onPrimaryPress,
    });
  };

  const hideModal = () => {
    setModalConfig(prev => ({...prev, visible: false}));
  };

  const [state, setState] = useState({
    categories1: [
      {
        name: 'Men',
        Icon: 'man',
        nav: 'protab',
      },
      {
        name: 'Women',
        Icon: 'woman',
        nav: 'protab',
      },
      {name: 'Shoes', Icon: 'file-tray-sharp', nav: 'payments'},
      {
        name: 'Dresses',
        Icon: 'shirt',
        nav: 'Receivables',
      },
      {
        name: 'Wallets',
        Icon: 'wallet',
        nav: 'Receivables',
      },
      {
        name: 'Accessories',
        Icon: 'color-filter',
        nav: 'Receivables',
      },
    ],
    Storelist: null,
    Storelist1: null,
    StreetName: '',
    Pincode: '',
    search: '',
    selectedIndex: 0,
    isLoading: false,
    error: null,
    userLocation: null,
  });

  // Error handling function
  const handleError = (error, context = 'Unknown operation') => {
    console.error(`Error in ${context}:`, error);
    setState(prevState => ({
      ...prevState,
      error: `${context} failed. Please try again.`,
      isLoading: false,
    }));
  };

  // Search filter function
  const SearchFilterFunction = text => {
    try {
      setState(prevState => ({...prevState, search: text}));

      if (text) {
        const newData = state.Storelist?.filter(function (data) {
          const textData = text.toUpperCase();
          return (
            (data.StoreName &&
              data.StoreName.toUpperCase().indexOf(textData) >= 0) ||
            (data.StoreLocation &&
              data.StoreLocation.toUpperCase().indexOf(textData) >= 0)
          );
        });

        console.log('Search results:', newData);
        setState(prevState => ({
          ...prevState,
          Storelist1: newData || [],
          selectedIndex: 0,
        }));
      } else {
        setState(prevState => ({
          ...prevState,
          Storelist1: state.Storelist,
          selectedIndex: 0,
        }));
      }
    } catch (error) {
      handleError(error, 'Search operation');
    }
  };

  // Clear search function
  const clearSearch = () => {
    try {
      setState(prevState => ({
        ...prevState,
        search: '',
        Storelist1: state.Storelist,
        selectedIndex: 0,
      }));
    } catch (error) {
      handleError(error, 'Clear search');
    }
  };

  // Calculate time difference function

  // Calculate distance between two coordinates using Haversine formula

  // Estimate delivery time based on distance
  const estimateDeliveryTime = distanceKm => {
    try {
      // Base delivery time: 15 minutes for preparation
      let baseTime = 15;

      // Add time based on distance
      // Assume average speed of 25 km/h in city traffic
      const travelTimeMinutes = (distanceKm / 25) * 60;

      const totalMinutes = Math.ceil(baseTime + travelTimeMinutes);

      if (totalMinutes < 60) {
        return `${totalMinutes} mins`;
      } else {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return minutes === 0
          ? `${hours} hour${hours > 1 ? 's' : ''}`
          : `${hours}h ${minutes}m`;
      }
    } catch (error) {
      handleError(error, 'Delivery time estimation');
      return '30 mins';
    }
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      showLoading('fetching_data', 'Fetching store list.');
      setState(prev => ({...prev, isLoading: true, error: null}));

      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');

      // Get user location (don't throw error if not available)
      const userLocation = await getUserLocation().catch(() => null);

      // Fetch all required data in parallel
      const [addressRes, storeRes] = await Promise.all([
        axios.get(
          `${URL_key}api/AddressApi/gCustomerAddress?UserProfileID=${UserProfileID}`,
          {headers: {Accept: 'application/json'}},
        ),
        axios.get(`${URL_key}api/ProductApi/gStoreList`, {
          headers: {Accept: 'application/json'},
        }),
      ]);

      const stores = storeRes.data || [];
      console.log('stores,stores.length', stores, stores.length);

      const transformedStores = stores.map(store => {
        const {
          Latitude,
          Longitude,
          StoreName,
          StoreID,
          StoreLocation,
          StartTiming,
          EndTiming,
          DeliveryCharges,
          IsDeliveryCharges,
          StoreImage,
          IsStoreClosed,
        } = store;

        const storeLat = parseFloat(Latitude);
        const storeLon = parseFloat(Longitude);

        let distance = 0;
        let deliveryTime = '30 mins';

        if (!isNaN(storeLat) && !isNaN(storeLon) && userLocation?.latitude) {
          distance = calculateDistance(
            userLocation?.latitude,
            userLocation?.longitude,
            storeLat,
            storeLon,
          );
          deliveryTime = estimateDeliveryTime(distance);
        }

        return {
          StoreID,
          StoreName,
          StoreLocation,
          Timing: calculateTimeDiff(StartTiming, EndTiming),
          DeliveryCharges,
          IsDeliveryCharges,
          StoreImage,
          IsStoreClosed,
          Latitude,
          Longitude,
          DeliveryTime: deliveryTime,
          Distance: distance ? distance.toFixed(1) : 0,
        };
      });

      hideLoading('fetching_data');

      const address = addressRes.data?.[0] || {};

      setState(prev => ({
        ...prev,
        StreetName: address.StreetName || '',
        Pincode: address.AddressCategory || '',
        Storelist: transformedStores,
        Storelist1: transformedStores,
        isLoading: false,
        userLocation,
      }));
    } catch (error) {
      hideLoading('fetching_data');
      handleError(error, 'Fetching data');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    try {
      const R = 6371; // Radius of Earth in KM
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    } catch (e) {
      handleError(e, 'Distance calc error');
      return 0;
    }
  };

  const calculateTimeDiff = (start, end) => {
    try {
      const s = new Date(`1970-01-01T${start}Z`);
      const e = new Date(`1970-01-01T${end}Z`);
      const diff = Math.max((e - s) / 60000, 0);
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      return mins === 0 ? `${hrs} hrs` : `${hrs} hrs ${mins} mins`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Handle store navigation
  const handleStorePress = item => {
    try {
      if (item.IsStoreClosed === false) {
        navigation.push('StoreProducts', {
          data: {
            StoreID: item.StoreID,
            StoreName: item.StoreName,
            StoreLocation: item.StoreLocation,
            StoreImage: item.StoreImage,
            Timing: item.Timing,
            DeliveryCharges: item.DeliveryCharges,
            DeliveryTime: item.DeliveryTime,
            Distance: item.Distance,
            Latitude: item.Latitude,
            Longitude: item.Longitude,
          },
        });
      }
    } catch (error) {
      handleError(error, 'Store navigation');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Error alert
  useEffect(() => {
    if (state.error) {
      showModal('Error', state.error, 'error', () => {
        setState(prevState => ({...prevState, error: null}));
        hideModal();
      });
    }
  }, [state.error]);

  return (
    <SafeAreaView>
      {/* NavigationEvents removed - using useFocusEffect instead */}
      <ScrollView style={{backgroundColor: 'white', height: '100%'}}>
        <HeaderWithAddress navigation={navigation} showBackButton={true} />

        <View style={{flexDirection: 'row', marginBottom: hp('5%')}}>
          <View
            style={{
              justifyContent: 'center',
              borderRadius: wp('3%'),
              height: hp('5.2%'),
              borderColor: '#00afb5',
              marginTop: hp('2%'),
              backgroundColor: '#ffff',
              width: wp('85%'),
              alignSelf: 'center',
              flexDirection: 'row',
              marginBottom: hp('1%'),
              textAlignVertical: 'top',
              marginLeft: wp('7%'),
              borderWidth: 0.5,
            }}>
            <TextInput
              placeholder="Search for stores"
              fontFamily={'Poppins-Medium'}
              placeholderTextColor={'#00afb5'}
              color={'black'}
              fontSize={11}
              value={state.search}
              onChangeText={SearchFilterFunction}
              style={{
                width: wp('65%'),
              }}
            />
            <Icon
              style={{marginLeft: wp('1%'), padding: hp('1%')}}
              onPress={() => {}}
              name="search"
              color={'grey'}
              size={20}
            />
          </View>
        </View>

        <Text
          style={{
            fontSize: 13,
            color: '#333',
            fontFamily: 'Poppins-SemiBold',
            marginTop: hp('2%'),
            marginBottom: hp('-0.5%'),
            marginLeft: wp('9%'),
            marginRight: wp('1%'),
          }}>
          All Stores
        </Text>

        {!state.userLocation && (
          <Text
            style={{
              fontSize: 10,
              color: '#ff6b35',
              fontFamily: 'Poppins-Light',
              marginTop: hp('1%'),
              marginBottom: hp('1%'),
              marginLeft: wp('8%'),
              marginRight: wp('9%'),
            }}>
            Location not available. Distances and delivery times are not
            estimated.
          </Text>
        )}

        <View
          style={{
            marginLeft: wp('2%'),
            marginRight: wp('2%'),
            marginBottom: hp('2%'),
          }}>
          {state.isLoading ? (
            <View style={{marginTop: hp('10%'), alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#00afb5" />
              <Text style={{marginTop: hp('2%'), fontFamily: 'Poppins-Light'}}>
                Loading stores...
              </Text>
            </View>
          ) : state.search && state.Storelist1?.length === 0 ? (
            <NoResults searchTerm={state.search} onClearSearch={clearSearch} />
          ) : (
            <FlatList
              data={state.Storelist1}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => handleStorePress(item)}>
                    <View
                      style={[
                        {
                          width: wp('93%'),
                          alignSelf: 'center',
                          borderRadius: wp('3%'),
                          marginLeft: wp('1%'),
                          marginRight: wp('1%'),
                          marginTop: hp('2%'),
                          borderColor: '#00afb5',
                        },
                      ]}>
                      <View style={{flexDirection: 'row'}}>
                        <View>
                          {item.StoreImage == null ||
                          item.StoreImage == undefined ||
                          item.StoreImage == '' ? (
                            <Image
                              style={{
                                width: wp('25%'),
                                height: hp('10%'),
                                marginTop: hp('1%'),
                                marginLeft: wp('6%'),
                                marginRight: wp('4%'),
                                marginBottom: hp('1%'),
                                opacity: item.IsStoreClosed == true ? 0.2 : 1,
                              }}
                              source={require('../Images/Zudio.jpg')}
                            />
                          ) : (
                            <Image
                              style={{
                                width: wp('25%'),
                                height: hp('10%'),
                                marginTop: hp('1%'),
                                marginLeft: wp('6%'),
                                marginRight: wp('4%'),
                                marginBottom: hp('1%'),
                                opacity: item.IsStoreClosed == true ? 0.2 : 1,
                              }}
                              source={{uri: item.StoreImage}}
                            />
                          )}
                        </View>

                        <View>
                          <Text
                            style={{
                              fontSize: 12,
                              fontFamily: 'Poppins-Medium',
                              alignContent: 'center',
                              textAlign: 'left',
                              justifyContent: 'center',
                              color: '#333',
                              marginTop: hp('0.5%'),
                              marginLeft: wp('1%'),
                              marginRight: wp('2%'),
                              width: wp('55%'),
                              opacity: item.IsStoreClosed == true ? 0.3 : 1,
                            }}>
                            {item.StoreName}
                          </Text>
                          <Text
                            style={{
                              fontSize: 9,
                              fontFamily: 'Poppins-Light',
                              alignContent: 'center',
                              textAlign: 'left',
                              justifyContent: 'center',
                              color: 'gray',
                              marginLeft: wp('1%'),
                              marginRight: wp('2%'),
                              width: wp('55%'),
                              opacity: item.IsStoreClosed == true ? 0.7 : 1,
                            }}>
                            {item.StoreLocation}
                          </Text>

                          {/* <Text
                            style={{
                              fontSize: 9,
                              fontFamily: 'Poppins-Medium',
                              alignContent: 'center',
                              textAlign: 'left',
                              justifyContent: 'center',
                              color: '#00afb5',
                              marginTop: hp('1%'),
                              marginLeft: wp('1%'),
                              marginRight: wp('2%'),
                              width: wp('74%'),
                              opacity: item.IsStoreClosed == true ? 0.3 : 1,
                            }}>
                            {/* ⏰ {item.Timing || 'Store Hours'} • ₹
                            {item.DeliveryCharges || '0'} 
                          </Text> */}

                          {state.userLocation && (
                            <Text
                              style={{
                                fontSize: 8,
                                fontFamily: 'Poppins-Light',
                                alignContent: 'center',
                                textAlign: 'left',
                                justifyContent: 'center',
                                color: '#232423',
                                fontWeight: 'bold',
                                marginTop: hp('0.5%'),
                                marginLeft: wp('1%'),
                                marginRight: wp('2%'),
                                width: wp('74%'),
                                opacity: item.IsStoreClosed == true ? 0.3 : 1,
                              }}>
                              🚚 Delivery in {item.DeliveryTime || '30 mins'} •{' '}
                              {item.Distance || '0.0'} km away
                            </Text>
                          )}
                        </View>
                      </View>
                      {item.IsStoreClosed == true ? (
                        <Text
                          style={{
                            fontSize: 9,
                            fontFamily: 'Poppins-Medium',
                            alignContent: 'center',
                            textAlign: 'center',
                            justifyContent: 'center',
                            color: '#333',
                            marginTop: hp('1%'),
                          }}>
                          Oops! The shop is closed.
                        </Text>
                      ) : (
                        <></>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              numColumns={1}
            />
          )}
        </View>

        <Text
          onPress={() => {
            navigation.push('Tabs');
          }}
          style={{
            fontSize: 9,
            fontFamily: 'Poppins-Light',
            color: '#333',
            marginTop: hp('1%'),
            marginBottom: hp('3%'),
            textAlign: 'center',
            marginRight: wp('5%'),
            marginLeft: wp('5%'),
          }}>
          We're working to bring more stores closer to you. In the meantime,
          happy shopping!
        </Text>
      </ScrollView>

      <CustomModal
        visible={modalConfig.visible}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onPrimaryPress={modalConfig.onPrimaryPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Store;
