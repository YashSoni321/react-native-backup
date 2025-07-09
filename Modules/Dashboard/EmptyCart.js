import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const EmptyCart = ({navigation}) => {
  const handleShopNow = () => {
    navigation.push('Tabs');
  };

  return (
    <View style={styles.container}>
      {/* Placeholder for empty cart - you can replace this with an actual empty cart image */}
      <View style={styles.emptyCartPlaceholder}>
        <Text style={styles.cartIcon}>🛒</Text>
      </View>
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Looks like you haven't added anything yet! Start shopping to fill your
        cart.
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        activeOpacity={0.7}
        onPress={handleShopNow}>
        <Text style={styles.shopButtonText}>Browse Stores</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
    marginTop: hp('10%'),
  },
  emptyCartPlaceholder: {
    width: wp('50%'),
    height: hp('25%'),
    marginBottom: hp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: wp('5%'),
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  cartIcon: {
    fontSize: 60,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    color: '#666',
    textAlign: 'center',
    lineHeight: hp('2.2%'),
    marginBottom: hp('4%'),
  },
  shopButton: {
    backgroundColor: '#00afb5',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('2%'),
    marginBottom: hp('2%'),
  },
  shopButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textAlign: 'center',
  },
});

export default EmptyCart;
