import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const customers = [
  'IND_CUST_001',
  'IND_CUST_002',
  'IND_CUST_003',
  'CORP_CUST_001',
  'BUS_CUST_001',
];

export default function CustomerSelector() {
  const navigation = useNavigation();

  const handleSelect = (customerId) => {
    navigation.navigate('HomeScreen', { customerId });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>اختر حساب العميل 👇</Text>
      {customers.map((id) => (
        <TouchableOpacity
          key={id}
          style={styles.button}
          onPress={() => handleSelect(id)}
        >
          <Text style={styles.buttonText}>{id}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#636AE8',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
