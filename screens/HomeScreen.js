import { StyleSheet, Text, View } from "react-native";

// 1. ¡Importa tu tema!
import { AppTheme } from "../constants/theme";

const HomeScreen = () => {
  const totalVolume = aquariums.reduce((sum, a) => sum + (a.volume || 0), 0);
  const marineCount = aquariums.filter((a) => a.mainType === "marine").length;
  const freshwaterCount = aquariums.filter(
    (a) => a.mainType === "freshwater"
  ).length;
  return (
    <View style={styles.container}>
      {aquariums.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {/* HEADER DASHBOARD */}
          <View style={styles.dashboardHeader}>
            <Text style={styles.dashboardTitle}>Mis Acuarios </Text>
            <Text style={styles.dashboardSubtitle}>
              Volumen total: {totalVolume} L
            </Text>
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Marinos: {marineCount}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  Agua dulce: {freshwaterCount}
                </Text>
              </View>
            </View>
          </View>

          {/* TARJETAS */}
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

// 2. Usa las variables del tema para crear los estilos del componente
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.COLORS.background },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: AppTheme.SIZES.padding,
  },

  list: {
    padding: AppTheme.SIZES.padding,
    paddingBottom: 80,
  },

  // --- NUEVO HEADER DASHBOARD ---
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
    gap: 8,
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

  // --- TARJETA ---
  card: {
    backgroundColor: AppTheme.COLORS.white,
    borderRadius: AppTheme.SIZES.radius,
    padding: AppTheme.SIZES.margin,
    marginBottom: AppTheme.SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.COLORS.secondary, // pequeño acento de color
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    ...AppTheme.FONTS.h3,
  },
  deleteButton: {
    marginLeft: 8,
  },

  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  parameter: {
    alignItems: "center",
  },
  parameterLabel: {
    ...AppTheme.FONTS.caption,
    color: AppTheme.COLORS.darkGray,
  },
  parameterText: {
    ...AppTheme.FONTS.body2,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  alertIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  alertText: {
    ...AppTheme.FONTS.caption,
    flex: 1,
  },
  recommendationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  recommendationText: {
    ...AppTheme.FONTS.body2,
    marginLeft: 6,
    flex: 1,
  },

  floatingButton: {
    position: "absolute",
    right: AppTheme.SIZES.padding,
    bottom: AppTheme.SIZES.padding,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppTheme.COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});

export default HomeScreen;
