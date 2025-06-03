import React, { type PropsWithChildren } from 'react';
import { useAuthStore, type AuthUser } from '@/modules/auth/store/authStore';
import Toast from 'react-native-toast-message';

/**
 * 인증 관련 정보와 액션을 제공하는 훅
 */
export function useSession() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    signupAndLoginViaApi,
    loginWithPinViaApi,
    logout,
    clearError,
    initialize,
    handleUserNotFound,
  } = useAuthStore();

  return {
    session: isAuthenticated ? user : null,
    isLoading,
    error,
    isAuthenticated,

    signUpAndLogin: async (pin: string) => {
      try {
        return await signupAndLoginViaApi(pin);
      } catch (err) {
        if (err instanceof Error) {
          return { success: false, message: err.message };
        }
        return { success: false, message: '알 수 없는 회원가입 오류' };
      }
    },
    signInWithPin: async (pin: string) => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser || !currentUser.id) {
        Toast.show({
          type: 'error',
          text1: '사용자 정보 오류',
          text2: '사용자 정보를 찾을 수 없습니다.',
          position: 'bottom',
        });
        return { success: false, message: '사용자 정보를 찾을 수 없습니다.' };
      }
      try {
        return await loginWithPinViaApi(pin, currentUser.id);
      } catch (err) {
        if (err instanceof Error) {
          return { success: false, message: err.message };
        }
        return { success: false, message: '알 수 없는 PIN 로그인 오류' };
      }
    },
    signOut: async () => {
      try {
        await logout();
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: '로그아웃 실패',
          text2: '로그아웃 중 오류가 발생했습니다.',
          position: 'bottom',
        });
        if (err instanceof Error) {
          throw new Error(`로그아웃 실패: ${err.message}`);
        }
        throw new Error('로그아웃 중 알 수 없는 오류가 발생했습니다.');
      }
    },
    handleUserNotFound: async () => {
      try {
        await handleUserNotFound();
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: '데이터 초기화 실패',
          text2: '사용자 데이터 초기화 중 오류가 발생했습니다.',
          position: 'bottom',
        });
        if (err instanceof Error) {
          throw new Error(`사용자 데이터 초기화 실패: ${err.message}`);
        }
        throw new Error(
          '사용자 데이터 초기화 중 알 수 없는 오류가 발생했습니다.',
        );
      }
    },
    clearAuthError: clearError,
    initializeAuth: initialize,
  };
}

export function SessionProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}
