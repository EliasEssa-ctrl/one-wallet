// AppNavigator.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerSelector from '../screens/CustomerSelector';
import HomeScreen from '../screens/HomeScreen'; // رح نعدله بالخطوة الجايه

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="CustomerSelector" component={CustomerSelector} options={{ title: 'اختيار العميل' }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'تفاصيل الحساب' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
