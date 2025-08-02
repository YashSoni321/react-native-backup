import React, {useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  ActivityIndicator,
  BackHandler,
  FlatList,
  ImageBackground,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {Switch} from 'react-native-switch';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import ToggleSwitch from 'toggle-switch-react-native';
import {Dialog} from 'react-native-simple-dialogs';
import {CustomPicker} from 'react-native-custom-picker';
import {API_KEY, URL_key} from './api';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import RBSheet from 'react-native-raw-bottom-sheet';
var RNFS = require('react-native-fs');
import {
  notifications,
  messages,
  NotificationMessage,
  Android,
} from 'react-native-firebase-push-notifications';
import Normalize from './size';
import CustomModal from '../shared/CustomModal';

const StoreDetails = ({navigation}) => {
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onPrimaryPress: null,
  });

  const showModal = (title, message, type = 'info', onPrimaryPress = null) => {
    setModalConfig({
      visible: true,
      title,
      message,
      type,
      onPrimaryPress,
    });
  };

  const hideModal = () => {
    setModalConfig(prev => ({...prev, visible: false}));
  };

  const [state, setState] = useState({
    categories11: [
      {
        name: 'Men',
        Icon: 'man',
        nav: 'protab',
      },
      {
        name: 'Women',
        Icon: 'woman',
        nav: 'protab',
      },
      {name: 'Shoes', Icon: 'file-tray-sharp', nav: 'payments'},
      // {name: 'Leads', Icon: 'ios-magnet-outline', nav: 'leads'},

      {
        name: 'Dresses',
        Icon: 'shirt',
        nav: 'Receivables',
      },
    ],
    categories1: [
      {
        name: '24',
        Icon: 'man',
        nav: 'protab',
      },
      {
        name: '26',
        Icon: 'woman',
        nav: 'protab',
      },
      {
        name: '28',
        Icon: 'man',
        nav: 'protab',
      },
      {
        name: '30',
        Icon: 'woman',
        nav: 'protab',
      },
      {name: '32', Icon: 'file-tray-sharp', nav: 'payments'},
      // {name: 'Leads', Icon: 'ios-magnet-outline', nav: 'leads'},

      {
        name: '34',
        Icon: 'shirt',
        nav: 'Receivables',
      },
      {
        name: '36',
        Icon: 'woman',
        nav: 'protab',
      },

      // {
      //   name: 'Wallets',
      //   Icon: 'wallet',
      //   nav: 'Receivables',
      // },
      // {
      //   name: 'Accessories',
      //   Icon: 'color-filter',
      //   nav: 'Receivables',
      // },
    ],
  });
  return (
    <SafeAreaView>
      {/* NavigationEvents removed - not used in this component */}
      <ScrollView>
        <ImageBackground
          style={{width: wp('100%')}}
          activeOpacity={0.5}
          source={require('../assets/output-onlinepngtools.png')}
          resizeMode="cover">
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
              marginBottom: hp('2%'),
              // backgroundColor:"lightgrey"s
              // marginTop: hp('15%'),
              // marginBottom: hp('1%'),
              //   marginLeft:wp('17.5%')
            }}
            resizeMode="contain"
            source={require('../assets/FYBR-Logo-removebg-preview.png')}
          />
          <Icon
            onPress={() => {
              try {
                console.log('🔄 Navigating back to Tabs screen...');
                this.props.navigation.navigate('Tabs');
              } catch (error) {
                console.error('❌ Navigation error:', error);
                showModal(
                  'Navigation Error',
                  'Unable to navigate. Please try again.',
                  'error',
                );
              }
            }}
            name={'chevron-back'}
            color="#333"
            size={35}
            style={{
              marginTop: hp('-11.0%'),
              marginLeft: wp('2%'),
              marginBottom: hp('6%'),
            }}
          />
        </ImageBackground>
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
            borderWidth: 1,
            borderColor: '#00afb5',
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
            ZUDIO
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <View
            style={{
              // justifyContent: 'center',
              // borderWidth: wp('0.2%'),
              borderRadius: wp('10%'),
              // padding: 5,
              height: hp('5.2%'),
              // marginBottom: hp('3%'),
              borderColor: '#f77f77',
              marginTop: hp('1%'),
              backgroundColor: '#ffff',

              width: wp('85%'),
              alignSelf: 'center',
              flexDirection: 'row',
              marginBottom: hp('1%'),
              // paddingLeft: wp('12%'),a
              // alignItems: 'center',
              textAlignVertical: 'top',
              alignSelf: 'center',
              marginLeft: wp('2%'),
            }}>
            {/* <Icon
                name="search-sharp"
                color={'grey'}
                size={24}
                style={{marginTop: hp('-0.2%'), marginLeft: wp('0%')}}
              /> */}
            <TextInput
              placeholder="Search for products in 'Zudio'"
              fontFamily={'Poppins-Light'}
              placeholderTextColor={'grey'}
              color={'black'}
              fontSize={13}
              // maxLength={10}
              // keyboardType={'number-pad'}
              onChangeText={
                value => this.SearchFilterFunction(value)
                // this.handleInputChange('MobileNo', value)
              }
              style={{
                // borderWidth: 1,
                padding: hp('1%'),
                width: wp('65%'),
                marginLeft: wp('3%'),
                // marginLeft: wp('1%'),
              }}
            />
          </View>
          <View
            style={{
              height: hp('5%'),
              width: hp('5%'),
              borderRadius: wp('100%'),
              backgroundColor: '#216e66',
              marginTop: hp('1.1%'),
              marginLeft: wp('-7%'),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon
              style={{}}
              onPress={() => {
                // this.setState({Filter:true})
                // this.RBSheet1.open();
              }}
              // activeOpacity={0.5}

              name="search"
              color={'#ffff'}
              size={25}
            />
          </View>
        </View>
        <Text
          style={{
            fontSize: 15,
            // textAlign: 'center',
            //   justifyContent: 'center',
            color: '#333',
            fontFamily: 'Poppins-SemiBold',
            marginTop: hp('1.5%'),
            marginBottom: hp('-0.5%'),
            marginLeft: wp('5%'),
            marginRight: wp('1%'),
          }}>
          Categories
        </Text>
        <View
          style={{
            marginLeft: wp('2%'),
            marginRight: wp('2%'),
            marginBottom: hp('2%'),
          }}>
          <FlatList
            data={this.state.categories11}
            // horizontal={true}
            renderItem={({item, index}) => {
              return (
                <>
                  <View
                    style={[
                      {
                        width: wp('22%'),
                        alignSelf: 'center',
                        //   elevation: 10,
                        //   shadowColor: '#000',
                        //   shadowOffset: {width: 0, height: 3},
                        //   shadowOpacity: 0.5,
                        //   shadowRadius: 5,

                        backgroundColor: '#00afb5',
                        // borderRadius: wp('3%'),
                        borderRadius: wp('5%'),
                        // borderTopRightRadius: wp('3%'),
                        //   borderBottomRightRadius: wp('3%'),
                        // marginLeft: wp('0.5%'),
                        // justifyContent: 'center',
                        // alignItems: 'center',
                        marginLeft: wp('1%'),
                        marginRight: wp('1%'),
                        marginTop: hp('2%'),
                        // marginBottom: hp('2%'),
                        borderColor: '#00afb5',
                        // height: hp('7%'),
                        alignItems: 'center',
                        justifyContent: 'center',
                        // flexDirection: 'row',
                        // borderWidth: 0.7,
                      },
                    ]}>
                    <Icon
                      name={item.Icon}
                      color="#ffff"
                      size={26}
                      style={{
                        marginTop: hp('1%'),
                        // marginBottom: hp('1%'),
                        // marginLeft: wp('3%'),
                      }}
                    />
                    <Text
                      onPress={() => {
                        Linking.openURL(item.name);
                      }}
                      style={{
                        fontSize: 13,
                        fontFamily: 'Poppins-Light',
                        alignContent: 'center',
                        textAlign: 'center',
                        justifyContent: 'center',
                        color: '#ffff',
                        marginTop: hp('0.5%'),
                        marginBottom: hp('1%'),
                        marginLeft: wp('2%'),
                        marginRight: wp('2%'),
                        // textDecorationLine: 'underline',
                      }}>
                      {item.name}
                    </Text>
                  </View>
                </>
              );
            }}
            numColumns={5}
          />
        </View>
        <View
          style={{
            marginLeft: wp('2%'),
            marginRight: wp('2%'),
            marginBottom: hp('2%'),
          }}>
          <FlatList
            data={this.state.categories11}
            // horizontal={true}
            renderItem={({item, index}) => {
              return (
                <>
                  <View
                    style={[
                      {
                        width: wp('95%'),
                        alignSelf: 'center',
                        //   elevation: 10,
                        //   shadowColor: '#000',
                        //   shadowOffset: {width: 0, height: 3},
                        //   shadowOpacity: 0.5,
                        //   shadowRadius: 5,

                        // backgroundColor: '#ffff',
                        // borderRadius: wp('3%'),
                        borderRadius: wp('3%'),
                        // borderTopRightRadius: wp('3%'),
                        //   borderBottomRightRadius: wp('3%'),
                        // marginLeft: wp('0.5%'),
                        // justifyContent: 'center',
                        // alignItems: 'center',
                        // marginLeft: wp('1%'),
                        // marginRight: wp('1%'),
                        marginTop: hp('2%'),
                        // marginBottom: hp('2%'),
                        borderColor: '#00afb5',
                        // height: hp('7%'),
                        // alignItems: 'center',
                        // justifyContent: 'center',

                        // borderWidth: 0.7,
                      },
                    ]}>
                    <View style={{flexDirection: 'row'}}>
                      <View>
                        <Image
                          style={{
                            width: wp('30%'),
                            height: hp('18%'),
                            resizeMode: 'stretch',
                            // resizeMode: 'stretch',s
                            // borderTopRightRadius: hp('1%'),
                            // borderTopLeftRadius: hp('1%'),
                            // marginTop: hp('2%'),
                            marginLeft: wp('0.5%'),
                            marginRight: wp('0.5%'),
                            borderRadius: wp('5%'),
                            // marginBottom: hp('2%'),
                            // marginLeft: wp('1.5%'),
                          }}
                          // resizeMode="center"
                          source={require('../assets/bb.jpg')}
                        />
                      </View>
                      <View>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-SemiBold',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#00afb5',
                            marginTop: hp('0.5%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('60%'),

                            // textDecorationLine: 'underline',
                          }}>
                          Studiofit
                        </Text>
                        <Icon
                          onPress={() => {
                            this.RBSheet.open();
                          }}
                          name={'cart'}
                          color="#00afb5"
                          size={25}
                          style={{
                            marginBottom: hp('0.5%'),
                            marginLeft: wp('3%'),
                            alignSelf: 'flex-end',
                            marginRight: wp('15%'),
                            marginTop: hp('-3.5%'),
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-Light',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#666',
                            marginTop: hp('0.5%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('74%'),

                            // textDecorationLine: 'underline',
                          }}>
                          Studiofit Dark Brown Dazed Abs
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-SemiBold',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#333',
                            marginTop: hp('1%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('74%'),

                            // textDecorationLine: 'underline',
                          }}>
                          ₹ 399.00
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-Light',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#333',
                            marginTop: hp('1%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('74%'),

                            // textDecorationLine: 'underline',
                          }}>
                          Delivered by 4 hours
                        </Text>

                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Poppins-Light',
                            alignContent: 'center',
                            textAlign: 'left',
                            justifyContent: 'center',
                            color: '#666',
                            marginTop: hp('1%'),

                            marginLeft: wp('3%'),
                            marginRight: wp('2%'),
                            width: wp('74%'),

                            // textDecorationLine: 'underline',
                          }}>
                          Size XS
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Separator />
                </>
              );
            }}
            numColumns={1}
          />
        </View>
        <RBSheet
          ref={ref => {
            this.RBSheet = ref;
          }}
          // closeOnDragDown={true}
          closeOnPressMask={true}
          closeOnPressBack={true}
          height={hp('36%')}
          // openDuration={250}
          customStyles={{
            container: {
              // justifyContent: "center",
              // alignItems: "center"
            },
          }}>
          <ScrollView>
            <View style={{backgroundColor: '#00afb5'}}>
              <TouchableOpacity
                activeOpacity={0.5}
                // style={{position: 'absolute'}}
                onPress={() => this.RBSheet.close()}>
                <Icon
                  name="close-circle-sharp"
                  color={'lightgrey'}
                  size={hp('4%')}
                  style={{
                    marginLeft: wp('7%'),
                    marginTop: hp('1.5%'),
                  }}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  // textAlign: 'center',
                  //   justifyContent: 'center',
                  color: '#ffff',
                  fontFamily: 'Poppins-SemiBold',
                  marginTop: hp('1%'),
                  marginBottom: hp('1%'),
                  marginLeft: wp('8%'),
                  marginRight: wp('1%'),
                }}>
                Select size for Studiofit
              </Text>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: hp('2%'),
                }}>
                <FlatList
                  data={this.state.categories1}
                  // horizontal={true}
                  renderItem={({item, index}) => {
                    return (
                      <>
                        <View
                          style={[
                            {
                              width: wp('12%'),
                              alignSelf: 'center',
                              height: hp('4%'),
                              //   elevation: 10,
                              //   shadowColor: '#000',
                              //   shadowOffset: {width: 0, height: 3},
                              //   shadowOpacity: 0.5,
                              //   shadowRadius: 5,

                              backgroundColor: '#ffff',
                              // borderRadius: wp('3%'),
                              borderRadius: wp('1%'),
                              // borderTopRightRadius: wp('3%'),
                              //   borderBottomRightRadius: wp('3%'),
                              // marginLeft: wp('0.5%'),
                              // justifyContent: 'center',
                              // alignItems: 'center',
                              marginLeft: wp('3%'),
                              marginRight: wp('3%'),
                              marginTop: hp('2%'),
                              marginBottom: hp('2%'),
                              borderColor: '#00afb5',
                              // height: hp('7%'),
                              alignItems: 'center',
                              justifyContent: 'center',
                              // flexDirection: 'row',
                              // borderWidth: 0.7,
                            },
                          ]}>
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: 'Poppins-SemiBold',
                              alignContent: 'center',
                              textAlign: 'center',
                              justifyContent: 'center',
                              color: '#666',

                              // textDecorationLine: 'underline',
                            }}>
                            {item.name}
                          </Text>
                        </View>
                      </>
                    );
                  }}
                  numColumns={5}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  // this.setState({currentPosition: 0});
                  // this.props.navigation.push('signup');
                  this.RBSheet.close();
                }}>
                <LinearGradient
                  colors={['#ffff', '#ffff']}
                  style={{
                    //   marginTop: hp('2%'),s
                    paddingTop: hp('0.7%'),
                    paddingBottom: hp('0.7%'),
                    backgroundColor: '#00afb5',
                    borderRadius: wp('2%'),
                    marginLeft: wp('30%'),
                    marginRight: wp('30%'),
                    borderColor: 'white',
                    marginBottom: hp('5%'),
                    borderWidth: 1,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#00afb5',
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 16,
                    }}>
                    {' '}
                    Done{' '}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </RBSheet>
      </ScrollView>

      <CustomModal
        visible={modalConfig.visible}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onPrimaryPress={modalConfig.onPrimaryPress}
      />
    </SafeAreaView>
  );
};

const Separator = () => <View style={styles.separator} />;
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: 'grey',
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

export default StoreDetails;
