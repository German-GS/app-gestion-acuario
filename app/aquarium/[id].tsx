// app/aquarium/[id].tsx
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
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
import AddParameterModal, {
  PARAMETERS,
} from "../../components/AddParameterModal";
import { AppTheme } from "../../constants/theme";
import { auth, db, storage } from "../../firebaseConfig";

// --- TIPOS DE DATOS ---
interface Aquarium {
  id: string;
  name: string;
  imageUrl?: string;
}
interface ParameterReading {
  id: string;
  timestamp: any; // Firestore Timestamp
  value: number;
}
type ParameterKey = keyof typeof PARAMETERS;
interface ParameterData {
  [key: string]: ParameterReading[];
}
// Tipo de dato para la gráfica
interface ChartPoint {
  value: number;
  label?: string;
  dataPointText?: string;
}

// --- COMPONENTE DE LA GRÁFICA (CON MEJORAS) ---
const ParameterChart = ({
  name,
  data,
  onAdd,
}: {
  name: string;
  data: ChartPoint[];
  onAdd: () => void;
}) => {
  // CAMBIO 1: Lógica para mostrar la gráfica desde el primer punto.
  const showChart = data.length > 0;

  // CAMBIO 2: Si solo hay un punto, lo duplicamos para que la librería dibuje el punto.
  // Le quitamos la etiqueta al segundo para que no se muestre duplicada.
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
          // Eje Y (vertical)
          yAxisTextStyle={{ color: AppTheme.COLORS.darkGray }}
          noOfSections={4}
          // Eje X (horizontal)
          xAxisThickness={1}
          xAxisColor={AppTheme.COLORS.lightGray}
          xAxisLabelTextStyle={{
            color: AppTheme.COLORS.darkGray,
            fontSize: 10,
          }}
          // Puntos de datos
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

// --- PANTALLA PRINCIPAL ---
const AquariumDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [aquarium, setAquarium] = useState<Aquarium | null>(null);
  const [parameters, setParameters] = useState<ParameterData>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // 1. Verificamos que tengamos un ID para el acuario.
    if (!id) {
      console.log("No hay ID de acuario, volviendo atrás.");
      router.back();
      return;
    }

    // 2. Obtenemos el usuario actual de forma segura.
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("Usuario no autenticado, no se pueden cargar los datos.");
      setIsLoading(false); // Dejamos de cargar si no hay usuario.
      return;
    }

    // --- SUSCRIPCIÓN AL DOCUMENTO DEL ACUARIO ---
    // (Esta parte no cambia)
    const aquariumDocRef = doc(db, "aquariums", id);
    const unsubscribeAquarium = onSnapshot(aquariumDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAquarium({ id: docSnap.id, ...docSnap.data() } as Aquarium);
      } else {
        console.log("El acuario no existe.");
        router.back();
      }
      // Solo dejamos de cargar cuando tenemos la info del acuario.
      setIsLoading(false);
    });

    // --- SUSCRIPCIÓN A LOS PARÁMETROS (AHORA SEGURA) ---
    const paramsCollectionRef = collection(db, "aquariums", id, "parameters");
    // 3. La consulta ahora filtra por el 'userId' para cumplir la regla de seguridad.
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
          if (!allParams[paramType]) {
            allParams[paramType] = [];
          }
          allParams[paramType].push({
            id: doc.id,
            value: data.value,
            timestamp: data.timestamp,
          });
        });

        // Ordenamos los parámetros por fecha (esto no cambia)
        for (const paramType in allParams) {
          if (allParams[paramType] && allParams[paramType].length > 0) {
            allParams[paramType].sort(
              (a, b) => a.timestamp?.seconds - b.timestamp?.seconds
            );
          }
        }
        setParameters(allParams);
      },
      (error) => {
        // 4. Añadimos un manejo de errores para la escucha de parámetros.
        // Esto te ayudará a ver cualquier futuro error de Firestore en la consola.
        console.error("Error al escuchar los parámetros:", error);
      }
    );

    // --- FUNCIÓN DE LIMPIEZA ---
    // Se ejecuta cuando el componente se desmonta para evitar fugas de memoria.
    return () => {
      unsubscribeAquarium();
      unsubscribeParams();
    };
  }, [id]); // El efecto se volv

  const handleSaveParameter = async (paramType: string, value: number) => {
    if (!id) return;
    try {
      const paramsRef = collection(db, "aquariums", id, "parameters");
      await addDoc(paramsRef, {
        type: paramType,
        value: value,
        timestamp: serverTimestamp(),
        userId: auth.currentUser?.uid,
      });
      const key = paramType as ParameterKey;
      Alert.alert(
        "¡Éxito!",
        `El parámetro ${PARAMETERS[key].name} ha sido guardado.`
      );
    } catch (error) {
      console.error("Error al guardar el parámetro:", error);
      Alert.alert("Error", "No se pudo guardar la lectura del parámetro.");
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
          headerTitle: aquarium?.name || "Detalles del Acuario",
          headerBackTitle: "Mis Acuarios", // <-- AÑADE ESTA LÍNEA
        }}
      />
      <AddParameterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveParameter}
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

          // CAMBIO 3: Preparamos los datos para la gráfica, incluyendo la etiqueta con la fecha.
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
              onAdd={() => setModalVisible(true)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- ESTILOS (SIN CAMBIOS) ---
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
  sectionTitle: { ...AppTheme.FONTS.h2, marginBottom: AppTheme.SIZES.margin },
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
  },
});

export default AquariumDetailScreen;
