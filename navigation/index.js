import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthNavigation from './AuthNavigation';
import AppNavigation from './AppNavigation';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  console.log('[RootNavigator] ========================================');
  console.log('[RootNavigator] Component rendering START');
  console.log('[RootNavigator] ========================================');

  console.log('[RootNavigator] About to render NavigationContainer');
  return (
    <NavigationContainer
      onReady={() => {
        console.log('[RootNavigator] ========================================');
        console.log('[RootNavigator] NavigationContainer READY');
        console.log('[RootNavigator] ========================================');
      }}
      onStateChange={state => {
        const currentRoute = state?.routes?.[state?.index]?.name;
        console.log('[RootNavigator] Navigation state changed:', currentRoute);
      }}>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Auth" component={AuthNavigation} />
        <Stack.Screen name="App" component={AppNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
