// app/(auth)/login.js
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { AppTheme } from '../../constants/theme';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
// --- 👇 IMPORTANTE: AÑADIMOS signInWithEmailAndPassword 👇 ---
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para feedback visual
  const router = useRouter();

  // --- Lógica de Google (sin cambios) ---
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: "91058824770-piv7dgiijuvckiq1e53n9geoasj38b2a.apps.googleusercontent.com",
    androidClientId: "91058824770-m4i4hbgkfrfe789e47ig20mndgq2qr0r.apps.googleusercontent.com",
    webClientId: "91058824770-aigfc59143jmeqfdi0rfus5kqngeqq18.apps.googleusercontent.com",
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response) {
      if (response.type === 'success') {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential).catch(error => {
            console.error("Error en signInWithCredential:", error);
            Alert.alert("Error", "No se pudo validar la credencial de Google.");
        });
      } else if (response.type === 'error') {
        console.error("Error en la respuesta de autenticación:", response.error);
        Alert.alert("Error", "Ocurrió un error durante la autenticación.");
      }
    }
  }, [response]);


  // --- 👇 LÓGICA DE INICIO DE SESIÓN CON CORREO IMPLEMENTADA 👇 ---
  const handleEmailLogin = () => {
    if (!email || !password) {
      Alert.alert("Campos incompletos", "Por favor, introduce tu correo y contraseña.");
      return;
    }
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .catch(error => {
        console.log(error.code);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            Alert.alert("Error", "Las credenciales son incorrectas. Por favor, verifica tu correo y contraseña.");
        } else {
            Alert.alert("Error", "Ocurrió un error al intentar iniciar sesión.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Bienvenido a AquaMind</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleEmailLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={AppTheme.COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

           <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            disabled={!request || isLoading}
            onPress={() => promptAsync()}
          >
            <Text style={styles.buttonText}>🚀 Iniciar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>¿No tienes una cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// ... (tus estilos sin cambios)
const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: AppTheme.SIZES.padding,
    backgroundColor: AppTheme.COLORS.background,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: AppTheme.SIZES.padding,
  },
  title: {
    ...AppTheme.FONTS.h1,
    textAlign: 'center',
    marginBottom: AppTheme.SIZES.padding,
  },
  input: {
    ...AppTheme.FONTS.body2,
    height: 50,
    borderColor: AppTheme.COLORS.lightGray,
    borderWidth: 1,
    borderRadius: AppTheme.SIZES.radius,
    paddingHorizontal: 15,
    marginBottom: AppTheme.SIZES.margin,
    backgroundColor: AppTheme.COLORS.white,
  },
  button: {
    backgroundColor: AppTheme.COLORS.primary,
    padding: 15,
    borderRadius: AppTheme.SIZES.radius,
    alignItems: 'center',
    marginTop: AppTheme.SIZES.margin,
    height: 55,
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4', // Color de Google
    marginTop: 10,
  },
  buttonText: {
    ...AppTheme.FONTS.h3,
    color: AppTheme.COLORS.white,
    fontSize: 16,
  },
  linkText: {
    ...AppTheme.FONTS.body2,
    color: AppTheme.COLORS.primary,
    textAlign: 'center',
    marginTop: AppTheme.SIZES.padding,
  },
});

export default LoginScreen;