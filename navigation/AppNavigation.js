import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Landing from '../Modules/Login/Landing';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Landing" component={Landing} />
    </Stack.Navigator>
  );
};

export default AppNavigation;
