import React, {useEffect, useRef} from 'react';
import {View, Text, Animated, Easing, StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const FybrLoadingSpinner = ({isVisible = false, size = 'small'}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Start spinning animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      // Scale in animation
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      // Scale out animation
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Reset spin value
      spinValue.setValue(0);
    }
  }, [isVisible, spinValue, scaleValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isVisible) {
    return null;
  }

  const spinnerSize = size === 'small' ? 20 : size === 'medium' ? 30 : 40;
  const textSize = size === 'small' ? 8 : size === 'medium' ? 10 : 12;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{scale: scaleValue}],
        },
      ]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            transform: [{rotate: spin}],
          },
        ]}>
        <View
          style={[
            styles.spinnerInner,
            {width: spinnerSize, height: spinnerSize},
          ]}
        />
      </Animated.View>
      <Text style={[styles.text, {fontSize: textSize}]}>fybr</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  spinner: {
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: '#00afb5',
    borderRightColor: '#00afb5',
  },
  spinnerInner: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomColor: '#02b008',
    borderLeftColor: '#02b008',
  },
  text: {
    color: '#00afb5',
    fontFamily: 'RedHatDisplay-SemiBold',
    marginTop: 3,
    textAlign: 'center',
  },
});

export default FybrLoadingSpinner;
