import React, { type PropsWithChildren } from 'react';
import { useAuthStore, type AuthUser } from '@/modules/auth/store/authStore';

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
        console.error('[useSession] signInWithPin: 사용자 ID 없음');
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
        console.error('[useSession] signOut error:', err);
        if (err instanceof Error) {
          throw new Error(`로그아웃 실패: ${err.message}`);
        }
        throw new Error('로그아웃 중 알 수 없는 오류가 발생했습니다.');
      }
    },
    clearAuthError: clearError,
    initializeAuth: initialize,
  };
}

export function SessionProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}
