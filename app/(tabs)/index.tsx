// app/(tabs)/index.tsx
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRouter } from "expo-router";
import { deleteDoc, doc } from "firebase/firestore";
import React, { useCallback } from "react";
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
import { RANGES } from "../../constants/parameterRanges";
import { getRecommendationText } from "../../constants/recommendations";
import { AppTheme } from "../../constants/theme";
import { db } from "../../firebaseConfig";
import { useAquariumStore } from "../../store/aquariumStore";

type Aquarium = {
  id: string;
  name: string;
  volume: number;
  mainType: "freshwater" | "marine";
  subType: string;
  imageUrl?: string;
  latestParameters?: { [key: string]: number };
};

type StatusTexts = {
  registerToSee: string;
  noRanges: string;
  stable: string;
  alertPrefix: string;
  low: string;
  high: string;
};

const getAquariumStatus = (
  aquarium: Aquarium,
  texts: StatusTexts
): { text: string; color: string; recommendations?: string[] } => {
  const latestParams = aquarium.latestParameters;

  if (!latestParams || Object.keys(latestParams).length === 0) {
    return {
      text: texts.registerToSee,
      color: AppTheme.COLORS.darkGray,
    };
  }

  const ranges = RANGES[aquarium.subType as keyof typeof RANGES];
  if (!ranges) {
    return {
      text: texts.noRanges,
      color: AppTheme.COLORS.accentMarine,
    };
  }

  const alerts: string[] = [];
  const uniqueRecommendations = new Set<string>();

  for (const paramKey of Object.keys(latestParams)) {
    const paramConfig = ranges[paramKey as keyof typeof ranges];
    const currentValue = latestParams[paramKey];

    if (paramConfig && currentValue !== undefined) {
      if (currentValue < paramConfig.min) {
        alerts.push(`${paramConfig.name} ${texts.low}`);

        const rec = getRecommendationText(
          paramKey,
          "low",
          aquarium.mainType // 👈 aquí marino vs dulce
        );
        if (rec) uniqueRecommendations.add(rec);
      } else if (currentValue > paramConfig.max) {
        alerts.push(`${paramConfig.name} ${texts.high}`);

        const rec = getRecommendationText(
          paramKey,
          "high",
          aquarium.mainType // 👈 igual aquí
        );
        if (rec) uniqueRecommendations.add(rec);
      }
    }
  }

  if (alerts.length === 0) {
    return {
      text: texts.stable,
      color: AppTheme.COLORS.accentFreshwater,
    };
  }

  return {
    text: `${texts.alertPrefix} ${alerts.join(", ")}`,
    color: AppTheme.COLORS.accentMarine,
    recommendations: Array.from(uniqueRecommendations),
  };
};

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { aquariums, isLoading, fetchAquariums, removeAquarium } =
    useAquariumStore();

  const statusTexts: StatusTexts = {
    registerToSee: t(
      "home.status.registerToSee",
      "Registra un parámetro para ver el estado"
    ),
    noRanges: t(
      "home.status.noRanges",
      "Rangos no definidos para este tipo de acuario"
    ),
    stable: t("home.status.stable", "Parámetros estables"),
    alertPrefix: t("home.status.alertPrefix", "Alerta:"),
    low: t("home.status.low", "bajo"),
    high: t("home.status.high", "alto"),
  };

  // Totales mini-dashboard
  const totalVolume = aquariums.reduce((sum, a) => sum + (a.volume || 0), 0);
  const marineCount = aquariums.filter((a) => a.mainType === "marine").length;
  const freshwaterCount = aquariums.filter(
    (a) => a.mainType === "freshwater"
  ).length;

  const handleDelete = (aquariumId: string, aquariumName: string) => {
    Alert.alert(
      t("home.deleteConfirmTitle", "Confirmar borrado"),
      t("home.deleteConfirmMessage", {
        defaultValue: '¿Estás seguro de que quieres eliminar "{{name}}"?',
        name: aquariumName,
      }),
      [
        { text: t("common.cancel", "Cancelar"), style: "cancel" },
        {
          text: t("common.delete", "Eliminar"),
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "aquariums", aquariumId));
              removeAquarium(aquariumId);
            } catch (error) {
              console.error("Error al eliminar el acuario:", error);
              Alert.alert(
                t("common.error", "Error"),
                t("home.deleteError", "No se pudo eliminar el acuario.")
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchAquariums();
    }, [fetchAquariums])
  );

  const AquariumCard = ({ item }: { item: Aquarium }) => {
    const status = getAquariumStatus(item, statusTexts);
    const params = item.latestParameters || {};

    const mainTypeLabel =
      item.mainType === "marine"
        ? t("home.marineLabel", "Marine")
        : t("home.freshwaterLabel", "Freshwater");

    return (
      <View style={styles.card}>
        {/* Botón borrar flotante */}
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.name)}
          style={styles.deleteButton}
        >
          <FontAwesome
            name="trash-o"
            size={20}
            color={AppTheme.COLORS.darkGray}
          />
        </TouchableOpacity>

        {/* Card clickable completa */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(`/aquarium/${item.id}` as const)}
        >
          {/* Imagen principal */}
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <FontAwesome
                name="camera"
                size={26}
                color={AppTheme.COLORS.darkGray}
              />
              <Text style={styles.imagePlaceholderText}>
                {t("home.noPhoto", "Añade una foto de tu acuario")}
              </Text>
            </View>
          )}

          {/* Contenido */}
          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardVolume}>
                {t("home.volumeLiters", {
                  defaultValue: "{{volume}} L",
                  volume: item.volume,
                })}
              </Text>
            </View>

            {/* Badges */}
            <View style={styles.badgesRow}>
              <View
                style={[
                  styles.badge,
                  item.mainType === "marine"
                    ? styles.badgeMarine
                    : styles.badgeFreshwater,
                ]}
              >
                <Text style={styles.badgeText}>{mainTypeLabel}</Text>
              </View>
              <View style={[styles.badge, styles.badgeOutline]}>
                <Text style={styles.badgeOutlineText}>{item.subType}</Text>
              </View>
            </View>
            {/* Parámetros principales */}
            <View style={styles.parametersRow}>
              {item.mainType === "marine" ? (
                <>
                  {/* Layout para ACUARIO MARINO */}
                  <View style={styles.parameterItem}>
                    <Text style={styles.parameterLabel}>KH</Text>
                    <Text style={styles.parameterValue}>
                      {params.kh ?? t("home.noDataShort", "--")}
                    </Text>
                  </View>
                  <View style={styles.parameterItem}>
                    <Text style={styles.parameterLabel}>Ca</Text>
                    <Text style={styles.parameterValue}>
                      {params.ca ?? t("home.noDataShort", "--")}
                    </Text>
                  </View>
                  <View style={styles.parameterItem}>
                    <Text style={styles.parameterLabel}>Mg</Text>
                    <Text style={styles.parameterValue}>
                      {params.mg ?? t("home.noDataShort", "--")}
                    </Text>
                  </View>
                  <View style={styles.parameterItem}>
                    <Text style={styles.parameterLabel}>NO₃</Text>
                    <Text style={styles.parameterValue}>
                      {params.no3 ?? t("home.noDataShort", "--")}
                    </Text>
                  </View>
                  <View style={styles.parameterItem}>
                    <Text style={styles.parameterLabel}>PO₄</Text>
                    <Text style={styles.parameterValue}>
                      {params.po4 ?? t("home.noDataShort", "--")}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  {/* Layout para ACUARIO DE AGUA DULCE */}
                  <View style={styles.parameterItem}>
                    <Text style={styles.parameterLabel}>pH</Text>
                    <Text style={styles.parameterValue}>
                      {params.ph ?? t("home.noDataShort", "--")}
                    </Text>
                  </View>
                  <View style={styles.parameterItem}>
                    <Text style={styles.parameterLabel}>GH</Text>
                    <Text style={styles.parameterValue}>
                      {params.gh ?? t("home.noDataShort", "--")}
                    </Text>
                  </View>
                  <View style={styles.parameterItem}>
                    <Text style={styles.parameterLabel}>KH</Text>
                    <Text style={styles.parameterValue}>
                      {params.kh ?? t("home.noDataShort", "--")}
                    </Text>
                  </View>
                  <View style={styles.parameterItem}>
                    <Text style={styles.parameterLabel}>NO₃</Text>
                    <Text style={styles.parameterValue}>
                      {params.no3 ?? t("home.noDataShort", "--")}
                    </Text>
                  </View>
                  <View style={styles.parameterItem}>
                    <Text style={styles.parameterLabel}>PO₄</Text>
                    <Text style={styles.parameterValue}>
                      {params.po4 ?? t("home.noDataShort", "--")}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Estado */}
            <View style={styles.statusRow}>
              <View
                style={[styles.statusDot, { backgroundColor: status.color }]}
              />
              <Text style={styles.statusText} numberOfLines={2}>
                {status.text}
              </Text>
            </View>

            {/* Recomendaciones */}
            {status.recommendations &&
              status.recommendations.map((rec, index) => (
                <View
                  key={index}
                  style={[
                    styles.recommendationContainer,
                    index > 0 && { marginTop: 6 },
                  ]}
                >
                  <FontAwesome
                    name="lightbulb-o"
                    size={14}
                    color={AppTheme.COLORS.darkGray}
                  />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.centerContent}>
      <FontAwesome
        name="tint"
        size={60}
        color={AppTheme.COLORS.primary}
        style={{ marginBottom: AppTheme.SIZES.padding }}
      />
      <Text style={styles.titleEmpty}>
        {t("home.emptyTitle", "Bienvenido a AquaMind")}
      </Text>
      <Text style={styles.subtitle}>
        {t(
          "home.emptySubtitle",
          'Toca el botón "+" para añadir tu primer acuario y empezar a monitorear la salud de tu ecosistema acuático.'
        )}
      </Text>
    </View>
  );

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
        <EmptyState />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {/* Mini-dashboard */}
          <View style={styles.dashboardHeader}>
            <Text style={styles.dashboardTitle}>
              {t("home.dashboardTitle", "My Aquariums")}
            </Text>
            <Text style={styles.dashboardSubtitle}>
              {t("home.totalVolumeLabel", "Total volume")} {totalVolume} L
            </Text>
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {t("home.marineLabel", "Marine")}: {marineCount}
                </Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {t("home.freshwaterLabel", "Freshwater")}: {freshwaterCount}
                </Text>
              </View>
            </View>
          </View>

          {/* Tarjetas estilo B */}
          {aquariums.map((item) => (
            <AquariumCard key={item.id} item={item as Aquarium} />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/createAquarium" as const)}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.COLORS.background },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: AppTheme.SIZES.padding,
  },

  titleEmpty: {
    ...AppTheme.FONTS.h2,
    textAlign: "center",
    marginBottom: AppTheme.SIZES.base,
  },
  subtitle: {
    ...AppTheme.FONTS.body1,
    textAlign: "center",
  },

  list: {
    padding: AppTheme.SIZES.padding,
    paddingBottom: 90,
  },

  // Dashboard superior
  dashboardHeader: {
    marginBottom: AppTheme.SIZES.padding,
  },
  dashboardTitle: {
    ...AppTheme.FONTS.h1,
    marginBottom: 4,
  },
  dashboardSubtitle: {
    ...AppTheme.FONTS.body2,
    color: AppTheme.COLORS.darkGray,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    columnGap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: AppTheme.COLORS.lightGray,
  },
  chipText: {
    ...AppTheme.FONTS.caption,
    color: AppTheme.COLORS.darkGray,
  },

  // Tarjeta estilo B
  card: {
    backgroundColor: AppTheme.COLORS.white,
    borderRadius: AppTheme.SIZES.radius * 2,
    marginBottom: AppTheme.SIZES.margin,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    padding: 6,
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: AppTheme.COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    ...AppTheme.FONTS.caption,
    marginTop: 4,
    color: AppTheme.COLORS.darkGray,
  },

  cardContent: {
    padding: AppTheme.SIZES.margin,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    ...AppTheme.FONTS.h3,
    flex: 1,
    marginRight: 8,
  },
  cardVolume: {
    ...AppTheme.FONTS.body2,
    color: AppTheme.COLORS.darkGray,
  },

  badgesRow: {
    flexDirection: "row",
    marginBottom: 10,
    columnGap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeMarine: {
    backgroundColor: "#e6f7ff",
  },
  badgeFreshwater: {
    backgroundColor: "#e6fffb",
  },
  badgeText: {
    ...AppTheme.FONTS.caption,
    color: AppTheme.COLORS.primary,
  },
  badgeOutline: {
    borderWidth: 1,
    borderColor: AppTheme.COLORS.lightGray,
    backgroundColor: "transparent",
  },
  badgeOutlineText: {
    ...AppTheme.FONTS.caption,
    color: AppTheme.COLORS.darkGray,
  },

  parametersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 10,
  },
  parameterItem: {
    alignItems: "center",
    flex: 1,
  },
  parameterLabel: {
    ...AppTheme.FONTS.caption,
    fontWeight: "bold",
  },
  parameterValue: {
    ...AppTheme.FONTS.caption,
    marginTop: 2,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    ...AppTheme.FONTS.caption,
    flex: 1,
    color: AppTheme.COLORS.darkGray,
  },

  recommendationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
    padding: 8,
    backgroundColor: "#fffbe6",
    borderRadius: AppTheme.SIZES.radius,
    borderWidth: 1,
    borderColor: "#ffe58f",
  },
  recommendationText: {
    ...AppTheme.FONTS.caption,
    flex: 1,
    marginLeft: 6,
    color: "#614700",
    lineHeight: 18,
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
});

export default HomeScreen;
