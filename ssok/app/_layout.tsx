import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import Toast, { BaseToast } from 'react-native-toast-message';
import { FontProvider } from '../components/TextProvider';
import { Provider as PaperProvider } from 'react-native-paper';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useLoadingStore } from '@/stores/loadingStore';
import { SessionProvider, useSession } from '@/contexts/useSession';
import { AppStateManager } from '@/components/AppStateManager';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// Toast 커스텀 설정 - warning 타입 추가
const toastConfig = {
  /*
    warning 타입 추가 - BaseToast를 기반으로 노란색 스타일 적용
  */
  warning: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#f39c12', backgroundColor: '#fff3cd' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#856404',
      }}
      text2Style={{
        fontSize: 13,
        color: '#856404',
      }}
    />
  ),
};

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
