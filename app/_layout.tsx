// app/_layout.js

import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; // Asegúrate que la ruta a useAuth sea correcta
import "../i18n";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) {
      return; // No hagas nada mientras carga
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (user && inAuthGroup) {
      // Si el usuario está logueado y en la pantalla de auth, llévalo a la app.
      router.replace("/(tabs)");
    } else if (!user && !inAuthGroup) {
      // Si el usuario NO está logueado y NO está en la pantalla de auth, llévalo a login.
      router.replace("/(auth)/login");
    }

    // Oculta la pantalla de carga una vez que la lógica haya terminado.
    SplashScreen.hideAsync();
  }, [user, isLoading, segments]);

  if (isLoading) {
    return null; // Muestra una pantalla vacía en lugar del layout para evitar parpadeos
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="createAquarium"
        options={{
          presentation: "modal",
          headerTitle: "Nuevo Acuario",
        }}
      />
      <Stack.Screen
        name="reminders"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
