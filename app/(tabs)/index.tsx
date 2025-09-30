// app/(tabs)/index.tsx
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { deleteDoc, doc } from "firebase/firestore";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RANGES } from "../../constants/parameterRanges";
import { RECOMMENDATIONS } from "../../constants/recommendations";
import { AppTheme } from "../../constants/theme";
import { db } from "../../firebaseConfig";
import { useAquariumStore } from "../../store/aquariumStore"; // <-- 1. Importa el store

// --- (Interfaces y getAquariumStatus sin cambios) ---
// ... (puedes mantener las interfaces y la función getAquariumStatus exactamente como estaban)
interface Aquarium {
  id: string;
  name: string;
  volume: number;
  mainType: "freshwater" | "marine";
  subType: string;
  latestParameters?: { [key: string]: number };
}
const getAquariumStatus = (
  aquarium: Aquarium
): { text: string; color: string; recommendations?: string[] } => {
  const latestParams = aquarium.latestParameters; // Guardamos en una variable para simpleza

  // Si no hay parámetros, retornamos el estado inicial
  if (!latestParams || Object.keys(latestParams).length === 0) {
    return {
      text: "Registra un parámetro para ver el estado",
      color: AppTheme.COLORS.darkGray,
    };
  }

  const ranges = RANGES[aquarium.subType as keyof typeof RANGES];
  if (!ranges) {
    return {
      text: "Rangos no definidos para este tipo de acuario",
      color: AppTheme.COLORS.accentMarine,
    };
  }

  const alerts: string[] = [];
  const uniqueRecommendations = new Set<string>();

  // --- 👇 ESTE ES EL BUCLE CORREGIDO 👇 ---
  // Usamos Object.keys() para asegurar que 'paramKey' sea siempre un string
  for (const paramKey of Object.keys(latestParams)) {
    const key = paramKey as keyof typeof ranges & keyof typeof RECOMMENDATIONS;
    const paramConfig = ranges[key];
    const currentValue = latestParams[key]; // Ahora podemos acceder de forma segura

    if (paramConfig && currentValue !== undefined) {
      if (currentValue < paramConfig.min) {
        alerts.push(`${paramConfig.name} bajo`);
        if (RECOMMENDATIONS[key]?.low)
          uniqueRecommendations.add(RECOMMENDATIONS[key].low);
      } else if (currentValue > paramConfig.max) {
        alerts.push(`${paramConfig.name} alto`);
        if (RECOMMENDATIONS[key]?.high)
          uniqueRecommendations.add(RECOMMENDATIONS[key].high);
      }
    }
  }

  if (alerts.length === 0) {
    return {
      text: "Parámetros estables",
      color: AppTheme.COLORS.accentFreshwater,
    };
  }

  return {
    text: `Alerta: ${alerts.join(", ")}`,
    color: AppTheme.COLORS.accentMarine,
    recommendations: Array.from(uniqueRecommendations),
  };
};

