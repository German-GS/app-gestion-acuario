// firebaseConfig.js
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD7JxdALa1sGkpVlYzyoMKTj6MUTUi_hQw",
    authDomain: "aquamind-c43cb.firebaseapp.com",
    projectId: "aquamind-c43cb",
    storageBucket: "aquamind-c43cb.firebasestorage.app",
    messagingSenderId: "91058824770",
    appId: "1:91058824770:web:75bd34f2333055bdd82fdb",
    measurementId: "G-PQJXY4TFE2"
};

let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} else {
    app = getApp();
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);