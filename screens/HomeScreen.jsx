import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { create } from 'tailwind-rn';
import utilities from '../tailwind.json';

const { tailwind } = create(utilities);

const Header = () => (
  <View style={tailwind('flex-row justify-between items-center p-4 bg-white')}>
    <Text style={tailwind('text-lg font-bold text-gray-800')}>Home - Dashboard</Text>
    <Text style={tailwind('text-sm text-gray-600')}>9:41</Text>
  </View>
);

const ProfileCard = ({ name, balance1, balance2, cardNumber }) => (
  <View style={tailwind('bg-blue-600 p-4 rounded-lg mb-4')}>
    <Text style={tailwind('text-white text-lg font-bold')}>{name}</Text>
    <View style={tailwind('flex-row justify-between mt-2')}>
      <View>
        <Text style={tailwind('text-white text-2xl font-bold')}>{balance1}</Text>
        <Text style={tailwind('text-white text-xs')}>{cardNumber}</Text>
      </View>
      <View>
        <Text style={tailwind('text-white text-2xl font-bold')}>{balance2}</Text>
        <Text style={tailwind('text-white text-xs')}>{cardNumber}</Text>
      </View>
    </View>
  </View>
);

const ActionButtons = () => (
  <View style={tailwind('flex-row justify-around mb-4')}>
    <View style={tailwind('bg-gray-100 p-3 rounded-full')}>
      <Text>Transfer</Text>
    </View>
    <View style={tailwind('bg-gray-100 p-3 rounded-full')}>
      <Text>Scan</Text>
    </View>
    <View style={tailwind('bg-gray-100 p-3 rounded-full')}>
      <Text>Pay</Text>
    </View>
    <View style={tailwind('bg-gray-100 p-3 rounded-full')}>
      <Text>Savings</Text>
    </View>
  </View>
);

const Promotion = () => (
  <View style={tailwind('bg-purple-500 p-4 rounded-lg mb-4 flex-row justify-between items-center')}>
    <Text style={tailwind('text-white text-center flex-1')}>Get your salary paid by PayCoin account</Text>
    <View style={tailwind('w-12 h-12 bg-gray-300 rounded-full')} />
  </View>
);

const ActivityItem = ({ date, description, amount, isPositive }) => (
  <View style={tailwind('flex-row items-center p-2')}>
    <View style={tailwind('w-2 h-2 bg-gray-400 rounded-full mr-2')} />
    <Text style={tailwind('flex-1 text-gray-700')}>{date} {description}</Text>
    <Text style={tailwind(isPositive ? 'text-green-500' : 'text-red-500')}>{amount}</Text>
  </View>
);

const Footer = () => (
  <View style={tailwind('flex-row justify-around items-center p-2 bg-gray-200')}>
    <Text>🏠</Text>
    <Text>📊</Text>
    <Text style={tailwind('text-lg font-bold')}>42%</Text>
    <Text>👤</Text>
    <Text>⚙️</Text>
  </View>
);

const Dashboard = () => {
  return (
    <SafeAreaView style={tailwind('flex-1 bg-gray-100')}>
      <StatusBar barStyle="dark-content" />
      <Header />
      <View style={tailwind('p-4')}>
        <ProfileCard name="Antonio Diaz" balance1="$850.00" balance2="$115,000" cardNumber="Card 7412 7342 5436" />
        <ActionButtons />
        <Promotion />
        <Text style={tailwind('text-lg font-bold text-gray-800 mb-2')}>Recent Activities</Text>
        <ActivityItem date="Monday 7/7/2025" description="Sarah Alon - Project bonus" amount="+ $3000" isPositive={true} />
        <ActivityItem date="" description="Rivendale Theater - Movie tickets" amount="- $30" isPositive={false} />
        <ActivityItem date="" description="Daniel Jackson" amount="" isPositive={false} />
      </View>
      <Footer />
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});