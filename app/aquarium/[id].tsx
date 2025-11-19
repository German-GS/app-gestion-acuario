// app/(tabs)/[id].tsx
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import AddMaintenanceModal, {
  MAINTENANCE_TYPES,
} from "../../components/AddMaintenanceModal";
import AddParameterModal, {
  PARAMETERS,
  PARAM_KEYS_BY_TYPE,
} from "../../components/AddParameterModal";
import { AppTheme } from "../../constants/theme";
import { auth, db, storage } from "../../firebaseConfig";

// ---------- Tipos ----------
interface Aquarium {
  id: string;
  name: string;
  imageUrl?: string;
  volume?: number;
  // OJO: usamos mainType, que es lo que guardas en Firestore
  mainType?: "marine" | "freshwater";
  // opcional si en el futuro quieres usar type:
  type?: "marine" | "freshwater";
}

interface ParameterReading {
  id: string;
  timestamp: any;
  value: number;
}

interface MaintenanceLog {
  id: string;
  timestamp: any;
  type: keyof typeof MAINTENANCE_TYPES;
  notes: string;
  volume?: number;
  units?: "liters" | "gallons";
  smartNote?: string;
}

interface ParameterData {
  [key: string]: ParameterReading[];
}

interface ChartPoint {
  value: number;
  label?: string;
  dataPointText?: string;
  hideDataPoint?: boolean;
}

type TimeRange = "week" | "month" | "4m" | "6m" | "year" | "all";

// ---------- Helpers ----------
const getDateFromTimestamp = (ts: any): Date => {
  if (!ts || !ts.seconds) return new Date();
  return new Date(ts.seconds * 1000);
};

const formatShortDate = (date: Date, locale: string) =>
  date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
  });

const formatLongDateTime = (date: Date, locale: string) =>
  date.toLocaleString(locale, {
    dateStyle: "long",
    timeStyle: "short",
  });

// Detecta si el acuario es marino o dulce con varios posibles campos/valores
const getAquariumType = (aq: any): "marine" | "freshwater" => {
  if (!aq) return "marine";

  // Lo importante: mirar mainType, que es lo que guardas
  const rawMain = `${aq.mainType || ""}`.toLowerCase();
  const rawType = `${aq.type || ""}`.toLowerCase();
  const rawSub = `${aq.subType || ""}`.toLowerCase();

  // Cualquier cosa que huela a agua dulce
  if (
    rawMain.includes("fresh") ||
    rawMain.includes("dulce") ||
    rawType.includes("fresh") ||
    rawSub.includes("planted") ||
    rawSub.includes("community") ||
    rawSub.includes("goldfish") ||
    rawSub.includes("cichlid")
  ) {
    return "freshwater";
  }

  // Resto: lo consideramos marino
  return "marine";
};

// ---------- Componente de gráfica ----------
interface ParameterChartProps {
  name: string;
  unit?: string;
  iconName?: React.ComponentProps<typeof FontAwesome>["name"];
  lineColor?: string;
  data: ChartPoint[];
  readings: ParameterReading[];
  onAdd: () => void;
  onDelete: (readingId: string) => void;
}

