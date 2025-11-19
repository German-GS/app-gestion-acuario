// app/reminders.js
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddReminderModal, {
  REMINDER_TYPES,
} from "../components/AddReminderModal";
import { AppTheme } from "../constants/theme";
import { auth, db } from "../firebaseConfig";
import i18n from "../i18n"; // para usar fuera del componente

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Función para registrar y pedir permisos (usa i18n global)
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert(
        i18n.t("notifications.permissionDeniedTitle", "Permiso denegado"),
        i18n.t(
          "notifications.permissionDeniedMessage",
          "No se pueden recibir notificaciones sin permiso."
        )
      );
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    Alert.alert(
      i18n.t("notifications.physicalDeviceTitle", "Dispositivo requerido"),
      i18n.t(
        "notifications.physicalDeviceMessage",
        "Debes usar un dispositivo físico para las notificaciones."
      )
    );
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

const RemindersScreen = () => {
  const router = useRouter();
  const { aquariumId, aquariumName } = useLocalSearchParams();
  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const { t, i18n: i18nHook } = useTranslation();
  const locale = i18nHook.language === "en" ? "en-US" : "es-ES";

  // Pedir permisos al cargar la pantalla
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // Cargar recordatorios de Firestore
  useFocusEffect(
    useCallback(() => {
      if (!aquariumId || !auth.currentUser) return;

      const q = query(
        collection(db, "reminders"),
        where("userId", "==", auth.currentUser.uid),
        where("aquariumId", "==", aquariumId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const remindersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReminders(remindersData);
      });

      return () => unsubscribe();
    }, [aquariumId])
  );

  const handleSaveReminder = async ({ task, date, frequency }) => {
    if (!auth.currentUser || !aquariumId) return;

    const finalAquariumName =
      aquariumName || t("aquarium.reminders.unnamedAquarium", "tu acuario");

    // 1. Programar la notificación local
    const trigger = new Date(date);
    let triggerConfig = {};
    let repeats = false;

    if (frequency === "daily") {
      repeats = true;
      triggerConfig = {
        hour: trigger.getHours(),
        minute: trigger.getMinutes(),
        repeats: true,
      };
    } else if (frequency === "weekly") {
      repeats = true;
      triggerConfig = {
        weekday: trigger.getDay() + 1,
        hour: trigger.getHours(),
        minute: trigger.getMinutes(),
        repeats: true,
      };
    } else if (frequency === "monthly") {
      repeats = true;
      triggerConfig = {
        day: trigger.getDate(),
        hour: trigger.getHours(),
        minute: trigger.getMinutes(),
        repeats: true,
      };
    } else {
      triggerConfig = { date: trigger };
    }

    const title = t("aquarium.reminders.notificationTitle", {
      name: finalAquariumName,
      defaultValue: `Recordatorio de ${finalAquariumName}`,
    });

    const body = t(`aquarium.reminders.types.${task}`, REMINDER_TYPES[task]);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: triggerConfig,
    });

    // 2. Guardar en Firestore
    await addDoc(collection(db, "reminders"), {
      userId: auth.currentUser.uid,
      aquariumId,
      aquariumName: finalAquariumName,
      task,
      dueDate: date.toISOString(),
      frequency,
      notificationId,
      createdAt: serverTimestamp(),
    });
  };

  const handleDeleteReminder = async (item) => {
    await Notifications.cancelScheduledNotificationAsync(item.notificationId);
    await deleteDoc(doc(db, "reminders", item.id));
  };

  const renderItem = ({ item }) => {
    const nextDate = new Date(item.dueDate);
    const freqLabel = t(
      `aquarium.reminders.frequency.${item.frequency}`,
      item.frequency
    );

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {t(
              `aquarium.reminders.types.${item.task}`,
              REMINDER_TYPES[item.task]
            )}
          </Text>
          <Text style={styles.cardDate}>
            {t("aquarium.reminders.nextLabel", "Próximo:")}{" "}
            {nextDate.toLocaleString(locale, {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </Text>
          <Text style={styles.cardFrequency}>
            {t("aquarium.reminders.repeatLabel", "Repetir")} {freqLabel}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteReminder(item)}>
          <FontAwesome
            name="trash-o"
            size={24}
            color={AppTheme.COLORS.darkGray}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t("aquarium.reminders.headerTitle", {
            name: aquariumName,
            defaultValue: `Recordatorios de ${aquariumName}`,
          })}
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome
            name="close"
            size={24}
            color={AppTheme.COLORS.darkGray}
          />
        </TouchableOpacity>
      </View>

      {/* Modal para crear/editar */}
      <AddReminderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveReminder}
      />

      {/* Lista de recordatorios */}
      <FlatList
        data={reminders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {t(
              "aquarium.reminders.emptyText",
              "No hay recordatorios. ¡Añade el primero!"
            )}
          </Text>
        }
      />

      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: AppTheme.SIZES.padding,
  },
  title: { ...AppTheme.FONTS.h2, flex: 1 },
  list: { paddingHorizontal: AppTheme.SIZES.padding },
  card: {
    backgroundColor: AppTheme.COLORS.white,
    borderRadius: AppTheme.SIZES.radius,
    padding: AppTheme.SIZES.margin,
    marginBottom: AppTheme.SIZES.margin,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: { ...AppTheme.FONTS.h3 },
  cardDate: {
    ...AppTheme.FONTS.body2,
    color: AppTheme.COLORS.darkGray,
    marginTop: 4,
  },
  cardFrequency: {
    ...AppTheme.FONTS.caption,
    fontStyle: "italic",
    marginTop: 4,
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
  emptyText: { textAlign: "center", marginTop: 50, ...AppTheme.FONTS.body1 },
});

export default RemindersScreen;
