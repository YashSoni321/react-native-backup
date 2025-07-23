import React from 'react';
import {View, Text} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const SummaryRow = ({
  label,
  value,
  isFree = false,
  valueColor,
  labelStyle,
  valueStyle,
}) => {
  const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp('1%'),
      }}>
      <Text
        style={[
          {
            fontSize: 12,
            color: '#333',
            fontFamily: 'Poppins-Light',
          },
          labelStyle,
        ]}>
        {label}
      </Text>
      <Text
        style={[
          {
            fontSize: 12,
            color: valueColor || (isFree ? '#2ecc71' : '#333'),
            fontFamily: 'Poppins-Light',
          },
          valueStyle,
        ]}>
        {isFree ? 'Free' : `₹ ${formattedValue}`}
        {isFree && value > 0 && ` (₹ ${formattedValue})`}
      </Text>
    </View>
  );
};
