import {
  NotificationData,
  showLocalNotification,
  cancelAllNotifications,
  cancelNotification,
} from '../utils/notificationUtils';
import { usePushNotification } from '../hooks/usePushNotification';

/**
 * 알림 서비스
 * 앱 전체에서 알림 기능을 관리하는 서비스 클래스
 */
class NotificationService {
  private static instance: NotificationService;
  private initialized = false;

  /**
   * 싱글톤 인스턴스 가져오기
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 알림 서비스 초기화
   * 앱 시작 시 호출
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[NotificationService] 이미 초기화되어 있습니다.');
      return;
    }

    try {
      // usePushNotification 훅의 기능을 활용하기 위한 임시 해결책
      // 실제로는 App.tsx 등에서 usePushNotification 훅을 사용하여 초기화
      const { initPushNotifications, isRegistered } = usePushNotification();

      // 이미 등록된 경우 초기화 완료로 간주
      if (isRegistered) {
        console.log(
          '[NotificationService] 이미 푸시 토큰이 등록되어 있습니다. 초기화 생략',
        );
        this.initialized = true;
        return;
      }

      await initPushNotifications();

      this.initialized = true;
      console.log('[NotificationService] 초기화 완료');
    } catch (error) {
      console.error('[NotificationService] 초기화 오류:', error);
      throw error;
    }
  }

  /**
   * 로컬 알림 표시
   *
   * @param notification 알림 데이터
   * @returns 알림 식별자
   */
  public async showNotification(
    notification: NotificationData,
  ): Promise<string> {
    try {
      const notificationId = await showLocalNotification(notification);
      return notificationId;
    } catch (error) {
      console.error('[NotificationService] 알림 표시 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 알림 취소
   *
   * @param notificationId 알림 식별자
   */
  public async cancelNotification(notificationId: string): Promise<void> {
    try {
      await cancelNotification(notificationId);
    } catch (error) {
      console.error('[NotificationService] 알림 취소 오류:', error);
      throw error;
    }
  }

  /**
   * 모든 알림 취소
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await cancelAllNotifications();
    } catch (error) {
      console.error('[NotificationService] 모든 알림 취소 오류:', error);
      throw error;
    }
  }
}

export default NotificationService.getInstance();