const ParameterChart = ({
  name,
  unit,
  iconName,
  lineColor,
  data,
  readings,
  onAdd,
  onDelete,
}: ParameterChartProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-US" : "es-ES";

  const showChart = data.length > 0;
  const chartData: ChartPoint[] = [...data];

  // Lecturas recientes más nuevas primero
  const recentReadings = [...readings].sort(
    (a, b) =>
      getDateFromTimestamp(b.timestamp).getTime() -
      getDateFromTimestamp(a.timestamp).getTime()
  );

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {iconName && (
            <FontAwesome
              name={iconName}
              size={18}
              color={AppTheme.COLORS.secondary}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={styles.chartTitle}>{name}</Text>
          {unit ? (
            <View style={styles.unitChip}>
              <Text style={styles.unitChipText}>{unit}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity onPress={onAdd}>
          <FontAwesome
            name="plus-circle"
            size={24}
            color={AppTheme.COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {showChart ? (
        <LineChart
          data={chartData}
          color={lineColor || AppTheme.COLORS.secondary}
          thickness={3}
          yAxisTextStyle={{ color: AppTheme.COLORS.darkGray }}
          noOfSections={4}
          xAxisThickness={1}
          xAxisColor={AppTheme.COLORS.lightGray}
          xAxisLabelTextStyle={{
            color: AppTheme.COLORS.darkGray,
            fontSize: 10,
          }}
          dataPointsColor={AppTheme.COLORS.primary}
          dataPointsRadius={4}
          isAnimated
          initialSpacing={40}
          endSpacing={60}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            {t(
              "aquarium.parameters.noData",
              "No hay datos registrados. Añade una lectura."
            )}
          </Text>
        </View>
      )}

      {/* Lecturas recientes */}
      {recentReadings.length > 0 && (
        <View style={styles.readingsList}>
          <Text style={styles.readingsTitle}>
            {t("aquarium.parameters.recentReadings", "Lecturas recientes")}
          </Text>
          {recentReadings.map((r) => {
            const date = getDateFromTimestamp(r.timestamp);
            const dateText = formatLongDateTime(date, locale);
            return (
              <View key={r.id} style={styles.readingRow}>
                <View>
                  <Text style={styles.readingValue}>{r.value}</Text>
                  <Text style={styles.readingDate}>{dateText}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      t("aquarium.parameters.deleteTitle", "Eliminar lectura"),
                      t(
                        "aquarium.parameters.deleteMessage",
                        "¿Deseas eliminar la lectura de {{date}}?",
                        { date: dateText }
                      ),
                      [
                        {
                          text: t("common.cancel", "Cancelar"),
                          style: "cancel",
                        },
                        {
                          text: t("common.delete", "Eliminar"),
                          style: "destructive",
                          onPress: () => onDelete(r.id),
                        },
                      ]
                    )
                  }
                >
                  <FontAwesome name="trash-o" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

// ---------- Pantalla principal ----------
const AquariumDetailScreen = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-US" : "es-ES";

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [aquarium, setAquarium] = useState<Aquarium | null>(null);
  const [parameters, setParameters] = useState<ParameterData>({});
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [paramToEdit, setParamToEdit] = useState<string | null>(null);
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    // --- Documento del acuario ---
    const aquariumDocRef = doc(db, "aquariums", id);
    const unsubscribeAquarium = onSnapshot(aquariumDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAquarium({ id: docSnap.id, ...docSnap.data() } as Aquarium);
      } else {
        router.back();
      }
      setIsLoading(false);
    });

    // --- Parámetros ---
    const paramsCollectionRef = collection(db, "aquariums", id, "parameters");
    const paramsQuery = query(
      paramsCollectionRef,
      where("userId", "==", currentUser.uid)
    );

    const unsubscribeParams = onSnapshot(
      paramsQuery,
      (snapshot) => {
        const allParams: ParameterData = {};

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const paramType = data.type as string;

          if (!allParams[paramType]) allParams[paramType] = [];

          allParams[paramType].push({
            id: docSnap.id,
            value: data.value,
            timestamp: data.timestamp,
          });
        });

        // Ordenar por fecha ascendente
        for (const paramType in allParams) {
          if (allParams[paramType] && allParams[paramType].length > 0) {
            allParams[paramType].sort(
              (a, b) =>
                getDateFromTimestamp(a.timestamp).getTime() -
                getDateFromTimestamp(b.timestamp).getTime()
            );
          }
        }

        setParameters(allParams);
      },
      (error) => console.error("Error al escuchar los parámetros:", error)
    );

    // --- Bitácora de mantenimiento ---
    const logsCollectionRef = collection(
      db,
      "aquariums",
      id,
      "maintenance_logs"
    );
    const logsQuery = query(
      logsCollectionRef,
      where("userId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    );
    const unsubscribeLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        const logsData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as MaintenanceLog[];
        setMaintenanceLogs(logsData);
      },
      (error) => console.error("Error al escuchar la bitácora:", error)
    );

    return () => {
      unsubscribeAquarium();
      unsubscribeParams();
      unsubscribeLogs();
    };
  }, [id, router]);

  // ---------- Lógica de parámetros ----------
  const handleSaveParameter = async (paramType: string, value: number) => {
    const currentUser = auth.currentUser;
    if (!id || !currentUser) {
      console.error("Error: Acuario no identificado o usuario no autenticado.");
      Alert.alert(
        t("common.error", "Error"),
        t(
          "aquarium.parameters.saveErrorSession",
          "No se pudo guardar el dato. Por favor, reinicia la sesión."
        )
      );
      return;
    }

    try {
      const paramsRef = collection(db, "aquariums", id, "parameters");
      await addDoc(paramsRef, {
        type: paramType,
        value,
        timestamp: serverTimestamp(),
        userId: currentUser.uid,
      });

      const def = (PARAMETERS as any)[paramType];
      const name = def?.name || paramType;

      Alert.alert(
        t("common.success", "¡Éxito!"),
        t(
          "aquarium.parameters.saveSuccess",
          "El parámetro {{name}} ha sido guardado.",
          { name }
        )
      );
    } catch (error) {
      console.error("Error al guardar el parámetro:", error);
      Alert.alert(
        t("common.error", "Error"),
        t(
          "errors.databaseConnection",
          "Ocurrió un problema al conectar con la base de datos."
        )
      );
    }
  };

  const handleDeleteParameterReading = async (
    _paramType: string,
    readingId: string
  ) => {
    const currentUser = auth.currentUser;
    if (!id || !currentUser) {
      Alert.alert(
        t("common.error", "Error"),
        t(
          "auth.invalidSession",
          "Sesión no válida. Intenta iniciar sesión de nuevo."
        )
      );
      return;
    }

    try {
      const readingRef = doc(db, "aquariums", id, "parameters", readingId);
      await deleteDoc(readingRef);
    } catch (error) {
      console.error("Error al eliminar la lectura:", error);
      Alert.alert(
        t("common.error", "Error"),
        t("aquarium.parameters.deleteError", "No se pudo eliminar la lectura.")
      );
    }
  };

  // ---------- Mantenimiento ----------
  const handleSaveMaintenance = async (type: string, data: any) => {
    const currentUser = auth.currentUser;
    if (!id || !currentUser) {
      console.error("Error: Acuario no identificado o usuario no autenticado.");
      Alert.alert(
        t("common.error", "Error"),
        t(
          "aquarium.maintenance.saveErrorSession",
          "No se pudo guardar el registro. Por favor, reinicia la sesión."
        )
      );
      return;
    }

    let logData: any = {
      type,
      notes: data.notes,
      timestamp: serverTimestamp(),
      userId: currentUser.uid,
    };

    if (type === "water_change" && aquarium?.volume) {
      logData.volume = data.volume;
      logData.units = data.units;

      const lastNitrate = parameters.no3?.[parameters.no3.length - 1]?.value;
      const lastPhosphate = parameters.po4?.[parameters.po4.length - 1]?.value;
      const totalVolume = aquarium.volume;
      let changeVolume = data.volume;

      if (data.units === "gallons") {
        changeVolume = data.volume * 3.78541;
      }

      const reductionPercentage = changeVolume / totalVolume;
      const smartNotesArray: string[] = [];

      if (lastNitrate !== undefined) {
        const nitrateReduction = (reductionPercentage * lastNitrate).toFixed(2);
        smartNotesArray.push(
          t(
            "aquarium.maintenance.smartNoteNitrate",
            "Puede reducir NO₃ en ~{{value}} ppm.",
            { value: nitrateReduction }
          )
        );
      }

      if (lastPhosphate !== undefined) {
        const phosphateReduction = (
          reductionPercentage * lastPhosphate
        ).toFixed(3);
        smartNotesArray.push(
          t(
            "aquarium.maintenance.smartNotePhosphate",
            "Puede reducir PO₄ en ~{{value}} ppm.",
            { value: phosphateReduction }
          )
        );
      }

      if (smartNotesArray.length > 0) {
        logData.smartNote = smartNotesArray.join(" ");
      }
    }

    try {
      const logsRef = collection(db, "aquariums", id, "maintenance_logs");
      await addDoc(logsRef, logData);
      Alert.alert(
        t("common.success", "¡Éxito!"),
        t("aquarium.maintenance.saveSuccess", "El registro ha sido guardado.")
      );
    } catch (error) {
      console.error("Error al guardar el registro:", error);
      Alert.alert(
        t("common.error", "Error"),
        t(
          "errors.databaseConnection",
          "Ocurrió un problema al conectar con la base de datos."
        )
      );
    }
  };

  // ---------- Filtro de rango de tiempo ----------
  const filterByRange = (list: ParameterReading[]): ParameterReading[] => {
    if (timeRange === "all") return list;

    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    let fromDate = new Date(now);

    switch (timeRange) {
      case "week":
        fromDate = new Date(now.getTime() - 7 * msPerDay);
        break;
      case "month":
        fromDate = new Date(now.getTime() - 30 * msPerDay);
        break;
      case "4m":
        fromDate = new Date(now.getTime() - 120 * msPerDay);
        break;
      case "6m":
        fromDate = new Date(now.getTime() - 180 * msPerDay);
        break;
      case "year":
        fromDate = new Date(now.getTime() - 365 * msPerDay);
        break;
    }

    return list.filter((p) => {
      const date = getDateFromTimestamp(p.timestamp);
      return date >= fromDate;
    });
  };

  // ---------- Imagen ----------
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        t("aquarium.photo.permissionTitle", "Permiso requerido"),
        t(
          "aquarium.photo.permissionMessage",
          "Necesitas dar permiso para acceder a tus fotos."
        )
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (pickerResult.canceled) return;

    if (pickerResult.assets && pickerResult.assets.length > 0) {
      uploadImage(pickerResult.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    const currentUser = auth.currentUser;
    if (!currentUser || !id) {
      setIsUploading(false);
      return;
    }

    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(
      storage,
      `aquarium_images/${currentUser.uid}/${id}_${new Date().getTime()}`
    );

    try {
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      const docRef = doc(db, "aquariums", id);
      await updateDoc(docRef, { imageUrl: downloadURL });
      Alert.alert(
        t("common.success", "¡Éxito!"),
        t(
          "aquarium.photo.uploadSuccess",
          "La foto del acuario ha sido actualizada."
        )
      );
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      Alert.alert(
        t("common.error", "Error"),
        t("errors.uploadImage", "No se pudo subir la imagen.")
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ---------- Render ----------
  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={AppTheme.COLORS.primary} />
      </View>
    );
  }

  const aquariumType = getAquariumType(aquarium);

  const paramKeysToShow =
    (PARAM_KEYS_BY_TYPE as any)?.[aquariumType] ||
    Object.keys(PARAMETERS as any);
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: aquarium?.name || t("aquarium.details", "Detalles"),
          headerBackTitle: t("tabs.myAquariums", "Mis Acuarios"),
        }}
      />

      <AddParameterModal
        visible={paramToEdit !== null}
        initialParam={paramToEdit}
        aquariumType={getAquariumType(aquarium)}
        onClose={() => setParamToEdit(null)}
        onSave={handleSaveParameter}
      />

      <AddMaintenanceModal
        visible={maintenanceModalVisible}
        onClose={() => setMaintenanceModalVisible(false)}
        onSave={handleSaveMaintenance}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Foto */}
        <TouchableOpacity onPress={pickImage} disabled={isUploading}>
          <View style={styles.photoContainer}>
            {aquarium?.imageUrl ? (
              <Image source={{ uri: aquarium.imageUrl }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <FontAwesome
                  name="camera"
                  size={40}
                  color={AppTheme.COLORS.darkGray}
                />
                <Text style={styles.photoPlaceholderText}>
                  {t("aquarium.photo.addPhoto", "Añadir Foto")}
                </Text>
              </View>
            )}
            {isUploading && (
              <ActivityIndicator
                style={styles.uploadIndicator}
                size="large"
                color={AppTheme.COLORS.white}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Parámetros */}
        <Text style={styles.sectionTitle}>
          {t("aquarium.parameters.title", "Parámetros")}
        </Text>

        {/* Selector global de rango de tiempo */}
        <View style={styles.rangeSelector}>
          {[
            { label: t("aquarium.range.7d", "7d"), value: "week" },
            { label: t("aquarium.range.1m", "1m"), value: "month" },
            { label: t("aquarium.range.4m", "4m"), value: "4m" },
            { label: t("aquarium.range.6m", "6m"), value: "6m" },
            { label: t("aquarium.range.1y", "1a"), value: "year" },
            { label: t("aquarium.range.all", "Todo"), value: "all" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.rangeButton,
                timeRange === opt.value && styles.rangeButtonActive,
              ]}
              onPress={() => setTimeRange(opt.value as TimeRange)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  timeRange === opt.value && styles.rangeButtonTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tarjetas de parámetros */}
        {paramKeysToShow.map((key: string) => {
          const paramData = parameters[key] || [];
          const filteredReadings = filterByRange(paramData);

          const dataForChart: ChartPoint[] = filteredReadings.map((p) => {
            const date = getDateFromTimestamp(p.timestamp);
            return {
              value: p.value,
              label: formatShortDate(date, locale),
            };
          });

          const def = (PARAMETERS as any)[key] || { name: key, unit: "" };
          const localizedName = `${t(
            `aquarium.paramNames.${key}`,
            def.name || key
          )}`;

          return (
            <ParameterChart
              key={key}
              name={localizedName}
              unit={def.unit}
              iconName={def.icon}
              data={dataForChart}
              readings={filteredReadings}
              onAdd={() => setParamToEdit(key)}
              onDelete={(readingId) =>
                handleDeleteParameterReading(key, readingId)
              }
            />
          );
        })}

        {/* Bitácora de mantenimiento */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t("aquarium.maintenance.logTitle", "Bitácora de Mantenimiento")}
          </Text>
          <TouchableOpacity onPress={() => setMaintenanceModalVisible(true)}>
            <FontAwesome
              name="plus-circle"
              size={24}
              color={AppTheme.COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {maintenanceLogs.length > 0 ? (
          maintenanceLogs.map((log) => {
            const date = getDateFromTimestamp(log.timestamp);
            const dateText = formatLongDateTime(date, locale);

            const unitLabel =
              log.units === "gallons"
                ? t("units.gallons", "galones")
                : t("units.liters", "litros");

            return (
              <View key={log.id} style={styles.logItem}>
                <Text style={styles.logDate}>{dateText}</Text>
                {log.type === "water_change" ? (
                  <>
                    <Text style={styles.logType}>
                      {t(
                        "aquarium.maintenance.waterChange",
                        "Cambio de Agua: {{volume}} {{units}}",
                        {
                          volume: log.volume,
                          units: unitLabel,
                        }
                      )}
                    </Text>
                    {log.smartNote && (
                      <Text style={styles.smartNote}>💡 {log.smartNote}</Text>
                    )}
                    <Text style={styles.rodiNote}>
                      {t(
                        "aquarium.maintenance.rodiNote",
                        "Recuerda usar agua de RODI a 0 TDS."
                      )}
                    </Text>
                    {log.notes && (
                      <Text style={styles.logNotes}>
                        {t("aquarium.maintenance.notesLabel", "Notas:")}{" "}
                        {log.notes}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.logType}>
                      {MAINTENANCE_TYPES[log.type]}
                    </Text>
                    <Text style={styles.logNotes}>{log.notes}</Text>
                  </>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>
            {t(
              "aquarium.maintenance.noLogs",
              "No hay registros de mantenimiento."
            )}
          </Text>
        )}

        {/* Recordatorios */}
        <Link
          href={{
            pathname: "/reminders",
            params: { aquariumId: id, aquariumName: aquarium?.name },
          }}
          asChild
        >
          <TouchableOpacity style={styles.remindersButton}>
            <FontAwesome
              name="bell-o"
              size={20}
              color={AppTheme.COLORS.white}
            />
            <Text style={styles.remindersButtonText}>
              {t("aquarium.reminders.manageButton", "Gestionar Recordatorios")}
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------- Estilos ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.COLORS.background },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: AppTheme.SIZES.padding, paddingBottom: 32 },
  photoContainer: {
    height: 200,
    borderRadius: AppTheme.SIZES.radius,
    marginBottom: AppTheme.SIZES.padding,
    backgroundColor: AppTheme.COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: { justifyContent: "center", alignItems: "center" },
  photoPlaceholderText: {
    ...AppTheme.FONTS.body1,
    color: AppTheme.COLORS.darkGray,
    marginTop: AppTheme.SIZES.base,
  },
  uploadIndicator: { position: "absolute" },
  sectionTitle: {
    ...AppTheme.FONTS.h2,
    marginBottom: AppTheme.SIZES.margin,
    marginTop: AppTheme.SIZES.base,
    flex: 1,
  },
  chartContainer: {
    backgroundColor: AppTheme.COLORS.white,
    borderRadius: AppTheme.SIZES.radius,
    padding: AppTheme.SIZES.margin,
    marginBottom: AppTheme.SIZES.margin,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: AppTheme.SIZES.margin,
  },
  chartTitle: { ...AppTheme.FONTS.h3 },
  unitChip: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: AppTheme.COLORS.background,
  },
  unitChipText: {
    ...AppTheme.FONTS.caption,
    color: AppTheme.COLORS.darkGray,
  },
  noDataContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    ...AppTheme.FONTS.body2,
    color: AppTheme.COLORS.darkGray,
    textAlign: "center",
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: AppTheme.SIZES.padding,
  },
  logItem: {
    backgroundColor: AppTheme.COLORS.white,
    borderRadius: AppTheme.SIZES.radius,
    padding: AppTheme.SIZES.margin,
    marginBottom: AppTheme.SIZES.margin,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  logDate: {
    ...AppTheme.FONTS.caption,
    color: AppTheme.COLORS.darkGray,
    marginBottom: 4,
  },
  logType: {
    ...AppTheme.FONTS.h3,
    fontSize: 16,
    marginBottom: 6,
  },
  logNotes: {
    ...AppTheme.FONTS.body2,
    lineHeight: 22,
  },
  smartNote: {
    ...AppTheme.FONTS.body2,
    backgroundColor: "#E6F4FF",
    color: "#00529B",
    padding: 10,
    borderRadius: AppTheme.SIZES.radius,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#B3D9FF",
  },
  rodiNote: {
    ...AppTheme.FONTS.caption,
    color: AppTheme.COLORS.darkGray,
    fontStyle: "italic",
    marginTop: 8,
  },
  remindersButton: {
    backgroundColor: AppTheme.COLORS.secondary,
    padding: 15,
    borderRadius: AppTheme.SIZES.radius,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: AppTheme.SIZES.padding,
  },
  remindersButtonText: {
    ...AppTheme.FONTS.h3,
    color: AppTheme.COLORS.white,
    fontSize: 16,
    marginLeft: 10,
  },
  // Rango de tiempo
  rangeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: AppTheme.SIZES.margin,
  },
  rangeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppTheme.COLORS.lightGray,
    marginRight: 6,
    marginBottom: 6,
  },
  rangeButtonActive: {
    backgroundColor: AppTheme.COLORS.primary,
    borderColor: AppTheme.COLORS.primary,
  },
  rangeButtonText: {
    ...AppTheme.FONTS.caption,
    color: AppTheme.COLORS.darkGray,
  },
  rangeButtonTextActive: {
    color: "#fff",
  },
  // Lista de lecturas
  readingsList: {
    marginTop: AppTheme.SIZES.base,
    borderTopWidth: 1,
    borderTopColor: AppTheme.COLORS.lightGray,
    paddingTop: AppTheme.SIZES.base,
  },
  readingsTitle: {
    ...AppTheme.FONTS.caption,
    color: AppTheme.COLORS.darkGray,
    marginBottom: 4,
  },
  readingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  readingValue: {
    ...AppTheme.FONTS.body2,
  },
  readingDate: {
    ...AppTheme.FONTS.caption,
    color: AppTheme.COLORS.darkGray,
  },
});

export default AquariumDetailScreen;
