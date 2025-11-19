import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme } from "../../constants/theme";
import { auth } from "../../firebaseConfig";
import i18n from "../../i18n";

const LANGUAGE_KEY = "appLanguage";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "es");

  // Cargar los datos del usuario y el idioma guardado
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
    }

    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (stored && stored !== i18n.language) {
          await i18n.changeLanguage(stored);
          setCurrentLang(stored);
        }
      } catch (e) {
        console.warn("Error loading language", e);
      }
    };

    loadLanguage();
  }, []);

  const handleUpdateProfile = () => {
    const user = auth.currentUser;
    if (user && displayName.trim() !== user.displayName) {
      setIsLoading(true);
      updateProfile(user, {
        displayName: displayName.trim(),
      })
        .then(() => {
          Alert.alert(t("profile.updated"));
        })
        .catch((error) => {
          console.error("Error al actualizar el perfil:", error);
          Alert.alert("Error", t("profile.updateError"));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error("Logout error:", error);
      Alert.alert("Error", t("profile.logoutError"));
    });
  };

  const handleChangeLanguage = async (lang) => {
    try {
      await i18n.changeLanguage(lang);
      setCurrentLang(lang);
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (e) {
      console.warn("Error changing language", e);
    }
  };

  const isES = currentLang.startsWith("es");
  const isEN = currentLang.startsWith("en");

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t("profile.title")}</Text>

      {/* --- Formulario de Perfil --- */}
      <View style={styles.form}>
        <Text style={styles.label}>{t("profile.username")}</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={t("profile.username")}
        />

        <Text style={styles.label}>{t("profile.email")}</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={email}
          editable={false} // El correo no se puede editar
        />

        {/* --- Selector de idioma --- */}
        <Text style={[styles.label, { marginTop: 16 }]}>
          {t("profile.language")}
        </Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langButton, isES && styles.langButtonActive]}
            onPress={() => handleChangeLanguage("es")}
          >
            <Text
              style={[
                styles.langButtonText,
                isES && styles.langButtonTextActive,
              ]}
            >
              ES · {t("profile.spanish")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langButton, isEN && styles.langButtonActive]}
            onPress={() => handleChangeLanguage("en")}
          >
            <Text
              style={[
                styles.langButtonText,
                isEN && styles.langButtonTextActive,
              ]}
            >
              EN · {t("profile.english")}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdateProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={AppTheme.COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>{t("profile.save")}</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>{t("profile.logout")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: AppTheme.SIZES.padding,
    backgroundColor: AppTheme.COLORS.background,
  },
  title: {
    ...AppTheme.FONTS.h1,
    marginBottom: AppTheme.SIZES.padding * 2,
  },
  form: {
    flex: 1,
  },
  label: {
    ...AppTheme.FONTS.body2,
    color: AppTheme.COLORS.darkGray,
    marginBottom: 8,
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
  inputDisabled: {
    backgroundColor: AppTheme.COLORS.lightGray,
    color: AppTheme.COLORS.darkGray,
  },
  button: {
    backgroundColor: AppTheme.COLORS.primary,
    padding: 15,
    borderRadius: AppTheme.SIZES.radius,
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: AppTheme.COLORS.accentMarine,
    padding: 15,
    borderRadius: AppTheme.SIZES.radius,
    alignItems: "center",
  },
  buttonText: {
    ...AppTheme.FONTS.h3,
    color: AppTheme.COLORS.white,
    fontSize: 16,
  },

  langRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: AppTheme.SIZES.margin,
  },
  langButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: AppTheme.SIZES.radius,
    borderWidth: 1,
    borderColor: AppTheme.COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppTheme.COLORS.white,
  },
  langButtonActive: {
    borderColor: AppTheme.COLORS.secondary,
    backgroundColor: "#E6F7FF",
  },
  langButtonText: {
    ...AppTheme.FONTS.body2,
    color: AppTheme.COLORS.darkGray,
  },
  langButtonTextActive: {
    color: AppTheme.COLORS.secondary,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
