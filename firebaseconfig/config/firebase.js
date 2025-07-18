// firebaseconfig/config/firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5Ogx_bi3qDK6zFLV8nd8Qdj86kvVnxM8",
  authDomain: "onewallet-7ed0f.firebaseapp.com",
  projectId: "onewallet-7ed0f",
  storageBucket: "onewallet-7ed0f.firebasestorage.app",
  messagingSenderId: "425339791305",
  appId: "1:425339791305:web:5f1f0210c5bf77e4f5aa18",
  measurementId: "G-8727SXZZZ9"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
