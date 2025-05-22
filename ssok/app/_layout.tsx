import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { FontProvider } from '../components/TextProvider';
import { Provider as PaperProvider } from 'react-native-paper';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useLoadingStore } from '@/stores/loadingStore';
import notificationService from '@/modules/notification/services/notificationService';
import { usePushNotification } from '@/modules/notification/hooks/usePushNotification';

export default function RootLayout() {
  const isLoading = useLoadingStore((state) => state.isLoading);
  const { initPushNotifications, error, devicePushToken } =
    usePushNotification();

  // 앱 시작 시 푸시 알림 초기화
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await initPushNotifications();
        console.log('푸시 알림이 초기화되었습니다.');
        console.log('디바이스 푸시 토큰:', devicePushToken);
      } catch (err) {
        console.error('푸시 알림 초기화 오류:', err);
      }
    };

    initNotifications();
  }, [initPushNotifications]);

  // 푸시 알림 오류 로깅
  useEffect(() => {
    if (error) {
      console.error('푸시 알림 오류:', error);
    }
  }, [error]);

  return (
    <PaperProvider>
      <FontProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/pin-setup"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/pin-confirm"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/pin-login"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="account/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="account/register"
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
      </FontProvider>
    </PaperProvider>
  );
}
