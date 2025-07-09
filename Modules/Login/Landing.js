import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  Image,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {request, PERMISSIONS, check, RESULTS} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
class Landing extends React.Component {
  async componentDidMount() {
    const value = await AsyncStorage.getItem('isLogin');
    console.log(value);
    if (value !== null && value == 'true') {
      this.props.navigation.push('Tab');
    }
    // Remove the else clause that was causing navigation to self
  }
  getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        console.log('Location:', position);
      },
      error => {
        console.log('Location Error:', error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };
  async enavlr() {
    try {
      await AsyncStorage.setItem('Notifi', 'true');
      console.log('Notification permission saved');
    } catch (error) {
      console.error('Error saving notification permission:', error);
    }
  }
  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          <View style={{backgroundColor: '#ffffff'}}>
            <Text
              style={{
                fontSize: 40,
                // textAlign: 'center',
                //   justifyContent: 'center',
                color: '#00afb5',
                fontFamily: 'RedHatDisplay-SemiBold',
                marginTop: hp('5%'),
                // marginBottom: hp('2%'),
                marginLeft: wp('10%'),
                // marginRight: wp('1%'),
              }}>
              fybr
            </Text>
            <Text
              style={{
                fontSize: 21,
                textAlign: 'center',
                //   justifyContent: 'center',
                color: '#00afb5',
                fontFamily: 'Poppins-SemiBold',
                marginTop: hp('13%'),
                marginBottom: hp('1%'),
                // marginLeft: wp('10%'),
                // marginRight: wp('1%'),
              }}>
              Welcome to Fybr!
            </Text>
            <Image
              style={{
                width: wp('90%'),
                height: hp('25%'),
                resizeMode: 'stretch',
                // resizeMode: 'stretch',s
                // borderTopRightRadius: hp('1%'),
                // borderTopLeftRadius: hp('1%'),
                // marginTop: hp('12%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                borderRadius: wp('5%'),
                // marginBottom: hp('2%'),
                // marginLeft: wp('1.5%'),
              }}
              // resizeMode="center"
              source={require('../Images/Landing.jpg')}
            />
            <Text
              style={{
                fontSize: 9,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#333',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                marginBottom: hp('2%'),
                marginLeft: wp('10%'),
                marginRight: wp('10%'),
              }}>
              Shop your favorite styles and get them delivered instantly from
              local stores to your doorstep Fashion, delivered fast!
            </Text>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                try {
                  const Notifi = await AsyncStorage.getItem('Notifi');
                  const loca = await AsyncStorage.getItem('loca');
                  console.log('Notification permission:', Notifi);
                  console.log('Location permission:', loca);

                  // Check if both permissions are already granted
                  if (Notifi === 'true' && loca === 'true') {
                    this.props.navigation.push('Login');
                    return;
                  }

                  // Request location permission
                  let locationPermission =
                    Platform.OS === 'ios'
                      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

                  const locationResult = await request(locationPermission);

                  if (locationResult === RESULTS.GRANTED) {
                    await AsyncStorage.setItem('loca', 'true');
                    console.log('Location permission granted');

                    // If notification permission is also granted, navigate to Login
                    if (Notifi === 'true') {
                      this.props.navigation.push('Login');
                    } else {
                      // Request notification permission on Android
                      if (Platform.OS === 'android') {
                        Alert.alert(
                          'Allow Notifications',
                          'Fybr app needs permission to send notifications.',
                          [
                            {text: 'Cancel', style: 'cancel'},
                            {
                              text: 'Allow',
                              onPress: async () => {
                                await this.enavlr();
                                this.props.navigation.push('Login');
                              },
                            },
                          ],
                        );
                      } else {
                        // On iOS, just navigate to Login
                        this.props.navigation.push('Login');
                      }
                    }
                  } else {
                    Alert.alert(
                      'Permission Denied',
                      'Location permission is required for the app to function properly!',
                    );
                  }
                } catch (error) {
                  console.error('Error in Landing navigation:', error);
                  Alert.alert(
                    'Error',
                    'Something went wrong. Please try again.',
                  );
                }
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
                  marginTop: hp('15%'),
                  marginBottom: hp('1.5%'),
                  borderColor: '#216e66',
                  // borderWidth: 1,
                }}>
                <Text
                  style={{
                    color: '#ffff',
                    fontSize: 11,
                    fontFamily: 'Poppins-Medium',
                    textAlign: 'center',
                    // marginTop: hp('-2%'),
                    // marginBottom: hp('2.5%'),
                    // marginLeft:wp('5%'),marginRight:wp('3%'),
                  }}>
                  Continue
                </Text>
              </View>
            </TouchableOpacity>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                marginBottom: hp('9%'),
                paddingHorizontal: wp('8%'),
              }}>
              <Text
                style={{
                  fontSize: 8,
                  textAlign: 'center',
                  color: '#333',
                  fontFamily: 'Poppins-Light',
                }}>
                By registering you agree to our{' '}
                <Text
                  onPress={() => {
                    this.props.navigation.push('Terms', {
                      data: {
                        Data: 'Landing',
                        otp: '102111',
                      },
                    });
                  }}
                  style={{
                    textDecorationLine: 'underline',
                    color: '#333',
                  }}>
                  Terms
                </Text>{' '}
                and{' '}
                <Text
                  onPress={() => {
                    this.props.navigation.push('Terms', {
                      data: {
                        Data: 'Landing',
                        otp: '102111',
                      },
                    });
                  }}
                  style={{
                    textDecorationLine: 'underline',
                    color: '#333',
                  }}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default Landing;
