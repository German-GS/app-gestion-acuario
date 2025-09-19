// app/(tabs)/_layout.js
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router"; // <-- Importa Link
import React from "react";
import { TouchableOpacity } from "react-native";
import { AppTheme } from "../../constants/theme";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppTheme.COLORS.secondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mis Acuarios", // Título de la pantalla
          headerShown: true, // <-- Mostramos la cabecera
          headerRight: () => (
            <Link href="/profile" asChild>
              <TouchableOpacity style={{ marginRight: 15 }}>
                <FontAwesome
                  name="user-circle"
                  size={25}
                  color={AppTheme.COLORS.primary}
                />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      {/* Añadiremos una pantalla de perfil oculta en el tab bar */}
      <Tabs.Screen
        name="profile"
        options={{ href: null, headerShown: false }} // Oculta del tab bar
      />
    </Tabs>
  );
}
