import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore, type AuthUser } from '@/modules/auth/store/authStore';
import { authApi } from '@/modules/auth/api/authApi';
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
    pin: storedPin,
    user: storedUser,
    login,
    isLoading,
    setIsLoading,
    clearError,
    isAuthenticated,
  } = useAuthStore();
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
    if (isAuthenticated) {
      router.replace('/(app)');
    }
  }, [isAuthenticated]);

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
    setIsLoading(true);
    clearError();
    setLoginAttempts((prev) => prev + 1);

    if (inputPin !== storedPin) {
      if (loginAttempts >= 2) {
        showDialog({
          title: '로그인 실패',
          content: ERROR_MESSAGES.PIN_LOGIN_ATTEMPT_LIMIT,
          confirmText: '확인',
        });
        setLoginAttempts(0);
      }
      setIsLoading(false);
      return false;
    }

    const userIdToLogin = storedUser?.id;

    if (!userIdToLogin) {
      showDialog({
        title: '오류',
        content: ERROR_MESSAGES.USER_ID_NOT_FOUND,
        confirmText: '확인',
      });
      setIsLoading(false);
      return false;
    }

    try {
      const loginResponse = await authApi.login({
        userId: userIdToLogin,
        pinCode: Number(inputPin),
      });

      if (loginResponse.data.isSuccess && loginResponse.data.result) {
        const { accessToken, refreshToken, ...userDataFromApi } = loginResponse
          .data.result as any;

        const finalUser: AuthUser = {
          id: userIdToLogin,
          username: userDataFromApi.username || storedUser?.username || '',
          phoneNumber:
            userDataFromApi.phoneNumber || storedUser?.phoneNumber || '',
          birthDate: userDataFromApi.birthDate || storedUser?.birthDate || '',
        };

        await login(finalUser, accessToken, refreshToken);
        // router.replace('/(tabs)'); // useEffect에서 isAuthenticated 변경을 감지하여 이동
        // setIsLoading(false); // login 액션 내부에서 처리되거나, 화면 전환으로 불필요
        return true;
      } else {
        showDialog({
          title: '로그인 실패',
          content: loginResponse.data.message || ERROR_MESSAGES.LOGIN_FAILED,
          confirmText: '확인',
        });
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      showDialog({
        title: '오류',
        content: ERROR_MESSAGES.LOGIN_ERROR,
        confirmText: '확인',
      });
      setIsLoading(false);
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
      />
    </>
  );
}
