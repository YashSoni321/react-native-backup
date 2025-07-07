import React from 'react';
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
import { Dialog } from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Normalize from './size';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { NavigationEvents } from 'react-navigation';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
var date = moment().format('YYYY/MM/DD ');
var time = moment().format('hh:mm A');
import ImagePicker from 'react-native-image-crop-picker';
import { CustomPicker } from 'react-native-custom-picker';
import { API_KEY, URL_key } from './api';
import axios from 'axios';
var RNFS = require('react-native-fs');
import XLSX from 'xlsx';
import publicIP from 'react-native-public-ip';
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import MenuDrawer from 'react-native-side-drawer';
import RNFetchBlob from 'rn-fetch-blob';
import { image } from './image';
import { marginBottom } from 'styled-system';
import StepIndicator from 'react-native-step-indicator';
import CheckBox from 'react-native-check-box';
class ReturnPo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          <View
            style={{
              backgroundColor: '#ffff',
            }}>
            <Image
              style={{
                //  borderWidth: 1,
                height: hp('12%'),
                width: wp('80%'),
                // borderColor: 'forestgreen',
                // borderRadius: hp('100%'),
                alignSelf: 'center',
                justifyContent: 'center',
                marginTop: hp('2%'),
                // marginBottom: hp('2%'),
                // backgroundColor:"lightgrey"s
                // marginTop: hp('15%'),
                // marginBottom: hp('1%'),
                //   marginLeft:wp('17.5%')
              }}
              resizeMode="contain"
              source={require('../assets/FYBR-Logo.jpg')}
            />
            <Icon
              onPress={() => [this.props.navigation.push('tabp')]}
              name={'chevron-back'}
              color="#333"
              size={35}
              style={{
                marginTop: hp('-8.5%'),
                marginLeft: wp('2%'),
                marginBottom: hp('7%'),
              }}
            />
          </View>
          <View style={{ backgroundColor: '#00afb5' }}>
            <View
              style={{
                backgroundColor: '#ffff',
                width: wp('60%'),
                height: hp('5%'),
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                borderRadius: wp('5%'),
                marginTop: hp('-2.5%'),
                marginBottom: hp('1.5%'),
                borderColor: '#216e66',
                borderWidth: 1,
              }}>
              <Text
                style={{
                  color: '#333',
                  fontSize: 18,
                  fontFamily: 'Poppins-Light',
                  textAlign: 'center',
                  // marginTop: hp('-2%'),
                  // marginBottom: hp('2.5%'),
                  // marginLeft:wp('5%'),marginRight:wp('3%'),
                }}>
                RETURN POLICY
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-SemiBold',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                // marginLeft: wp('2%'),
                // marginRight: wp('1%'),
              }}>
              What is Fybr's return policy? How does it work?
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
              }}>
              We offer refund and/or exchange within the first 30 days of your
              purchase, if 30 days have passed since your purchase, you will not
              be offered a refund and/or exchange of any kind.
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-SemiBold',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
                textDecorationLine: 'underline',
              }}>
              Eligibility for Refunds and Exchanges
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
              }}>
              ➤{'  '}Dot Symbol Your item must be unused and in the same
              condition that you received it.
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
              }}>
              ➤{'  '}Dot Symbol Your item must be unused and in the same
              condition that you received it.
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
              }}>
              ➤{'  '}Dot Symbol Your item must be unused and in the same
              condition that you received it.
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
              }}>
              ➤{'  '}Dot Symbol Your item must be unused and in the same
              condition that you received it.
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-SemiBold',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
                textDecorationLine: 'underline',
              }}>
              Late or missing refunds
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
              }}>
              ✅{'  '}Dot Symbol Your item must be unused and in the same
              condition that you received it.
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
              }}>
              ✅{'  '}Dot Symbol Your item must be unused and in the same
              condition that you received it.
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
              }}>
              ✅{'  '}Dot Symbol Your item must be unused and in the same
              condition that you received it.
            </Text>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'justify',
                //   justifyContent: 'center',
                color: '#ffff',
                fontFamily: 'Poppins-Light',
                marginTop: hp('2%'),
                // marginBottom: hp('-0.5%'),
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                lineHeight: hp('2.5%'),
              }}>
              ✅{'  '}Dot Symbol Your item must be unused and in the same
              condition that you received it.
            </Text>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                // this.RBSheet.close();
                this.props.navigation.push('tabp');
                // this.check();
              }}>
              <LinearGradient
                colors={['#00afb5', '#348db3']}
                style={{
                  marginTop: hp('5%'),
                  paddingTop: hp('0.7%'),
                  paddingBottom: hp('0.7%'),
                  backgroundColor: '#00afb5',
                  borderRadius: wp('3%'),
                  marginLeft: wp('13%'),
                  marginRight: wp('13%'),
                  borderColor: 'white',
                  marginBottom: hp('15%'),
                  borderWidth: 1,
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#ffff',
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 16,
                  }}>
                  {' '}
                  BACK TO PROFILE{' '}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
const Separator = () => <View style={styles.separator} />;
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 0.5,
    marginTop: hp('2%'),
    width: wp('100%'),
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReturnPo;
