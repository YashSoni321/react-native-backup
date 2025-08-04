import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FormInput,
  Text,
  View,
  Image,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Button,
  Platform,
  PermissionsAndroid,
  ImageBackground,
  BackHandler,
  ActivityIndicator,
  TouchableHighlight,
  DeviceEventEmitter,
  FlatList,
} from 'react-native';
import {Dialog} from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Normalize from '../Size/size';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';
navigator.geolocation = require('@react-native-community/geolocation');
import {useFocusEffect} from '@react-navigation/native';
import {API_KEY, URL_key} from '../Api/api';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {Marker} from 'react-native-maps';
import {UrlTile} from 'react-native-maps';
import GetLocation from 'react-native-get-location';
import publicIP from 'react-native-public-ip';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Geocoder from 'react-native-geocoder-reborn';
import {CustomPicker} from 'react-native-custom-picker';
import RBSheet from 'react-native-raw-bottom-sheet';

const AddAddress = ({navigation}) => {
  // Add error state
  const [error, setError] = useState(null);

  // Check if navigation prop exists
  if (!navigation) {
    console.error('AddAddress: navigation prop is required');
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text
          style={{color: 'red', fontSize: 16, textAlign: 'center', margin: 20}}>
          Navigation prop is missing. Please check your navigation setup.
        </Text>
      </SafeAreaView>
    );
  }

  const [loader, setLoader] = useState(false);
  const [region, setRegion] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [longitudeDelta] = useState(0.0922);
  const [latitudeDelta] = useState(0.0421);
  const [showaddress, setShowaddress] = useState(false);
  const [StateDDl, setStateDDl] = useState([]);
  const [CityDDl, setCityDDl] = useState([]);
  const [StateID, setStateID] = useState(null);
  const [CityID, setCityID] = useState(null);
  const [Address, setAddress] = useState(null);
  const [Addresserror, setAddresserror] = useState(false);
  const [Country, setCountry] = useState(null);
  const [Countryerror, setCountryerror] = useState(false);
  const [Pincode, setPincode] = useState(null);
  const [Pincodeerror, setPincodeerror] = useState(false);
  const [Locality, setLocality] = useState(null);
  const [Localityerror, setLocalityerror] = useState(false);
  const [StreetName, setStreetName] = useState(null);
  const [StreetNameerror, setStreetNameerror] = useState(false);
  const [AdminArea, setAdminArea] = useState(null);
  const [AdminAreaerror, setAdminAreaerror] = useState(false);
  const [StreetNumber, setStreetNumber] = useState(null);
  const [StreetNumbererror, setStreetNumbererror] = useState(false);
  const [addressesss, setAddressesss] = useState([
    {name: 'Home', Icon: 'home', ischeck: true},
    {name: 'Work', Icon: 'business', ischeck: false},
    {name: 'Other', Icon: 'location-sharp', ischeck: false},
  ]);
  const [AddressCategory, setAddressCategory] = useState('Home');
  const [Direction, setDirection] = useState(null);
  const [fail, setFail] = useState(false);
  const [publicIPState, setPublicIP] = useState(null);
  const [loca, setLoca] = useState(null);

  const RBSheetRef = useRef(null);

  const handleBackButtonClick = () => {
    BackHandler.exitApp();
    return true;
  };

  const handleInputChange = (inputName, inputValue) => {
    switch (inputName) {
      case 'StreetNumber':
        setStreetNumber(inputValue);
        break;
      case 'StreetName':
        setStreetName(inputValue);
        break;
      case 'Direction':
        setDirection(inputValue);
        break;
      default:
        break;
    }
  };

  const renderOption = settings => {
    const {item, getLabel} = settings;
    return (
      <View style={styles.optionContainer}>
        <Text
          style={{
            color: 'black',
            marginLeft: wp('3%'),
            fontSize: Normalize(12),
            fontFamily: 'NexaLight',
            marginTop: hp('1%'),
            marginRight: wp('1%'),
            textAlign: 'left',
          }}>
          {getLabel(item)}
        </Text>
      </View>
    );
  };

  const renderField = settings => {
    const {selectedItem, defaultText, getLabel, clear} = settings;
    return (
      <View style={styles.container1}>
        <View>
          {!selectedItem && (
            <Text
              style={[
                styles.text,
                {
                  fontSize: Normalize(12),
                  fontFamily: 'WorkSans-Regular',
                  textAlign: 'left',
                  borderRadius: 20,
                  color: '#666',
                  paddingTop: -4,
                  marginLeft: wp('3%'),
                },
              ]}>
              {defaultText}
            </Text>
          )}
          {selectedItem && (
            <View style={styles.innerContainer}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: Normalize(12),
                    fontFamily: 'WorkSans-Regular',
                    textAlign: 'left',
                    borderRadius: 20,
                    color: '#333',
                    paddingLeft: 2,
                    paddingTop: 2,
                    marginLeft: wp('3%'),
                    flexWrap: 'wrap',
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {getLabel(selectedItem)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  useEffect(() => {
    // Add error boundary
    const handleError = error => {
      console.error('AddAddress Error:', error);
      setError(error.message);
    };

    try {
      // Fetch state data
      axios
        .get(URL_key + 'api/AddressApi/gStateDDL', {
          headers: {
            'content-type': `application/json`,
          },
        })
        .then(response => {
          setStateDDl(response.data);
        })
        .catch(err => {
          console.log(err);
          handleError(err);
        });

      // Request location permissions
      const requestLocationPermission = async () => {
        try {
          const result = await request(
            Platform.OS === 'ios'
              ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
              : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          );

          if (result === RESULTS.GRANTED) {
            console.log('Location permission granted');
          } else {
            console.log('Location permission denied');
          }
        } catch (error) {
          console.log('Permission request error:', error);
          handleError(error);
        }
      };

      requestLocationPermission();

      // Get public IP
      publicIP()
        .then(ip => {
          console.log(ip);
          setPublicIP(ip);
        })
        .catch(error => {
          console.log(error);
          handleError(error);
        });

      // Get current location
      GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
      })
        .then(location => {
          console.log(location);
          var pos = {
            lat: location.latitude,
            lng: location.longitude,
          };

          Geocoder.geocodePosition(pos)
            .then(res => {
              setAddress(res[0].formattedAddress);
              setAdminArea(res[0].adminArea);
              setCountry(res[0].country);
              setLocality(res[0].locality);
              setPincode(res[0].postalCode);
              setStreetName(res[0].streetName);
              setStreetNumber(res[0].streetNumber);
              console.log(res[0]);
            })
            .catch(error => {
              console.log(error);
              handleError(error);
            });

          setLoca(location);
          setLatitude(location.latitude);
          setLongitude(location.longitude);
        })
        .catch(error => {
          const {code, message} = error;
          console.warn(code, message);
          handleError(error);
        });

      // Add back handler
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

      // Cleanup
      return () => {
        BackHandler.removeEventListener(
          'hardwareBackPress',
          handleBackButtonClick,
        );
      };
    } catch (error) {
      handleError(error);
    }
  }, []);

  const handleAddressSelection = index => {
    const updatedData = addressesss.map((item, i) => ({
      ...item,
      ischeck: i === index,
    }));
    const selectedItem = updatedData.find(item => item.ischeck);
    console.log('Selected Item Name:', selectedItem.name);
    setAddressesss(updatedData);
    setAddressCategory(selectedItem.name);
  };

  const handleSaveAddress = async () => {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      const FullName = await AsyncStorage.getItem('FullName');

      if (!StreetName) {
        setStreetNameerror(true);
        return;
      } else if (!StreetNumber) {
        setStreetNumbererror(true);
        return;
      }

      const addressData = {
        AddressID: 0,
        UserProfileID: UserProfileID,
        Latitude: latitude,
        Longitude: longitude,
        IPAddress: publicIPState,
        Pincode: Pincode,
        StreetName: StreetName,
        StreetNumber: StreetNumber,
        CompleteAddress: Address,
        StateID: StateID,
        CityID: CityID,
        IsPreferred: 1,
        SystemUser: FullName,
        Direction: Direction,
        AddressCategory: AddressCategory,
      };

      console.log('addressData', addressData);

      const response = await axios.post(
        URL_key + 'api/AddressApi/sCustomerAddress',
        addressData,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );

      console.log(response.data);
      console.log(response.status);

      if (response.data === 'INSERTED') {
        setShowaddress(false);
        navigation.navigate('Tab');
      } else {
        setFail(true);
      }
    } catch (err) {
      console.log(err);
      setFail(true);
    }
  };

  // Show error screen if there's an error
  if (error) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text
          style={{color: 'red', fontSize: 16, textAlign: 'center', margin: 20}}>
          Something went wrong: {error}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#00afb5',
            padding: 15,
            borderRadius: 10,
            marginTop: 20,
          }}
          onPress={() => setError(null)}>
          <Text style={{color: 'white'}}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (latitude === null && longitude === null) {
    return (
      <SafeAreaView>
        <View
          style={{
            height: hp('4%'),
            width: hp('4%'),
            backgroundColor: '#ffff',
            position: 'absolute',
            top: hp('2%'),
            left: wp('8%'),
            borderRadius: wp('100%'),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.5}
            name="arrow-back-sharp"
            color={'grey'}
            size={hp('2.5%')}
          />
        </View>
        <View style={{marginTop: hp('40%'), marginBottom: hp('20%')}}>
          <ActivityIndicator size="large" color="black" />
          <Text
            style={{
              textAlign: 'center',
              color: '#333',
              fontFamily: 'WorkSans-SemiBold',
              fontSize: Normalize(14),
              marginTop: hp('1.2%'),
            }}>
            Loading ! Please Wait
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={{backgroundColor: 'white'}}>
      <SafeAreaView>
        <Dialog
          visible={fail}
          dialogStyle={{
            borderRadius: wp('5%'),
            width: wp('80%'),
            alignSelf: 'center',
          }}
          onTouchOutside={() => console.log('no')}>
          <View
            style={{
              alignItems: 'center',
              marginTop: hp('2%'),
              marginBottom: hp('0.5%'),
            }}>
            <Image
              style={{
                height: hp('6%'),
                width: hp('6%'),
                borderRadius: hp('100%'),
                alignSelf: 'center',
                justifyContent: 'center',
              }}
              resizeMode="contain"
              source={require('../Images/1024px-Cross_red_circle.svg-removebg-preview.png')}
            />
          </View>
          <Text
            style={{
              color: 'red',
              fontSize: 15,
              fontFamily: 'Poppins-Light',
              textAlign: 'center',
              marginTop: hp('2%'),
              marginBottom: hp('1%'),
              lineHeight: hp('2.5%'),
            }}>
            Error !! Please Try Again.
          </Text>
          <TouchableOpacity
            style={styles.SubmitButtonStyledd}
            activeOpacity={0.5}
            onPress={() => {
              setFail(false);
              navigation.navigate('Signup');
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
              }}>
              {' '}
              OK{' '}
            </Text>
          </TouchableOpacity>
        </Dialog>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta,
          }}>
          <UrlTile
            urlTemplate={'http://c.tile.openstreetmap.org/{z}/{x}/{y}.png'}
            maximumZ={5}
            flipY={false}
          />
          <Marker
            coordinate={{
              latitude: latitude,
              longitude: longitude,
            }}
            title={'My Location'}
          />
        </MapView>

        <View
          style={{
            height: hp('4%'),
            width: hp('4%'),
            backgroundColor: '#ffff',
            position: 'absolute',
            top: hp('2%'),
            left: wp('8%'),
            borderRadius: wp('100%'),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.5}
            name="arrow-back-sharp"
            color={'grey'}
            size={hp('2.5%')}
          />
        </View>

        <Text
          style={{
            color: 'gray',
            fontSize: 11,
            fontFamily: 'Poppins-SemiBold',
            marginTop: hp('2%'),
            marginBottom: hp('1%'),
            marginLeft: wp('7%'),
          }}>
          SELECT DELIVERY LOCATION
        </Text>

        <View style={{flexDirection: 'row', marginLeft: wp('5%')}}>
          <Icon
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.5}
            name="location"
            color={'grey'}
            size={hp('3%')}
          />
          <Text
            style={{
              color: '#333',
              fontSize: 13,
              fontFamily: 'Poppins-Bold',
              marginTop: hp('0.2%'),
              marginBottom: hp('1%'),
              marginLeft: wp('3%'),
            }}>
            {Locality}
          </Text>
        </View>

        <Text
          style={{
            color: '#333',
            fontSize: 11,
            fontFamily: 'Poppins-SemiBold',
            marginTop: hp('0.3%'),
            marginBottom: hp('1%'),
            marginLeft: wp('7%'),
            width: wp('70%'),
          }}>
          {Address}
        </Text>

        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            RBSheetRef.current?.open();
          }}>
          <View
            style={{
              backgroundColor: '#00afb5',
              width: wp('80%'),
              height: hp('5%'),
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              borderRadius: wp('2%'),
              marginTop: hp('2%'),
              marginBottom: hp('1.5%'),
              borderColor: '#216e66',
            }}>
            <Text
              style={{
                color: '#ffff',
                fontSize: 13,
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
              }}>
              CONFIRM LOCATION
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            RBSheetRef.current?.open();
          }}>
          <View
            style={{
              backgroundColor: '#f2f4f4',
              width: wp('18%'),
              height: hp('2.5%'),
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'flex-end',
              borderRadius: wp('1%'),
              marginTop: hp('-18.7%'),
              marginBottom: hp('1.5%'),
              borderColor: '#216e66',
              marginRight: wp('5%'),
            }}>
            <Text
              style={{
                color: '#00afb5',
                fontSize: 10,
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
                marginTop: hp('0.1%'),
              }}>
              CHANGE
            </Text>
          </View>
        </TouchableOpacity>

        <RBSheet
          ref={RBSheetRef}
          closeOnPressMask={true}
          closeOnPressBack={true}
          height={hp('100%')}
          customStyles={{
            container: {},
          }}>
          <ScrollView>
            <Icon
              style={{
                marginTop: hp('2%'),
                marginLeft: wp('5%'),
              }}
              onPress={() => {
                RBSheetRef.current?.close();
              }}
              activeOpacity={0.5}
              name="close-circle-outline"
              color={'grey'}
              size={hp('3%')}
            />

            <View
              style={{
                flexDirection: 'row',
                marginLeft: wp('5%'),
                marginTop: hp('2%'),
              }}>
              <Icon
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.5}
                name="location"
                color={'grey'}
                size={hp('3%')}
              />
              <Text
                style={{
                  color: '#333',
                  fontSize: 13,
                  fontFamily: 'Poppins-Bold',
                  marginTop: hp('0.2%'),
                  marginBottom: hp('1%'),
                  marginLeft: wp('3%'),
                }}>
                {Locality}
              </Text>
            </View>

            <Text
              style={{
                color: '#333',
                fontSize: 11,
                fontFamily: 'Poppins-SemiBold',
                marginTop: hp('0.3%'),
                marginBottom: hp('1%'),
                marginLeft: wp('7%'),
                width: wp('70%'),
              }}>
              {Address}
            </Text>

            <View
              style={{
                width: wp('90%'),
                borderRadius: wp('1%'),
                backgroundColor: '#fefaf2',
                alignSelf: 'center',
                borderWidth: 1,
                borderColor: '#c2ad89',
                marginTop: hp('1%'),
                marginBottom: hp('1%'),
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: '#c2ad89',
                  fontSize: 11,
                  fontFamily: 'Poppins-SemiBold',
                  marginTop: hp('1%'),
                  marginBottom: hp('1%'),
                  marginLeft: wp('3%'),
                  marginRight: wp('3%'),
                }}>
                A detailed address will help our Delivery Partner reach your
                doorstep easily
              </Text>
            </View>

            <Text
              style={{
                color: 'gray',
                fontSize: 12,
                fontFamily: 'Poppins-Light',
                marginTop: hp('3%'),
                marginBottom: hp('-1%'),
                marginLeft: wp('9%'),
              }}>
              HOUSE / FLAT / BLOCK NO.
            </Text>

            <TextInput
              color={'#333'}
              fontFamily={'Poppins-Light'}
              placeholderTextColor={'#666'}
              fontSize={Normalize(10)}
              maxLength={200}
              value={StreetNumber}
              onChangeText={value => handleInputChange('StreetNumber', value)}
              style={{
                height: hp('4.5%'),
                shadowColor: 'white',
                shadowRadius: 0,
                width: wp('85%'),
                marginLeft: wp('8%'),
                borderBottomWidth: 1,
                borderColor: 'grey',
                marginTop: hp('1%'),
                marginBottom: hp('1%'),
                justifyContent: 'center',
                padding: hp('0.7%'),
              }}
            />

            {StreetNumbererror && (
              <Text style={styles.errorMessage}>
                * Please enter street number.
              </Text>
            )}

            <TextInput
              color={'#333'}
              fontFamily={'Poppins-Light'}
              placeholderTextColor={'#666'}
              fontSize={Normalize(10)}
              maxLength={200}
              placeholder="APARTMENT / ROAD / AREA"
              value={StreetName}
              onChangeText={value => handleInputChange('StreetName', value)}
              style={{
                height: hp('4.5%'),
                shadowColor: 'white',
                shadowRadius: 0,
                width: wp('85%'),
                marginLeft: wp('8%'),
                borderBottomWidth: 1,
                borderColor: 'grey',
                marginTop: hp('3%'),
                marginBottom: hp('1%'),
                justifyContent: 'center',
                padding: hp('0.7%'),
              }}
            />

            {StreetNameerror && (
              <Text style={styles.errorMessage}>
                * Please enter street name.
              </Text>
            )}

            <Text
              style={{
                color: 'gray',
                fontSize: 12,
                fontFamily: 'Poppins-Light',
                marginTop: hp('3%'),
                marginBottom: hp('-1%'),
                marginLeft: wp('9%'),
              }}>
              DIRECTIONS TO REACH (OPTIONAL)
            </Text>

            <TextInput
              color={'#333'}
              fontFamily={'Poppins-Light'}
              placeholderTextColor={'#666'}
              fontSize={Normalize(11)}
              maxLength={200}
              placeholder="e.g. Ring the bell on the red gate"
              onChangeText={value => handleInputChange('Direction', value)}
              style={{
                height: hp('15%'),
                shadowColor: 'white',
                shadowRadius: 0,
                width: wp('85%'),
                marginLeft: wp('8%'),
                borderRadius: wp('1.5%'),
                borderWidth: 1,
                borderColor: 'grey',
                marginTop: hp('2%'),
                marginBottom: hp('1%'),
                justifyContent: 'center',
                padding: hp('0.7%'),
                paddingHorizontal: wp('5%'),
                textAlignVertical: 'top',
              }}
            />

            <Text
              style={{
                color: 'gray',
                fontSize: 12,
                fontFamily: 'Poppins-Light',
                marginTop: hp('3%'),
                marginLeft: wp('9%'),
              }}>
              SAVE THIS ADDRESS AS
            </Text>

            <View
              style={{
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                marginTop: hp('3%'),
              }}>
              <FlatList
                data={addressesss}
                horizontal={true}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    onPress={() => {
                      if (!item.ischeck) {
                        handleAddressSelection(index);
                      }
                    }}>
                    <View
                      style={{
                        width: wp('26%'),
                        height: hp('5%'),
                        backgroundColor: item.ischeck ? '#297801' : '#f2f4f4',
                        borderRadius: wp('5%'),
                        flexDirection: 'row',
                        marginLeft: wp('2%'),
                        marginRight: wp('2%'),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Icon
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.5}
                        name={item.Icon}
                        color={item.ischeck ? '#ffff' : '#333'}
                        size={hp('2.5%')}
                      />
                      <Text
                        style={{
                          color: item.ischeck ? '#ffff' : '#333',
                          fontSize: 12,
                          fontFamily: 'Poppins-SemiBold',
                          marginTop: hp('0.2%'),
                          marginLeft: wp('2%'),
                        }}>
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>

            <TouchableOpacity activeOpacity={0.5} onPress={handleSaveAddress}>
              <View
                style={{
                  backgroundColor: '#00afb5',
                  width: wp('80%'),
                  height: hp('5%'),
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  borderRadius: wp('2%'),
                  marginTop: hp('5%'),
                  marginBottom: hp('1.5%'),
                  borderColor: '#216e66',
                }}>
                <Text
                  style={{
                    color: '#ffff',
                    fontSize: 13,
                    fontFamily: 'Poppins-SemiBold',
                    textAlign: 'center',
                  }}>
                  SAVE AND PROCEED
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </RBSheet>
      </SafeAreaView>
    </ScrollView>
  );
};

