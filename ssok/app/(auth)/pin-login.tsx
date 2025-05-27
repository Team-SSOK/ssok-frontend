import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useSession } from '@/contexts/useSession';
import PinScreen from '@/modules/auth/components/PinScreen';
import useDialog from '@/modules/auth/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider';
import { Alert, BackHandler } from 'react-native';
import { ERROR_MESSAGES } from '@/modules/auth/utils/constants';

/**
 * PIN 로그인 화면
 *
 * 사용자가 미리 등록한 PIN 번호로 로그인할 수 있는 화면입니다.
 * 세션 만료 시 자동으로 이 화면으로 리디렉션됩니다.
 */
export default function PinLogin() {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const {
    signInWithPin,
    isAuthenticated: isSessionAuthenticated,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useSession();
  const { showDialog, dialogState, hideDialog } = useDialog();
  const params = useLocalSearchParams();

  // 하드웨어 백 버튼 처리 (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // 로그인 화면에서는 백 버튼을 무시하여 뒤로 갈 수 없게 함
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  // 로그인 성공 시 (tabs)로 이동 (handleComplete에서 직접 라우팅하므로, 이 useEffect는 선택적 또는 중복될 수 있음)
  // 다만, 다른 이유로 isAuthenticated 상태가 변경될 경우를 대비해 유지할 수 있음.
  useEffect(() => {
    if (isSessionAuthenticated) {
      router.replace('/(app)');
    }
  }, [isSessionAuthenticated]);

  // 세션 만료 감지 (쿼리 파라미터로부터)
  useEffect(() => {
    const sessionExpired = params.sessionExpired === 'true';
    if (sessionExpired) {
      Alert.alert(
        '세션 만료',
        '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
        [{ text: '확인', style: 'default' }],
      );
    }
  }, [params]);

  /**
   * PIN 입력 완료 시 로그인 처리
   * 이 함수는 PinScreen에 prop으로 전달되지만, 의존성이 자주 변경되지 않으므로
   * useCallback을 제거해도 성능에 큰 영향이 없습니다.
   */
  const handleComplete = async (inputPin: string) => {
    setLoginAttempts((prev) => prev + 1);

    const result = await signInWithPin(inputPin);

    if (result.success) {
      console.log('[LOG][PinLogin] PIN 로그인 성공, 화면 전환');
      return true;
    } else {
      console.error('[ERROR][PinLogin] PIN 로그인 실패:', result.message);
      if (loginAttempts >= 2 && result.message?.includes('PIN')) {
        showDialog({
          title: '로그인 실패',
          content: ERROR_MESSAGES.PIN_LOGIN_ATTEMPT_LIMIT,
          confirmText: '확인',
          onConfirm: () => {
            hideDialog();
            setLoginAttempts(0);
          },
        });
      } else {
        showDialog({
          title: '로그인 실패',
          content: result.message || ERROR_MESSAGES.LOGIN_FAILED,
          confirmText: '확인',
        });
      }
      return false;
    }
  };

  return (
    <>
      <DialogProvider
        visible={dialogState.visible}
        title={dialogState.title}
        content={dialogState.content}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm || hideDialog}
        onCancel={dialogState.onCancel || hideDialog}
        onDismiss={hideDialog}
      />
      <PinScreen
        title="PIN 번호 로그인"
        subtitle="등록된 PIN 번호 6자리를 입력해주세요"
        onComplete={handleComplete}
        isLoading={isSessionLoading}
      />
    </>
  );
}
