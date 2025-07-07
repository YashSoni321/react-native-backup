import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../Modules/Login/login';
import Terms from '../Modules/Login/Terms';
import Signup from '../Modules/Login/signup';
import Tab from '../Modules/Dashboard/Tab';
import Home from '../Modules/Dashboard/home';
import Profile from '../Modules/Dashboard/profile';
import Cart from '../Modules/Dashboard/cart';
import Orders from '../Modules/Orders/orders';

import ReturnPo from '../screens/returnpo';
import TabP from '../Modules/Dashboard/tabp';
import TabC from '../Modules/Dashboard/tabc';
import Otp from '../Modules/Login/otp';
import ShippAddress from '../screens/shippaddress';
import ShippingVDetails from '../screens/shippingvdetails';
import Product from '../screens/product';
import Store from '../Modules/Dashboard/store';
import Tabs from '../Modules/Dashboard/tabs';
import StoreDetails from '../screens/storedetails';
import PaymentSummary from '../screens/paymentsummary';
import LoginPass from '../screens/loginpass';
import ForgetPas from '../screens/forgetpas';
import Landing from '../Modules/Login/Landing';
import Invite from '../Modules/Invite/Invite';
import Checkout from '../Modules/Checkout/checkout';
import TrackOrder from '../Modules/Checkout/trackorder';
import PhonePePayment from '../Modules/Payment/PhonePePayment';
import OrderDetail from '../Modules/Orders/orderdetail';
import Wishlist from '../Modules/Wishlist/Wishlist';
import AddressList from '../Modules/Address/AddressList';
import AddAddress from '../Modules/Address/addaddress';
import FAQ from '../Modules/FAQ/FAQ';
import Notification from '../Modules/Notification/Notification';
import StoreProducts from '../Modules/Products/storeproducts';
import CategoryProduct from '../Modules/Products/categoryproduct';
import ProductDetails from '../Modules/Products/ProductDetails';
import Contactsupport from '../Modules/Contact/Contactsupport';

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#ffff'},
      }}>
      <Stack.Screen name="Contactsupport" component={Contactsupport} />
      <Stack.Screen name="Terms" component={Terms} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="CategoryProduct" component={CategoryProduct} />
      <Stack.Screen name="StoreProducts" component={StoreProducts} />
      <Stack.Screen name="AddAddress" component={AddAddress} />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="FAQ" component={FAQ} />
      <Stack.Screen name="AddressList" component={AddressList} />
      <Stack.Screen name="Wishlist" component={Wishlist} />
      <Stack.Screen name="OrderDetail" component={OrderDetail} />
      <Stack.Screen name="TrackOrder" component={TrackOrder} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="PhonePePayment" component={PhonePePayment} />
      <Stack.Screen name="Invite" component={Invite} />
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="ForgetPas" component={ForgetPas} />
      <Stack.Screen name="LoginPass" component={LoginPass} />
      <Stack.Screen name="PaymentSummary" component={PaymentSummary} />
      <Stack.Screen name="StoreDetails" component={StoreDetails} />
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="Store" component={Store} />
      <Stack.Screen name="Product" component={Product} />
      <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="ShippAddress" component={ShippAddress} />
      <Stack.Screen name="ShippingVDetails" component={ShippingVDetails} />
      <Stack.Screen name="ReturnPo" component={ReturnPo} />
      <Stack.Screen name="TabC" component={TabC} />
      <Stack.Screen name="TabP" component={TabP} />
      <Stack.Screen name="Orders" component={Orders} />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Tab" component={Tab} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
