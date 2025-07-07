import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Home from './home';
import Profile from './profile';
import Cart from './cart';
import Store from './store';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="cart"
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#00afb5',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontFamily: 'Poppins-Light',
        },
        tabBarStyle: {
          paddingTop: hp('0.5%'),
          height: hp('7%'),
          shadowOffset: {width: 0, height: 3},
          shadowOpacity: 0.5,
          shadowRadius: 5,
        },
      }}>
      <Tab.Screen
        name="home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => <Icon name="home" color={color} size={26} />,
        }}
      />
      <Tab.Screen
        name="store"
        component={Store}
        options={{
          tabBarLabel: 'Stores',
          tabBarIcon: ({color}) => (
            <Icon name="file-tray" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="cart"
        component={Cart}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({color}) => <Icon name="cart" color={color} size={26} />,
        }}
      />
      <Tab.Screen
        name="profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => (
            <Icon name="person-circle" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigator;
