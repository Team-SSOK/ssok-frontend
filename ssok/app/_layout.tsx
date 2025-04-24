import { Stack } from 'expo-router';
import { PinProvider } from '../contexts/PinContext';

export default function RootLayout() {
  return (
    <PinProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="auth/pin" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/pin-confirm"
          options={{ headerShown: false }}
        />
      </Stack>
    </PinProvider>
  );
}
