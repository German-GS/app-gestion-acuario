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
    // --- 👇 LÍNEA CORREGIDA AQUÍ 👇 ---
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

// Ya no necesitas el bloque del emulador, lo puedes dejar comentado o borrarlo
/*
const host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
if (__DEV__ && !auth.emulatorConfig) {
    // ... código del emulador
}
*/

/* if (__DEV__ && !auth.emulatorConfig) {
    console.log(`🔌 Conectando a los emuladores en host: ${host}`);
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectStorageEmulator(storage, host, 9199);
    connectFirestoreEmulator(db, host, 8080);
} */


/* // firebaseConfig.js
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // <-- CORRECCIÓN AQUÍ
import { getApp, getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD7JxdALa1sGkpVlYzyoMKTj6MUTUi_hQw",
  authDomain: "aquamind-c43cb.firebaseapp.com",
  projectId: "aquamind-c43cb",
  storageBucket: "aquamind-c43cb.firebasestorage.app",
  messagingSenderId: "91058824770",
  appId: "1:91058824770:web:75bd34f2333055bdd82fdb",
  measurementId: "G-PQJXY4TFE2"
};

// Inicialización condicional de Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Inicializa y exporta los servicios que usarás
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app); */