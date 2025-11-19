// app/(auth)/register.js
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { AppTheme } from '../../constants/theme';
import { auth } from '../../firebaseConfig';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleRegister = () => {
    // --- 1. Validaciones del lado del cliente ---
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Campos Incompletos', 'Por favor, llena todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error de Contraseña', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
        Alert.alert('Contraseña Débil', 'La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    // --- 2. Lógica de Creación de Usuario en Firebase ---
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Usuario creado. Ahora actualizamos su perfil con el nombre de usuario.
        return updateProfile(userCredential.user, {
          displayName: username,
        });
      })
      .then(() => {
        // Perfil actualizado.
        Alert.alert(
          '¡Cuenta Creada!',
          'Tu cuenta ha sido creada con éxito. Ahora puedes iniciar sesión.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      })
      .catch(error => {
        // --- 3. Manejo de errores de Firebase ---
        console.error("Error en el registro:", error.code);
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Error', 'Este correo electrónico ya está en uso.');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Error', 'El formato del correo electrónico no es válido.');
        } else {
          Alert.alert('Error', 'Ocurrió un error al crear la cuenta.');
        }
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
          <Text style={styles.title}>Crear una Cuenta</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre de Usuario"
            value={username}
            placeholderTextColor={AppTheme.COLORS.darkGray}
            onChangeText={setUsername}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={AppTheme.COLORS.darkGray}
            textContentType="emailAddress"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={AppTheme.COLORS.darkGray}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="password-new"
          />
           <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor={AppTheme.COLORS.darkGray}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="password-new"
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>¿Ya tienes una cuenta? Inicia Sesión</Text>
          </TouchableOpacity>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Usa los mismos estilos que la pantalla de login para consistencia
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

export default RegisterScreen;