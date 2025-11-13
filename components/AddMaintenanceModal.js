/// components/AddMaintenanceModal.js
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  Alert,
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

export const MAINTENANCE_TYPES = {
  water_change: 'Cambio de Agua',
  dosing: 'Dosificación',
  cleaning: 'Limpieza',
  equipment: 'Mantenimiento Equipo',
  observation: 'Observación'
};

const AddMaintenanceModal = ({ visible, onClose, onSave }) => {
  const [eventType, setEventType] = useState('water_change');
  const [notes, setNotes] = useState('');
  // --- 👇 1. NUEVOS ESTADOS PARA EL CAMBIO DE AGUA ---
  const [volume, setVolume] = useState('');
  const [units, setUnits] = useState('liters');

  const handleSave = () => {
    let data = {};
    if (eventType === 'water_change') {
      if (!volume.trim() || parseFloat(volume) <= 0) {
        Alert.alert('Valor Requerido', 'Por favor, introduce un volumen válido.');
        return;
      }
      data = { volume: parseFloat(volume), units, notes };
    } else {
      if (!notes.trim()) {
        Alert.alert('Notas Requeridas', 'Por favor, introduce una nota o descripción.');
        return;
      }
      data = { notes };
    }
    
    onSave(eventType, data);
    
    // Limpiar campos y cerrar
    setNotes('');
    setVolume('');
    setEventType('water_change');
    onClose();
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
          <Text style={styles.modalTitle}>Registrar Mantenimiento</Text>

          <Text style={styles.label}>Tipo de Evento</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={eventType} onValueChange={(itemValue) => setEventType(itemValue)}>
              {Object.entries(MAINTENANCE_TYPES).map(([key, value]) => (
                <Picker.Item key={key} label={value} value={key} />
              ))}
            </Picker>
          </View>

          {/* --- 👇 2. RENDERIZADO CONDICIONAL DE INPUTS --- */}
          {eventType === 'water_change' ? (
            <>
              <Text style={styles.label}>Volumen del Cambio</Text>
              <View style={styles.volumeContainer}>
                <TextInput
                  style={[styles.input, styles.volumeInput]}
                  placeholder="Ej: 20"
                  keyboardType="numeric"
                  placeholderTextColor={AppTheme.COLORS.darkGray}
                  value={volume}
                  onChangeText={setVolume}
                />
                <View style={[styles.pickerContainer, styles.unitsPicker]}>
                    <Picker selectedValue={units} onValueChange={(itemValue) => setUnits(itemValue)}>
                        <Picker.Item label="Litros" value="liters" />
                        <Picker.Item label="Galones" value="gallons" />
                    </Picker>
                </View>
              </View>
              <Text style={styles.label}>Notas Adicionales (Opcional)</Text>
              <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholderTextColor={AppTheme.COLORS.darkGray}/>
            </>
          ) : (
            <>
              <Text style={styles.label}>Notas / Descripción</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Describe el evento..."
                multiline={true}
                value={notes}
                placeholderTextColor={AppTheme.COLORS.darkGray}
                onChangeText={setNotes}
              />
            </>
          )}


          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
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


const styles = StyleSheet.create({
    // ... (estilos previos sin cambios)
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%', },
    modalTitle: { ...AppTheme.FONTS.h2, marginBottom: 20, textAlign: 'center', },
    label: { ...AppTheme.FONTS.body2, marginBottom: 8, },
    pickerContainer: { borderColor: AppTheme.COLORS.lightGray, borderWidth: 1, borderRadius: AppTheme.SIZES.radius, marginBottom: AppTheme.SIZES.margin, backgroundColor: AppTheme.COLORS.white, justifyContent: 'center' },
    input: { ...AppTheme.FONTS.body2, height: 50, borderColor: AppTheme.COLORS.lightGray, borderWidth: 1, borderRadius: AppTheme.SIZES.radius, paddingHorizontal: 15, marginBottom: AppTheme.SIZES.margin, backgroundColor: AppTheme.COLORS.white, },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, },
    button: { backgroundColor: AppTheme.COLORS.primary, borderRadius: AppTheme.SIZES.radius, padding: 15, elevation: 2, flex: 1, marginHorizontal: 5, alignItems: 'center', },
    cancelButton: { backgroundColor: AppTheme.COLORS.darkGray, },
    buttonText: { ...AppTheme.FONTS.h3, color: 'white', fontSize: 16, },
    // --- 👇 3. NUEVOS ESTILOS PARA EL INPUT DE VOLUMEN ---
    volumeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    volumeInput: {
        flex: 1,
        marginRight: 10,
    },
    unitsPicker: {
        flex: 1,
    }
});

export default AddMaintenanceModal;