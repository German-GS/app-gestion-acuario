// components/AddReminderModal.js
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppTheme } from "../constants/theme";

export const REMINDER_TYPES = {
  water_change: "Cambio de Agua",
  cleaning: "Limpieza General",
  parameter_test: "Test de Parámetros",
  icp_test: "Enviar Test ICP",
  dosing: "Dosificación",
  other: "Otra Tarea",
};

// Mapeo de etiquetas para Frecuencia (para mostrar en el botón de iOS)
const FREQUENCY_LABELS = {
  once: "Nunca",
  daily: "Diariamente",
  weekly: "Semanalmente",
  monthly: "Mensualmente",
};

const DOSE_UNITS = {
  ml: "ml",
  drops: "Gotas",
  spoon: "Cucharadita",
};

const AddReminderModal = ({ visible, onClose, onSave }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-US" : "es-ES";

  const [task, setTask] = useState("water_change");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [frequency, setFrequency] = useState("once");
  const [androidMode, setAndroidMode] = useState("date");

  // Estados para controlar la visibilidad de los pickers en iOS
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  // 👉 Estados para dosificación
  const [doseName, setDoseName] = useState("");
  const [doseAmount, setDoseAmount] = useState("");
  const [doseUnit, setDoseUnit] = useState("ml");
  const [showDoseUnitPicker, setShowDoseUnitPicker] = useState(false);

  const handleSave = () => {
    if (date < new Date()) {
      Alert.alert(
        t("aquarium.reminders.invalidDateTitle", "Fecha Inválida"),
        t(
          "aquarium.reminders.invalidDateMessage",
          "No puedes programar un recordatorio en el pasado."
        )
      );
      return;
    }

    // Validación específica para dosificación
    if (task === "dosing") {
      const numericDose = parseFloat(doseAmount.replace(",", "."));

      if (!doseName.trim()) {
        Alert.alert(
          t("aquarium.reminders.doseNameRequiredTitle", "Nombre requerido"),
          t(
            "aquarium.reminders.doseNameRequiredMessage",
            "Por favor, indica el suplemento o producto a dosificar."
          )
        );
        return;
      }

      if (!doseAmount.trim() || isNaN(numericDose) || numericDose <= 0) {
        Alert.alert(
          t("aquarium.reminders.doseAmountRequiredTitle", "Cantidad inválida"),
          t(
            "aquarium.reminders.doseAmountRequiredMessage",
            "Introduce una cantidad numérica válida para la dosificación."
          )
        );
        return;
      }
    }

    onSave({
      task,
      date,
      frequency,
      // Solo incluimos estos datos de forma útil cuando es dosificación
      doseName: task === "dosing" ? doseName.trim() : null,
      doseAmount:
        task === "dosing" ? parseFloat(doseAmount.replace(",", ".")) : null,
      doseUnit: task === "dosing" ? doseUnit : null,
    });

    // Reset sencillo
    setDoseName("");
    setDoseAmount("");
    setDoseUnit("ml");
    setShowDoseUnitPicker(false);

    onClose();
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;

    if (Platform.OS === "android") {
      setShowDatePicker(false);
      setDate(currentDate);

      if (event.type === "set") {
        if (androidMode === "date") {
          setAndroidMode("time");
          setTimeout(() => setShowDatePicker(true), 50);
        } else {
          setAndroidMode("date");
        }
      } else {
        setAndroidMode("date");
      }
    } else {
      setDate(currentDate);
    }
  };

  const showDatepicker = () => {
    if (Platform.OS === "android") {
      setAndroidMode("date");
      setShowDatePicker(true);
    } else {
      // En iOS alternamos la visibilidad
      setShowDatePicker(!showDatePicker);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {t("aquarium.reminders.modalTitle", "Nuevo Recordatorio")}
          </Text>

          {/* --- SELECCIÓN DE TAREA --- */}
          <Text style={styles.label}>
            {t("aquarium.reminders.taskLabel", "Tarea")}
          </Text>

          {Platform.OS === "ios" ? (
            <View style={{ marginBottom: AppTheme.SIZES.margin }}>
              <TouchableOpacity
                style={[styles.inputButton]}
                onPress={() => setShowTaskPicker(!showTaskPicker)}
              >
                <Text style={styles.inputText}>
                  {t(
                    `aquarium.reminders.types.${task}`,
                    REMINDER_TYPES[task] || task
                  )}
                </Text>
              </TouchableOpacity>
              {showTaskPicker && (
                <Picker
                  selectedValue={task}
                  onValueChange={(value) => setTask(value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {Object.entries(REMINDER_TYPES).map(([key, label]) => (
                    <Picker.Item
                      key={key}
                      label={t(`aquarium.reminders.types.${key}`, label)}
                      value={key}
                    />
                  ))}
                </Picker>
              )}
            </View>
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={task}
                onValueChange={(value) => setTask(value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {Object.entries(REMINDER_TYPES).map(([key, label]) => (
                  <Picker.Item
                    key={key}
                    label={t(`aquarium.reminders.types.${key}`, label)}
                    value={key}
                  />
                ))}
              </Picker>
            </View>
          )}

          {/* --- CAMPOS EXTRA PARA DOSIFICACIÓN --- */}
          {task === "dosing" && (
            <>
              <Text style={styles.label}>
                {t("aquarium.reminders.doseNameLabel", "Producto / Suplemento")}
              </Text>
              <TextInput
                style={styles.textInput}
                value={doseName}
                onChangeText={setDoseName}
                placeholder={t(
                  "aquarium.reminders.doseNamePlaceholder",
                  "Ej: Hierro, All for Reef"
                )}
                placeholderTextColor={AppTheme.COLORS.darkGray}
              />

              <View style={styles.doseRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>
                    {t("aquarium.reminders.doseAmountLabel", "Cantidad")}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={doseAmount}
                    onChangeText={setDoseAmount}
                    keyboardType="numeric"
                    placeholder={t(
                      "aquarium.reminders.doseAmountPlaceholder",
                      "Ej: 2, 20"
                    )}
                    placeholderTextColor={AppTheme.COLORS.darkGray}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>
                    {t("aquarium.reminders.doseUnitLabel", "Unidad")}
                  </Text>

                  {Platform.OS === "ios" ? (
                    <View style={{ marginBottom: AppTheme.SIZES.margin }}>
                      <TouchableOpacity
                        style={[styles.inputButton]}
                        onPress={() =>
                          setShowDoseUnitPicker(!showDoseUnitPicker)
                        }
                      >
                        <Text style={styles.inputText}>
                          {t(
                            `aquarium.reminders.doseUnits.${doseUnit}`,
                            DOSE_UNITS[doseUnit] || doseUnit
                          )}
                        </Text>
                      </TouchableOpacity>
                      {showDoseUnitPicker && (
                        <Picker
                          selectedValue={doseUnit}
                          onValueChange={(value) => setDoseUnit(value)}
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          {Object.entries(DOSE_UNITS).map(([key, label]) => (
                            <Picker.Item
                              key={key}
                              label={t(
                                `aquarium.reminders.doseUnits.${key}`,
                                label
                              )}
                              value={key}
                            />
                          ))}
                        </Picker>
                      )}
                    </View>
                  ) : (
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={doseUnit}
                        onValueChange={(value) => setDoseUnit(value)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                      >
                        {Object.entries(DOSE_UNITS).map(([key, label]) => (
                          <Picker.Item
                            key={key}
                            label={t(
                              `aquarium.reminders.doseUnits.${key}`,
                              label
                            )}
                            value={key}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          {/* --- FECHA Y HORA --- */}
          <Text style={styles.label}>
            {t("aquarium.reminders.dateTimeLabel", "Fecha y Hora")}
          </Text>
          <TouchableOpacity style={styles.dateButton} onPress={showDatepicker}>
            <Text style={styles.dateButtonText}>
              {date.toLocaleString(locale, {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <View style={styles.dateTimePickerContainer}>
              <DateTimePicker
                value={date}
                mode={Platform.OS === "android" ? androidMode : "datetime"}
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={onChangeDate}
                style={styles.iosDatePicker}
              />
            </View>
          )}

          {/* --- REPETIR --- */}
          <Text style={styles.label}>
            {t("aquarium.reminders.repeatLabel", "Repetir")}
          </Text>

          {Platform.OS === "ios" ? (
            <View style={{ marginBottom: AppTheme.SIZES.margin }}>
              <TouchableOpacity
                style={[styles.inputButton]}
                onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
              >
                <Text style={styles.inputText}>
                  {t(
                    `aquarium.reminders.frequency.${frequency}`,
                    FREQUENCY_LABELS[frequency] || frequency
                  )}
                </Text>
              </TouchableOpacity>
              {showFrequencyPicker && (
                <Picker
                  selectedValue={frequency}
                  onValueChange={(value) => setFrequency(value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item
                    label={t("aquarium.reminders.frequency.once", "Nunca")}
                    value="once"
                  />
                  <Picker.Item
                    label={t(
                      "aquarium.reminders.frequency.daily",
                      "Diariamente"
                    )}
                    value="daily"
                  />
                  <Picker.Item
                    label={t(
                      "aquarium.reminders.frequency.weekly",
                      "Semanalmente"
                    )}
                    value="weekly"
                  />
                  <Picker.Item
                    label={t(
                      "aquarium.reminders.frequency.monthly",
                      "Mensualmente"
                    )}
                    value="monthly"
                  />
                </Picker>
              )}
            </View>
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={frequency}
                onValueChange={(value) => setFrequency(value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item
                  label={t("aquarium.reminders.frequency.once", "Nunca")}
                  value="once"
                />
                <Picker.Item
                  label={t("aquarium.reminders.frequency.daily", "Diariamente")}
                  value="daily"
                />
                <Picker.Item
                  label={t(
                    "aquarium.reminders.frequency.weekly",
                    "Semanalmente"
                  )}
                  value="weekly"
                />
                <Picker.Item
                  label={t(
                    "aquarium.reminders.frequency.monthly",
                    "Mensualmente"
                  )}
                  value="monthly"
                />
              </Picker>
            </View>
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
      </View>
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
    // Permitir que crezca si se abren los pickers en iOS
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

  // Estilos para el contenedor del Picker (solo usado en Android ahora)
  pickerWrapper: {
    borderWidth: 1,
    borderColor: AppTheme.COLORS.lightGray,
    borderRadius: AppTheme.SIZES.radius,
    backgroundColor: AppTheme.COLORS.white,
    marginBottom: AppTheme.SIZES.margin,
    height: 50,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    color: AppTheme.COLORS.text,
  },
  pickerItem: {
    fontSize: 16,
    color: AppTheme.COLORS.text,
  },

  // Nuevo estilo para el botón que simula input en iOS
  inputButton: {
    height: 50,
    borderColor: AppTheme.COLORS.lightGray,
    borderWidth: 1,
    borderRadius: AppTheme.SIZES.radius,
    paddingHorizontal: 15,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  inputText: {
    ...AppTheme.FONTS.body2,
    color: AppTheme.COLORS.text,
  },

  textInput: {
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

  doseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Date Picker
  dateButton: {
    ...AppTheme.FONTS.body2,
    height: 50,
    borderColor: AppTheme.COLORS.lightGray,
    borderWidth: 1,
    borderRadius: AppTheme.SIZES.radius,
    paddingHorizontal: 15,
    marginBottom: AppTheme.SIZES.margin,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  dateButtonText: {
    ...AppTheme.FONTS.body2,
    color: "#1A1A1A",
  },
  dateTimePickerContainer: {
    marginTop: 0,
    marginBottom: AppTheme.SIZES.margin,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center", // Centra el picker en iOS
  },
  iosDatePicker: {
    width: "100%",
  },

  // Botones inferiores
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
  cancelButton: {
    backgroundColor: AppTheme.COLORS.darkGray,
  },
  buttonText: {
    ...AppTheme.FONTS.h3,
    color: "white",
    fontSize: 16,
  },
});

export default AddReminderModal;
