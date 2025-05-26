import React from 'react';
import { router } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // authStore에서 사용자 정보 가져오므로 제거
import { useAuthStore, type AuthUser } from '@/modules/auth/store/authStore'; // AuthUser 타입 import
import { authApi } from '@/modules/auth/api/authApi';
// import { STORAGE_KEYS } from '@/modules/auth/utils/constants'; // 제거
import PinScreen from '@/modules/auth/components/PinScreen';
import useDialog from '@/modules/auth/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider'; // DialogProvider import
import { ERROR_MESSAGES } from '@/modules/auth/utils/constants'; // ERROR_MESSAGES 직접 사용

export default function PinConfirm() {
  const {
    pin: storedPin, // 스토어에 저장된 PIN (pin-setup에서 설정)
    user: tempUser, // 스토어에 임시 저장된 사용자 정보 (register에서 저장)
    login,
    isLoading, // 이 isLoading은 API 호출 시 사용
    setIsLoading,
    clearError,
    // setError, // 필요시 authStore 에러 상태 사용
  } = useAuthStore();

  const { showDialog, dialogState, hideDialog } = useDialog();

  const handleComplete = async (inputPin: string) => {
    if (inputPin !== storedPin) {
      showDialog({
        title: 'PIN 불일치',
        content: ERROR_MESSAGES.PIN_MISMATCH || 'PIN 번호가 일치하지 않습니다.',
        confirmText: '다시 시도',
      });
      return false;
    }

    if (
      !tempUser ||
      !tempUser.username ||
      !tempUser.phoneNumber ||
      !tempUser.birthDate
    ) {
      showDialog({
        title: '오류',
        content:
          ERROR_MESSAGES.MISSING_USER_INFO ||
          '회원가입에 필요한 사용자 정보가 없습니다.',
        confirmText: '확인',
      });
      return false;
    }

    setIsLoading(true);
    clearError();

    try {
      const signupData = {
        username: tempUser.username,
        phoneNumber: tempUser.phoneNumber,
        birthDate: tempUser.birthDate,
        pinCode: Number(inputPin),
      };

      console.log('[LOG][PinConfirm] 회원가입 요청:', signupData);
      const signupResponse = await authApi.signup(signupData);
      console.log('[LOG][PinConfirm] 회원가입 응답:', signupResponse.data);

      if (signupResponse.data.isSuccess && signupResponse.data.result?.userId) {
        const userId = signupResponse.data.result.userId;
        console.log(
          '[LOG][PinConfirm] 회원가입 성공. userId:',
          userId,
          '로그인 시도.',
        );

        // 회원가입 성공 후 바로 로그인 API 호출
        const loginResponse = await authApi.login({
          userId,
          pinCode: Number(inputPin),
        });
        console.log('[LOG][PinConfirm] 로그인 응답:', loginResponse.data);

        if (loginResponse.data.isSuccess && loginResponse.data.result) {
          const { accessToken, refreshToken, ...userDataFromApi } =
            loginResponse.data.result;

          if (
            typeof accessToken === 'string' &&
            typeof refreshToken === 'string' &&
            accessToken.trim() !== '' &&
            refreshToken.trim() !== ''
          ) {
            const finalUser: AuthUser = {
              id: userId, // 회원가입 시 받은 userId 사용
              // 로그인 응답에 사용자 정보가 포함되지 않으므로, 기존 tempUser 정보 활용
              // API 스펙에 따라 로그인 응답의 userDataFromApi를 사용할 수도 있음 (현재는 로그인 API 응답에 사용자 정보 없음)
              username: tempUser.username,
              phoneNumber: tempUser.phoneNumber,
              birthDate: tempUser.birthDate,
            };

            console.log('[LOG][PinConfirm] 로그인 성공, authStore.login 호출');
            await login(finalUser, accessToken, refreshToken);
            router.replace('/(app)');
            return true;
          } else {
            console.error(
              '[ERROR][PinConfirm] 로그인 API 응답에서 유효한 토큰을 받지 못했습니다.',
              { accessToken, refreshToken },
            );
            showDialog({
              title: '로그인 오류',
              content: '로그인 토큰을 받지 못했습니다. 다시 시도해주세요.',
              confirmText: '확인',
            });
          }
        } else {
          console.error(
            '[ERROR][PinConfirm] 로그인 API 호출 실패:',
            loginResponse.data,
          );
          showDialog({
            title: '로그인 실패',
            content:
              loginResponse.data.message ||
              ERROR_MESSAGES.LOGIN_FAILED ||
              '로그인에 실패했습니다.',
            confirmText: '확인',
          });
        }
      } else {
        console.error(
          '[ERROR][PinConfirm] 회원가입 API 호출 실패 또는 userId 없음:',
          signupResponse.data,
        );
        showDialog({
          title: '회원가입 실패',
          content:
            signupResponse.data.message ||
            ERROR_MESSAGES.SIGNUP_FAILED ||
            '회원가입에 실패했습니다.',
          confirmText: '확인',
        });
      }
    } catch (error) {
      console.error('[ERROR][PinConfirm] 처리 중 예외 발생:', error);
      showDialog({
        title: '오류',
        content: ERROR_MESSAGES.SIGNUP_ERROR || '처리 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    } finally {
      setIsLoading(false);
    }
    return false; // 기본적으로 실패로 처리, 성공 시점에서 true 반환
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
      <PinScreen title="PIN번호 확인" onComplete={handleComplete} />
    </>
  );
}

// ERROR_MESSAGES에 다음 추가 필요 (예시)
// MISSING_USER_INFO: '회원가입에 필요한 사용자 정보가 없습니다. 다시 시도해주세요.',
// SIGNUP_FAILED: '회원가입에 실패했습니다.',
// SIGNUP_ERROR: '회원가입 중 오류가 발생했습니다.',
// PIN_MISMATCH: 'PIN 번호가 일치하지 않습니다.',