const Separator = () => <View style={styles.separator} />;
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: '#333',
    borderBottomWidth: 0.7,
    marginTop: hp('0.5%'),
    width: wp('70%'),
    alignSelf: 'center',
  },
  SubmitButtonStyle: {
    marginTop: hp('5%'),
    paddingTop: hp('0.5%'),
    paddingBottom: hp('0.5%'),
    backgroundColor: '#9f8054',
    borderRadius: wp('10%'),
    marginLeft: wp('20%'),
    marginRight: wp('20%'),
    borderColor: 'white',

    borderWidth: 1,
  },
  linearGradient: {
    flex: 1,
    // paddingLeft: 15,
    // paddingRight: 15,
    // borderRadius: 5,
    height: hp('90%'),
    // width: hp('60%'),
    // borderRadius: wp('20'),
    marginTop: hp('-25%'),
    // width: wp('110%'),
    borderRadius: wp('20%'),
    // marginLeft: wp('-14%'),
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  errorMessage: {
    fontSize: Normalize(11),
    color: 'red',
    // textAlign: 'center',
    marginTop: hp('3.5%'),
    fontFamily: 'Poppins-Light',
    marginLeft: wp('8%'),
    // marginBottom: hp('1%'),
  },
  SubmitButtonStyledd: {
    paddingTop: hp('0.5%'),
    paddingBottom: hp('0.5%'),
    backgroundColor: 'red',
    borderRadius: wp('5%'),
    width: wp('25%'),
    alignSelf: 'center',
    marginTop: hp('2%'),
    // marginLeft: wp('3%'),
    marginBottom: hp('3%'),
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontal: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('50%'),
  },
  separator1: {
    borderBottomColor: '#00afb5',
    borderBottomWidth: 0.5,
    marginBottom: hp('2%'),
    marginTop: hp('1%'),
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  text: {
    fontSize: 18,
  },
  headerFooterContainer: {
    padding: 10,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: 'grey',
    borderRadius: 5,
    marginRight: 10,
    padding: 5,
  },
  optionContainer: {
    padding: 10,
    borderBottomColor: '#00afb5',
    borderBottomWidth: 1,
  },
  optionInnerContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  box: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  itemSeparatorStyle: {
    height: 1,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#D3D3D3',
  },
  map: {
    flex: 1,
    height: hp('70%'),
    width: wp('100%'),
    alignSelf: 'center',
    marginTop: hp('0%'),
    borderRadius: wp('5%'),
  },
  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddAddress;
