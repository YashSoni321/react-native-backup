import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  BackHandler,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

class Privacy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Data: this.props.route?.params?.data?.Data || null,
      OTP1: this.props.route?.params?.data?.otp || null,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
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

  render() {
    return (
      <ScrollView>
        <SafeAreaView>
          <Icon
            onPress={() => {
              if (this.state.Data == 'otp') {
                this.props.navigation.push(this.state.Data, {
                  data: {
                    otp: this.state.OTP1,
                  },
                });
              } else {
                this.props.navigation.push(this.state.Data);
              }
            }}
            name="chevron-back"
            color={'#00afb5'}
            size={40}
            style={{
              marginLeft: wp('4%'),
              padding: hp('1%'),
              marginTop: hp('3%'),
            }}
          />
          <Text
            style={{
              fontSize: 20,
              color: '#00afb5',
              fontFamily: 'Poppins-SemiBold',
              marginTop: hp('-5.5%'),
              marginBottom: hp('2%'),
              marginLeft: wp('20%'),
            }}>
            PRIVACY POLICY
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: '#333',
              fontFamily: 'Poppins-Light',
              marginTop: hp('2%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
            }}>
            Effective Date: November 01, 2024
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: '#333',
              fontFamily: 'Poppins-Light',
              marginTop: hp('1%'),
              marginBottom: hp('2%'),
              marginLeft: wp('10%'),
              marginRight: wp('5%'),
            }}>
            Fybr Private Limited ("Fybr," "we," "our," or "us") is committed to
            protecting your privacy. This Privacy Policy explains how we
            collect, use, and share your personal information when you use our
            platform and services. By using Fybr, you agree to the terms
            outlined in this policy.
          </Text>
          <Separator />
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.bodyText}>
            We collect the following types of information when you use our
            platform:
          </Text>
          <Text style={styles.subTitle}>1.1. Personal Information</Text>
          <Text style={styles.bodyText}>
            Name, email address, phone number, and delivery address during
            account creation or checkout.
          </Text>
          <Text style={styles.bodyText}>
            Payment information (e.g., credit/debit card details) processed
            securely through third-party payment providers.
          </Text>
          <Text style={styles.subTitle}>1.2. Usage Information</Text>
          <Text style={styles.bodyText}>
            Details about your interactions with our platform, such as search
            history, purchase activity, and pages viewed.
          </Text>
          <Text style={styles.subTitle}>
            1.3. Device and Technical Information
          </Text>
          <Text style={styles.bodyText}>
            Device type, operating system, browser type, IP address, and app
            usage statistics.
          </Text>
          <Text style={styles.subTitle}>1.4. Location Data</Text>
          <Text style={styles.bodyText}>
            Real-time location data to enhance delivery accuracy, only with your
            consent.
          </Text>
          <Text style={styles.subTitle}>1.5. Third-Party Information</Text>
          <Text style={styles.bodyText}>
            Information received from third-party partners, such as stores or
            payment gateways, related to your transactions.
          </Text>
          <Separator />
          <Text style={styles.sectionTitle}>
            2. How We Use Your Information
          </Text>
          <Text style={styles.bodyText}>We use your information to:</Text>
          <Text style={styles.bodyText}>
            Process orders and manage deliveries.
          </Text>
          <Text style={styles.bodyText}>
            Communicate with you regarding your orders, account, or customer
            support inquiries.
          </Text>
          <Text style={styles.bodyText}>
            Provide personalized product recommendations and improve our
            services.
          </Text>
          <Text style={styles.bodyText}>Ensure secure payment processing.</Text>
          <Text style={styles.bodyText}>
            Comply with legal obligations and enforce our terms and policies.
          </Text>
          <Separator />
          <Text style={styles.sectionTitle}>3. Sharing of Information</Text>
          <Text style={styles.bodyText}>
            We share your information only as necessary to provide our services:
          </Text>
          <Text style={styles.subTitle}>3.1. With Merchants</Text>
          <Text style={styles.bodyText}>
            To fulfill your orders, we share your delivery and contact details
            with the store you purchase from.
          </Text>
          <Text style={styles.subTitle}>3.2. With Delivery Partners</Text>
          <Text style={styles.bodyText}>
            To facilitate delivery, we share necessary information, such as your
            address and contact details.
          </Text>
          <Text style={styles.subTitle}>3.3. With Service Providers</Text>
          <Text style={styles.bodyText}>
            Third-party vendors assist with services like payment processing,
            analytics, and marketing.
          </Text>
          <Text style={styles.subTitle}>3.4. Legal Obligations</Text>
          <Text style={styles.bodyText}>
            We may disclose information to comply with legal requirements,
            enforce our policies, or protect our rights.
          </Text>
          <Separator />
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.bodyText}>
            We implement robust security measures to protect your information,
            including encryption and secure storage. However, no online platform
            can guarantee complete security.
          </Text>
          <Separator />
          <Text style={styles.sectionTitle}>5. Data Retention</Text>
          <Text style={styles.bodyText}>
            We retain your personal information only as long as necessary for
            the purposes outlined in this policy or as required by law.
          </Text>
          <Separator />
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.bodyText}>You have the right to:</Text>
          <Text style={styles.bodyText}>
            Access, correct, or update your personal information.
          </Text>
          <Text style={styles.bodyText}>
            Request the deletion of your account and associated data.
          </Text>
          <Text style={styles.bodyText}>
            Opt-out of marketing communications.
          </Text>
          <Text style={styles.bodyText}>
            To exercise these rights, contact us at info@fybrnow.com
          </Text>
          <Separator />
          <Text style={styles.sectionTitle}>
            7. Cookies and Tracking Technologies
          </Text>
          <Text style={styles.bodyText}>
            Fybr uses cookies and similar technologies to enhance your
            experience and analyze platform usage. You can manage your cookie
            preferences through your browser settings.
          </Text>
          <Separator />
          <Text style={styles.sectionTitle}>8. Third-Party Links</Text>
          <Text style={styles.bodyText}>
            Fybr may contain links to third-party websites. We are not
            responsible for the privacy practices of these websites.
          </Text>
          <Separator />
          <Text style={styles.sectionTitle}>
            9. Updates to This Privacy Policy
          </Text>
          <Text style={styles.bodyText}>
            We may update this Privacy Policy from time to time. Changes will be
            effective upon posting, and continued use of Fybr signifies your
            acceptance of the updated policy.
          </Text>
          <Separator />
          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.bodyText}>
            If you have questions or concerns about this Privacy Policy, please
            contact us at:
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.subTitle}>Email: {'  '}</Text>
            <Text
              onPress={() => Linking.openURL('mailto:info@fybrnow.com')}
              style={{
                fontSize: 13,
                color: 'blue',
                fontFamily: 'Poppins-Light',
                marginBottom: hp('2%'),
                marginLeft: wp('10%'),
                marginRight: wp('5%'),
              }}>
              info@fybrnow.com
            </Text>
          </Text>
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
    marginTop: hp('0%'),
    width: wp('80%'),
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    // color: '#00afb5',
    fontFamily: 'Poppins-Bold',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
    // fontWeight: 'bold',
    marginLeft: wp('10%'),
    marginRight: wp('5%'),
  },
  subTitle: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: hp('0.5%'),
    // fontWeight: 'bold',
    marginLeft: wp('10%'),
    marginRight: wp('5%'),
  },
  bodyText: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    marginBottom: hp('1.5%'),
    textAlign: 'justify',
    marginLeft: wp('10%'),
    marginRight: wp('5%'),
  },
});

export default Privacy;
