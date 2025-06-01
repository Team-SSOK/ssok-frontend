import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { authApi } from '@/modules/auth/api/authApi';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { backgroundService } from '@/services/backgroundService';
import { router } from 'expo-router';
import useDialog from '@/hooks/useDialog';

const LOG_TAG = '[LOG][useAppState]';
const BACKGROUND_THRESHOLD = 30000;

/**
 * 앱 상태 변화를 감지하고 백그라운드/포그라운드 전환 시 보안 로직을 처리하는 훅
 *
 * @usage
 * ```tsx
 * // 컴포넌트에서 사용
 * const { needsReauth, handleReauth, dialogState, hideDialog } = useAppState();
 *
 * return (
 *   <>
 *     {needsReauth && <ReauthScreen onReauth={handleReauth} />}
 *     <DialogProvider
 *       visible={dialogState.visible}
 *       title={dialogState.title}
 *       content={dialogState.content}
 *       confirmText={dialogState.confirmText}
 *       onConfirm={dialogState.onConfirm}
 *       onDismiss={hideDialog}
 *     />
 *   </>
 * );
 * ```
 */
export const useAppState = () => {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const [needsReauth, setNeedsReauth] = useState(false);

  const appStateRef = useRef(AppState.currentState);
  const backgroundTimerRef = useRef<number | null>(null);
  const backgroundStartTimeRef = useRef<number | null>(null);
  const { isAuthenticated, user, handleUserNotFound } = useAuthStore();
  const { showDialog, dialogState, hideDialog } = useDialog();

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
        const errorMsg = response.data.message || '재인증에 실패했습니다.';
        showDialog({
          title: '재인증 실패!!',
          content: '사용자 정보를 찾을 수 없습니다.\n앱을 다시 시작해주세요.',
          confirmText: '확인',
          onConfirm: () => {
            router.push('/(auth)/register');
            hideDialog();
          },
        });
        return { success: false, message: errorMsg };
      }
    } catch (error: any) {
      // 사용자 없음 에러 감지
      if (
        error.response?.status === 404 ||
        error.response?.data?.code === 4040 ||
        error.response?.data?.message?.includes('사용자를 찾을 수 없습니다') ||
        error.response?.data?.message?.includes('User not found')
      ) {
        console.log(
          `${LOG_TAG} 재인증 중 사용자 없음 에러 감지 - 전체 초기화 진행`,
        );

        // needsReauth 상태를 먼저 false로 설정하여 AppStateManager 간섭 방지
        setNeedsReauth(false);

        // 사용자에게 친화적인 메시지로 상황 설명
        showDialog({
          title: '계정 정보 없음',
          content:
            '서버에서 계정 정보를 찾을 수 없습니다.\n처음부터 다시 가입해주세요.',
          confirmText: '확인',
          onConfirm: async () => {
            console.log(
              `${LOG_TAG} 다이얼로그 확인 버튼 클릭 - handleUserNotFound 호출 시작`,
            );
            hideDialog();
            try {
              await handleUserNotFound();
              console.log(`${LOG_TAG} handleUserNotFound 호출 완료`);
            } catch (error) {
              console.error(
                `${LOG_TAG} handleUserNotFound 호출 중 오류:`,
                error,
              );
            }
          },
        });

        return {
          success: false,
          message: '사용자 정보가 삭제되어 다시 로그인이 필요합니다!.',
        };
      }

      // 일반 에러 처리
      const errorMessage =
        error.response?.data?.message || '재인증 중 오류가 발생했습니다.';

      showDialog({
        title: '재인증 오류',
        content: `${errorMessage}\n잠시 후 다시 시도해주세요.`,
        confirmText: '확인',
      });

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
    // 다이얼로그 상태 추가
    dialogState,
    showDialog,
    hideDialog,
    // 백그라운드 서비스 상태도 노출
    isInBackground: backgroundService.isAppInBackground(),
    backgroundStartTime: backgroundService.getBackgroundStartTime(),
  };
};
