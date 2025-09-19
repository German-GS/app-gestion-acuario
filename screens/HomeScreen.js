import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

// 1. ¡Importa tu tema!
import { AppTheme } from '../constants/theme';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Acuarios</Text>
        <Text style={styles.subtitle}>Bienvenido de nuevo</Text>
      </View>
      {/* ...el resto de tu pantalla */}
    </SafeAreaView>
  );
};

// 2. Usa las variables del tema para crear los estilos del componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.COLORS.background, // <- Color de fondo global
  },
  header: {
    padding: AppTheme.SIZES.padding, // <- Espaciado global
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.COLORS.lightGray,
  },
  title: {
    ...AppTheme.FONTS.h1, // <- Estilo de fuente global para H1
  },
  subtitle: {
    ...AppTheme.FONTS.body2, // <- Estilo de fuente global para texto normal
    color: AppTheme.COLORS.darkGray, // <- Puedes sobreescribir propiedades
  },
});

export default HomeScreen;