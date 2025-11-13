// components/AddParameterModal.js
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AppTheme } from '../constants/theme';

// Definimos los parámetros con sus unidades
export const PARAMETERS = {
  kh: { name: 'Alcalinidad (KH)', unit: 'dKH' },
  ca: { name: 'Calcio (Ca)', unit: 'ppm' },
  mg: { name: 'Magnesio (Mg)', unit: 'ppm' },
  no3: { name: 'Nitratos (NO3)', unit: 'ppm' },
  po4: { name: 'Fosfatos (PO4)', unit: 'ppm' },
  temp: { name: 'Temperatura', unit: '°C' },
};

const AddParameterModal = ({ visible, onClose, onSave }) => {
  // Aseguramos que siempre haya una selección válida
  const [selectedParam, setSelectedParam] = useState('kh');
  const [value, setValue] = useState('');

  const handleSave = () => {
    if (!value.trim()) {
      // Usamos Alert en lugar de alert
      Alert.alert('Valor Requerido', 'Por favor, introduce un valor.');
      return;
    }
    onSave(selectedParam, parseFloat(value));
    setValue(''); // Limpiamos el valor
    onClose(); // Cerramos el modal
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Añadir Nueva Lectura</Text>

          <Text style={styles.label}>Parámetro</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedParam}
              onValueChange={(itemValue) => setSelectedParam(itemValue)}
            >
              {Object.entries(PARAMETERS).map(([key, { name }]) => (
                <Picker.Item key={key} label={name} value={key} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Valor ({PARAMETERS[selectedParam]?.unit || ''})</Text>
          <TextInput
            style={styles.input}
            placeholder="Introduce el valor medido"
            placeholderTextColor={AppTheme.COLORS.darkGray}
            keyboardType="decimal-pad" // Mejor para valores numéricos
            value={value}
            onChangeText={setValue}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ... (Estilos sin cambios)
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    ...AppTheme.FONTS.h2,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    ...AppTheme.FONTS.body2,
    marginBottom: 8,
  },
  pickerContainer: {
    borderColor: AppTheme.COLORS.lightGray,
    borderWidth: 1,
    borderRadius: AppTheme.SIZES.radius,
    marginBottom: AppTheme.SIZES.margin,
    backgroundColor: AppTheme.COLORS.white,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: AppTheme.COLORS.primary,
    borderRadius: AppTheme.SIZES.radius,
    padding: 15,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: AppTheme.COLORS.darkGray,
  },
  buttonText: {
    ...AppTheme.FONTS.h3,
    color: 'white',
    fontSize: 16,
  },
});

export default AddParameterModal;

