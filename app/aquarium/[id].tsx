import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
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
} from "../../components/AddParameterModal";
import { AppTheme } from "../../constants/theme";
import { auth, db, storage } from "../../firebaseConfig";

// Interfaces
interface Aquarium {
  id: string;
  name: string;
  imageUrl?: string;
  volume?: number;
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
type ParameterKey = keyof typeof PARAMETERS;
interface ParameterData {
  [key: string]: ParameterReading[];
}
interface ChartPoint {
  value: number;
  label?: string;
  dataPointText?: string;
}

// Componente de Gráfica (sin cambios)
const ParameterChart = ({
  name,
  data,
  onAdd,
}: {
  name: string;
  data: ChartPoint[];
  onAdd: () => void;
}) => {
  const showChart = data.length > 0;
  const chartData =
    data.length === 1 ? [data[0], { ...data[0], label: undefined }] : data;
  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>{name}</Text>
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
          color={AppTheme.COLORS.secondary}
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
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No hay datos registrados. Añade una lectura.
          </Text>
        </View>
      )}
    </View>
  );
};

const AquariumDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [aquarium, setAquarium] = useState<Aquarium | null>(null);
  const [parameters, setParameters] = useState<ParameterData>({});
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [paramModalVisible, setParamModalVisible] = useState(false);
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

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

    const aquariumDocRef = doc(db, "aquariums", id);
    const unsubscribeAquarium = onSnapshot(aquariumDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAquarium({ id: docSnap.id, ...docSnap.data() } as Aquarium);
      } else {
        router.back();
      }
      setIsLoading(false);
    });

    const paramsCollectionRef = collection(db, "aquariums", id, "parameters");
    const paramsQuery = query(
      paramsCollectionRef,
      where("userId", "==", currentUser.uid)
    );
    const unsubscribeParams = onSnapshot(
      paramsQuery,
      (snapshot) => {
        const allParams: ParameterData = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const paramType = data.type;
          if (!allParams[paramType]) allParams[paramType] = [];
          allParams[paramType].push({
            id: doc.id,
            value: data.value,
            timestamp: data.timestamp,
          });
        });
        for (const paramType in allParams) {
          if (allParams[paramType] && allParams[paramType].length > 0) {
            allParams[paramType].sort(
              (a, b) => a.timestamp?.seconds - b.timestamp?.seconds
            );
          }
        }
        setParameters(allParams);
      },
      (error) => console.error("Error al escuchar los parámetros:", error)
    );

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
        const logsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
  }, [id]);

  const handleSaveParameter = async (paramType: string, value: number) => {
    const currentUser = auth.currentUser;
    if (!id || !currentUser) {
      console.error("Error: Acuario no identificado o usuario no autenticado.");
      Alert.alert(
        "Error",
        "No se pudo guardar el dato. Por favor, reinicia la sesión."
      );
      return;
    }
    try {
      const paramsRef = collection(db, "aquariums", id, "parameters");
      await addDoc(paramsRef, {
        type: paramType,
        value: value,
        timestamp: serverTimestamp(),
        userId: currentUser.uid,
      });
      const key = paramType as ParameterKey;
      Alert.alert(
        "¡Éxito!",
        `El parámetro ${PARAMETERS[key].name} ha sido guardado.`
      );
    } catch (error) {
      console.error("Error al guardar el parámetro:", error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al conectar con la base de datos."
      );
    }
  };

  const handleSaveMaintenance = async (type: string, data: any) => {
    const currentUser = auth.currentUser;
    if (!id || !currentUser) {
      console.error("Error: Acuario no identificado o usuario no autenticado.");
      Alert.alert(
        "Error",
        "No se pudo guardar el registro. Por favor, reinicia la sesión."
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
      let smartNotesArray = [];
      if (lastNitrate !== undefined) {
        const nitrateReduction = (reductionPercentage * lastNitrate).toFixed(2);
        smartNotesArray.push(`Puede reducir NO₃ en ~${nitrateReduction} ppm.`);
      }
      if (lastPhosphate !== undefined) {
        const phosphateReduction = (
          reductionPercentage * lastPhosphate
        ).toFixed(3);
        smartNotesArray.push(
          `Puede reducir PO₄ en ~${phosphateReduction} ppm.`
        );
      }
      if (smartNotesArray.length > 0) {
        logData.smartNote = smartNotesArray.join(" ");
      }
    }
    try {
      const logsRef = collection(db, "aquariums", id, "maintenance_logs");
      await addDoc(logsRef, logData);
      Alert.alert("¡Éxito!", "El registro ha sido guardado.");
    } catch (error) {
      console.error("Error al guardar el registro:", error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al conectar con la base de datos."
      );
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitas dar permiso para acceder a tus fotos."
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
      Alert.alert("¡Éxito!", "La foto del acuario ha sido actualizada.");
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      Alert.alert("Error", "No se pudo subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={AppTheme.COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: aquarium?.name || "Detalles",
          headerBackTitle: "Mis Acuarios",
        }}
      />
      <AddParameterModal
        visible={paramModalVisible}
        onClose={() => setParamModalVisible(false)}
        onSave={handleSaveParameter}
      />
      <AddMaintenanceModal
        visible={maintenanceModalVisible}
        onClose={() => setMaintenanceModalVisible(false)}
        onSave={handleSaveMaintenance}
      />

      <ScrollView contentContainerStyle={styles.content}>
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
                <Text style={styles.photoPlaceholderText}>Añadir Foto</Text>
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

        <Text style={styles.sectionTitle}>Parámetros</Text>
        {Object.keys(PARAMETERS).map((key) => {
          const paramKey = key as ParameterKey;
          const paramData = parameters[paramKey] || [];
          const dataForChart: ChartPoint[] = paramData.map((p) => {
            const date = p.timestamp
              ? new Date(p.timestamp.seconds * 1000)
              : new Date();
            return {
              value: p.value,
              label: date.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
              }),
            };
          });
          return (
            <ParameterChart
              key={paramKey}
              name={PARAMETERS[paramKey].name}
              data={dataForChart}
              onAdd={() => setParamModalVisible(true)}
            />
          );
        })}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bitácora de Mantenimiento</Text>
          <TouchableOpacity onPress={() => setMaintenanceModalVisible(true)}>
            <FontAwesome
              name="plus-circle"
              size={24}
              color={AppTheme.COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {maintenanceLogs.length > 0 ? (
          maintenanceLogs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <Text style={styles.logDate}>
                {new Date(log.timestamp?.seconds * 1000).toLocaleString(
                  "es-ES",
                  { dateStyle: "long", timeStyle: "short" }
                )}
              </Text>
              {log.type === "water_change" ? (
                <>
                  <Text style={styles.logType}>
                    Cambio de Agua: {log.volume} {log.units}
                  </Text>
                  {log.smartNote && (
                    <Text style={styles.smartNote}>💡 {log.smartNote}</Text>
                  )}
                  <Text style={styles.rodiNote}>
                    Recuerda usar agua de RODI a 0 TDS.
                  </Text>
                  {log.notes && (
                    <Text style={styles.logNotes}>Notas: {log.notes}</Text>
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
          ))
        ) : (
          <Text style={styles.noDataText}>
            No hay registros de mantenimiento.
          </Text>
        )}
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
              Gestionar Recordatorios
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- ESTILOS (CON NUEVAS CLASES PARA LA BITÁCORA) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.COLORS.background },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: AppTheme.SIZES.padding },
  photoContainer: {
    height: 200,
    borderRadius: AppTheme.SIZES.radius,
    marginBottom: AppTheme.SIZES.padding,
    backgroundColor: AppTheme.COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
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
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: AppTheme.SIZES.margin,
  },
  chartTitle: { ...AppTheme.FONTS.h3 },
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
  // --- 👇 NUEVOS ESTILOS ---
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
    backgroundColor: "#E6F4FF", // Un azul claro
    color: "#00529B", // Un azul oscuro
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
});

export default AquariumDetailScreen;
