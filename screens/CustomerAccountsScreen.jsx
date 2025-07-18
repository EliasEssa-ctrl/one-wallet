import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';

export default function CustomerAccountsScreen() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { customerId } = route.params;

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get(
          'https://jpcjofsdev.apigw-az-eu.webmethods.io/gateway/Accounts/v0.4.3/accounts',
          {
            headers: {
              'x-customer-id': customerId,
              'Accept': 'application/json'
            }
          }
        );
        setAccounts(res.data.accounts || []);
      } catch (err) {
        console.error('فشل في جلب البيانات:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>الحسابات الخاصة بـ {customerId}</Text>
      {accounts.map((acc, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.label}>رقم الحساب:</Text>
          <Text style={styles.value}>{acc.accountId}</Text>
          <Text style={styles.label}>اسم الحساب:</Text>
          <Text style={styles.value}>{acc.accountName}</Text>
          <Text style={styles.label}>العملة:</Text>
          <Text style={styles.value}>{acc.currency || 'JOD'}</Text>
          <Text style={styles.label}>الحالة:</Text>
          <Text style={[styles.value, { color: acc.status === 'active' ? 'green' : 'red' }]}>
            {acc.status || 'غير محددة'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
});
