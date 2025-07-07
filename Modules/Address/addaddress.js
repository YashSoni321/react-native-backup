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
    DeviceEventEmitter, FlatList
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
import axios from 'axios';
navigator.geolocation = require('@react-native-community/geolocation');
import { NavigationEvents } from 'react-navigation';
import { API_KEY, URL_key } from '../Api/api';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { UrlTile } from 'react-native-maps';
import GetLocation from 'react-native-get-location';
import publicIP from 'react-native-public-ip';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geocoder from 'react-native-geocoder-reborn';
import { CustomPicker } from 'react-native-custom-picker';
import RBSheet from 'react-native-raw-bottom-sheet';
class AddAddress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            loader: false,
            region: '',
            latitude: null,
            longitude: null,
            longitudeDelta: 0.0922,
            latitudeDelta: 0.0421, showaddress: false,
            StateDDl: [], CityDDl: [], StateID: null, CityID: null,
            Address: null, Addresserror: false,
            Country: null, Countryerror: false,
            Pincode: null, Pincodeerror: false,
            Locality: null, Localityerror: false,
            StreetName: null, StreetNameerror: false,
            AdminArea: null, AdminAreaerror: false,
            StreetNumber: null, StreetNumbererror: false,
            addressesss: [{ name: "Home", Icon: "home", ischeck: true }, { name: "Work", Icon: "business", ischeck: false }, { name: "Other", Icon: "location-sharp", ischeck: false },],
            AddressCategory: "Home", Direction: null
        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    async componentDidMount() {
        axios
            .get(URL_key + 'api/AddressApi/gStateDDL', {
                headers: {
                    'content-type': `application/json`,
                },
            })
            .then(response => {
                this.setState({ StateDDl: response.data })
                // console.log(response.data)
            })
            .catch(err => {
                console.log(err);

            });
        const result = await request(
            Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        );

        if (result === RESULTS.GRANTED) {
            console.log('Location permission granted');
        } else {
            console.log('Location permission denied');
        }
        publicIP()
            .then(ip => {
                console.log(ip);
                this.setState({ publicIP: ip });
                // '47.122.71.234'
            })
            .catch(error => {
                console.log(error);
                // 'Unable to get IP address.'
            });
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            // timeout: 15000,
        })
            .then(location => {
                console.log(location);
                var pos = {
                    lat: location.latitude,
                    lng: location.longitude
                };
                Geocoder.geocodePosition(pos).then(res => {
                    this.setState({
                        Address: res[0].formattedAddress,
                        AdminArea: res[0].adminArea,
                        Country: res[0].country,
                        Locality: res[0].locality,
                        Pincode: res[0].postalCode,
                        StreetName: res[0].streetName,
                        StreetNumber: res[0].streetNumber,

                    });
                    console.log(res[0])
                    // alert(res[0].formattedAddress);
                })
                    .catch(error => {

                        console.log(error)
                    });
                // this.setState({
                //   loca: location,
                //   latitude: location.latitude,
                //   longitude: location.longitude,
                // });

                this.setState({
                    loca: location,
                    latitude: location.latitude,
                    longitude: location.longitude,
                });

            })
            .catch(error => {
                const { code, message } = error;
                console.warn(code, message);
            });
    }

    componentWillMount() {
        BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick,
        );
    }

    componentWillUnmount() {
        BackHandler.removeEventListener(
            'hardwareBackPress',
            this.handleBackButtonClick,
        );
    }
    handleBackButtonClick() {


        BackHandler.exitApp();
        return true;
    }
    renderOption(settings) {
        const { item, getLabel } = settings;
        const element = (data, index) => (
            <TouchableOpacity onPress={() => this.props.navigation.push('Login')}>
                <View style={styles.btn}>
                    <Text style={styles.btnText}>button</Text>
                </View>
            </TouchableOpacity>
        );
        // console.log(item)
        return (
            <View style={styles.optionContainer}>
                <Text
                    style={{
                        color: 'black',
                        // alignSelf: 'center',
                        marginLeft: wp('3%'),
                        fontSize: Normalize(12),
                        fontFamily: 'NexaLight',
                        marginTop: hp('1%'),
                        marginRight: wp('1%'),
                        textAlign: 'left',
                    }}>
                    {getLabel(item)}
                </Text>
            </View>
        );
    }
    selectedValue(index, item) {
        this.setState({ selectedText: item.name });
    }
    handleInputChange = (inputName, inputValue) => {
        this.setState(state => ({ ...state, [inputName]: inputValue }));
        // if (inputName == 'UserName') {
        //   this.setState({EmailError: true});
        // } else if (inputName == 'Password') {
        //   this.setState({PasswordError: true});
        // } else {
        //   this.setState({EmailError: false});
        //   this.setState({PasswordError: false});
        // }
    };
    renderField(settings) {
        const { selectedItem, defaultText, getLabel, clear } = settings;
        return (
            <View style={styles.container1}>
                <View>
                    {!selectedItem && (
                        <Text
                            style={[
                                styles.text,
                                {
                                    fontSize: Normalize(12),
                                    fontFamily: 'WorkSans-Regular',

                                    textAlign: 'left',

                                    borderRadius: 20,
                                    color: '#666',

                                    // paddingLeft: 10,
                                    paddingTop: -4,
                                    marginLeft: wp('3%'),
                                    // width: wp('30%'),
                                },
                            ]}>
                            {defaultText}
                        </Text>
                    )}
                    {selectedItem && (
                        <View style={styles.innerContainer}>
                            <Text
                                style={[
                                    styles.text,
                                    {
                                        fontSize: Normalize(12),
                                        fontFamily: 'WorkSans-Regular',

                                        textAlign: 'left',

                                        borderRadius: 20,
                                        color: '#333',

                                        paddingLeft: 2,
                                        paddingTop: 2,
                                        marginLeft: wp('3%'),
                                        // width: wp('25%'),
                                        flexWrap: 'wrap',
                                    },
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="tail">
                                {getLabel(selectedItem)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    render() {
        return (
            <ScrollView>
                <SafeAreaView>
                    <NavigationEvents
                        onWillFocus={this._onFocus}
                        onWillBlur={this._onBlurr}
                    />

                    <Dialog
                        visible={this.state.fail}
                        dialogStyle={{
                            borderRadius: wp('5%'),
                            width: wp('80%'),
                            alignSelf: 'center',
                        }}
                        onTouchOutside={() => console.log('no')}>
                        <View
                            style={{
                                alignItems: 'center',
                                marginTop: hp('2%'),
                                marginBottom: hp('0.5%'),
                            }}>
                            <Image
                                style={{
                                    //  borderWidth: 1,
                                    height: hp('6%'),
                                    width: hp('6%'),
                                    // borderColor: 'forestgreen',
                                    borderRadius: hp('100%'),
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    // marginTop: hp('-1%'),
                                    // marginBottom: hp('1%'),
                                }}
                                resizeMode="contain"
                                source={require('../Images/1024px-Cross_red_circle.svg-removebg-preview.png')}
                            />
                        </View>
                        <Text
                            style={{
                                color: 'red',
                                fontSize: 15,
                                fontFamily: 'Poppins-Light',
                                textAlign: 'center',
                                marginTop: hp('2%'),
                                marginBottom: hp('1%'),
                                lineHeight: hp('2.5%'),
                            }}>
                            Error !! Please Try Again.
                        </Text>
                        <TouchableOpacity
                            style={styles.SubmitButtonStyledd}
                            activeOpacity={0.5}
                            onPress={() => {
                                this.setState({ fail: false }, () => {
                                    // this.props.navigation.push('signup');
                                });
                            }}>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: 'white',
                                    fontFamily: 'Poppins-SemiBold',
                                    fontSize: 16,
                                }}>
                                {' '}
                                OK{' '}
                            </Text>
                        </TouchableOpacity>
                    </Dialog>


                    {this.state.latitude == null && this.state.longitude == null ? <>
                        <View style={{ height: hp('4%'), width: hp('4%'), backgroundColor: "#ffff", position: "absolute", top: hp('2%'), left: wp('8%'), borderRadius: wp('100%'), alignItems: "center", justifyContent: "center" }}>
                            <Icon
                                style={
                                    {
                                        // width: wp('10%'),
                                        // marginRight: hp('2%'),
                                        // marginTop: hp('5%'),
                                        // marginLeft: wp('5%'),
                                        // paddingLeft: wp('-4%'),
                                        // position: "absolute", top: hp('1%'), left: wp('5%')
                                    }
                                }
                                onPress={() => {
                                    this.props.navigation.push("Login")
                                }}
                                activeOpacity={0.5}
                                name="arrow-back-sharp"
                                color={'grey'}
                                size={hp('2.5%')}
                            />
                        </View>
                        <View style={{ marginTop: hp('40%'), marginBottom: hp('20%') }}>
                            {/* <ActivityIndicator /> */}
                            <ActivityIndicator size="large" color="black" />
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: '#333',
                                    fontFamily: 'WorkSans-SemiBold',
                                    fontSize: Normalize(14),
                                    // marginRight: wp('28%'),
                                    marginTop: hp('1.2%'),
                                    // marginLeft: wp('5%'),
                                }}>
                                Loading ! Please Wait
                            </Text>
                        </View>
                    </> : <>

                        <MapView
                            style={{ flex: 1, height: hp('70%'), width: wp('100%'), alignSelf: "center", marginTop: hp('0%'), borderRadius: wp('5%') }}
                            region={{
                                latitude: this.state.latitude,
                                longitude: this.state.longitude,
                                latitudeDelta: this.state.latitudeDelta,
                                longitudeDelta: this.state.longitudeDelta,
                            }}
                            loadingEnabled
                            //   minZoomLevel={3}
                            //   maxZoomLevel={10}
                            showsIndoors={false}
                            showsTraffic={false}
                            showsBuildings={false}
                            showsScale={true}
                            showsUserLocation
                            provider={PROVIDER_GOOGLE}
                            onPress={e => {
                                this.setState({
                                    latitude: e.nativeEvent.coordinate.latitude,
                                    longitude: e.nativeEvent.coordinate.longitude,
                                });
                                console.log(e.nativeEvent.coordinate);
                            }}

                        // onRegionChange={(e) => {
                        //     this.setState({latitude:e.latitude,longitude:e.longitude,latitudeDelta:e.latitudeDelta,longitudeDelta:e.longitudeDelta})
                        //     console.log(e)
                        // }}
                        >
                            <UrlTile

                                urlTemplate={'http://c.tile.openstreetmap.org/{z}/{x}/{y}.png'}

                                maximumZ={5}

                                flipY={false}
                            />
                            <Marker
                                draggable
                                coordinate={{
                                    latitude: this.state.latitude,
                                    longitude: this.state.longitude,
                                }}
                                onDrag={e => console.log(e)}
                            //   image={{uri: 'custom_pin'}}
                            />
                        </MapView>
                        <View style={{ height: hp('4%'), width: hp('4%'), backgroundColor: "#ffff", position: "absolute", top: hp('2%'), left: wp('8%'), borderRadius: wp('100%'), alignItems: "center", justifyContent: "center" }}>
                            <Icon
                                style={
                                    {
                                        // width: wp('10%'),
                                        // marginRight: hp('2%'),
                                        // marginTop: hp('5%'),
                                        // marginLeft: wp('5%'),
                                        // paddingLeft: wp('-4%'),
                                        // position: "absolute", top: hp('1%'), left: wp('5%')
                                    }
                                }
                                onPress={() => {
                                    this.props.navigation.push("Login")
                                }}
                                activeOpacity={0.5}
                                name="arrow-back-sharp"
                                color={'grey'}
                                size={hp('2.5%')}
                            />
                        </View>
                        <Text
                            style={{
                                color: 'gray',
                                fontSize: 11,
                                fontFamily: 'Poppins-SemiBold',
                                // textAlign: 'center',
                                marginTop: hp('2%'),
                                marginBottom: hp('1%'), marginLeft: wp('7%')
                                // lineHeight: hp('2.5%'),
                            }}>
                            SELECT DELIVERY LOCATION
                        </Text>
                        <View style={{ flexDirection: "row", marginLeft: wp('5%') }}>
                            <Icon
                                style={
                                    {
                                        // width: wp('10%'),
                                        // marginRight: hp('2%'),
                                        // marginTop: hp('5%'),
                                        // marginLeft: wp('5%'),
                                        // paddingLeft: wp('-4%'),
                                        // position: "absolute", top: hp('1%'), left: wp('5%')
                                    }
                                }
                                onPress={() => {
                                    this.props.navigation.push("Login")
                                }}
                                activeOpacity={0.5}
                                name="location"
                                color={'grey'}
                                size={hp('3%')}
                            />
                            <Text
                                style={{
                                    color: '#333',
                                    fontSize: 13,
                                    fontFamily: 'Poppins-Bold',
                                    // textAlign: 'center',
                                    marginTop: hp('0.2%'),
                                    marginBottom: hp('1%'), marginLeft: wp('3%')
                                    // lineHeight: hp('2.5%'),
                                }}>
                                {this.state.Locality}
                            </Text>
                        </View>
                        <Text
                            style={{
                                color: '#333',
                                fontSize: 11,
                                fontFamily: 'Poppins-SemiBold',
                                // textAlign: 'center',
                                marginTop: hp('0.3%'),
                                marginBottom: hp('1%'), marginLeft: wp('7%'), width: wp('70%')
                                // lineHeight: hp('2.5%'),
                            }}>
                            {this.state.Address}
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={async () => {
                                this.RBSheet.open()
                                // this.setState({ showaddress: true })
                                // this.props.navigation.push("tab")
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
                                    marginTop: hp('2%'),
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
                                    CONFIRM LOCATION
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={() => {
                                this.RBSheet.open()
                                // this.setState({ showaddress: true })
                                // this.props.navigation.push("tab")
                            }}>
                            <View
                                style={{
                                    backgroundColor: '#f2f4f4',
                                    width: wp('18%'),
                                    height: hp('2.5%'),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    alignSelf: "flex-end",
                                    borderRadius: wp('1%'),
                                    marginTop: hp('-18.7%'),
                                    marginBottom: hp('1.5%'),
                                    borderColor: '#216e66', marginRight: wp('5%')
                                    // borderWidth: 1,
                                }}>
                                <Text
                                    onPress={() => {
                                        this.RBSheet.open()
                                        // this.setState({ showaddress: true })
                                        // this.props.navigation.push("tab")
                                    }}
                                    style={{
                                        color: '#00afb5',
                                        fontSize: 10,
                                        fontFamily: 'Poppins-SemiBold',
                                        textAlign: 'center',
                                        marginTop: hp('0.1%'),
                                        // marginBottom: hp('2.5%'),
                                        // marginLeft:wp('5%'),marginRight:wp('3%'),
                                    }}>
                                    CHANGE
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </>}

                    <RBSheet
                        ref={ref => {
                            this.RBSheet = ref;
                        }}
                        // closeOnDragDown={true}
                        closeOnPressMask={true}
                        closeOnPressBack={true}
                        height={hp('100%')}
                        // openDuration={250}
                        customStyles={{
                            container: {
                                // justifyContent: "center",
                                // alignItems: "center"
                            },
                        }}>
                        <ScrollView>
                            <Icon
                                style={
                                    {
                                        // width: wp('10%'),
                                        // marginRight: hp('2%'),
                                        marginTop: hp('2%'),
                                        marginLeft: wp('5%'),
                                        // paddingLeft: wp('-4%'),
                                        // position: "absolute", top: hp('1%'), left: wp('5%')
                                    }
                                }
                                onPress={() => {
                                    this.RBSheet.close()
                                }}
                                activeOpacity={0.5}
                                name="close-circle-outline"
                                color={'grey'}
                                size={hp('3%')}
                            />
                            <View style={{ flexDirection: "row", marginLeft: wp('5%'), marginTop: hp('2%') }}>
                                <Icon
                                    style={
                                        {
                                            // width: wp('10%'),
                                            // marginRight: hp('2%'),
                                            // marginTop: hp('5%'),
                                            // marginLeft: wp('5%'),
                                            // paddingLeft: wp('-4%'),
                                            // position: "absolute", top: hp('1%'), left: wp('5%')
                                        }
                                    }
                                    onPress={() => {
                                        this.props.navigation.push("Login")
                                    }}
                                    activeOpacity={0.5}
                                    name="location"
                                    color={'grey'}
                                    size={hp('3%')}
                                />
                                <Text
                                    style={{
                                        color: '#333',
                                        fontSize: 13,
                                        fontFamily: 'Poppins-Bold',
                                        // textAlign: 'center',
                                        marginTop: hp('0.2%'),
                                        marginBottom: hp('1%'), marginLeft: wp('3%')
                                        // lineHeight: hp('2.5%'),
                                    }}>
                                    {this.state.Locality}
                                </Text>
                            </View>
                            <Text
                                style={{
                                    color: '#333',
                                    fontSize: 11,
                                    fontFamily: 'Poppins-SemiBold',
                                    // textAlign: 'center',
                                    marginTop: hp('0.3%'),
                                    marginBottom: hp('1%'), marginLeft: wp('7%'), width: wp('70%')
                                    // lineHeight: hp('2.5%'),
                                }}>
                                {this.state.Address}
                            </Text>
                            <View style={{
                                width: wp('90%'), borderRadius: wp('1%'), backgroundColor: "#fefaf2", alignSelf: "center",
                                borderWidth: 1, borderColor: "#c2ad89", marginTop: hp('1%'), marginBottom: hp('1%'), justifyContent: "center",
                            }}>
                                <Text
                                    style={{
                                        color: '#c2ad89',
                                        fontSize: 11,
                                        fontFamily: 'Poppins-SemiBold',
                                        // textAlign: 'center',
                                        marginTop: hp('1%'),
                                        marginBottom: hp('1%'), marginLeft: wp('3%'), marginRight: wp('3%'),
                                        // lineHeight: hp('2.5%'),
                                    }}>
                                    A detailed address will help our Delivery Partner reach your doorstep easily
                                </Text>
                            </View>
                            <Text
                                style={{
                                    color: 'gray',
                                    fontSize: 12,
                                    fontFamily: 'Poppins-Light',
                                    // textAlign: 'center',
                                    marginTop: hp('3%'),
                                    marginBottom: hp('-1%'), marginLeft: wp('9%')
                                    // lineHeight: hp('2.5%'),
                                }}>
                                HOUSE / FLAT / BLOCK NO.
                            </Text>
                            <TextInput
                                color={'#333'}
                                fontFamily={'Poppins-Light'}
                                placeholderTextColor={'#666'}
                                fontSize={Normalize(10)}
                                maxLength={200}
                                // keyboardType={"number-pad"}
                                // secureTextEntry={true}
                                // secureTextEntry={this.state.hidePassword1}
                                // placeholder="Enter the Number"
                                value={this.state.StreetNumber}
                                onChangeText={value =>
                                    this.handleInputChange('StreetNumber', value)
                                }
                                style={{
                                    height: hp('4.5%'),
                                    shadowColor: 'white',
                                    shadowRadius: 0,
                                    width: wp('85%'),
                                    marginLeft: wp('8%'),
                                    // marginRight: wp('4%'),
                                    // borderRadius: wp('3%'),

                                    borderBottomWidth: 1,
                                    borderColor: 'grey',

                                    marginTop: hp('1%'),

                                    marginBottom: hp('1%'),

                                    justifyContent: 'center',
                                    padding: hp('0.7%'),
                                    // paddingHorizontal: wp('5%'),
                                    // paddingTop: hp('1%'),
                                }}
                            />
                            {this.state.StreetNumbererror == true ? (
                                <Text style={styles.errorMessage}>
                                    * Please enter street number.
                                </Text>
                            ) : null}
                            <TextInput
                                color={'#333'}
                                fontFamily={'Poppins-Light'}
                                placeholderTextColor={'#666'}
                                fontSize={Normalize(10)}
                                maxLength={200}
                                // keyboardType={"number-pad"}
                                // secureTextEntry={true}
                                // secureTextEntry={this.state.hidePassword1}
                                placeholder="APARTMENT / ROAD / AREA"
                                value={this.state.StreetName}
                                onChangeText={value =>
                                    this.handleInputChange('StreetName', value)
                                }
                                style={{
                                    height: hp('4.5%'),
                                    shadowColor: 'white',
                                    shadowRadius: 0,
                                    width: wp('85%'),
                                    marginLeft: wp('8%'),
                                    // marginRight: wp('4%'),
                                    // borderRadius: wp('3%'),

                                    borderBottomWidth: 1,
                                    borderColor: 'grey',

                                    marginTop: hp('3%'),

                                    marginBottom: hp('1%'),

                                    justifyContent: 'center',
                                    padding: hp('0.7%'),
                                    // paddingHorizontal: wp('5%'),
                                    // paddingTop: hp('1%'),
                                }}
                            />
                            {this.state.StreetNameerror == true ? (
                                <Text style={styles.errorMessage}>
                                    * Please enter street name.
                                </Text>
                            ) : null}
                            <Text
                                style={{
                                    color: 'gray',
                                    fontSize: 12,
                                    fontFamily: 'Poppins-Light',
                                    // textAlign: 'center',
                                    marginTop: hp('3%'),
                                    marginBottom: hp('-1%'), marginLeft: wp('9%')
                                    // lineHeight: hp('2.5%'),
                                }}>
                                DIRECTIONS TO REACH (OPTIONAL)
                            </Text>
                            <TextInput
                                color={'#333'}
                                fontFamily={'Poppins-Light'}
                                placeholderTextColor={'#666'}
                                fontSize={Normalize(11)}
                                maxLength={200}
                                // keyboardType={"number-pad"}
                                // secureTextEntry={true}
                                // secureTextEntry={this.state.hidePassword1}
                                placeholder="e.g. Ring the bell on the red gate"
                                // value={this.state.StreetNumber}
                                onChangeText={value =>
                                    this.handleInputChange('Direction', value)
                                }
                                style={{
                                    height: hp('15%'),
                                    shadowColor: 'white',
                                    shadowRadius: 0,
                                    width: wp('85%'),
                                    marginLeft: wp('8%'),
                                    // marginRight: wp('4%'),
                                    borderRadius: wp('1.5%'),

                                    borderWidth: 1,
                                    borderColor: 'grey',

                                    marginTop: hp('2%'),

                                    marginBottom: hp('1%'),

                                    justifyContent: 'center',
                                    padding: hp('0.7%'),
                                    paddingHorizontal: wp('5%'), textAlignVertical: "top"
                                    // paddingTop: hp('1%'),
                                }}
                            />
                            <Text
                                style={{
                                    color: 'gray',
                                    fontSize: 12,
                                    fontFamily: 'Poppins-Light',
                                    // textAlign: 'center',
                                    marginTop: hp('3%'),
                                    marginLeft: wp('9%')
                                    // lineHeight: hp('2.5%'),
                                }}>
                                SAVE THIS ADDRESS AS
                            </Text>
                            <View style={{ marginLeft: wp('5%'), marginRight: wp('5%'), marginTop: hp('3%') }}>


                                <FlatList
                                    data={this.state.addressesss}
                                    horizontal={true}
                                    renderItem={({ item, index }) => {
                                        return (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (item.ischeck == false) {
                                                            const updatedData = this.state.addressesss.map((item, i) => ({
                                                                ...item,
                                                                ischeck: i === index, // Set ischeck true only for the clicked item
                                                            }));
                                                            const selectedItem = updatedData.find((item) => item.ischeck);
                                                            console.log("Selected Item Name:", selectedItem.name); // Logs 
                                                            this.setState({ addressesss: updatedData, AddressCategory: selectedItem.name })
                                                        }
                                                    }}
                                                >


                                                    <View style={{
                                                        width: wp('26%'), height: hp('5%'),
                                                        backgroundColor: item.ischeck == true ? "#297801" : "#f2f4f4",
                                                        borderRadius: wp('5%'),
                                                        flexDirection: "row", marginLeft: wp('2%'), marginRight: wp('2%'),
                                                        alignItems: "center", justifyContent: "center"
                                                    }}>
                                                        <Icon
                                                            style={
                                                                {

                                                                }
                                                            }
                                                            onPress={() => {
                                                                this.props.navigation.push("Login")
                                                            }}
                                                            activeOpacity={0.5}
                                                            name={item.Icon}
                                                            color={item.ischeck == true ? "#ffff" : "#333"}
                                                            size={hp('2.5%')}
                                                        />
                                                        <Text
                                                            style={{
                                                                color: item.ischeck == true ? "#ffff" : "#333",
                                                                fontSize: 12,
                                                                fontFamily: 'Poppins-SemiBold',
                                                                // textAlign: 'center',
                                                                marginTop: hp('0.2%'),
                                                                marginLeft: wp('2%')
                                                                // lineHeight: hp('2.5%'),
                                                            }}>
                                                            {item.name}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </>
                                        )
                                    }} />
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={async () => {
                                    var UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');
                                    var FullName = await AsyncStorage.getItem('FullName');
                                    if (this.state.StreetName == null || this.state.StreetName == undefined) {
                                        this.setState({ StreetNameerror: true })
                                    } else if (this.state.StreetNumber == null || this.state.StreetNumber == undefined) {
                                        this.setState({ StreetNumbererror: true })
                                    } else {


                                        const a = {
                                            AddressID: 0,
                                            UserProfileID: UserProfileID,
                                            Latitude: this.state.latitude,
                                            Longitude: this.state.longitude,
                                            IPAddress: this.state.publicIP,
                                            Pincode: this.state.Pincode,
                                            StreetName: this.state.StreetName,
                                            StreetNumber: this.state.StreetNumber,
                                            CompleteAddress: this.state.Address,
                                            StateID: this.state.StateID,
                                            CityID: this.state.CityID,
                                            IsPreferred: 1,
                                            SystemUser: FullName,
                                            Direction: this.state.Direction,
                                            AddressCategory: this.state.AddressCategory

                                        }
                                        console.log(a)
                                        axios
                                            .post(URL_key + 'api/AddressApi/sCustomerAddress', a, {
                                                headers: {
                                                    'content-type': `application/json`,
                                                },
                                            })
                                            .then(response => {
                                                console.log(response.data);
                                                console.log(response.status);
                                                if (response.data == 'INSERTED') {
                                                    this.setState({ showaddress: false });
                                                    this.props.navigation.push("Tab")
                                                } else {
                                                    this.setState({ fail: true });
                                                }
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                this.setState({ fail: true });
                                            });


                                    }
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
                                        marginTop: hp('5%'),
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
                                        SAVE AND PROCEED
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </ScrollView></RBSheet>

                </SafeAreaView>
            </ScrollView>
        );
    }
}

const Separator = () => <View style={styles.separator} />;
const styles = StyleSheet.create({
    separator: {
        borderBottomColor: '#333',
        borderBottomWidth: 0.7,
        marginTop: hp('0.5%'),
        width: wp('70%'),
        alignSelf: 'center',
    },
    SubmitButtonStyle: {
        marginTop: hp('5%'),
        paddingTop: hp('0.5%'),
        paddingBottom: hp('0.5%'),
        backgroundColor: '#9f8054',
        borderRadius: wp('10%'),
        marginLeft: wp('20%'),
        marginRight: wp('20%'),
        borderColor: 'white',

        borderWidth: 1,
    },
    linearGradient: {
        flex: 1,
        // paddingLeft: 15,
        // paddingRight: 15,
        // borderRadius: 5,
        height: hp('90%'),
        // width: hp('60%'),
        // borderRadius: wp('20'),
        marginTop: hp('-25%'),
        // width: wp('110%'),
        borderRadius: wp('20%'),
        // marginLeft: wp('-14%'),
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
    errorMessage: {
        fontSize: Normalize(11),
        color: 'red',
        // textAlign: 'center',
        marginTop: hp('3.5%'),
        fontFamily: 'Poppins-Light',
        marginLeft: wp('8%'),
        // marginBottom: hp('1%'),
    },
    SubmitButtonStyledd: {
        paddingTop: hp('0.5%'),
        paddingBottom: hp('0.5%'),
        backgroundColor: 'red',
        borderRadius: wp('5%'),
        width: wp('25%'),
        alignSelf: 'center',
        marginTop: hp('2%'),
        // marginLeft: wp('3%'),
        marginBottom: hp('3%'),
    }, container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    horizontal: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp('50%'),
    },
    separator1: {
        borderBottomColor: '#00afb5',
        borderBottomWidth: 0.5,
        marginBottom: hp('2%'),
        marginTop: hp('1%'),
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    text: {
        fontSize: 18,
    },
    headerFooterContainer: {
        padding: 10,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: 'grey',
        borderRadius: 5,
        marginRight: 10,
        padding: 5,
    },
    optionContainer: {
        padding: 10,
        borderBottomColor: '#00afb5',
        borderBottomWidth: 1,
    },
    optionInnerContainer: {
        flex: 1,
        flexDirection: 'row',
    },

    box: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    itemSeparatorStyle: {
        height: 1,
        width: '90%',
        alignSelf: 'center',
        backgroundColor: '#D3D3D3',
    },
});

export default AddAddress;
