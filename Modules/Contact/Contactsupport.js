import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  ScrollView,
  FlatList,
  Linking,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Contactsupport = ({navigation}) => {
  const [FAQ] = useState([
    {
      QuestionText: 'How do I contact Fybr support?',
      AnswerText:
        'You can reach Fybr’s customer support through the app, website, or by emailing us directly at  support@fybrnow.com',
    },
  ]);

  const renderFAQItem = ({item}) => (
    <>
      <Text
        style={{
          color: '#333',
          fontSize: 13,
          fontFamily: 'Poppins-SemiBold',
          marginTop: hp('3%'),
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
        }}>
        {item.AnswerText.split(
          /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        ).map((part, index) => {
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part);
          if (isEmail) {
            return (
              <Text
                key={index}
                style={{
                  color: '#00afb5',
                  textDecorationLine: 'underline',
                }}
                onPress={() => Linking.openURL(`mailto:${part}`)}>
                {part}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    </>
  );

  return (
    <SafeAreaView>
      <ScrollView style={{backgroundColor: 'white', height: '100%'}}>
        {/* <Icon
          onPress={() => navigation.push('TabP')}
          name="chevron-back"
          color={'#00afb5'}
          size={40}
          style={{
            marginLeft: wp('4%'),
            padding: hp('1%'),
            marginTop: hp('3%'),
          }}
        /> */}
        <TouchableOpacity onPress={() => navigation.push('TabP')}>
          <Icon
            onPress={() => navigation.push('TabP')}
            name="chevron-back"
            color={'#00afb5'}
            size={40}
            style={{
              marginLeft: wp('1%'),
              padding: hp('1%'),
              marginTop: hp('5%'),
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 20,
            // textAlign: 'center',
            color: '#00afb5',
            fontFamily: 'Poppins-SemiBold',
            marginTop: hp('-5.5%'),
            marginBottom: hp('2%'),
            marginLeft: wp('13%'),
          }}>
          Contact Support
        </Text>

        <FlatList
          data={FAQ}
          renderItem={renderFAQItem}
          numColumns={1}
          keyExtractor={(item, index) => index.toString()}
        />

        <Text
          style={{
            textAlign: 'center',
            color: '#333',
            fontSize: 14,
            fontWeight: '800',
            fontFamily: 'Poppins-SemiBold',
            marginTop: hp('5%'),
            marginBottom: hp('3%'),
          }}>
          FYBR RETAIL PRIVATE LIMITED
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Contactsupport;
