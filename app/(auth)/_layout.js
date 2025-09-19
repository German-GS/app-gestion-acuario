// app/(auth)/_layout.js
import { Stack } from 'expo-router';

export default function AuthLayout() {
  // Este layout solo define el stack, ya no redirige.
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}