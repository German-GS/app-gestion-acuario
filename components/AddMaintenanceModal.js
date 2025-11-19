// components/AddMaintenanceModal.js
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppTheme } from "../constants/theme";

export const MAINTENANCE_TYPES = {
  water_change: "Cambio de Agua",
  dosing: "Dosificación",
  cleaning: "Limpieza",
  equipment: "Mantenimiento Equipo",
  observation: "Observación",
};

const AddMaintenanceModal = ({ visible, onClose, onSave }) => {
  const { t } = useTranslation();

  const [eventType, setEventType] = useState("water_change");
  const [notes, setNotes] = useState("");
  const [volume, setVolume] = useState("");
  const [units, setUnits] = useState("liters");

  // Estados para controlar visibilidad en iOS
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const handleSave = () => {
    let data = {};

    if (eventType === "water_change") {
      if (!volume.trim() || parseFloat(volume) <= 0) {
        Alert.alert(
          t("maintenanceModal.requiredValueTitle", "Valor Requerido"),
          t(
            "maintenanceModal.requiredValueMessage",
            "Por favor, introduce un volumen válido."
          )
        );
        return;
      }
      data = { volume: parseFloat(volume), units, notes };
    } else {
      if (!notes.trim()) {
        Alert.alert(
          t("maintenanceModal.requiredNotesTitle", "Notas Requeridas"),
          t(
            "maintenanceModal.requiredNotesMessage",
            "Por favor, introduce una nota o descripción."
          )
        );
        return;
      }
      data = { notes };
    }

    onSave(eventType, data);
    setNotes("");
    setVolume("");
    setEventType("water_change");
    onClose();
  };

  // Helper para renderizar pickers
  const renderIOSPicker = (
    selectedValue,
    setValue,
    options,
    visible,
    setVisible,
    isMap = true
  ) => {
    // options puede ser un objeto (Map) o array
    const label = isMap ? options[selectedValue] : selectedValue;
    const translatedLabel = isMap
      ? t(`aquarium.maintenance.types.${selectedValue}`, label)
      : label;

    return (
      <View style={{ marginBottom: AppTheme.SIZES.margin }}>
        <TouchableOpacity
          style={[styles.input, { justifyContent: "center" }]}
          onPress={() => setVisible(!visible)}
        >
          <Text style={{ color: "#1A1A1A" }}>{translatedLabel}</Text>
        </TouchableOpacity>
        {visible && (
          <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue) => setValue(itemValue)}
            style={styles.picker}
          >
            {isMap
              ? Object.entries(options).map(([key, value]) => (
                  <Picker.Item
                    key={key}
                    label={t(`aquarium.maintenance.types.${key}`, value)}
                    value={key}
                  />
                ))
              : options.map((opt) => (
                  <Picker.Item
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                  />
                ))}
          </Picker>
        )}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {t("maintenanceModal.title", "Registrar Mantenimiento")}
          </Text>

          <Text style={styles.label}>
            {t("maintenanceModal.eventTypeLabel", "Tipo de Evento")}
          </Text>

          {Platform.OS === "ios" ? (
            renderIOSPicker(
              eventType,
              setEventType,
              MAINTENANCE_TYPES,
              showTypePicker,
              setShowTypePicker
            )
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={eventType}
                onValueChange={(itemValue) => setEventType(itemValue)}
                style={styles.picker}
                dropdownIconColor={AppTheme.COLORS.darkGray}
              >
                {Object.entries(MAINTENANCE_TYPES).map(([key, value]) => (
                  <Picker.Item
                    key={key}
                    label={t(`aquarium.maintenance.types.${key}`, value)}
                    value={key}
                  />
                ))}
              </Picker>
            </View>
          )}

          {eventType === "water_change" ? (
            <>
              <Text style={styles.label}>
                {t(
                  "maintenanceModal.waterChangeVolumeLabel",
                  "Volumen del Cambio"
                )}
              </Text>
              <View style={styles.volumeContainer}>
                <TextInput
                  style={[styles.input, styles.volumeInput]}
                  placeholder={t(
                    "maintenanceModal.volumePlaceholder",
                    "Ej: 20"
                  )}
                  keyboardType="numeric"
                  placeholderTextColor={AppTheme.COLORS.darkGray}
                  value={volume}
                  onChangeText={setVolume}
                />

                <View style={{ flex: 1 }}>
                  {Platform.OS === "ios" ? (
                    /* Picker de Unidades en iOS */
                    <View>
                      <TouchableOpacity
                        style={[
                          styles.input,
                          { justifyContent: "center", marginBottom: 0 },
                        ]}
                        onPress={() => setShowUnitPicker(!showUnitPicker)}
                      >
                        <Text style={{ color: "#1A1A1A" }}>{units}</Text>
                      </TouchableOpacity>
                      {showUnitPicker && (
                        <Picker
                          selectedValue={units}
                          onValueChange={(val) => setUnits(val)}
                          style={styles.picker}
                        >
                          <Picker.Item label="litros" value="liters" />
                          <Picker.Item label="galones" value="gallons" />
                        </Picker>
                      )}
                    </View>
                  ) : (
                    /* Picker de Unidades en Android */
                    <View style={[styles.pickerContainer, styles.unitsPicker]}>
                      <Picker
                        selectedValue={units}
                        onValueChange={(value) => setUnits(value)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                      >
                        <Picker.Item label="litros" value="liters" />
                        <Picker.Item label="galones" value="gallons" />
                      </Picker>
                    </View>
                  )}
                </View>
              </View>

              {/* Para evitar que el layout salte al abrir el picker en iOS, 
                  a veces es bueno poner el siguiente input en un View aparte 
                  o dar margen si el picker está abierto, pero por ahora lo dejamos simple */}

              <Text
                style={[styles.label, { marginTop: AppTheme.SIZES.margin }]}
              >
                {t(
                  "maintenanceModal.waterChangeNotesLabel",
                  "Notas Adicionales (Opcional)"
                )}
              </Text>
              <TextInput
                style={styles.input}
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor={AppTheme.COLORS.darkGray}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>
                {t("maintenanceModal.notesLabel", "Notas / Descripción")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { height: 100, textAlignVertical: "top" },
                ]}
                placeholder={t(
                  "maintenanceModal.notesPlaceholder",
                  "Describe el evento..."
                )}
                multiline={true}
                value={notes}
                placeholderTextColor={AppTheme.COLORS.darkGray}
                onChangeText={setNotes}
              />
            </>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>
                {t("common.cancel", "Cancelar")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>
                {t("common.save", "Guardar")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  picker: {
    width: "100%",
    color: AppTheme.COLORS.text,
    // Sin height fijo para iOS
  },
  pickerItem: {
    fontSize: 16,
    color: AppTheme.COLORS.text,
  },
  modalTitle: { ...AppTheme.FONTS.h2, marginBottom: 20, textAlign: "center" },
  label: { ...AppTheme.FONTS.body2, marginBottom: 8 },
  pickerContainer: {
    borderColor: AppTheme.COLORS.lightGray,
    borderWidth: 1,
    borderRadius: AppTheme.SIZES.radius,
    marginBottom: AppTheme.SIZES.margin,
    backgroundColor: "#fff",
    justifyContent: "center",
    zIndex: 40,
    elevation: 10,
    // Mantener esto solo para Android
    height: 50,
  },
  input: {
    ...AppTheme.FONTS.body2,
    height: 50,
    borderColor: AppTheme.COLORS.lightGray,
    borderWidth: 1,
    borderRadius: AppTheme.SIZES.radius,
    paddingHorizontal: 15,
    marginBottom: AppTheme.SIZES.margin,
    backgroundColor: "#fff",
    color: "#1A1A1A",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    backgroundColor: AppTheme.COLORS.primary,
    borderRadius: AppTheme.SIZES.radius,
    padding: 15,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: AppTheme.COLORS.darkGray },
  buttonText: { ...AppTheme.FONTS.h3, color: "white", fontSize: 16 },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Cambiado a flex-start para que se alineen arriba si el picker se abre
  },
  volumeInput: {
    flex: 1,
    marginRight: 10,
  },
  unitsPicker: {
    flex: 1,
    marginBottom: 0, // Reset margin inside flex container
  },
});

export default AddMaintenanceModal;
