// app/createAquarium.js
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTheme } from '../constants/theme';
import { auth, db } from '../firebaseConfig';

// Opciones para los Pickers (esto ya estaba correcto)
const freshwaterSubTypes = {
  community: 'Comunitario',
  goldfish: 'Peces Dorados / Orientales',
  americanCichlids: 'Cíclidos Americanos',
  africanCichlids: 'Cíclidos Africanos',
  plantedLow: 'Plantado (Bajos Requerimientos)',
  plantedMid: 'Plantado (Medios Requerimientos)',
  plantedHigh: 'Plantado (Altos Requerimientos)',
};

const marineSubTypes = {
  fishOnly: 'Solo Peces',
  softCorals: 'Corales Blandos',
  lps: 'Corales LPS',
  sps: 'Corales SPS',
  mixedReef: 'Mixto (LPS, SPS y Blandos)',
};

const CreateAquariumScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    volume: '',
    mainType: 'freshwater',
    // --- 👇 CORRECCIÓN CLAVE AQUÍ 👇 ---
    // El valor inicial de subType debe ser una de las llaves cortas,
    // como 'community', para que coincida con lo que se guarda.
    subType: 'community',
    filtration: 'canister',
    lighting: 'led',
    substrate: 'sand',
  });

  const handleInputChange = (field, value) => {
    // Lógica para resetear el subtipo cuando cambia el tipo principal
    if (field === 'mainType') {
        const newSubType = value === 'freshwater' ? 'community' : 'fishOnly';
        setFormData(prevState => ({ ...prevState, [field]: value, subType: newSubType }));
    } else {
        setFormData(prevState => ({ ...prevState, [field]: value }));
    }
  };

  const handleSaveAquarium = async () => {
    if (!formData.name || !formData.volume) {
      Alert.alert('Campos Incompletos', 'Por favor, introduce el nombre y el volumen del acuario.');
      return;
    }

    try {
      await addDoc(collection(db, 'aquariums'), {
        userId: auth.currentUser.uid,
        name: formData.name,
        volume: parseInt(formData.volume, 10),
        mainType: formData.mainType,
        subType: formData.subType, // Esto ya guarda la llave correcta
        setupDate: serverTimestamp(),
        filtration: formData.filtration,
        lighting: formData.lighting,
        substrate: formData.substrate,
      });
      
      Alert.alert('¡Éxito!', 'Tu acuario ha sido registrado.', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error("Error al guardar el acuario:", error);
      Alert.alert('Error', 'No se pudo registrar tu acuario.');
    }
  };

  const subTypeOptions = formData.mainType === 'freshwater' ? freshwaterSubTypes : marineSubTypes;

  // El resto del return y los estilos no necesitan cambios...
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nuevo Acuario</Text>
        
        {/* Inputs para nombre y volumen */}
        <Text style={styles.label}>Nombre del Acuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Mi primer plantado"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          placeholderTextColor={AppTheme.COLORS.darkGray}
        />
        <Text style={styles.label}>Volumen (en litros)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 100"
          keyboardType="numeric"
          value={formData.volume}
          onChangeText={(value) => handleInputChange('volume', value)}
          placeholderTextColor={AppTheme.COLORS.darkGray}
        />
        
        {/* Pickers */}
        <Text style={styles.label}>Tipo Principal</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.mainType}
            onValueChange={(value) => handleInputChange('mainType', value)}
          >
            <Picker.Item label="Agua Dulce" value="freshwater" />
            <Picker.Item label="Marino" value="marine" />
          </Picker>
        </View>

        <Text style={styles.label}>Sub-Tipo de Acuario</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.subType}
            onValueChange={(value) => handleInputChange('subType', value)}
          >
            {Object.entries(subTypeOptions).map(([key, label]) => (
              <Picker.Item key={key} label={label} value={key} />
            ))}
          </Picker>
        </View>

        {/* ...otros Pickers y TextInput de sustrato... */}
        <Text style={styles.label}>Tipo de Filtración</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.filtration}
            onValueChange={(value) => handleInputChange('filtration', value)}
          >
            <Picker.Item label="Filtro Canister" value="canister" />
            <Picker.Item label="Sump" value="sump" />
            <Picker.Item label="Filtro de Cascada (Hang-on)" value="hang-on" />
            <Picker.Item label="Filtro Interno" value="internal" />
          </Picker>
        </View>
        <Text style={styles.label}>Tipo de Iluminación</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.lighting}
            onValueChange={(value) => handleInputChange('lighting', value)}
          >
            <Picker.Item label="LED" value="led" />
            <Picker.Item label="Tubos Fluorescentes (T5/T8)" value="fluorescent" />
            <Picker.Item label="Halogenuros Metálicos (HQI)" value="hqi" />
          </Picker>
        </View>
        <Text style={styles.label}>Tipo de Sustrato</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Arena, Grava, Aquasoil"
          value={formData.substrate}
          onChangeText={(value) => handleInputChange('substrate', value)}
        />

        {/* Botones */}
        <TouchableOpacity style={styles.button} onPress={handleSaveAquarium}>
          <Text style={styles.buttonText}>Guardar Acuario</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppTheme.COLORS.background,
    },
    content: {
        padding: AppTheme.SIZES.padding,
    },
    title: {
        ...AppTheme.FONTS.h1,
        marginBottom: AppTheme.SIZES.padding,
    },
    label: {
        ...AppTheme.FONTS.body1,
        color: AppTheme.COLORS.text,
        marginBottom: AppTheme.SIZES.base,
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
    pickerContainer: {
        borderColor: AppTheme.COLORS.lightGray,
        borderWidth: 1,
        borderRadius: AppTheme.SIZES.radius,
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
    cancelButton: {
        backgroundColor: AppTheme.COLORS.darkGray,
    },
    buttonText: {
        ...AppTheme.FONTS.h3,
        color: AppTheme.COLORS.white,
        fontSize: 16,
    },
});

export default CreateAquariumScreen;