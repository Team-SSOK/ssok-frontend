import React, { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useAppState } from '@/hooks/useAppState';
import { useSession } from '@/contexts/useSession';
import { useNotificationInitializer } from '@/modules/notification';
import Toast from 'react-native-toast-message';

const LOG_TAG = '[LOG][AppStateManager]';

/**
 * 앱 상태 관리 컴포넌트
 *
 * 백그라운드/포그라운드 전환을 감지하고 필요시 재인증 페이지로 네비게이션합니다.
 * 또한 인증된 사용자에게 푸시 알림을 초기화합니다.
 * 이 컴포넌트는 앱의 최상위 레벨에서 사용되어야 합니다.
 */
export const AppStateManager: React.FC = () => {
  const { needsReauth, clearReauthRequest } = useAppState();
  const { isAuthenticated, isLoading } = useSession();
  const isNavigatingRef = useRef(false);

  // 푸시 알림 초기화 (인증된 사용자에게만)
  const notification = useNotificationInitializer({
    autoRegister: isAuthenticated, // 인증된 사용자에게만 자동 등록
    onSuccess: (token) => {
      console.log(`${LOG_TAG} 푸시 토큰 등록 성공:`, token.substring(0, 20) + '...');
      Toast.show({
        type: 'success',
        text1: '알림 설정 완료',
        text2: '푸시 알림이 활성화되었습니다.',
        position: 'bottom',
        visibilityTime: 2000,
      });
    },
    onError: (error) => {
      console.error(`${LOG_TAG} 푸시 알림 설정 오류:`, error);
      // 권한 거부는 사용자 선택이므로 에러 토스트를 표시하지 않음
      if (!error.includes('권한이 거부')) {
        Toast.show({
          type: 'error',
          text1: '알림 설정 실패',
          text2: error,
          position: 'bottom',
          visibilityTime: 3000,
        });
      }
    },
    onNotificationReceived: (notificationData) => {
      console.log(`${LOG_TAG} 알림 수신:`, notificationData);
      // 필요시 알림 수신 처리 로직 추가
    },
    onNotificationResponse: (response) => {
      console.log(`${LOG_TAG} 알림 탭:`, response);
      // 필요시 알림 탭 처리 로직 추가 (딥링크 등)
    },
  });

  // 재인증 처리
  useEffect(() => {
    console.log(
      `${LOG_TAG} needsReauth changed to: ${needsReauth}, isNavigating: ${isNavigatingRef.current}`,
    );

    if (needsReauth && !isNavigatingRef.current) {
      console.log(`${LOG_TAG} 재인증 필요, reauth 페이지로 이동`);
      isNavigatingRef.current = true;

      // 재인증 페이지로 이동
      router.push('/reauth');

      // 재인증 후 상태 초기화
      clearReauthRequest();

      // 네비게이션 플래그 리셋 (약간의 지연 후)
      setTimeout(() => {
        console.log(`${LOG_TAG} 네비게이션 플래그 리셋`);
        isNavigatingRef.current = false;
      }, 1000);
    }
  }, [needsReauth, clearReauthRequest]);

  // 인증 상태 변경 시 알림 설정 로그
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        console.log(`${LOG_TAG} 사용자 인증됨 - 푸시 알림 초기화 시작`);
      } else {
        console.log(`${LOG_TAG} 사용자 미인증됨 - 푸시 알림 비활성화`);
      }
    }
  }, [isAuthenticated, isLoading]);

  // 이 컴포넌트는 UI를 렌더링하지 않고 상태 관리만 담당
  return null;
};
