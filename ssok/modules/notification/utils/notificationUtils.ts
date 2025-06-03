import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * 푸시 토큰 유효성 검사
 *
 * @param token 검사할 토큰
 * @returns 유효한 토큰인지 여부
 */
export const isValidPushToken = (token: string | null): token is string => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // 토큰이 비어있지 않고 최소 길이를 만족하는지 확인
  return token.length > 10;
};

/**
 * 알림 권한 상태를 사용자 친화적인 메시지로 변환
 *
 * @param status 권한 상태
 * @returns 사용자 친화적인 메시지
 */
export const getPermissionStatusMessage = (
  status: Notifications.PermissionStatus | null,
): string => {
  switch (status) {
    case 'granted':
      return '알림 권한이 허용되었습니다.';
    case 'denied':
      return '알림 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.';
    case 'undetermined':
      return '알림 권한을 요청해주세요.';
    default:
      return '알림 권한 상태를 확인할 수 없습니다.';
  }
};

/**
 * 플랫폼별 알림 설정 가이드 메시지
 *
 * @returns 플랫폼별 설정 가이드
 */
export const getNotificationSettingsGuide = (): string => {
  if (Platform.OS === 'ios') {
    return '설정 > 알림 > 앱 이름에서 알림을 허용해주세요.';
  } else {
    return '설정 > 앱 > 앱 이름 > 알림에서 알림을 허용해주세요.';
  }
};

/**
 * 알림 에러를 사용자 친화적인 메시지로 변환
 *
 * @param error 에러 객체
 * @returns 사용자 친화적인 에러 메시지
 */
export const getNotificationErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('permission')) {
      return '알림 권한이 필요합니다. ' + getNotificationSettingsGuide();
    }

    if (message.includes('device')) {
      return '실제 디바이스에서만 푸시 알림을 사용할 수 있습니다.';
    }

    if (message.includes('token')) {
      return '푸시 토큰을 가져올 수 없습니다. 네트워크 연결을 확인해주세요.';
    }

    if (message.includes('network') || message.includes('fetch')) {
      return '네트워크 연결을 확인하고 다시 시도해주세요.';
    }

    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * 알림 데이터에서 특정 키의 값을 안전하게 추출
 *
 * @param notification 알림 객체
 * @param key 추출할 키
 * @returns 추출된 값 또는 undefined
 */
export const getNotificationData = <T = any>(
  notification: Notifications.Notification,
  key: string,
): T | undefined => {
  try {
    const data = notification.request.content.data;
    return data && typeof data === 'object' ? (data as any)[key] : undefined;
  } catch (error) {
    console.warn('알림 데이터 추출 오류:', error);
    return undefined;
  }
};

/**
 * 알림 응답에서 액션 식별자 추출
 *
 * @param response 알림 응답 객체
 * @returns 액션 식별자
 */
export const getNotificationActionIdentifier = (
  response: Notifications.NotificationResponse,
): string => {
  return response.actionIdentifier || 'default';
};

/**
 * 디바이스가 푸시 알림을 지원하는지 확인
 *
 * @returns 푸시 알림 지원 여부
 */
export const isPushNotificationSupported = (): boolean => {
  // 웹에서는 푸시 알림이 제한적으로 지원됨
  if (Platform.OS === 'web') {
    return false;
  }

  // iOS와 Android는 지원
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * 알림 채널 ID 생성 (Android용)
 *
 * @param channelName 채널 이름
 * @returns 채널 ID
 */
export const generateNotificationChannelId = (channelName: string): string => {
  return channelName.toLowerCase().replace(/\s+/g, '_');
};

/**
 * 알림 우선순위를 플랫폼별로 변환
 *
 * @param priority 우선순위 ('low' | 'normal' | 'high' | 'max')
 * @returns 플랫폼별 우선순위 값
 */
export const getNotificationPriority = (
  priority: 'low' | 'normal' | 'high' | 'max',
) => {
  if (Platform.OS === 'android') {
    switch (priority) {
      case 'low':
        return Notifications.AndroidImportance.LOW;
      case 'normal':
        return Notifications.AndroidImportance.DEFAULT;
      case 'high':
        return Notifications.AndroidImportance.HIGH;
      case 'max':
        return Notifications.AndroidImportance.MAX;
      default:
        return Notifications.AndroidImportance.DEFAULT;
    }
  }

  // iOS는 별도의 우선순위 설정이 없음
  return undefined;
};
