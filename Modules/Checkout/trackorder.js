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
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, AnimatedRegion } from 'react-native-maps';

class Add extends React.Component {
    render() {
        return (<SafeAreaView>
            <ScrollView>
                <ImageBackground
                    style={{ width: wp('100%') }}
                    activeOpacity={0.5}
                    source={require('../Images/output-onlinepngtools1.png')}
                    resizeMode="cover">
                    <Icon
                        name="chevron-back"
                        color={'#00afb5'}
                        size={40}
                        style={{ marginLeft: wp('1%'), padding: hp('1%'), marginTop: hp('5%'), }}
                    />

                    <Text
                        style={{
                            fontSize: 45,
                            textAlign: "center",
                            //   justifyContent: 'center',
                            color: '#00afb5',
                            fontFamily: 'RedHatDisplay-Bold',
                            marginTop: hp('-9%'),
                            marginBottom: hp('2%'),
                            // marginRight: wp('20%'),
                            // marginRight: wp('5%'),
                        }}>
                        fybr
                    </Text>
                </ImageBackground>
                <Text
                    style={{
                        fontSize: 14,
                        // textAlign: "center",
                        //   justifyContent: 'center',
                        color: '#333',
                        fontFamily: 'Poppins-SemiBold',
                        marginTop: hp('3%'),
                        // marginBottom: hp('2%'),
                        marginLeft: wp('10%'),
                        // marginRight: wp('10%'),
                    }}>
                    Track your order
                </Text>
                <MapView
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    style={{ height: hp('20%'), width: wp('80%'), alignSelf: "center", marginTop: hp('2%') }}
                >
                    <Marker coordinate={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                    }} title="Start Point" />
                </MapView>
                <Text
                    style={{
                        color: '#333',
                        fontSize: 12,
                        fontFamily: 'Poppins-Light',
                        // textAlign: 'center',
                        marginTop: hp('2%'),
                        // marginBottom: hp('1%'),
                        marginLeft: wp('10%'),
                    }}>
                    Estimated Arrival
                </Text>
                <Text
                    style={{
                        color: '#333',
                        fontSize: 14,
                        fontFamily: 'Poppins-SemiBold',
                        // textAlign: 'center',
                        marginTop: hp('1%'),
                        // marginBottom: hp('1%'),
                        marginLeft: wp('10%'),
                    }}>
                    6 Minutes
                </Text>
                <Text
                    style={{
                        color: '#333',
                        fontSize: 12,
                        fontFamily: 'Poppins-Light',
                        // textAlign: 'center',
                        marginTop: hp('1%'),
                        // marginBottom: hp('1%'),
                        marginLeft: wp('10%'),
                    }}>
                    Order is out for delivery
                </Text>
                <Text
                    style={{
                        color: '#333',
                        fontSize: 14,
                        fontFamily: 'Poppins-SemiBold',
                        // textAlign: 'center',
                        marginTop: hp('4%'),
                        // marginBottom: hp('1%'),
                        marginLeft: wp('10%'),
                    }}>
                    Noman
                </Text>
                <Text
                    style={{
                        color: '#333',
                        fontSize: 11,
                        fontFamily: 'Poppins-Light',
                        // textAlign: 'center',
                        marginTop: hp('1%'),
                        // marginBottom: hp('1%'),
                        marginLeft: wp('10%'),
                    }}>
                    is your delivery partner
                </Text>
                <Text
                    style={{
                        color: '#333',
                        fontSize: 12,
                        fontFamily: 'Poppins-Light',
                        // textAlign: 'center',
                        marginTop: hp('1%'),
                        // marginBottom: hp('1%'),
                        marginLeft: wp('10%'),
                    }}>
                    Contact
                </Text>

                <Icon name="person-circle" color={"#00afb5"} size={hp('12%')} style={{

                    alignSelf: "flex-end",
                    // position: 'absolute',
                    marginTop: hp('-10.5%'), marginRight: wp('8%')
                }} />
                <Text
                    style={{
                        color: '#333',
                        fontSize: 11,
                        fontFamily: 'Poppins-Light',
                        textAlign: 'center',
                        marginTop: hp('10%'),
                        // marginBottom: hp('1%'),
                        marginLeft: wp('5%'), marginRight: wp('5%'),
                    }}>
                    Check your registered phone number for updates!
                </Text>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                        this.props.navigation.push("tab")
                    }}>
                    <View
                        style={{
                            backgroundColor: '#00afb5',
                            width: wp('80%'),
                            height: hp('5%'),
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            borderRadius: wp('2%'),
                            marginTop: hp('10%'),
                            marginBottom: hp('1.5%'),
                            borderColor: '#216e66',
                            // borderWidth: 1,
                        }}>
                        <Text
                            style={{
                                color: '#ffff',
                                fontSize: 13,
                                fontFamily: 'Poppins-SemiBold',
                                textAlign: 'center',
                                // marginTop: hp('-2%'),
                                // marginBottom: hp('2.5%'),
                                // marginLeft:wp('5%'),marginRight:wp('3%'),
                            }}>
                            Continue
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>);
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