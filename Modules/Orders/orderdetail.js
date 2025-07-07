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
            categories1: [
                {
                    name: 'Wallets',
                    Icon: 'wallet',
                    nav: 'Receivables',
                },
                {
                    name: 'Grocery',
                    Icon: 'color-filter',
                    nav: 'Receivables',
                },
            ],
            OrderID: this.props.route?.params?.data?.OrderID || null,
            orderslist: null
        }
    }
    async componentDidMount() {
        try {
            // Get UserProfileID from AsyncStorage
            const UserProfileID = await AsyncStorage.getItem('LoginUserProfileID');

            // Fetch Order List
            const orderResponse = await axios.get(
                `${URL_key}api/ProductApi/gOrderDetail?OrderID=${this.state.OrderID}`,
                { headers: { 'content-type': 'application/json' } }
            );

            let orders = orderResponse.data;

            // Loop through each order and fetch product details for each OrderItem
            for (let order of orders) {
                for (let item of order.OrderItems) {
                    try {
                        const productResponse = await axios.get(
                            `${URL_key}api/ProductApi/gProductDetails?ProductID=${item.ProductID}`,
                            { headers: { 'content-type': 'application/json' } }
                        );

                        if (productResponse.data) {
                            // Extract store and product details
                            item.StoreName = productResponse.data.StoreName;
                            item.StoreLocation = productResponse.data.StoreLocation;
                            item.ProductName = productResponse.data.ProductName;
                            item.ProductColor = productResponse.data.ProductColor;

                            // Find matching ProductItem based on ProductItemID
                            const matchingItem = productResponse.data.ProductItems.find(
                                productItem => productItem.ProductItemID === item.ProductItemID
                            );

                            if (matchingItem) {
                                item.ItemName = matchingItem.ItemName;
                                item.ItemColor = matchingItem.ItemColor;
                                item.Size = matchingItem.Size;
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching product details for ProductID: ${item.ProductID}`, err);
                    }
                }
            }

            // Update state with enriched orders

            // console.log(orders[0].OrderItems)
            this.setState({
                orderslist: orders,
                PaymentAmount: orders[0]?.PaymentAmount || '',
                PaymentMode: orders[0]?.PaymentMode || '',
                Pincode: orders[0]?.Pincode || '',
                StreetName: orders[0]?.StreetName || '',
                StreetNumber: orders[0]?.StreetNumber || '',
                StateName: orders[0]?.StateName || '',
                CityName: orders[0]?.CityName || '',
                OrderDate: orders[0]?.OrderDate
                    ? moment(orders[0].OrderDate).format("dddd, MMMM DD, YYYY, hh.mm A")
                    : '',
            });

        } catch (error) {
            console.error('Error fetching orders or product details:', error);
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
                            // marginBottom: hp('2%'),
                            // marginRight: wp('20%'),
                            // marginRight: wp('5%'),
                        }}>
                        fybr
                    </Text>
                    <Icon
                        onPress={() => {
                            this.props.navigation.push("orders")
                        }}
                        name="chevron-back"
                        color={'#00afb5'}
                        size={40}
                        style={{ marginLeft: wp('1%'), padding: hp('1%'), marginTop: hp('-9.0%'), marginBottom: hp('2%'), }}
                    />
                </ImageBackground>
                <View
                    style={{
                        // marginLeft: wp('2%'),
                        // marginRight: wp('2%'),
                        marginBottom: hp('2%'),
                        // marginTop: hp('2%'),
                    }}>
                    <FlatList
                        data={this.state.orderslist}
                        // horizontal={true}
                        renderItem={({ item, index }) => {
                            return (
                                <>
                                    <FlatList
                                        data={item.OrderItems}
                                        // horizontal={true}
                                        renderItem={({ item, index }) => {
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
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <View>
                                                                <Image
                                                                    style={{
                                                                        width: wp('30%'),
                                                                        height: hp('12%'),
                                                                        resizeMode: 'stretch',
                                                                        // resizeMode: 'stretch',s
                                                                        // borderTopRightRadius: hp('1%'),
                                                                        // borderTopLeftRadius: hp('1%'),
                                                                        marginTop: hp('2%'),
                                                                        marginLeft: wp('5%'),
                                                                        marginRight: wp('5%'),
                                                                        // borderRadius: wp('5%'),
                                                                        // marginBottom: hp('2%'),
                                                                        // marginLeft: wp('1.5%'),
                                                                    }}
                                                                    // resizeMode="center"
                                                                    source={require('../Images/bb.jpg')}
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
                                                                        color: '#333',
                                                                        marginTop: hp('4%'),

                                                                        marginLeft: wp('3%'),
                                                                        marginRight: wp('2%'),
                                                                        width: wp('25%'),
                                                                        // textDecorationLine: 'underline',
                                                                    }}>
                                                                    {item.ProductName}
                                                                </Text>

                                                                <Text
                                                                    style={{
                                                                        fontSize: 10,
                                                                        fontFamily: 'Poppins-Light',
                                                                        alignContent: 'center',
                                                                        textAlign: 'left',
                                                                        justifyContent: 'center',
                                                                        color: 'gray',
                                                                        marginTop: hp('0.5%'),

                                                                        marginLeft: wp('3%'),
                                                                        marginRight: wp('2%'),
                                                                        width: wp('25%'),

                                                                        // textDecorationLine: 'underline',
                                                                    }}>
                                                                    {item.ProductColor}

                                                                </Text>
                                                                <Text
                                                                    style={{
                                                                        fontSize: 11,
                                                                        fontFamily: 'Poppins-SemiBold',
                                                                        alignContent: 'center',
                                                                        textAlign: 'left',
                                                                        justifyContent: 'center',
                                                                        color: '#333',
                                                                        marginTop: hp('1%'),

                                                                        marginLeft: wp('3%'),
                                                                        marginRight: wp('2%'),
                                                                        width: wp('25%'),

                                                                        // textDecorationLine: 'underline',
                                                                    }}>
                                                                    🟡 {item.Size}
                                                                </Text>




                                                            </View>
                                                            <View>
                                                                <Text
                                                                    style={{
                                                                        fontSize: 11,
                                                                        fontFamily: 'Poppins-SemiBold',
                                                                        // alignContent: 'center',
                                                                        // textAlign: 'left',
                                                                        // justifyContent: 'center',
                                                                        color: '#333',
                                                                        marginTop: hp('7%'),

                                                                        marginLeft: wp('3%'),
                                                                        marginRight: wp('4%'),
                                                                        // width: wp('74%'),

                                                                        // textDecorationLine: 'underline',
                                                                    }}>
                                                                    ₹ {item.TotalPrice}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </>)
                                        }} />
                                </>
                            );
                        }}
                        numColumns={1}
                    />
                </View>
                <Text
                    style={{
                        fontSize: 13,
                        // textAlign: "center",
                        //   justifyContent: 'center',
                        color: '#333',
                        fontFamily: 'Poppins-SemiBold',
                        marginTop: hp('2%'),
                        // marginBottom: hp('2%'),
                        marginLeft: wp('10%'),
                        // marginRight: wp('10%'),
                    }}>
                    Mode of Payment
                </Text>
                <Text
                    style={{
                        fontSize: 12,
                        // textAlign: "center",
                        //   justifyContent: 'center',
                        color: '#666',
                        fontFamily: 'Poppins-Light',
                        marginTop: hp('2%'),
                        // marginBottom: hp('2%'),
                        marginLeft: wp('10%'),
                        // marginRight: wp('10%'),
                    }}>
                    {this.state.PaymentMode}
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        // textAlign: "center",
                        //   justifyContent: 'center',
                        color: '#333',
                        fontFamily: 'Poppins-SemiBold',
                        marginTop: hp('2%'),
                        // marginBottom: hp('2%'),
                        marginLeft: wp('10%'),
                        // marginRight: wp('10%'),
                    }}>
                    Payment Summary
                </Text>
                <Text
                    style={{
                        fontSize: 12,
                        // textAlign: 'center',
                        //   justifyContent: 'center',
                        color: '#666',
                        fontFamily: 'Poppins-Light',
                        marginTop: hp('2%'),
                        // marginBottom: hp('-0.5%'),
                        marginLeft: wp('10%'),
                        marginRight: wp('1%'),
                    }}>
                    Subtotal
                </Text>
                <Text
                    style={{
                        fontSize: 12,
                        textAlign: 'right',
                        //   justifyContent: 'center',
                        color: '#666',
                        fontFamily: 'Poppins-Light',
                        marginTop: hp('-2.5%'),
                        // marginBottom: hp('-0.5%'),
                        // marginLeft: wp('5%'),
                        marginRight: wp('5%'),
                    }}>
                    ₹ {this.state.PaymentAmount}
                </Text>

                <Text
                    style={{
                        fontSize: 12,
                        // textAlign: 'center',
                        //   justifyContent: 'center',
                        color: '#666',
                        fontFamily: 'Poppins-Light',
                        // marginTop: hp('1%'),
                        // marginBottom: hp('-0.5%'),
                        marginLeft: wp('10%'),
                        marginRight: wp('1%'),
                    }}>
                    Charges & Fees
                </Text>
                <Text
                    style={{
                        fontSize: 12,
                        textAlign: 'right',
                        //   justifyContent: 'center',
                        color: '#666',
                        fontFamily: 'Poppins-Light',
                        marginTop: hp('-2.5%'),
                        // marginBottom: hp('-0.5%'),
                        // marginLeft: wp('5%'),
                        marginRight: wp('5%'),
                    }}>
                    ₹ 0.00
                </Text>

                <Text
                    style={{
                        fontSize: 12,
                        // textAlign: 'center',
                        //   justifyContent: 'center',
                        color: '#333',
                        fontFamily: 'Poppins-SemiBold',
                        marginTop: hp('3%'),
                        // marginBottom: hp('-0.5%'),
                        marginLeft: wp('10%'),
                        marginRight: wp('1%'),
                    }}>
                    Total amount
                </Text>
                <Text
                    style={{
                        fontSize: 12,
                        textAlign: 'right',
                        //   justifyContent: 'center',
                        color: '#333',
                        fontFamily: 'Poppins-SemiBold',
                        marginTop: hp('-2.5%'),
                        // marginBottom: hp('-0.5%'),
                        // marginLeft: wp('5%'),
                        marginRight: wp('5%'),
                    }}>
                    ₹ {this.state.PaymentAmount}
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        // textAlign: "center",
                        //   justifyContent: 'center',
                        color: '#333',
                        fontFamily: 'Poppins-SemiBold',
                        marginTop: hp('3%'),
                        // marginBottom: hp('2%'),
                        marginLeft: wp('10%'),
                        // marginRight: wp('10%'),
                    }}>
                    Order Details
                </Text>
                <Text
                    style={{
                        fontSize: 11,
                        // textAlign: "center",
                        //   justifyContent: 'center',
                        color: '#333',
                        fontFamily: 'Poppins-Light',
                        marginTop: hp('2%'),
                        // marginBottom: hp('2%'),
                        marginLeft: wp('10%'),
                        // marginRight: wp('10%'),
                    }}>
                    {this.state.OrderDate}
                </Text>
                <Text
                    style={{
                        fontSize: 11,
                        // textAlign: "center",
                        //   justifyContent: 'center',
                        color: '#333',
                        fontFamily: 'Poppins-Light',
                        // marginTop: hp('2%'),
                        // marginBottom: hp('2%'),
                        marginLeft: wp('10%'),
                        // marginRight: wp('10%'),
                    }}>
                    {this.state.StreetNumber}, {this.state.StreetName}, {this.state.CityName}, {this.state.StateName} - {this.state.Pincode}
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        // textAlign: "center",
                        //   justifyContent: 'center',
                        color: '#333',
                        fontFamily: 'Poppins-SemiBold',
                        marginTop: hp('3%'),
                        marginBottom: hp('1%'),
                        marginLeft: wp('10%'),
                        // marginRight: wp('10%'),
                    }}>
                    Need help with this order?
                </Text>
                <View style={{ width: wp('80%`'), borderWidth: 0.7, alignSelf: "center", borderColor: "#666", borderRadius: 5 }}>
                   <TouchableOpacity onPress={()=> this.props.navigation.push("Contactsupport")}>
                    <Text
                        style={{
                            fontSize: 13,
                            // textAlign: "center",
                            //   justifyContent: 'center',
                            color: '#333',
                            fontFamily: 'Poppins-Light',
                            marginTop: hp('1.5%'),
                            // // marginBottom: hp('2%'),
                            marginLeft: wp('4%'),
                            // marginRight: wp('10%'),
                        }}>
                        Contact Support
                    </Text>
                            </TouchableOpacity>
                    <Text
                        style={{
                            fontSize: 11,
                            // textAlign: "center",
                            //   justifyContent: 'center',
                            color: '#666',
                            fontFamily: 'Poppins-Light',
                            // marginTop: hp('2%'),
                            marginBottom: hp('1.5%'),
                            marginLeft: wp('4%'),
                            // marginRight: wp('10%'),
                        }}>
                        Chat with our support team
                    </Text>
                    <Icon
                        onPress={() => {
                            this.props.navigation.push("orders")
                        }}
                        name="chatbox-ellipses-outline"
                        color={'#00afb5'}
                        size={40}
                        style={{ marginRight: wp('1%'), padding: hp('1%'), marginTop: hp('-7%'), alignSelf: "flex-end" }}
                    />
                </View>
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