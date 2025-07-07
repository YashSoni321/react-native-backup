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
    Linking,
} from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Normalize from '../Size/size';
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
import CheckBox from 'react-native-check-box';

class Add extends React.Component {
    render() {
        return (<SafeAreaView>
            <ScrollView>
                <View style={{ backgroundColor: "#ffff", height: hp('100%'), width: wp('100%') }}>


                    <Icon
                        onPress={() => {
                            this.props.navigation.push("tabp")
                        }}
                        name="chevron-back"
                        color={'#00afb5'}
                        size={40}
                        style={{ marginLeft: wp('1%'), padding: hp('1%'), marginTop: hp('5%'), }}
                    />
                    <Text
                        style={{
                            color: '#00afb5',
                            fontSize: 14,
                            fontFamily: 'Poppins-SemiBold',
                            // textAlign: 'center',
                            // marginTop: hp('4%'),
                            // marginBottom: hp('1%'),
                            marginLeft: wp('17%'), marginTop: hp('-5.2%'),
                        }}>
                        Invite your friends to shop on Fybr
                    </Text>
                    <Image
                        style={{
                            width: wp('80%'),
                            height: hp('22%'),
                            resizeMode: 'stretch',
                            // resizeMode: 'stretch',s
                            // borderTopRightRadius: hp('1%'),
                            // borderTopLeftRadius: hp('1%'),
                            marginTop: hp('13%'),
                            marginLeft: wp('3%'),
                            marginRight: wp('3%'), alignSelf: "center"
                            // borderRadius: wp('5%'),
                            // marginBottom: hp('2%'),
                            // marginLeft: wp('1.5%'),
                        }}
                        // resizeMode="center"
                        source={require('../Images/Invite.jpg')}
                    />
                    <Text
                        style={{
                            fontSize: 10,
                            textAlign: "center",
                            //   justifyContent: 'center',
                            color: '#333',
                            fontFamily: 'Poppins-Light',
                            marginTop: hp('2%'),
                            marginBottom: hp('2%'),
                            marginLeft: wp('10%'),
                            marginRight: wp('10%'),
                        }}>
                        <Text
                            style={{
                                fontSize: 10,
                                textAlign: "center",
                                //   justifyContent: 'center',
                                color: '#333',
                                fontFamily: 'Poppins-Light',
                                marginTop: hp('2%'),
                                marginBottom: hp('2%'),
                                marginLeft: wp('10%'),
                                marginRight: wp('10%'),
                            }}>
                            When your friends sign up using the referral code, they get {' '}
                        </Text>
                        <Text
                            style={{
                                fontSize: 10,
                                textAlign: "center",
                                //   justifyContent: 'center',
                                color: '#00afb5',
                                fontFamily: 'Poppins-Medium',
                                marginTop: hp('2%'),
                                marginBottom: hp('2%'),
                                marginLeft: wp('10%'),
                                marginRight: wp('10%'),
                            }}>
                            10% {' '}
                        </Text>
                        <Text
                            style={{
                                fontSize: 10,
                                textAlign: "center",
                                //   justifyContent: 'center',
                                color: '#333',
                                fontFamily: 'Poppins-Light',
                                marginTop: hp('2%'),
                                marginBottom: hp('2%'),
                                marginLeft: wp('10%'),
                                marginRight: wp('10%'),
                            }}>
                            and you get {' '}
                        </Text>
                        <Text
                            style={{
                                fontSize: 10,
                                textAlign: "center",
                                //   justifyContent: 'center',
                                color: '#00afb5',
                                fontFamily: 'Poppins-Medium',
                                marginTop: hp('2%'),
                                marginBottom: hp('2%'),
                                marginLeft: wp('10%'),
                                marginRight: wp('10%'),
                            }}>
                            20% off{' '}
                        </Text>
                        <Text
                            style={{
                                fontSize: 10,
                                textAlign: "center",
                                //   justifyContent: 'center',
                                color: '#333',
                                fontFamily: 'Poppins-Light',
                                marginTop: hp('2%'),
                                marginBottom: hp('2%'),
                                marginLeft: wp('10%'),
                                marginRight: wp('10%'),
                            }}>
                            on orders above {' '}
                        </Text>
                        <Text
                            style={{
                                fontSize: 10,
                                textAlign: "center",
                                //   justifyContent: 'center',
                                color: '#00afb5',
                                fontFamily: 'Poppins-Medium',
                                marginTop: hp('2%'),
                                marginBottom: hp('2%'),
                                marginLeft: wp('10%'),
                                marginRight: wp('10%'),
                            }}>
                            ₹ 800
                        </Text>
                    </Text>
                    <Text
                        style={{
                            fontSize: 10,
                            textAlign: "center",
                            //   justifyContent: 'center',
                            color: 'grey',
                            fontFamily: 'Poppins-Medium',
                            marginTop: hp('5%'),
                            // marginBottom: hp('2%'),
                            // marginLeft: wp('10%'),
                            // marginRight: wp('10%'),
                        }}>
                        Send invite with referral code!
                    </Text>
                    <View
                        style={{
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderRadius: wp('1.5%'),
                            // padding: 5,
                            height: hp('5.2%'),
                            // marginBottom: hp('3%'),
                            borderColor: '#00afb5',
                            marginTop: hp('1%'),
                            backgroundColor: '#ffff',

                            width: wp('65%'),
                            alignSelf: 'center',
                            // flexDirection: 'row',
                            marginBottom: hp('1%'),
                            // paddingLeft: wp('12%'),a
                            alignItems: 'center',
                            textAlignVertical: 'top',
                            // marginLeft: wp('7%'),
                        }}>
                        <Text
                            style={{
                                fontSize: 12,
                                textAlign: "center",
                                //   justifyContent: 'center',
                                color: '#00afb5',
                                fontFamily: 'Poppins-SemiBold',
                                // marginTop: hp('2%'),
                                // marginBottom: hp('2%'),
                                // marginLeft: wp('10%'),
                                // marginRight: wp('10%'),
                            }}>
                            2705mlp
                        </Text>
                    </View>
                    <View
                        style={{
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderRadius: wp('1.5%'),
                            // padding: 5,
                            height: hp('5.2%'),
                            // marginBottom: hp('3%'),
                            borderColor: '#00afb5',
                            marginTop: hp('1%'),
                            backgroundColor: '#00afb5',

                            width: wp('65%'),
                            alignSelf: 'center',
                            // flexDirection: 'row',
                            marginBottom: hp('1%'),
                            // paddingLeft: wp('12%'),a
                            alignItems: 'center',
                            textAlignVertical: 'top',
                            // marginLeft: wp('7%'),
                        }}>
                        <Text
                            style={{
                                fontSize: 12,
                                textAlign: "center",
                                //   justifyContent: 'center',
                                color: '#ffff',
                                fontFamily: 'Poppins-SemiBold',
                                // marginTop: hp('2%'),
                                // marginBottom: hp('2%'),
                                // marginLeft: wp('10%'),
                                // marginRight: wp('10%'),
                            }}>
                            Send Invite
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Add;