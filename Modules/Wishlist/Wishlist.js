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
import { API_KEY, URL_key } from '../Api/api';
import axios from 'axios';
var RNFS = require('react-native-fs');
import XLSX from 'xlsx';
import publicIP from 'react-native-public-ip';
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import MenuDrawer from 'react-native-side-drawer';
import RNFetchBlob from 'rn-fetch-blob';
import { image } from './image';
import { alignSelf, marginBottom } from 'styled-system';
import StepIndicator from 'react-native-step-indicator';
import CheckBox from 'react-native-check-box';

class Add extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [
                {
                    name: 'Dresses',
                    Icon: 'color-filter',
                    nav: 'protab',
                },

                { name: 'Shirts', Icon: 'podium', nav: 'payments' },
                // {name: 'Leads', Icon: 'ios-magnet-outline', nav: 'leads'},


            ],
            brand: [
                {
                    name: 'LOV',
                    ischeck: false,
                },

                { name: 'Nuon', ischeck: false },
                // {name: 'Leads', Icon: 'ios-magnet-outline', nav: 'leads'},
                {
                    name: 'Studiofit',
                    ischeck: false,
                },
                {
                    name: 'Wardrobe',
                    ischeck: false,
                },
            ], Nearbystores1: null, Nearbystores: null
        }
    }
    async componentDidMount() {
        try {
            const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');

            // Fetch wishlist products
            const wishlistResponse = await axios.get(
                `${URL_key}api/ProductApi/gWishList?UserProfileID=${UserProfileID}`,
                { headers: { 'content-type': 'application/json' } }
            );

            let wishlistProducts = wishlistResponse.data;

            // Fetch product details for each product in the wishlist
            const updatedProducts = await Promise.all(
                wishlistProducts.map(async (product) => {
                    try {
                        const productDetailsResponse = await axios.get(
                            `${URL_key}api/ProductApi/gProductDetails?ProductID=${product.ProductID}`,
                            { headers: { 'content-type': 'application/json' } }
                        );

                        const productDetails = productDetailsResponse.data;

                        return {
                            ...product,
                            StoreName: productDetails.StoreName || "Unknown",
                            StoreLocation: productDetails.StoreLocation || "Unknown",
                            StoreId: productDetails.StoreID || null,
                            ProductImage1: productDetails.ProductImage || null,
                            ProductColor: productDetails.ProductColor || "Unknown"
                        };
                    } catch (error) {
                        console.error("Error fetching product details for ProductID:", product.ProductID, error);
                        return product; // Return original product if details fetch fails
                    }
                })
            );

            // Group products by StoreName - StoreLocation
            const groupedProducts = updatedProducts.reduce((acc, product) => {
                const key = `${product.StoreName} - ${product.StoreLocation}`;

                if (!acc[key]) {
                    acc[key] = {
                        StoreName: product.StoreName,
                        StoreLocation: product.StoreLocation,
                        Products: []
                    };
                }

                acc[key].Products.push(product);
                return acc;
            }, {});

            // Convert object to an array
            const groupedArray = Object.values(groupedProducts);

            // Update state with grouped products
            console.log(groupedArray)
            this.setState({ Nearbystores: groupedArray, Nearbystores1: groupedArray });

        } catch (error) {
            console.error("Error fetching wishlist:", error);
        }
    }
    SearchFilterFunction(text) {
        if (text) {
            const textData = text.toUpperCase();

            const newData = this.state.Nearbystores.filter((store) => {
                // Check if store name matches
                const storeMatch = store.StoreName && store.StoreName.toUpperCase().includes(textData);

                // Check if any product in the Products array matches
                const productMatch = store.Products.some(
                    (product) => product.ProductName && product.ProductName.toUpperCase().includes(textData)
                );

                return storeMatch || productMatch;
            });

            console.log(newData);

            this.setState({
                Nearbystores1: newData,
                selectedIndex: 11,
                search: text
            });
        } else {
            this.setState({ Nearbystores1: this.state.Nearbystores });
        }
    }

    render() {
        return (<SafeAreaView>
            <ScrollView>
                <ImageBackground
                    style={{ width: wp('100%') }}
                    activeOpacity={0.5}
                    source={require('../Images/output-onlinepngtools1.png')}
                    resizeMode="cover">


                    <Text
                        style={{
                            fontSize: 45,
                            textAlign: "center",
                            //   justifyContent: 'center',
                            color: '#00afb5',
                            fontFamily: 'RedHatDisplay-Bold',
                            marginTop: hp('3%'),

                            // marginRight: wp('20%'),
                            marginRight: wp('5%'),
                        }}>
                        fybr
                    </Text>
                    <Icon
                        onPress={() => {
                            this.props.navigation.push("tabp")
                        }}
                        name="chevron-back"
                        color={'#00afb5'}
                        size={40}
                        style={{ marginLeft: wp('3%'), padding: hp('1%'), marginTop: hp('-7%'), marginBottom: hp('0%'), }}
                    />

                    <View style={{ flexDirection: 'row' }}>
                        <View
                            style={{
                                justifyContent: 'center',
                                // borderWidth: wp('0.2%'),
                                borderRadius: wp('3%'),
                                // padding: 5,
                                height: hp('5.2%'),
                                // marginBottom: hp('3%'),
                                borderColor: '#00afb5',
                                marginTop: hp('2%'),
                                backgroundColor: '#ffff',

                                width: wp('85%'),
                                alignSelf: 'center',
                                flexDirection: 'row',
                                marginBottom: hp('1%'),
                                // paddingLeft: wp('12%'),a
                                // alignItems: 'center',
                                textAlignVertical: 'top',
                                marginLeft: wp('7%'), borderWidth: 0.5
                            }}>
                            {/* <Icon
                                name="camera-sharp"
                                color={'#00afb5'}
                                size={24}
                                style={{ marginLeft: wp('0%'), padding: hp('1%'), }}
                            />
                            <View style={{ height: hp('2%'), borderColor: "#00afb5", borderWidth: 0.5, alignSelf: "center", marginLeft: wp('1%') }}>

                            </View> */}
                            <TextInput
                                placeholder={"Search for products in wishlist"}
                                fontFamily={'Poppins-Light'}
                                placeholderTextColor={'#00afb5'}
                                color={'black'}
                                fontSize={10}
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
                                    // marginLeft: wp('1%'),
                                    // marginLeft: wp('1%'),
                                }}
                            />
                            <Icon
                                style={{ marginLeft: wp('1%'), padding: hp('1%'), }}
                                onPress={() => {
                                    // this.setState({Filter:true})
                                    // this.RBSheet1.open();
                                }}
                                // activeOpacity={0.5}

                                name="search"
                                color={'gray'}
                                size={20}
                            />

                        </View>



                    </View>
                </ImageBackground>
                <View style={{ marginTop: hp('2%') }}>

                </View>
                <FlatList
                    data={this.state.Nearbystores1}
                    // horizontal={true}
                    renderItem={({ item, index }) => {
                        return (
                            <>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        // textAlign: 'center',
                                        //   justifyContent: 'center',
                                        color: '#333',
                                        fontFamily: 'Poppins-SemiBold',
                                        // marginTop: hp('2%'),
                                        marginBottom: hp('-0.5%'),
                                        marginLeft: wp('10%'),
                                        marginRight: wp('1%'), width: wp('80%')
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            // textAlign: 'center',
                                            //   justifyContent: 'center',
                                            color: '#333',
                                            fontFamily: 'Poppins-Medium',
                                            // marginTop: hp('2%'),
                                            marginBottom: hp('-0.5%'),
                                            marginLeft: wp('10%'),
                                            marginRight: wp('1%'),
                                        }}>
                                        {item.StoreName}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 9,
                                            // textAlign: 'center',
                                            //   justifyContent: 'center',
                                            color: 'grey',
                                            fontFamily: 'Poppins-Light',
                                            marginTop: hp('2%'),
                                            marginBottom: hp('-0.5%'),

                                        }}>
                                        {'  '}{item.StoreLocation}
                                    </Text>
                                </Text>
                                <View
                                    style={{
                                        marginLeft: wp('4%'),
                                        marginRight: wp('4%'), marginTop: hp('2%'), marginBottom: hp('2%')
                                    }}>
                                    <FlatList
                                        data={item.Products}
                                        // horizontal={true}
                                        renderItem={({ item, index }) => {
                                            return (
                                                <>
                                                    <TouchableOpacity onPress={() => {
                                                        this.props.navigation.push('ProductDetails', {
                                                            data: {
                                                                ProductID: item.ProductID,
                                                                Pagename: "Wishlist"
                                                            },
                                                        });
                                                    }}>


                                                        <View
                                                            style={[
                                                                {
                                                                    // width: wp('30%'),
                                                                    alignSelf: 'center',
                                                                    //   elevation: 10,
                                                                    //   shadowColor: '#000',
                                                                    //   shadowOffset: {width: 0, height: 3},
                                                                    //   shadowOpacity: 0.5,
                                                                    //   shadowRadius: 5,

                                                                    // backgroundColor: '#ffff',
                                                                    // borderRadius: wp('3%'),
                                                                    borderRadius: wp('5%'),
                                                                    // borderTopRightRadius: wp('3%'),
                                                                    //   borderBottomRightRadius: wp('3%'),
                                                                    // marginLeft: wp('0.5%'),
                                                                    // justifyContent: 'center',
                                                                    // alignItems: 'center',
                                                                    marginLeft: wp('1%'),
                                                                    marginRight: wp('1%'),
                                                                    marginTop: hp('1%'),
                                                                    // marginBottom: hp('2%'),
                                                                    // borderColor: '#00afb5',
                                                                    // height: hp('7%'),
                                                                    // alignItems: 'center',
                                                                    // justifyContent: 'center',
                                                                    // flexDirection: 'row',
                                                                    // borderWidth: 0.7,
                                                                },
                                                            ]}>
                                                            {item.ProductImage1 == null || item.ProductImage1 == undefined ? <>
                                                                <Image
                                                                    style={{
                                                                        width: wp('39%'),
                                                                        height: hp('15%'),
                                                                        resizeMode: 'stretch',
                                                                        // resizeMode: 'stretch',s
                                                                        // borderTopRightRadius: hp('1%'),
                                                                        // borderTopLeftRadius: hp('1%'),
                                                                        // marginTop: hp('2%'),
                                                                        marginLeft: wp('3%'),
                                                                        marginRight: wp('3%'),
                                                                        // borderRadius: wp('5%'),
                                                                        // marginBottom: hp('2%'),
                                                                        // marginLeft: wp('1.5%'),
                                                                    }}
                                                                    // resizeMode="center"
                                                                    source={require('../Images/tshirt.jpg')}
                                                                />
                                                            </> : <>
                                                                {item.ProductImage1.length == 0 || item.ProductImage1 == "" ? <>
                                                                    <Image
                                                                        style={{
                                                                            width: wp('39%'),
                                                                            height: hp('15%'),
                                                                            resizeMode: 'stretch',
                                                                            // resizeMode: 'stretch',s
                                                                            // borderTopRightRadius: hp('1%'),
                                                                            // borderTopLeftRadius: hp('1%'),
                                                                            // marginTop: hp('2%'),
                                                                            marginLeft: wp('3%'),
                                                                            marginRight: wp('3%'),
                                                                            // borderRadius: wp('5%'),
                                                                            // marginBottom: hp('2%'),
                                                                            // marginLeft: wp('1.5%'),
                                                                        }}
                                                                        // resizeMode="center"
                                                                        source={require('../Images/tshirt.jpg')}
                                                                    />

                                                                </> : <>

                                                                    <Image
                                                                        style={{
                                                                            width: wp('39%'),
                                                                            height: hp('15%'),
                                                                            resizeMode: 'stretch',
                                                                            // resizeMode: 'stretch',s
                                                                            // borderTopRightRadius: hp('1%'),
                                                                            // borderTopLeftRadius: hp('1%'),
                                                                            // marginTop: hp('2%'),
                                                                            marginLeft: wp('3%'),
                                                                            marginRight: wp('3%'),
                                                                            // borderRadius: wp('5%'),
                                                                            // marginBottom: hp('2%'),
                                                                            // marginLeft: wp('1.5%'),
                                                                        }}
                                                                        // resizeMode="center"
                                                                        source={{ uri: item.ProductImage1 }}
                                                                    />
                                                                </>}

                                                            </>}

                                                            <Text
                                                                // onPress={() => {
                                                                //   Linking.openURL(item.name);
                                                                // }}
                                                                style={{
                                                                    fontSize: 9,
                                                                    fontFamily: 'Poppins-Light',

                                                                    color: '#333',
                                                                    marginTop: hp('0.5%'),
                                                                    // marginBottom: hp('1%'),
                                                                    marginLeft: wp('4%'), width: wp('39%'),
                                                                    // marginRight: wp('2%'),
                                                                    // textDecorationLine: 'underline',
                                                                }}>
                                                                {item.ProductName}
                                                            </Text>
                                                            <Text
                                                                // onPress={() => {
                                                                //   Linking.openURL(item.name);
                                                                // }}
                                                                style={{
                                                                    fontSize: 8,
                                                                    fontFamily: 'Poppins-Light',

                                                                    color: 'grey',
                                                                    // marginTop: hp('0.5%'),
                                                                    // marginBottom: hp('1%'),
                                                                    marginLeft: wp('4%'),
                                                                    // marginRight: wp('2%'),
                                                                    // textDecorationLine: 'underline',
                                                                }}>
                                                                {item.ProductColor}
                                                            </Text>
                                                            <Text
                                                                // onPress={() => {
                                                                //   Linking.openURL(item.name);
                                                                // }}
                                                                style={{
                                                                    fontSize: 8,
                                                                    fontFamily: 'Poppins-Light',

                                                                    color: '#333',
                                                                    // marginTop: hp('0.5%'),
                                                                    // marginBottom: hp('1%'),
                                                                    marginLeft: wp('4%'),
                                                                    // marginRight: wp('2%'),
                                                                    // textDecorationLine: 'underline',
                                                                }}>
                                                                ₹  {item.ProductPrice}
                                                            </Text>

                                                        </View>
                                                    </TouchableOpacity>
                                                </>
                                            );
                                        }}
                                        numColumns={2}
                                    />
                                </View>
                            </>)
                    }} />


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