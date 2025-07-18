import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseconfig/config/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customerId, setCustomerId] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !customerId) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        customerId,
        createdAt: new Date(),
      });

      Alert.alert('تم التسجيل بنجاح');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('خطأ', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إنشاء حساب جديد</Text>
      <TextInput style={styles.input} placeholder="البريد الإلكتروني" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="كلمة المرور" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="رقم العميل" value={customerId} onChangeText={setCustomerId} />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>تسجيل</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#aaa', marginBottom: 10, padding: 10, borderRadius: 5 },
  button: { backgroundColor: '#222', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center' },
});
