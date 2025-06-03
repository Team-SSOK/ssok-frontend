import React from 'react';
import { router } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // authStore에서 사용자 정보 가져오므로 제거
import { useAuthStore, type AuthUser } from '@/modules/auth/store/authStore'; // AuthUser 타입 import
// import { authApi } from '@/modules/auth/api/authApi'; // 스토어에서 처리하므로 제거
// import { STORAGE_KEYS } from '@/modules/auth/utils/constants'; // 제거
import PinScreen from '@/modules/auth/components/PinScreen';
import useDialog from '@/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider'; // DialogProvider import
import { ERROR_MESSAGES } from '@/modules/auth/utils/constants'; // ERROR_MESSAGES 직접 사용
import { useSession } from '@/contexts/useSession'; // useSession 훅 임포트

export default function PinConfirm() {
  const {
    pin: storedPin, // 스토어에 저장된 PIN (pin-setup에서 설정)
    // user: tempUser, // 스토어의 user 상태는 useSession 또는 useAuthStore를 통해 간접적으로 사용
    isLoading, // 직접 사용하지 않고 useSession의 isLoading 사용
    // setError, // 필요시 authStore 에러 상태 사용
  } = useAuthStore(); // 스토어에서 필요한 최소한의 상태만 가져오거나, useSession으로 통일

  const {
    signUpAndLogin,
    isLoading: isSessionLoading,
    error: sessionError,
    clearAuthError,
  } = useSession(); // useSession 사용
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

    // tempUser 정보는 authStore.signupAndLoginViaApi 내부에서 get()으로 가져와 사용합니다.
    // 따라서 여기서 명시적으로 확인할 필요는 줄어들지만, UI 로직상 필요하면 유지할 수 있습니다.
    // const currentUserState = useAuthStore.getState().user;
    // if (!currentUserState || !currentUserState.username || !currentUserState.phoneNumber || !currentUserState.birthDate) {
    //   showDialog({
    //     title: '오류',
    //     content: ERROR_MESSAGES.MISSING_USER_INFO || '회원가입에 필요한 사용자 정보가 없습니다.',
    //     confirmText: '확인',
    //   });
    //   return false;
    // }

    // setIsLoading(true); // 스토어 액션 내부에서 처리
    // clearAuthError(); // 필요시 호출 또는 스토어 액션 시작 시 처리

    // useSession의 signUpAndLogin 함수 호출
    const result = await signUpAndLogin(inputPin);

    if (result.success) {
      console.log('[LOG][PinConfirm] 회원가입 및 로그인 성공, 화면 전환');
      router.replace('/(app)'); // 성공 시 메인 화면으로
      return true;
    } else {
      console.error(
        '[ERROR][PinConfirm] 회원가입/로그인 실패:',
        result.message,
      );
      showDialog({
        title: '처리 실패',
        content:
          result.message ||
          ERROR_MESSAGES.SIGNUP_ERROR ||
          '처리 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
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
      {/* PinScreen의 isLoading 프롭은 useSession의 isSessionLoading 또는 스토어의 isLoading을 사용 */}
      <PinScreen
        title="PIN번호 확인"
        onComplete={handleComplete}
        isLoading={isSessionLoading} // 로딩 상태 전달
      />
    </>
  );
}
// ERROR_MESSAGES에 다음 추가 필요 (예시)
// MISSING_USER_INFO: '회원가입에 필요한 사용자 정보가 없습니다. 다시 시도해주세요.',
// SIGNUP_FAILED: '회원가입에 실패했습니다.',
// SIGNUP_ERROR: '회원가입 중 오류가 발생했습니다.',
// PIN_MISMATCH: 'PIN 번호가 일치하지 않습니다.',
