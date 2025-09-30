// components/AddReminderModal.js
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppTheme } from '../constants/theme';

export const REMINDER_TYPES = {
  water_change: 'Cambio de Agua',
  cleaning: 'Limpieza General',
  parameter_test: 'Test de Parámetros',
  icp_test: 'Enviar Test ICP',
  other: 'Otra Tarea',
};

const AddReminderModal = ({ visible, onClose, onSave }) => {
  const [task, setTask] = useState('water_change');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [frequency, setFrequency] = useState('once'); // 'once', 'daily', 'weekly', 'monthly'

  const handleSave = () => {
    if (date < new Date()) {
      Alert.alert("Fecha Inválida", "No puedes programar un recordatorio en el pasado.");
      return;
    }
    onSave({ task, date, frequency });
    onClose();
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Nuevo Recordatorio</Text>

          <Text style={styles.label}>Tarea</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={task} onValueChange={(itemValue) => setTask(itemValue)}>
              {Object.entries(REMINDER_TYPES).map(([key, value]) => (
                <Picker.Item key={key} label={value} value={key} />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Fecha y Hora</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{date.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="datetime"
              is24Hour={true}
              display="default"
              onChange={onChangeDate}
            />
          )}

          <Text style={styles.label}>Repetir</Text>
           <View style={styles.pickerContainer}>
            <Picker selectedValue={frequency} onValueChange={(itemValue) => setFrequency(itemValue)}>
                <Picker.Item label="Nunca" value="once" />
                <Picker.Item label="Diariamente" value="daily" />
                <Picker.Item label="Semanalmente" value="weekly" />
                <Picker.Item label="Mensualmente" value="monthly" />
            </Picker>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ... (Estilos similares a los otros modales)
const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%', },
    modalTitle: { ...AppTheme.FONTS.h2, marginBottom: 20, textAlign: 'center', },
    label: { ...AppTheme.FONTS.body2, marginBottom: 8, },
    pickerContainer: { borderColor: AppTheme.COLORS.lightGray, borderWidth: 1, borderRadius: AppTheme.SIZES.radius, marginBottom: AppTheme.SIZES.margin, backgroundColor: AppTheme.COLORS.white, justifyContent: 'center' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, },
    button: { backgroundColor: AppTheme.COLORS.primary, borderRadius: AppTheme.SIZES.radius, padding: 15, elevation: 2, flex: 1, marginHorizontal: 5, alignItems: 'center', },
    cancelButton: { backgroundColor: AppTheme.COLORS.darkGray, },
    buttonText: { ...AppTheme.FONTS.h3, color: 'white', fontSize: 16, },
    dateButton: {
        ...AppTheme.FONTS.body2,
        height: 50,
        borderColor: AppTheme.COLORS.lightGray,
        borderWidth: 1,
        borderRadius: AppTheme.SIZES.radius,
        paddingHorizontal: 15,
        marginBottom: AppTheme.SIZES.margin,
        backgroundColor: AppTheme.COLORS.white,
        justifyContent: 'center',
    },
    dateButtonText: {
        ...AppTheme.FONTS.body2,
    }
});


export default AddReminderModal;