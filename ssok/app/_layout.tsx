import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FontProvider } from '../components/TextProvider';
import { Provider as PaperProvider } from 'react-native-paper';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useLoadingStore } from '@/stores/loadingStore';
import { SessionProvider, useSession } from '@/contexts/useSession';
import * as SplashScreen from 'expo-splash-screen';

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
    async function prepare() {
      try {
        console.log(
          '[RootLayout] prepare 시작. 현재 sessionIsLoading:',
          sessionIsLoading,
        );
        await initializeAuth();
      } catch (e) {
        console.warn('[ERROR][RootLayout] 앱 준비 중 에러:', e);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [initializeAuth]);

  if (!appIsReady || sessionIsLoading) {
    console.log(
      '[RootLayout] appIsReady 또는 sessionIsLoading false. 스플래시 유지 또는 null 반환.',
    );
    return null;
  }

  return (
    <SessionProvider>
      <PaperProvider>
        <FontProvider>
          <RootNavigator />
          <LoadingIndicator visible={globalLoading && appIsReady} />
        </FontProvider>
      </PaperProvider>
    </SessionProvider>
  );
}

function RootNavigator() {
  const { isLoading, isAuthenticated } = useSession();

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
