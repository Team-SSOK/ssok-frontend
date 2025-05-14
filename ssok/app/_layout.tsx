import { Stack } from 'expo-router';
import { PinProvider } from '../contexts/PinContext';
import { TextProvider } from '../components/TextProvider';
import LoadingProvider from '../contexts/LoadingContext';
import { Provider as PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <TextProvider>
        <PinProvider>
          <LoadingProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="auth/register"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="auth/pin" options={{ headerShown: false }} />
              <Stack.Screen
                name="auth/pin-confirm"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="auth/pin-login"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="account/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="transfer/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="transfer/amount"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="transfer/confirm"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="transfer/complete"
                options={{ headerShown: false }}
              />
            </Stack>
          </LoadingProvider>
        </PinProvider>
      </TextProvider>
    </PaperProvider>
  );
}
