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
    FlatList, Linking
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

class FAQ extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            FAQ: null,
        }
    }
    async componentDidMount() {
        axios
            .get(URL_key + 'api/FAQApi/gFAQs', {
                headers: {
                    'content-type': `application/json`,
                },
            })
            .then(response => {
                this.setState({ FAQ: response.data })
                // console.log(response.data)
            })
            .catch(err => {
                console.log(err);

            });
    }
    render() {
        return (<SafeAreaView>
            <ScrollView>
                <Icon
                    onPress={() => {
                        this.props.navigation.push("tabp")
                    }}
                    name="chevron-back"
                    color={'#00afb5'}
                    size={40}
                    style={{ marginLeft: wp('4%'), padding: hp('1%'), marginTop: hp('3%'), }}
                />

                <Text
                    style={{
                        fontSize: 20,
                        // textAlign: "center",
                        //   justifyContent: 'center',
                        color: '#00afb5',
                        fontFamily: 'Poppins-SemiBold',
                        marginTop: hp('-5.5%'),
                        marginBottom: hp('2%'), marginLeft: wp('20%')
                        // marginRight: wp('20%'),
                        // marginRight: wp('5%'),
                    }}>
                    FAQs
                </Text>
                <FlatList
                    data={this.state.FAQ}
                    // horizontal={true}
                    renderItem={({ item, index }) => {
                        return (
                            <>
                                <Text
                                    style={{
                                        color: '#333',
                                        fontSize: 13,
                                        fontFamily: 'Poppins-SemiBold',
                                        // textAlign: 'center',
                                        marginTop: hp('3%'),
                                        // marginBottom: hp('1%'),
                                        marginLeft: wp('10%'),
                                    }}>
                                    {item.QuestionText}
                                </Text>
                                <Text
                                    style={{
                                        color: '#333',
                                        fontSize: 12,
                                        fontFamily: 'Poppins-Light',
                                        marginTop: hp('1.5%'),
                                        marginLeft: wp('10%'),
                                        marginRight: wp('8%'),
                                    }}
                                >
                                    {
                                        item.AnswerText.split(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g).map((part, index) => {
                                            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part);
                                            if (isEmail) {
                                                return (
                                                    <Text
                                                        key={index}
                                                        style={{ color: '#00afb5', textDecorationLine: 'underline' }}
                                                        onPress={() => Linking.openURL(`mailto:${part}`)}
                                                    >
                                                        {part}
                                                    </Text>
                                                );
                                            }
                                            return part;
                                        })
                                    }
                                </Text>
                            </>)
                    }}
                    numColumns={1}
                />

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

export default FAQ;