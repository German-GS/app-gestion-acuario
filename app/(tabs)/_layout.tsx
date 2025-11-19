// app/(tabs)/_layout.tsx
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { AppTheme } from "../../constants/theme";

type TabBarIconProps = {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
};

function TabBarIcon({ name, color }: TabBarIconProps) {
  return (
    <FontAwesome
      name={name}
      size={22}
      color={color}
      style={{ marginBottom: -4 }}
    />
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppTheme.COLORS.secondary,
        tabBarInactiveTintColor: AppTheme.COLORS.darkGray,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 8,
          height: 64,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          ...AppTheme.FONTS.caption,
        },
        headerTitleAlign: "left",
        headerStyle: {
          backgroundColor: AppTheme.COLORS.background,
        },
        headerShadowVisible: false,
        // 👉 Icono de perfil en TODAS las pestañas visibles
        headerRight: () => (
          <Link href="/profile" asChild>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <FontAwesome
                name="user-circle"
                size={26}
                color={AppTheme.COLORS.primary}
              />
            </TouchableOpacity>
          </Link>
        ),
      }}
    >
      {/* Home / Mis Acuarios */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.myAquariums", "Mis Acuarios"),
          tabBarLabel: t("tabs.myAquariums", "Mis Acuarios"),
          tabBarIcon: ({ color }) => <TabBarIcon name="tint" color={color} />,
        }}
      />

      {/* Explore */}
      <Tabs.Screen
        name="explore"
        options={{
          title: t("tabs.explore", "Explore"),
          tabBarLabel: t("tabs.explore", "Explore"),
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />

      {/* Perfil (oculto de la barra, se abre solo desde el icono) */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
