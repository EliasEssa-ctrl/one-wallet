import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions,
  Platform, ActivityIndicator, Alert, FlatList, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function TransferScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [account, setAccount] = useState(route.params?.account || null);

  const [transferMethod, setTransferMethod] = useState('favorite');
  const [aliasType, setAliasType] = useState('Alias');
  const [inputValue, setInputValue] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [amount, setAmount] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const banks = ['زين كاش', 'بنك صفوة', 'البنك العربي'];

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const existing = await AsyncStorage.getItem('favorites');
        const parsed = existing ? JSON.parse(existing) : [];
        setFavorites(parsed);
      } catch (error) {
        Alert.alert('خطأ', 'فشل في تحميل قائمة المفضلة.');
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (account?.accountId && account?.customerId) {
      fetchRealBalance(account.customerId, account.accountId);
    }
  }, []);

  const fetchRealBalance = async (customerId, accountId) => {
    try {
      const res = await fetch(`https://jpcjofsdev.apigw-az-eu.webmethods.io/gateway/Balances/v0.4.3/accounts/${accountId}/balances`, {
        headers: {
          'x-customer-id': customerId,
          'x-interactions-id': '1',
          'Content-Type': 'application/json'
        }
      });

      const json = await res.json();
      const balance = json?.balances?.[0]?.balanceAmount ?? 'غير متوفر';
      setAccount(prev => ({ ...prev, balance: balance }));
    } catch (err) {
      console.error("❌ فشل في جلب الرصيد:", err);
    }
  };

  const validateForm = () => {
    if (!inputValue) {
      Alert.alert('خطأ', `يرجى إدخال ${aliasType === 'Alias' ? 'الاسم المستعار' : 'رقم IBAN'}.`);
      return false;
    }
    if (!selectedBank) {
      Alert.alert('خطأ', 'يرجى اختيار البنك أو المحفظة.');
      return false;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال مبلغ صحيح.');
      return false;
    }
    if (!transferPurpose) {
      Alert.alert('خطأ', 'يرجى إدخال غاية التحويل.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('https://6873f50ac75558e27355be26.mockapi.io/bank-app');
      const data = await response.json();

      let matchedUser = null;
      if (aliasType === 'IBAN') {
        matchedUser = data.find(user => user.iban.toLowerCase() === inputValue.toLowerCase());
      } else {
        matchedUser = data.find(user => user.name.toLowerCase() === inputValue.toLowerCase());
      }

      if (!matchedUser) {
        Alert.alert('المستخدم غير موجود', 'تأكد من صحة البيانات المدخلة.');
        setIsSubmitting(false);
        return;
      }

      navigation.navigate('TransferDetails', {
        account: { ...account, accountType: account?.accountType || 'حساب جاري' },
        recipientName: matchedUser.name,
        recipientIban: matchedUser.iban,
        recipientBank: selectedBank,
        amount,
        transferPurpose,
        transferDetails: details,
      });

    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل في التحقق من بيانات المستخدم.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() =>
        navigation.navigate('TransferDetails', {
          account: { ...account, accountType: account?.accountType || 'حساب جاري' },
          recipientName: item.name,
          recipientIban: item.iban,
          recipientBank: item.bank,
          amount,
          transferPurpose,
          transferDetails: details,
        })
      }
    >
      <Text style={styles.favoriteName}>{item.name}</Text>
      <Text style={styles.favoriteBank}>{item.bank}</Text>
      <Text style={styles.favoriteType}>{item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity><Ionicons name="help-circle-outline" size={24} color="#666" /></TouchableOpacity>
          <Text style={styles.headerTitle}>تحويل</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity><Ionicons name="settings-outline" size={24} color="#666" /></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Card */}
        {account ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{account.accountType || 'حساب جاري'}</Text>
            <Text style={styles.cardIban}>{account.iban || 'غير متوفر'}</Text>
            <Text style={styles.cardBalance}>
              {account.balance ? `دينار ${parseFloat(account.balance).toFixed(2)}` : 'غير متوفر'}
            </Text>
          </View>
        ) : (
          <Text style={styles.errorText}>لا توجد بيانات حساب.</Text>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setTransferMethod('favorite')}
            style={[styles.tabButton, transferMethod === 'favorite' && styles.activeTab]}
          >
            <Text style={transferMethod === 'favorite' ? styles.activeTabText : styles.tabText}>
              المفضلة
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTransferMethod('iban')}
            style={[styles.tabButton, transferMethod === 'iban' && styles.activeTab]}
          >
            <Text style={transferMethod === 'iban' ? styles.activeTabText : styles.tabText}>
              تحويل يدوي
            </Text>
          </TouchableOpacity>
        </View>
                {/* Form or Favorites */}
                {transferMethod === 'favorite' ? (
          <View style={styles.favoritesBox}>
            {favorites.length > 0 ? (
              <FlatList
                data={favorites}
                renderItem={renderFavoriteItem}
                keyExtractor={(item) => item.id.toString()}
              />
            ) : (
              <Text style={styles.emptyFavoritesText}>لا توجد مفضلات حالياً</Text>
            )}
          </View>
        ) : (
          <View style={styles.formBox}>
            <Text style={styles.label}>نوع الإدخال</Text>
            <View style={styles.dropdownBox}>
              <Picker
                selectedValue={aliasType}
                onValueChange={(itemValue) => setAliasType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="الاسم المستعار" value="Alias" />
                <Picker.Item label="رقم IBAN" value="IBAN" />
              </Picker>
            </View>

            <Text style={styles.label}>{aliasType === 'Alias' ? 'الاسم المستعار' : 'رقم IBAN'}</Text>
            <TextInput
              style={styles.input}
              placeholder={aliasType === 'Alias' ? 'أدخل الاسم المستعار' : 'أدخل رقم الـ IBAN'}
              value={inputValue}
              onChangeText={setInputValue}
              textAlign="right"
            />

            <Text style={styles.label}>البنك أو المحفظة</Text>
            <View style={styles.dropdownBox}>
              <Picker
                selectedValue={selectedBank}
                onValueChange={(itemValue) => setSelectedBank(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="اختر البنك أو المحفظة" value="" />
                {banks.map((bank, idx) => (
                  <Picker.Item key={idx} label={bank} value={bank} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>المبلغ</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل المبلغ (دينار)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              textAlign="right"
            />

            <Text style={styles.label}>غاية التحويل</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل غاية التحويل"
              value={transferPurpose}
              onChangeText={setTransferPurpose}
              textAlign="right"
            />

            <Text style={styles.label}>تفاصيل إضافية (اختياري)</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل تفاصيل إضافية"
              value={details}
              onChangeText={setDetails}
              textAlign="right"
            />

            <TouchableOpacity
              style={[styles.sendButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendText}>إرسال</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6FA',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    backgroundColor: '#636AE8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  cardIban: {
    color: '#fff',
    textAlign: 'right',
    marginVertical: 4,
  },
  cardBalance: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  errorText: {
    color: '#636AE8',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabText: {
    color: '#666',
    fontSize: 14,
  },
  activeTab: {
    backgroundColor: '#636AE8'
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  formBox: {
    gap: 12,
  },
  favoritesBox: {
    flex: 1,
    paddingVertical: 10,
  },
  favoriteItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  favoriteBank: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  favoriteType: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  emptyFavoritesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContainer: {
  paddingBottom: 40,
},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 8,
    textAlign: 'right',
    backgroundColor: '#fff',
  },
  dropdownBox: {
    textAlign: 'center',

    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 40,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#636AE8',
    borderRadius: 30,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#636AE8',
    opacity: 0.7,
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
},
});
