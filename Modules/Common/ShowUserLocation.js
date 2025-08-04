import React, {useEffect, useState} from 'react';
import {TouchableOpacity, Text, ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {URL_key} from '../Api/api';

const AddressSelector = ({navigation, onPress}) => {
  const [userAddress, setUserAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchUserAddress = async () => {
    try {
      const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
      console.log('IN AddressSelector UserProfileID:', UserProfileID);

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
            color: '#ff0000',
            fontSize: 11,
            fontFamily: 'Poppins-Medium',
            marginTop: hp('5%'),
            marginLeft: wp('10%'),
          }}>
          Failed to load address. Tap to retry.
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={{marginLeft: wp('2')}}
      onPress={onPress ? onPress : () => navigation.push('AddAddress')}>
      <Text
        style={{
          color: '#333',
          fontSize: 11,
          fontFamily: 'Poppins-Medium',
          //   marginTop: hp('5%'),
          //   marginLeft: wp('1%'),
        }}>
        Delivering to{' >'}
      </Text>

      {userAddress?.AddressCategory && (
        <Text
          style={{
            color: '#00afb5',
            fontSize: 12,
            fontFamily: 'Poppins-SemiBold',
            // marginLeft: wp('10.5%'),
          }}>
          {userAddress.AddressCategory}
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

export default AddressSelector;
