// app/(tabs)/profile.js
import { signOut, updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTheme } from '../../constants/theme';
import { auth } from '../../firebaseConfig';

const ProfileScreen = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar los datos del usuario cuando la pantalla se monta
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, []);

  const handleUpdateProfile = () => {
    const user = auth.currentUser;
    if (user && displayName.trim() !== user.displayName) {
      setIsLoading(true);
      updateProfile(user, {
        displayName: displayName.trim(),
      }).then(() => {
        Alert.alert("¡Éxito!", "Tu nombre ha sido actualizado.");
      }).catch(error => {
        console.error("Error al actualizar el perfil:", error);
        Alert.alert("Error", "No se pudo actualizar tu nombre.");
      }).finally(() => {
        setIsLoading(false);
      });
    }
  };

  const handleLogout = () => {
    signOut(auth).catch(error => {
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      
      {/* --- Formulario de Perfil --- */}
      <View style={styles.form}>
        <Text style={styles.label}>Nombre de Usuario</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Tu nombre"
        />

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={email}
          editable={false} // El correo no se puede editar
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={AppTheme.COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- Estilos Mejorados ---
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
        alignItems: 'center',
        justifyContent: 'center',
        height: 55,
        marginTop: 10,
    },
    logoutButton: {
        backgroundColor: AppTheme.COLORS.accentMarine,
        padding: 15,
        borderRadius: AppTheme.SIZES.radius,
        alignItems: 'center',
    },
    buttonText: {
        ...AppTheme.FONTS.h3,
        color: AppTheme.COLORS.white,
        fontSize: 16,
    },
});

export default ProfileScreen;