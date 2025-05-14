import { Stack } from 'expo-router';
import { PinProvider } from '../contexts/PinContext';
import { TextProvider } from '../components/TextProvider';
import { Provider as PaperProvider } from 'react-native-paper';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useLoadingStore } from '@/stores/loadingStore';

export default function RootLayout() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <PaperProvider>
      <TextProvider>
        <PinProvider>
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
          <LoadingIndicator visible={isLoading} />
        </PinProvider>
      </TextProvider>
    </PaperProvider>
  );
}
