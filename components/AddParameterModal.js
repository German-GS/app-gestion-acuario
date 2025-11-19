// components/AddParameterModal.js
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

export const PARAMETERS = {
  kh: { name: "Alkalinity (KH)", unit: "dKH" },
  ca: { name: "Calcium (Ca)", unit: "ppm" },
  mg: { name: "Magnesium (Mg)", unit: "ppm" },
  no3: { name: "Nitrate (NO₃)", unit: "ppm" },
  po4: { name: "Phosphate (PO₄)", unit: "ppm" },
  salinity: { name: "Salinity", unit: "ppt" },
  temp: { name: "Temperature", unit: "°C" },
  ph: { name: "pH", unit: "" },
  gh: { name: "General Hardness (GH)", unit: "°dGH" },
  ammonia: { name: "Ammonia", unit: "ppm" },
  nitrite: { name: "Nitrite", unit: "ppm" },
  nitrate: { name: "Nitrate", unit: "ppm" },
  iron: { name: "Iron (Fe)", unit: "ppm" },
  co2: { name: "CO₂", unit: "ppm" },
  tds: { name: "TDS", unit: "ppm" },
};

export const PARAM_KEYS_BY_TYPE = {
  marine: ["kh", "ca", "mg", "no3", "po4", "salinity", "temp", "ph"],
  freshwater: [
    "ph",
    "gh",
    "kh",
    "ammonia",
    "nitrite",
    "nitrate",
    "iron",
    "co2",
    "tds",
    "temp",
  ],
};

const AddParameterModal = ({
  visible,
  initialParam,
  aquariumType = "marine",
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();

  const paramKeys = PARAM_KEYS_BY_TYPE[aquariumType] || Object.keys(PARAMETERS);
  const [selectedParam, setSelectedParam] = useState(
    initialParam || paramKeys[0] || "kh"
  );
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  // Nuevo estado para controlar la visibilidad del picker en iOS
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (initialParam) {
      setSelectedParam(initialParam);
    } else if (paramKeys.length > 0) {
      setSelectedParam(paramKeys[0]);
    }
    setValue("");
    setError("");
    setShowPicker(false); // Resetear al abrir
  }, [initialParam, visible, aquariumType]);

  const handleSave = () => {
    const numericValue = parseFloat(value.replace(",", "."));
    if (isNaN(numericValue)) {
      setError(
        t(
          "parameterModal.errorInvalidNumber",
          "Introduce un valor numérico válido."
        )
      );
      return;
    }
    setError("");
    onSave(selectedParam, numericValue);
    onClose();
  };

  const unit = PARAMETERS[selectedParam]?.unit || "ppm";

  // Renderizado condicional del Picker
  const renderPicker = () => {
    const pickerContent = (
      <Picker
        selectedValue={selectedParam}
        onValueChange={(value) => {
          setSelectedParam(value);
          // En iOS opcionalmente puedes cerrar el picker al seleccionar,
          // o dejar que el usuario lo cierre con el botón
          if (Platform.OS === "ios") setShowPicker(false);
        }}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        {paramKeys.map((key) => (
          <Picker.Item key={key} label={PARAMETERS[key].name} value={key} />
        ))}
      </Picker>
    );

    if (Platform.OS === "ios") {
      return (
        <View style={{ marginBottom: AppTheme.SIZES.margin }}>
          <TouchableOpacity
            style={[styles.input, { justifyContent: "center" }]}
            onPress={() => setShowPicker(!showPicker)}
          >
            <Text style={{ color: AppTheme.COLORS.text }}>
              {PARAMETERS[selectedParam]?.name || selectedParam}
            </Text>
          </TouchableOpacity>
          {showPicker && pickerContent}
        </View>
      );
    }

    // Android mantiene el estilo original
    return <View style={styles.pickerWrapper}>{pickerContent}</View>;
  };

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
          <Text style={styles.modalTitle}>
            {t("parameterModal.title", "Añadir Nueva Lectura")}
          </Text>

          <Text style={styles.label}>
            {t("parameterModal.parameterLabel", "Parámetro")}
          </Text>

          {/* Usamos la función de renderizado condicional */}
          {renderPicker()}

          <Text style={styles.label}>
            {`${t("parameterModal.valueLabel", "Valor")} (${unit || "ppm"})`}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t(
              "parameterModal.valuePlaceholder",
              "Introduce el valor medido"
            )}
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonRow}>
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
    backgroundColor: "#fff",
    padding: AppTheme.SIZES.padding,
    // Asegura que el modal pueda crecer si el picker se expande
    maxHeight: "90%",
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: AppTheme.COLORS.lightGray,
    borderRadius: AppTheme.SIZES.radius,
    marginBottom: AppTheme.SIZES.margin,
    backgroundColor: "#fff",
    overflow: "hidden",
    height: 50,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    // Eliminamos height fijo para que en iOS se expanda
    // height: 50,
    color: AppTheme.COLORS.text,
  },
  pickerItem: {
    fontSize: 16,
    color: AppTheme.COLORS.text,
  },
  input: {
    borderColor: AppTheme.COLORS.lightGray,
    borderWidth: 1,
    borderRadius: AppTheme.SIZES.radius,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: AppTheme.SIZES.margin,
    backgroundColor: "#fff",
    color: "#1A1A1A",
    ...AppTheme.FONTS.body2,
    height: 50, // Aseguramos altura consistente
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
