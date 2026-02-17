import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDv4AoExDxhiCOFMxkk_iatcIy6651Ks9w",
  authDomain: "petcare-46539.firebaseapp.com",
  projectId: "petcare-46539",
  storageBucket: "petcare-46539.firebasestorage.app",
  messagingSenderId: "526803434769",
  appId: "1:526803434769:web:e22f95328fff77b6fca0b0"
};

const app = initializeApp(firebaseConfig);

// Enables auto-login / session persistence after restart
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
