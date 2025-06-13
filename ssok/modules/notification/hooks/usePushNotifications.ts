import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { notificationApi } from '../api/notificationApi';
import { usePushStore } from '../store/pushStore';
import { getNotificationErrorMessage } from '../utils/notificationUtils';
import Toast from 'react-native-toast-message';

/**
 * 푸시 알림 관리 훅
 *
 * 이 훅은 다음 기능들을 제공하며, 모든 상태는 Zustand 스토어(`pushStore`)를 통해 관리됩니다:
 * - 푸시 알림 권한 요청
 * - 디바이스 푸시 토큰 획득
 * - 서버에 토큰 등록
 * - Android 알림 채널 설정
 */
export const usePushNotifications = () => {
  const { setState, resetState: resetStore, ...state } = usePushStore();

  /**
   * Android 알림 채널 설정
   */
  const setupAndroidNotificationChannel = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  /**
   * 푸시 알림 권한 요청 및 토큰 획득/등록
   */
  const requestPermissionsAndRegisterToken = async () => {
    try {
      setState({ isLoading: true, error: null });

      await setupAndroidNotificationChannel();

      if (!Device.isDevice) {
        throw new Error('푸시 알림은 물리적 디바이스에서만 사용 가능합니다.');
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('푸시 알림 권한이 거부되었습니다.');
      }

      const devicePushToken = await Notifications.getDevicePushTokenAsync();
      const token = devicePushToken.data;

      if (!token) {
        throw new Error('푸시 토큰을 가져올 수 없습니다.');
      }

      const response = await notificationApi.registerFcmToken(token);

      if (!response.data.isSuccess) {
        throw new Error(
          response.data.message || '서버에 토큰을 등록하지 못했습니다.',
        );
      }

      setState({
        pushToken: token,
        permissionStatus: finalStatus,
        isLoading: false,
        isTokenRegistered: true,
      });

      console.log('푸시 토큰 등록 성공:', token);
      return token;
    } catch (error) {
      const errorMessage = getNotificationErrorMessage(error);
      setState({ error: errorMessage, isLoading: false });
      Toast.show({
        type: 'error',
        text1: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  /**
   * 현재 권한 상태 확인
   */
  const checkPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setState({ permissionStatus: status });
      return status;
    } catch (error) {
      console.error('권한 상태 확인 오류:', error);
      return null;
    }
  };

  return {
    ...state,
    requestPermissionsAndRegisterToken,
    checkPermissionStatus,
    resetState: resetStore,
  };
};
