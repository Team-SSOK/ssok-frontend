import * as Notifications from 'expo-notifications';

/**
 * 알림 데이터 타입
 */
export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * 로컬 알림 표시 함수
 *
 * @param notificationData 알림 데이터
 * @returns 알림 식별자
 */
export const showLocalNotification = async (
  notificationData: NotificationData,
): Promise<string> => {
  const { title, body, data = {} } = notificationData;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // 즉시 표시
  });

  return identifier;
};

/**
 * 모든 알림 취소 함수
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
};

/**
 * 특정 알림 취소 함수
 *
 * @param identifier 알림 식별자
 */
export const cancelNotification = async (identifier: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(identifier);
};

/**
 * 알림 탭 처리 함수
 *
 * @param callback 알림 탭 시 실행할 콜백 함수
 * @returns 구독 해제 함수
 */
export const addNotificationResponseReceivedListener = (
  callback: (response: Notifications.NotificationResponse) => void,
): (() => void) => {
  const subscription =
    Notifications.addNotificationResponseReceivedListener(callback);

  return () => subscription.remove();
};

/**
 * 알림 수신 처리 함수
 *
 * @param callback 알림 수신 시 실행할 콜백 함수
 * @returns 구독 해제 함수
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void,
): (() => void) => {
  const subscription = Notifications.addNotificationReceivedListener(callback);

  return () => subscription.remove();
};
