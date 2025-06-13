import { useEffect } from 'react';
import {
  initializeNotificationListeners,
  setupNotificationHandler,
} from '../services/notificationService';

/**
 * 앱의 전역 알림 리스너를 관리하는 훅.
 * 앱의 루트 레이아웃 컴포넌트에서 한 번만 사용되어야 합니다.
 */
export const useNotificationManager = () => {
  useEffect(() => {
    // 포그라운드 알림 핸들러 설정
    setupNotificationHandler();

    // 알림 리스너를 설정하고, 정리(cleanup) 함수를 반환받습니다.
    const cleanupListeners = initializeNotificationListeners();

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다.
    return () => {
      cleanupListeners();
    };
  }, []);
}; 