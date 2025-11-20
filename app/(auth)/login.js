// app/(auth)/login.js
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
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
  View,
} from "react-native";
import { AppTheme } from "../../constants/theme";
import { auth } from "../../firebaseConfig";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Configura Google Sign-In una sola vez.
    // El webClientId se usa para obtener el idToken y es indispensable.
    GoogleSignin.configure({
      webClientId:
        "91058824770-p93jsqs7fihgvfgivjjqvprbd72nnpfc.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // --- 👇 LA CORRECCIÓN ESTÁ AQUÍ 👇 ---
      // Obtenemos el idToken desde userInfo.data en lugar de userInfo
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error(
          "No se pudo obtener el idToken de la respuesta de Google."
        );
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Inicio de sesión cancelado por el usuario");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("El inicio de sesión ya está en progreso");
      } else {
        console.error("Error detallado de Google Sign-In:", error);
        Alert.alert(
          "Error",
          "Ocurrió un error durante el inicio de sesión con Google."
        );
      }
    }
  };

  const handleEmailLogin = () => {
    if (!email || !password) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, introduce tu correo y contraseña."
      );
      return;
    }
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        Alert.alert("Error", "Las credenciales son incorrectas.");
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
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Bienvenido a AquaMind</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={AppTheme.COLORS.darkGray}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={AppTheme.COLORS.darkGray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleEmailLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={AppTheme.COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleLogin}
          >
            <Text style={styles.buttonText}>🚀 Iniciar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.linkText}>
              ¿No tienes una cuenta? Regístrate
            </Text>
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
    justifyContent: "center",
    padding: AppTheme.SIZES.padding,
    backgroundColor: AppTheme.COLORS.background,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: AppTheme.SIZES.padding,
  },
  title: {
    ...AppTheme.FONTS.h1,
    textAlign: "center",
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
    alignItems: "center",
    marginTop: AppTheme.SIZES.margin,
    height: 55,
    justifyContent: "center",
  },
  googleButton: {
    backgroundColor: "#4285F4", // Color de Google
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
    textAlign: "center",
    marginTop: AppTheme.SIZES.padding,
  },
});

export default LoginScreen;
