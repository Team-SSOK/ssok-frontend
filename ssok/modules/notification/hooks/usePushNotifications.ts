import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { notificationApi } from '../api/notificationApi';

/**
 * 푸시 알림 상태 타입
 */
export interface PushNotificationState {
  /** 푸시 토큰 */
  pushToken: string | null;
  /** 권한 상태 */
  permissionStatus: Notifications.PermissionStatus | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 토큰 등록 성공 여부 */
  isTokenRegistered: boolean;
}

/**
 * 푸시 알림 관리 훅
 *
 * 이 훅은 다음 기능들을 제공합니다:
 * - 푸시 알림 권한 요청
 * - 디바이스 푸시 토큰 획득 (getDevicePushTokenAsync 사용)
 * - 서버에 토큰 등록
 * - Android 알림 채널 설정
 *
 * @returns 푸시 알림 상태와 관련 함수들
 */
export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    pushToken: null,
    permissionStatus: null,
    isLoading: false,
    error: null,
    isTokenRegistered: false,
  });

  /**
   * Android 알림 채널 설정
   * Android에서는 알림을 표시하기 위해 채널이 필요합니다.
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
   * 푸시 알림 권한 요청 및 토큰 획득
   *
   * 1. 물리적 디바이스인지 확인
   * 2. 현재 권한 상태 확인
   * 3. 권한이 없으면 요청
   * 4. 디바이스 푸시 토큰 획득 (getDevicePushTokenAsync 사용)
   * 5. 서버에 토큰 등록
   */
  const requestPermissionsAndRegisterToken = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Android 알림 채널 설정
      await setupAndroidNotificationChannel();

      // 물리적 디바이스 확인
      if (!Device.isDevice) {
        throw new Error(
          '푸시 알림은 물리적 디바이스에서만 사용할 수 있습니다.',
        );
      }

      // 현재 권한 상태 확인
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 권한이 없으면 요청
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // 권한이 거부된 경우
      if (finalStatus !== 'granted') {
        throw new Error('푸시 알림 권한이 거부되었습니다.');
      }

      // 디바이스 푸시 토큰 획득 (getDevicePushTokenAsync 사용)
      const devicePushToken = await Notifications.getDevicePushTokenAsync();
      const token = devicePushToken.data;

      if (!token) {
        throw new Error('푸시 토큰을 가져올 수 없습니다.');
      }

      // 서버에 토큰 등록
      const response = await notificationApi.registerFcmToken(token);

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || '토큰 등록에 실패했습니다.');
      }

      setState((prev) => ({
        ...prev,
        pushToken: token,
        permissionStatus: finalStatus,
        isLoading: false,
        isTokenRegistered: true,
      }));

      console.log('푸시 토큰 등록 성공:', token);
      return token;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));

      console.error('푸시 알림 설정 오류:', errorMessage);
      throw error;
    }
  };

  /**
   * 권한 상태 확인
   */
  const checkPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setState((prev) => ({ ...prev, permissionStatus: status }));
      return status;
    } catch (error) {
      console.error('권한 상태 확인 오류:', error);
      return null;
    }
  };

  /**
   * 상태 초기화
   */
  const resetState = () => {
    setState({
      pushToken: null,
      permissionStatus: null,
      isLoading: false,
      error: null,
      isTokenRegistered: false,
    });
  };

  // 컴포넌트 마운트 시 권한 상태 확인
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  return {
    ...state,
    requestPermissionsAndRegisterToken,
    checkPermissionStatus,
    resetState,
  };
};
