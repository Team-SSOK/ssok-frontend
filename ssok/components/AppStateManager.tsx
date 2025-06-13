import React, { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useAppState } from '@/hooks/useAppState';
import { useSession } from '@/contexts/useSession';

const LOG_TAG = '[LOG][AppStateManager]';

/**
 * 앱 상태 관리 컴포넌트
 *
 * 백그라운드/포그라운드 전환을 감지하고 필요시 재인증 페이지로 네비게이션합니다.
 * 이 컴포넌트는 앱의 최상위 레벨에서 사용되어야 합니다.
 */
export const AppStateManager: React.FC = () => {
  const { needsReauth, clearReauthRequest } = useAppState();
  const { isAuthenticated, isLoading } = useSession();
  const isNavigatingRef = useRef(false);

  // 재인증 처리
  useEffect(() => {
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

  // 인증 상태 변경 로그
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        console.log(`${LOG_TAG} 사용자 인증됨`);
      } else {
        console.log(`${LOG_TAG} 사용자 미인증됨`);
      }
    }
  }, [isAuthenticated, isLoading]);

  return null;
};