const HomeScreen = () => {
  const router = useRouter();
  // --- 2. Usa el estado y las acciones del store ---
  const { aquariums, isLoading, fetchAquariums, removeAquarium } =
    useAquariumStore();

  const handleDelete = (aquariumId: string, aquariumName: string) => {
    Alert.alert(
      "Confirmar Borrado",
      `¿Estás seguro de que quieres eliminar "${aquariumName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "aquariums", aquariumId));
              removeAquarium(aquariumId); // <-- 3. Llama a la acción del store
            } catch (error) {
              console.error("Error al eliminar el acuario:", error);
              Alert.alert("Error", "No se pudo eliminar el acuario.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // --- 4. El `useFocusEffect` ahora solo llama a la acción de fetch ---
  useFocusEffect(
    useCallback(() => {
      fetchAquariums();
    }, [])
  );

  // El resto del componente (AquariumCard y el return) no necesita cambios
  const AquariumCard = ({ item }: { item: Aquarium }) => {
    // ... (El código de AquariumCard se mantiene igual)
    const status = getAquariumStatus(item);
    const params = item.latestParameters || {};

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Link href={`/aquarium/${item.id}`} asChild>
            <TouchableOpacity style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>
                {item.name} ({item.volume}L)
              </Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.name)}
            style={styles.deleteButton}
          >
            <FontAwesome
              name="trash-o"
              size={22}
              color={AppTheme.COLORS.darkGray}
            />
          </TouchableOpacity>
        </View>
        <Link href={`/aquarium/${item.id}`} asChild>
          <TouchableOpacity>
            {/* --- 👇 MODIFICADO: AÑADIMOS PO4 A LA VISTA DE LA TARJETA 👇 --- */}
            <View style={styles.cardBody}>
              <View style={styles.parameter}>
                <Text style={styles.parameterLabel}>KH:</Text>
                <Text style={styles.parameterText}>{params.kh ?? "--"}</Text>
              </View>
              <View style={styles.parameter}>
                <Text style={styles.parameterLabel}>Ca:</Text>
                <Text style={styles.parameterText}>{params.ca ?? "--"}</Text>
              </View>
              <View style={styles.parameter}>
                <Text style={styles.parameterLabel}>Mg:</Text>
                <Text style={styles.parameterText}>{params.mg ?? "--"}</Text>
              </View>
              <View style={styles.parameter}>
                <Text style={styles.parameterLabel}>NO₃:</Text>
                <Text style={styles.parameterText}>{params.no3 ?? "--"}</Text>
              </View>
              <View style={styles.parameter}>
                <Text style={styles.parameterLabel}>PO₄:</Text>
                <Text style={styles.parameterText}>{params.po4 ?? "--"}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View
                style={[
                  styles.alertIndicator,
                  { backgroundColor: status.color },
                ]}
              />
              <Text style={styles.alertText}>{status.text}</Text>
            </View>
            {status.recommendations &&
              status.recommendations.map((rec, index) => (
                <View
                  key={index}
                  style={[
                    styles.recommendationContainer,
                    index > 0 && { marginTop: 5 },
                  ]}
                >
                  <FontAwesome
                    name="lightbulb-o"
                    size={16}
                    color={AppTheme.COLORS.darkGray}
                  />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
          </TouchableOpacity>
        </Link>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={AppTheme.COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {aquariums.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.subtitle}>
            Crea tu primer acuario para empezar a registrar.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {aquariums.map((item) => (
            <AquariumCard key={item.id} item={item} />
          ))}
        </ScrollView>
      )}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/createAquarium")}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

// ... (Los estilos se mantienen iguales)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.COLORS.background },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: AppTheme.SIZES.padding,
  },
  subtitle: { ...AppTheme.FONTS.body1, textAlign: "center" },
  list: { padding: AppTheme.SIZES.padding },
  card: {
    backgroundColor: AppTheme.COLORS.white,
    borderRadius: AppTheme.SIZES.radius * 1.5,
    padding: AppTheme.SIZES.margin,
    marginBottom: AppTheme.SIZES.margin,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: AppTheme.SIZES.margin,
  },
  cardTitle: { ...AppTheme.FONTS.h3, flex: 1 },
  deleteButton: { padding: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppTheme.SIZES.radius,
  },
  tagMarine: { backgroundColor: "#FFE0EE" },
  tagFreshwater: { backgroundColor: "#E0FFF0" },
  tagText: { ...AppTheme.FONTS.caption, fontWeight: "bold" },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: AppTheme.SIZES.margin,
    flexWrap: "wrap",
  }, // Añadido flexWrap
  parameter: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
    marginBottom: 5,
  }, // Añadido margen
  parameterText: { ...AppTheme.FONTS.body2, marginLeft: 6 },
  parameterLabel: { ...AppTheme.FONTS.body2, fontWeight: "bold" },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: AppTheme.SIZES.base,
    borderTopWidth: 1,
    borderTopColor: AppTheme.COLORS.lightGray,
  },
  alertIndicator: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  alertText: {
    ...AppTheme.FONTS.caption,
    flex: 1,
    color: AppTheme.COLORS.darkGray,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppTheme.COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  recommendationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fffbe6",
    borderRadius: AppTheme.SIZES.radius,
    borderWidth: 1,
    borderColor: "#ffe58f",
  },
  recommendationText: {
    ...AppTheme.FONTS.caption,
    flex: 1,
    marginLeft: 8,
    color: "#614700",
    lineHeight: 18,
  },
});

export default HomeScreen;
