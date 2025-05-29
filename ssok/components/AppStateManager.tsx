import React, { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useAppState } from '@/hooks/useAppState';

const LOG_TAG = '[LOG][AppStateManager]';

/**
 * 앱 상태 관리 컴포넌트
 *
 * 백그라운드/포그라운드 전환을 감지하고 필요시 재인증 페이지로 네비게이션합니다.
 * 이 컴포넌트는 앱의 최상위 레벨에서 사용되어야 합니다.
 */
export const AppStateManager: React.FC = () => {
  const { needsReauth, clearReauthRequest } = useAppState();
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    console.log(
      `${LOG_TAG} needsReauth changed to: ${needsReauth}, isNavigating: ${isNavigatingRef.current}`,
    );

    if (needsReauth && !isNavigatingRef.current) {
      console.log(`${LOG_TAG} 재인증 필요, reauth 페이지로 이동`);
      isNavigatingRef.current = true;

      // 재인증 페이지로 이동
      router.push('/reauth');

      // 네비게이션 후 상태 초기화
      clearReauthRequest();

      // 네비게이션 플래그 리셋 (약간의 지연 후)
      setTimeout(() => {
        console.log(`${LOG_TAG} 네비게이션 플래그 리셋`);
        isNavigatingRef.current = false;
      }, 1000);
    }
  }, [needsReauth, clearReauthRequest]);

  // 이 컴포넌트는 UI를 렌더링하지 않고 상태 관리만 담당
  return null;
};
