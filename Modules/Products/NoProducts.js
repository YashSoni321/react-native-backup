import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const NoProducts = ({onGoBack}) => {
  return (
    <View style={styles.container}>
      {/* Placeholder for no results - you can replace this with an actual no results image */}
      <View style={styles.noResultsPlaceholder}>
        <Text style={styles.searchIcon}>🔍</Text>
      </View>
      <Text style={styles.noResultsTitle}>No Products Found</Text>
      <Text style={styles.noResultsSubtitle}>
        No products found for your store. Please select another store for
        shopping.
      </Text>
      <TouchableOpacity
        style={styles.clearButton}
        activeOpacity={0.7}
        onPress={onGoBack}>
        <Text style={styles.clearButtonText}>Change Store</Text>
      </TouchableOpacity>
      <Text style={styles.suggestionsText}>
        Suggestions: Explore stores near you or search by store name
      </Text>
    </View>
  );
};

export default NoProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
    marginTop: hp('6%'),
    marginBottom: hp('8%'),
  },
  clearButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  noResultsPlaceholder: {
    width: wp('40%'),
    height: hp('20%'),
    marginBottom: hp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: wp('5%'),
    borderWidth: 2,
    borderColor: '#e8e8e8',
    borderStyle: 'dashed',
  },
  searchIcon: {
    fontSize: 50,
    opacity: 0.4,
  },
  noResultsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  noResultsSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Light',
    color: '#666',
    textAlign: 'center',
    lineHeight: hp('2%'),
    marginBottom: hp('3%'),
  },
  clearButton: {
    backgroundColor: '#00afb5',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  suggestionsText: {
    fontSize: 9,
    fontFamily: 'Poppins-Light',
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
