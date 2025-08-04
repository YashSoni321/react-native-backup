import React, {useEffect, useState} from 'react';
import {TouchableOpacity, Text, ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {URL_key} from '../Api/api';

const CheckoutAddress = ({navigation, onPress}) => {
  const [userAddress, setUserAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchUserAddress = async () => {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      console.log('IN CheckoutAddress UserProfileID:', UserProfileID);

      const addressResponse = await axios.get(
        URL_key +
          'api/AddressApi/gCustomerAddress?UserProfileID=' +
          UserProfileID,
        {
          headers: {
            'content-type': `application/json`,
          },
        },
      );
      console.log('🏠 AddressResponse:', addressResponse.data[0]);
      if (addressResponse && addressResponse.data[0]) {
        setUserAddress(addressResponse.data[0]);
      }

      console.log('🏠 AddressResponse:', addressResponse.data[0]);
    } catch (err) {
      console.error('❌ Error fetching address:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAddress();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="small"
        color="#00afb5"
        style={{marginTop: hp('5%')}}
      />
    );
  }

  if (error) {
    return (
      <TouchableOpacity
        onPress={onPress ? onPress : () => navigation.push('AddAddress')}>
        <Text
          style={{
            color: '#3366ff',
            fontSize: 11,
            fontFamily: 'Poppins-Medium',
            // marginTop: hp('5%'),
            // textAlign: 'left',
            marginLeft: wp('3%'),
          }}>
          Didn't find any address.{"\n"}Please click here to add an address.
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={{marginLeft: wp('2')}}
      onPress={onPress ? onPress : () => navigation.push('AddAddress')}>

      {userAddress?.AddressCategory && (
        <Text
          style={{
            color: '#000000',
            fontWeight: 'bold',
            fontSize: 12,
            fontFamily: 'Poppins-SemiBold',
            // marginLeft: wp('10.5%'),
          }}>
          {userAddress.AddressCategory}
        </Text>
      )}
   {userAddress?.StreetNumber && (
        <Text
          style={{
            color: 'black',
            fontSize: 11,
            fontFamily: 'Poppins-SemiBold',
            // marginLeft: wp('10.5%'),
          }}>
      {userAddress?.StreetNumber ?? ""}
        </Text>
      )}
      {userAddress?.StreetName && (
        <Text
          style={{
            color: 'black',
            fontSize: 11,
            fontFamily: 'Poppins-SemiBold',
            // marginLeft: wp('10.5%'),
          }}>
          {userAddress.StreetName}
        </Text>
      )}
    
    </TouchableOpacity>
  );
};

export default CheckoutAddress;
