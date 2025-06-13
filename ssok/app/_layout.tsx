import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { Provider as PaperProvider } from 'react-native-paper';
import { FontProvider } from '../components/TextProvider';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useLoadingStore } from '@/stores/loadingStore';
import { SessionProvider, useSession } from '@/contexts/useSession';
import { AppStateManager } from '@/components/AppStateManager';
import toastConfig from '@/components/ToastConfig';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { initializeAuth, isLoading: sessionIsLoading } = useSession();
  const globalLoading = useLoadingStore((state) => state.isLoading);

  useEffect(() => {
    async function appInit() {
      try {
        await initializeAuth();
      } catch (e) {
        console.warn('[ERROR][RootLayout] 앱 준비 중 에러:', e);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }
    appInit();
  }, [initializeAuth]);

  if (!appIsReady || sessionIsLoading) {
    console.log(
      '[RootLayout] appIsReady 또는 sessionIsLoading false',
    );
    return null;
  }

  return (
    <SessionProvider>
      <PaperProvider>
        <FontProvider>
          <RootNavigator />
          <LoadingIndicator visible={globalLoading && appIsReady} />
          <AppStateManager />
          <Toast config={toastConfig} />
        </FontProvider>
      </PaperProvider>
    </SessionProvider>
  );
}

function RootNavigator() {
  const { isLoading, isAuthenticated } = useSession();

  if (isLoading) {
    return <LoadingIndicator visible={true} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
        <Stack.Screen
          name="reauth"
          options={{
            presentation: 'modal',
            gestureEnabled: false,
            headerShown: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
