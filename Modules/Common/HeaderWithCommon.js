import React from 'react';
import {View, Text, ImageBackground, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AddressSelector from './ShowUserLocation';
import HeaderImage from '../Images/output-onlinepngtools1.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const HeaderWithAddress = ({
  navigation,
  showbackGroundImage = true,
  handleBackPress,
  showBackButton = true,
  showFybrText = true,
  fybrText = 'fybr',
  isCheckoutPage = false,
  navigateToHome = false,
}) => {
  return !showbackGroundImage ? (
    <></>
  ) : (
    <ImageBackground
      source={HeaderImage}
      style={{
        width: wp('100%'),
        height: hp('15%'),
        paddingHorizontal: wp('5%'),
        paddingTop: hp('3%'),
        paddingBottom: hp('1%'),
        justifyContent: 'space-between',
      }}
      resizeMode="cover">
      {/* Top Row: Back Button & Fybr Text */}

      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between', // <-- Important!
          alignItems: 'center',
          paddingHorizontal: wp('4%'),
          paddingVertical: hp('1%'),
        }}>
        {/* Left Section: Back Button + Address Selector */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {showBackButton ? (
            navigateToHome ? (
              <TouchableOpacity onPress={() => navigation.push('Tab')}>
                <Icon name="chevron-back" size={32} color="#00afb5" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleBackPress}>
                <Icon name="chevron-back" size={32} color="#00afb5" />
              </TouchableOpacity>
            )
          ) : (
            <View style={{width: 32}} />
          )}

          {/* Address Selector */}
          <AddressSelector
            navigation={navigation}
            isCheckoutPage={isCheckoutPage}
          />
        </View>

        {/* Right Section: Fybr Text */}
        {showFybrText && (
          <Text
            style={{
              fontSize: 48,
              fontWeight: '600',
              color: '#00afb5',
              marginLeft: wp('-22%'),
              fontFamily: 'RedHatDisplay-SemiBold',
            }}>
            {fybrText}
          </Text>
        )}
      </View>

      {/* Address Selector at Bottom */}
    </ImageBackground>
  );
};

export default HeaderWithAddress;
