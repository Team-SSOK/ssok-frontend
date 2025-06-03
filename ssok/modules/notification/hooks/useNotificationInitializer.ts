import { useEffect, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';
import {
  setupNotificationHandler,
  setupNotificationListeners,
  cleanupNotificationListeners,
  type NotificationListeners,
} from '../services/notificationService';
import { getNotificationErrorMessage } from '../utils/notificationUtils';

/**
 * 알림 초기화 옵션
 */
export interface NotificationInitializerOptions {
  /** 자동으로 권한 요청 및 토큰 등록 여부 (기본값: true) */
  autoRegister?: boolean;
  /** 에러 발생 시 호출될 콜백 */
  onError?: (error: string) => void;
  /** 토큰 등록 성공 시 호출될 콜백 */
  onSuccess?: (token: string) => void;
  /** 알림 수신 시 호출될 콜백 */
  onNotificationReceived?: (notification: any) => void;
  /** 알림 탭 시 호출될 콜백 */
  onNotificationResponse?: (response: any) => void;
}

/**
 * 알림 초기화 훅
 *
 * 이 훅은 앱 시작 시 다음 작업들을 자동으로 수행합니다:
 * 1. 알림 핸들러 설정
 * 2. 알림 리스너 설정
 * 3. 푸시 알림 권한 요청 및 토큰 등록 (옵션)
 *
 * @param options 초기화 옵션
 * @returns 푸시 알림 상태와 수동 등록 함수
 */
export const useNotificationInitializer = (
  options: NotificationInitializerOptions = {},
) => {
  const {
    autoRegister = true,
    onError,
    onSuccess,
    onNotificationReceived,
    onNotificationResponse,
  } = options;

  const pushNotifications = usePushNotifications();
  const listenersRef = useRef<NotificationListeners | null>(null);

  // 알림 초기화
  useEffect(() => {
    // 알림 핸들러 설정
    setupNotificationHandler();

    // 알림 리스너 설정
    listenersRef.current = setupNotificationListeners(
      onNotificationReceived,
      onNotificationResponse,
    );

    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      if (listenersRef.current) {
        cleanupNotificationListeners(listenersRef.current);
      }
    };
  }, [onNotificationReceived, onNotificationResponse]);

  // 자동 등록
  useEffect(() => {
    if (
      autoRegister &&
      !pushNotifications.isTokenRegistered &&
      !pushNotifications.isLoading
    ) {
      handleRegisterToken();
    }
  }, [
    autoRegister,
    pushNotifications.isTokenRegistered,
    pushNotifications.isLoading,
  ]);

  // 에러 처리
  useEffect(() => {
    if (pushNotifications.error && onError) {
      const userFriendlyError = getNotificationErrorMessage(
        pushNotifications.error,
      );
      onError(userFriendlyError);
    }
  }, [pushNotifications.error, onError]);

  // 성공 처리
  useEffect(() => {
    if (
      pushNotifications.isTokenRegistered &&
      pushNotifications.pushToken &&
      onSuccess
    ) {
      onSuccess(pushNotifications.pushToken);
    }
  }, [
    pushNotifications.isTokenRegistered,
    pushNotifications.pushToken,
    onSuccess,
  ]);

  /**
   * 수동으로 토큰 등록 실행
   */
  const handleRegisterToken = async () => {
    try {
      await pushNotifications.requestPermissionsAndRegisterToken();
    } catch (error) {
      // 에러는 이미 pushNotifications 상태에서 처리됨
      console.error('토큰 등록 실패:', error);
    }
  };

  return {
    // 푸시 알림 상태
    ...pushNotifications,

    // 수동 등록 함수
    registerToken: handleRegisterToken,

    // 초기화 완료 여부
    isInitialized: pushNotifications.permissionStatus !== null,
  };
};
