// app/_layout.js
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // --- LÓGICA DE REDIRECCIÓN CORREGIDA ---
  useEffect(() => {
    // Si todavía estamos verificando al usuario, no hacemos nada.
    if (isLoading) return;

    // `inAuthGroup` nos dice si la ruta actual está dentro de la carpeta (auth)
    const inAuthGroup = segments[0] === "(auth)";

    if (user && inAuthGroup) {
      // Si el usuario ya está logueado PERO está en la pantalla de login/registro,
      // lo mandamos al dashboard.
      router.replace("/(tabs)");
    } else if (!user) {
      // Si no hay usuario en absoluto, lo mandamos al login.
      // Esto protege todas las pantallas de la app.
      router.replace("/(auth)/login");
    }

    // Una vez que la lógica termina, podemos ocultar la pantalla de carga.
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [user, isLoading]); // <-- IMPORTANTE: Quitamos 'segments' de aquí

  // Si está cargando, no mostramos nada para evitar parpadeos
  if (isLoading) {
    return null;
  }

  // El Stack no cambia
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="createAquarium"
        options={{
          presentation: "modal",
          headerTitle: "Nuevo Acuario",
          headerBackTitle: "Cancelar",
        }}
      />
    </Stack>
  );
}
