// screens/SignUpScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customerId, setCustomerId] = useState('');
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (!email || !password || !customerId) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email,
        customerId,
        createdAt: new Date(),
      });

      Alert.alert('تم بنجاح', 'تم إنشاء الحساب بنجاح');
      navigation.navigate('Login');
    } catch (error) {
      console.error('خطأ:', error);
      Alert.alert('فشل التسجيل', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إنشاء حساب</Text>

      <TextInput
        placeholder="البريد الإلكتروني"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="كلمة المرور"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="رقم العميل (Customer ID)"
        style={styles.input}
        value={customerId}
        onChangeText={setCustomerId}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>تسجيل حساب</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>لديك حساب؟ سجل الدخول</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: width * 0.85,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    width: width * 0.85,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  link: {
    marginTop: 15,
    color: '#007AFF',
  },
});
