// components/AddParameterModal.js
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
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

// 👇 Mismo objeto que usas en [id].tsx
export const PARAMETERS = {
  kh: { name: "Alcalinidad (KH)", unit: "dKH" },
  ca: { name: "Calcio (Ca)", unit: "ppm" },
  mg: { name: "Magnesio (Mg)", unit: "ppm" },
  no3: { name: "Nitratos (NO3)", unit: "ppm" },
  po4: { name: "Fosfatos (PO4)", unit: "ppm" },
};

const AddParameterModal = ({ visible, initialParam, onClose, onSave }) => {
  const [selectedParam, setSelectedParam] = useState(initialParam || "kh");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialParam) {
      setSelectedParam(initialParam);
    }
    setValue("");
    setError("");
  }, [initialParam, visible]);

  const handleSave = () => {
    const numericValue = parseFloat(value.replace(",", "."));
    if (isNaN(numericValue)) {
      setError("Introduce un valor numérico válido.");
      return;
    }
    setError("");
    onSave(selectedParam, numericValue);
    onClose();
  };

  const unit = PARAMETERS[selectedParam]?.unit || "";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Añadir Nueva Lectura</Text>

          {/* Label Parámetro */}
          <Text style={styles.label}>Parámetro</Text>

          {/* Contenedor del Picker con altura fija para que no corte el texto */}
          <View
            style={[
              styles.pickerOuter,
              Platform.OS === "android" && styles.pickerOuterAndroid,
            ]}
          >
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedParam}
                onValueChange={(itemValue) => setSelectedParam(itemValue)}
                mode="dropdown"
                dropdownIconColor={AppTheme.COLORS.darkGray}
                style={styles.picker}
              >
                {Object.keys(PARAMETERS).map((key) => (
                  <Picker.Item
                    key={key}
                    label={PARAMETERS[key].name}
                    value={key}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Valor */}
          <Text style={styles.label}>Valor ({unit || "ppm"})</Text>
          <TextInput
            style={styles.input}
            placeholder="Introduce el valor medido"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Botones */}
          <View style={styles.buttonRow}>
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    width: "100%",
    borderRadius: AppTheme.SIZES.radius * 1.5,
    backgroundColor: AppTheme.COLORS.white,
    padding: AppTheme.SIZES.padding,
  },
  modalTitle: {
    ...AppTheme.FONTS.h2,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    ...AppTheme.FONTS.body2,
    marginBottom: 8,
  },

  // --- Picker fix ---
  pickerOuter: {
    borderColor: AppTheme.COLORS.lightGray,
    borderWidth: 1,
    borderRadius: AppTheme.SIZES.radius,
    marginBottom: AppTheme.SIZES.margin,
    backgroundColor: AppTheme.COLORS.white,
    overflow: "hidden",
  },
  // Para Android real: aseguramos zIndex/elevation para que no se esconda
  pickerOuterAndroid: {
    zIndex: 10,
    elevation: 10,
  },
  // Altura fija y centrado vertical
  pickerContainer: {
    height: 52,
    justifyContent: "center",
  },
  picker: {
    height: 52,
    width: "100%",
  },

  input: {
    borderColor: AppTheme.COLORS.lightGray,
    borderWidth: 1,
    borderRadius: AppTheme.SIZES.radius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: AppTheme.SIZES.margin,
    ...AppTheme.FONTS.body2,
  },
  errorText: {
    ...AppTheme.FONTS.caption,
    color: "red",
    marginBottom: AppTheme.SIZES.margin,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: AppTheme.SIZES.base,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: AppTheme.SIZES.radius,
    backgroundColor: AppTheme.COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: AppTheme.COLORS.darkGray,
  },
  buttonText: {
    ...AppTheme.FONTS.h3,
    color: "white",
    fontSize: 16,
  },
});

export default AddParameterModal;
