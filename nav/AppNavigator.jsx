// AppNavigator.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import CustomerSelector from '../screens/CustomerSelector';
import CustomerAccountsScreen from '../screens/CustomerAccountsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'إنشاء حساب' }} />
        <Stack.Screen name="CustomerSelector" component={CustomerSelector} options={{ title: 'اختيار العميل' }} />
        <Stack.Screen name="CustomerAccounts" component={CustomerAccountsScreen} options={{ title: 'تفاصيل الحساب' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
