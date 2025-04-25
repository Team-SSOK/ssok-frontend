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
        <Stack.Screen name="auth/pin-login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="account/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="transfer/index" options={{ headerShown: false }} />
        <Stack.Screen name="transfer/amount" options={{ headerShown: false }} />
        <Stack.Screen
          name="transfer/confirm"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="transfer/complete"
          options={{ headerShown: false }}
        />
      </Stack>
    </PinProvider>
  );
}
