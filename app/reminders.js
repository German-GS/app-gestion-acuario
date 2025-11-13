// app/reminders.js
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddReminderModal, { REMINDER_TYPES } from '../components/AddReminderModal';
import { AppTheme } from '../constants/theme';
import { auth, db } from '../firebaseConfig';

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Función para registrar y pedir permisos
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Permiso denegado', 'No se pueden recibir notificaciones sin permiso.');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    Alert.alert('Debes usar un dispositivo físico para las notificaciones.');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

const RemindersScreen = () => {
  const router = useRouter();
  const { aquariumId, aquariumName } = useLocalSearchParams();
  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Pedir permisos al cargar la pantalla
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // Cargar recordatorios de Firestore
  useFocusEffect(
    useCallback(() => {
      if (!aquariumId || !auth.currentUser) return;

      const q = query(
        collection(db, 'reminders'),
        where('userId', '==', auth.currentUser.uid),
        where('aquariumId', '==', aquariumId)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const remindersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReminders(remindersData);
      });

      return () => unsubscribe();
    }, [aquariumId])
  );
  
  const handleSaveReminder = async ({ task, date, frequency }) => {
    if (!auth.currentUser || !aquariumId) return;
    const finalAquariumName = aquariumName || "tu acuario";

    // 1. Programar la notificación local
    const trigger = new Date(date);
    let repeats = false;
    let triggerConfig = {};

    if(frequency === 'daily') { repeats = true; triggerConfig = { hour: trigger.getHours(), minute: trigger.getMinutes(), repeats: true }; }
    else if(frequency === 'weekly') { repeats = true; triggerConfig = { weekday: trigger.getDay() + 1, hour: trigger.getHours(), minute: trigger.getMinutes(), repeats: true }; }
    else if(frequency === 'monthly') { repeats = true; triggerConfig = { day: trigger.getDate(), hour: trigger.getHours(), minute: trigger.getMinutes(), repeats: true }; }
    else { triggerConfig = trigger; }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Recordatorio de ${aquariumName}`,
        body: REMINDER_TYPES[task],
      },
      trigger: triggerConfig,
    });
    
    // 2. Guardar en Firestore
    await addDoc(collection(db, 'reminders'), {
      userId: auth.currentUser.uid,
      aquariumId,
      aquariumName,
      task,
      dueDate: date.toISOString(),
      frequency,
      notificationId,
      createdAt: serverTimestamp(),
    });
  };

  const handleDeleteReminder = async (item) => {
    // Cancelar la notificación programada
    await Notifications.cancelScheduledNotificationAsync(item.notificationId);
    // Borrar de Firestore
    await deleteDoc(doc(db, 'reminders', item.id));
  };
  
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{REMINDER_TYPES[item.task]}</Text>
        <Text style={styles.cardDate}>
          Próximo: {new Date(item.dueDate).toLocaleString('es-ES')}
        </Text>
        <Text style={styles.cardFrequency}>Repite: {item.frequency}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteReminder(item)}>
        <FontAwesome name="trash-o" size={24} color={AppTheme.COLORS.darkGray} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recordatorios de {aquariumName}</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="close" size={24} color={AppTheme.COLORS.darkGray} />
        </TouchableOpacity>
      </View>
      
      <AddReminderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveReminder}
      />
      
      <FlatList
        data={reminders}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay recordatorios. ¡Añade el primero!</Text>}
      />

      <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ... Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.COLORS.background, },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: AppTheme.SIZES.padding, },
  title: { ...AppTheme.FONTS.h2, flex: 1 },
  list: { paddingHorizontal: AppTheme.SIZES.padding },
  card: { backgroundColor: AppTheme.COLORS.white, borderRadius: AppTheme.SIZES.radius, padding: AppTheme.SIZES.margin, marginBottom: AppTheme.SIZES.margin, flexDirection: 'row', alignItems: 'center' },
  cardTitle: { ...AppTheme.FONTS.h3 },
  cardDate: { ...AppTheme.FONTS.body2, color: AppTheme.COLORS.darkGray, marginTop: 4 },
  cardFrequency: { ...AppTheme.FONTS.caption, fontStyle: 'italic', marginTop: 4 },
  floatingButton: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: AppTheme.COLORS.secondary, justifyContent: 'center', alignItems: 'center', elevation: 8, },
  emptyText: { textAlign: 'center', marginTop: 50, ...AppTheme.FONTS.body1 },
});


export default RemindersScreen;