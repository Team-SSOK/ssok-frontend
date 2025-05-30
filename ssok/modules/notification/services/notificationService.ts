import * as Notifications from 'expo-notifications';

/**
 * 알림 핸들러 설정
 *
 * 이 설정은 앱이 포그라운드에 있을 때 알림을 어떻게 처리할지 결정합니다:
 * - shouldShowAlert: 알림 배너 표시 여부 (deprecated, shouldShowBanner 사용)
 * - shouldShowBanner: 알림 배너 표시 여부
 * - shouldShowList: 알림 목록에 표시 여부
 * - shouldPlaySound: 알림 소리 재생 여부
 * - shouldSetBadge: 앱 아이콘 배지 설정 여부
 */
export const setupNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

/**
 * 알림 수신 리스너 타입
 */
export interface NotificationListeners {
  /** 알림 수신 리스너 */
  notificationListener: Notifications.Subscription | null;
  /** 알림 응답 리스너 */
  responseListener: Notifications.Subscription | null;
}

/**
 * 알림 수신 및 응답 리스너 설정
 *
 * @param onNotificationReceived 알림 수신 시 호출될 콜백
 * @param onNotificationResponse 알림 탭 시 호출될 콜백
 * @returns 리스너 객체들 (정리용)
 */
export const setupNotificationListeners = (
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (
    response: Notifications.NotificationResponse,
  ) => void,
): NotificationListeners => {
  // 알림 수신 리스너
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('알림 수신:', notification);
      onNotificationReceived?.(notification);
    },
  );

  // 알림 응답 리스너 (사용자가 알림을 탭했을 때)
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('알림 응답:', response);
      onNotificationResponse?.(response);
    });

  return {
    notificationListener,
    responseListener,
  };
};

/**
 * 알림 리스너 정리
 *
 * @param listeners 정리할 리스너들
 */
export const cleanupNotificationListeners = (
  listeners: NotificationListeners,
) => {
  if (listeners.notificationListener) {
    listeners.notificationListener.remove();
  }

  if (listeners.responseListener) {
    listeners.responseListener.remove();
  }
};

/**
 * 로컬 알림 스케줄링
 *
 * @param title 알림 제목
 * @param body 알림 내용
 * @param data 추가 데이터
 * @param seconds 몇 초 후에 알림을 표시할지 (기본값: 1초)
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>,
  seconds: number = 1,
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });

    console.log('로컬 알림 스케줄링 완료');
  } catch (error) {
    console.error('로컬 알림 스케줄링 오류:', error);
    throw error;
  }
};

/**
 * 모든 예약된 알림 취소
 */
export const cancelAllScheduledNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('모든 예약된 알림이 취소되었습니다.');
  } catch (error) {
    console.error('알림 취소 오류:', error);
    throw error;
  }
};

/**
 * 알림 배지 개수 설정
 *
 * @param count 배지에 표시할 숫자 (0이면 배지 제거)
 */
export const setBadgeCount = async (count: number) => {
  try {
    await Notifications.setBadgeCountAsync(count);
    console.log(`배지 개수 설정: ${count}`);
  } catch (error) {
    console.error('배지 설정 오류:', error);
    throw error;
  }
};
