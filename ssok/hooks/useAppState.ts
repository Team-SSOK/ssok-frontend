import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { authApi } from '@/modules/auth/api/authApi';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { backgroundService } from '@/services/backgroundService';

const LOG_TAG = '[LOG][useAppState]';
const BACKGROUND_THRESHOLD = 30000;

/**
 * 앱 상태 변화를 감지하고 백그라운드/포그라운드 전환 시 보안 로직을 처리하는 훅
 */
export const useAppState = () => {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const [needsReauth, setNeedsReauth] = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const backgroundTimerRef = useRef<number | null>(null);
  const backgroundStartTimeRef = useRef<number | null>(null);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log(
        `${LOG_TAG} App state changed from ${appStateRef.current} to ${nextAppState}`,
      );

      // 인증된 사용자만 처리
      if (!isAuthenticated || !user) {
        appStateRef.current = nextAppState;
        setAppState(nextAppState);
        return;
      }

      // 포그라운드 → 백그라운드 전환
      if (
        appStateRef.current.match(/active|foreground/) &&
        nextAppState === 'background'
      ) {
        console.log(
          `${LOG_TAG} App going to background, starting ${BACKGROUND_THRESHOLD / 1000}s timer`,
        );

        // 백그라운드 시작 시간 기록
        backgroundStartTimeRef.current = Date.now();

        // 백그라운드 서비스 상태 업데이트
        backgroundService.onAppBackground();

        // 30초 후에 background API 호출하는 타이머 설정
        backgroundTimerRef.current = setTimeout(async () => {
          console.log(
            `${LOG_TAG} Background timer expired (${BACKGROUND_THRESHOLD / 1000}s), calling background API`,
          );

          try {
            await authApi.background();
            console.log(`${LOG_TAG} Background API call successful`);
          } catch (error) {
            console.error(`${LOG_TAG} Background API call failed:`, error);
          }
        }, BACKGROUND_THRESHOLD);
      }

      // 백그라운드 → 포그라운드 전환
      if (appStateRef.current === 'background' && nextAppState === 'active') {
        const backgroundDuration = backgroundStartTimeRef.current
          ? Date.now() - backgroundStartTimeRef.current
          : 0;

        console.log(
          `${LOG_TAG} App returning to foreground after ${backgroundDuration}ms`,
        );

        // 백그라운드 타이머가 있으면 취소
        if (backgroundTimerRef.current) {
          console.log(
            `${LOG_TAG} Cancelling background timer (returned before ${BACKGROUND_THRESHOLD / 1000}s)`,
          );
          clearTimeout(backgroundTimerRef.current);
          backgroundTimerRef.current = null;
        }

        // 백그라운드 서비스 상태 업데이트
        backgroundService.onAppForeground();

        // 30초 이상 백그라운드에 있었던 경우에만 재인증 요구
        if (backgroundDuration >= BACKGROUND_THRESHOLD) {
          console.log(
            `${LOG_TAG} Background duration exceeded threshold, requiring reauth`,
          );
          setNeedsReauth(true);
        } else {
          console.log(
            `${LOG_TAG} Background duration under threshold, no reauth required`,
          );
        }

        // 백그라운드 시작 시간 초기화
        backgroundStartTimeRef.current = null;
      }

      appStateRef.current = nextAppState;
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
      // 컴포넌트 언마운트 시 타이머 정리
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
      }
    };
  }, [isAuthenticated, user]);

  /**
   * 재인증 처리 함수
   * @param pinCode PIN 코드
   * @returns 재인증 결과
   */
  const handleReauth = async (
    pinCode: string,
  ): Promise<{ success: boolean; message?: string }> => {
    if (!user?.id) {
      return { success: false, message: '사용자 정보를 찾을 수 없습니다.' };
    }

    try {
      const response = await authApi.foreground({
        userId: user.id,
        pinCode: parseInt(pinCode, 10),
      });

      if (response.data.isSuccess && response.data.result) {
        // 토큰 저장은 API 인터셉터에서 자동으로 처리됨
        console.log(`${LOG_TAG} Foreground reauth successful`);
        setNeedsReauth(false);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || '재인증에 실패했습니다.',
        };
      }
    } catch (error: any) {
      console.error(`${LOG_TAG} Foreground reauth failed:`, error);

      // 에러 응답에서 메시지 추출
      const errorMessage =
        error.response?.data?.message || '재인증 중 오류가 발생했습니다.';
      return { success: false, message: errorMessage };
    }
  };

  /**
   * 재인증 요구 상태를 수동으로 해제
   */
  const clearReauthRequest = () => {
    console.log(
      `${LOG_TAG} Clearing reauth request, setting needsReauth to false`,
    );
    setNeedsReauth(false);
  };

  return {
    appState,
    needsReauth,
    handleReauth,
    clearReauthRequest,
    // 백그라운드 서비스 상태도 노출
    isInBackground: backgroundService.isAppInBackground(),
    backgroundStartTime: backgroundService.getBackgroundStartTime(),
  };
};
