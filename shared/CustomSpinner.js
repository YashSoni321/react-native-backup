import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const CustomSpinner = ({value, onChange}) => {
  const [currentValue, setCurrentValue] = useState(value ?? 0);

  const updateValue = newValue => {
    if (newValue >= 0 && newValue <= 50) {
      setCurrentValue(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => updateValue(currentValue + 1)}
        style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>

      <Text style={styles.value}>{currentValue}</Text>
      <TouchableOpacity
        onPress={() => updateValue(currentValue - 1)}
        style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: wp('3%'),
  },
  button: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 8, // Rounded square
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonPressed: {
    backgroundColor: 'orange',
  },
  buttonText: {
    fontSize: 16,
    // width: 40,
    textAlign: 'center',
    color: 'black',
    paddingHorizontal: 10,
  },
  value: {
    fontSize: 14,
    // width: 40,
    textAlign: 'center',
    color: 'black',
  },
});
