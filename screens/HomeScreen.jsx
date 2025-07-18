import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseconfig/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const customerId = route?.params?.customerId;
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (customerId) {
      fetchAccounts(customerId);
      fetchRecentTransactions();
    } else {
      Alert.alert('خطأ', 'لم يتم العثور على معرف المستخدم');
      setLoading(false);
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [customerId]);

  const fetchAccounts = async (id) => {
    try {
      setLoading(true);
      if (!id || id.trim() === '') {
        Alert.alert('خطأ', 'رقم العميل غير معروف.');
        return;
      }
      const res = await fetch('https://jpcjofsdev.apigw-az-eu.webmethods.io/gateway/Accounts/v0.4.3/accounts', {
        headers: {
          'x-customer-id': id,
          'x-jws-signature': '1',
          'x-auth-date': '2',
          'x-idempotency-key': '1',
          'x-customer-user-agent': '1',
          'x-financial-id': '1',
          'x-customer-ip-address': '1',
          'x-interactions-id': '1',
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      const fetchedAccounts = json?.accounts || json?.data || [];
      const updatedAccounts = await Promise.all(
        fetchedAccounts.map(async (acc) => {
          try {
            const balanceRes = await fetch(
              `https://jpcjofsdev.apigw-az-eu.webmethods.io/gateway/Balances/v0.4.3/accounts/${acc.accountId}/balances`,
              {
                headers: {
                  'x-customer-id': id,
                  'x-interactions-id': '1',
                  'Content-Type': 'application/json',
                },
              }
            );
            const balanceJson = await balanceRes.json();
            const balanceValue = balanceJson?.balances?.[0]?.balanceAmount ?? 0;
            const newAccount = {
              accountId: acc.accountId,
              customerId: id,
              iban: acc.mainRoute?.address || '',
              currency: acc.accountCurrency || 'JOD',
              type: acc.accountType?.name || 'غير معروف',
              balance: balanceValue,
              updatedAt: new Date(),
            };
            await setDoc(doc(db, 'accounts_dynamic', acc.accountId.toString()), newAccount);
            return { ...acc, realBalance: balanceValue };
          } catch (balanceError) {
            console.error(`❌ فشل في جلب الرصيد لحساب ${acc.accountId}`, balanceError);
            return { ...acc, realBalance: 'غير متوفر' };
          }
        })
      );
      setAccounts(updatedAccounts);
      await setDoc(doc(db, 'accounts', id), {
        accounts: updatedAccounts,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('❌ خطأ في جلب الحسابات:', error);
      Alert.alert('خطأ', 'فشل في تحميل بيانات الحسابات');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const saved = await AsyncStorage.getItem('recentTransactions');
      const parsed = saved ? JSON.parse(saved) : [];
      setTransactions(parsed);
    } catch (e) {
      console.error('فشل في جلب الأنشطة الأخيرة:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#636AE8" />
        <Text style={styles.loadingText}>جاري تحميل بيانات الحساب...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#E8618C', '#636AE8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>مرحبًا 👋</Text>
          <Text style={styles.subtitle}>رقم العميل: {customerId || 'غير متاح'}</Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>حساباتك</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll}>
          {accounts.length > 0 ? (
            accounts.map((acc, index) => (
              <View key={index} style={styles.card}>
                <LinearGradient
                  colors={['#E8618C', '#636AE8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.cardLabel}>{acc.accountType?.name ?? 'نوع الحساب'}</Text>
                <Text style={styles.cardIban}>{acc.mainRoute?.address ?? 'IBAN غير متوفر'}</Text>
                <Text style={styles.cardBalance}>
                  الرصيد: {acc.realBalance ?? 'جارٍ التحميل'} {acc.accountCurrency ?? 'JOD'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>لا توجد حسابات متاحة</Text>
          )}
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              accounts.length > 0 &&
              navigation.navigate('TransferScreen', {
                account: { ...accounts[0], accountType: accounts[0].accountType || 'حساب جاري' },
              })
            }
          >
            <LinearGradient
              colors={['#E8618C', '#636AE8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconButtonGradient}
            >
              <Ionicons name="swap-horizontal" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.iconLabel}>تحويل</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Parcode')}
          >
            <LinearGradient
              colors={['#E8618C', '#636AE8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconButtonGradient}
            >
              <Ionicons name="barcode" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.iconLabel}>مسح</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <LinearGradient
              colors={['#E8618C', '#636AE8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconButtonGradient}
            >
              <MaterialIcons name="receipt" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.iconLabel}>فواتير</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} disabled>
            <View style={[styles.iconButtonGradient, { backgroundColor: '#ccc' }]}>
              <FontAwesome5 name="piggy-bank" size={20} color="#fff" />
            </View>
            <Text style={[styles.iconLabel, { color: '#ccc' }]}>مدخرات</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityBox}>
          <Text style={styles.sectionTitle}>الأنشطة الأخيرة</Text>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <View key={transaction.id} style={styles.activityItem}>
                <Text style={styles.activityName}>{transaction.name}</Text>
                <Text
                  style={[
                    styles.activityAmount,
                    { color: transaction.amount.startsWith('-') ? '#c0392b' : '#2ecc71' },
                  ]}
                >
                  {transaction.amount}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyActivityText}>لا توجد أنشطة حالياً</Text>
          )}
        </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color="#636AE8" />
            <Text style={styles.navLabel}>الرئيسية</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="stats-chart" size={24} color="#666" />
            <Text style={styles.navLabel}>الإحصائيات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="people" size={24} color="#666" />
            <Text style={styles.navLabel}>جهات الاتصال</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person" size={24} color="#666" />
            <Text style={styles.navLabel}>الملف الشخصي</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    width: width,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 32,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
  },
  cardsScroll: {
    marginBottom: 24,
  },
  card: {
    width: width * 0.85,
    height: 200,
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 12,
  },
  cardIban: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 16,
  },
  cardBalance: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconButton: {
    alignItems: 'center',
    width: width * 0.22,
  },
  iconButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  activityBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityName: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  activityAmount: {
    fontSize: 16,
    textAlign: 'right',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyActivityText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});