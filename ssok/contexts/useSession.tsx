import React, { type PropsWithChildren } from 'react';
import { useAuthStore, type AuthUser } from '@/modules/auth/store/authStore'; // 경로 수정 및 AuthUser 타입 import

/**
 * 인증 관련 정보와 액션을 제공하는 훅
 */
export function useSession() {
  // useAuthStore로부터 상태와 액션을 가져옴
  const {
    user, // 현재 로그인한 사용자 정보 (AuthUser | null)
    isAuthenticated, // 인증 여부 (boolean)
    isLoading, // 로딩 상태 (boolean)
    error, // 에러 메시지 (string | null)
    loginWithPin, // PIN 기반 로그인 함수
    // login, // 일반 로그인 함수 (API 응답으로 사용자 정보와 토큰을 받아 처리)
    logout, // 로그아웃 함수
    clearError, // 에러 초기화 함수
    initialize, // 스토어 초기화 함수 (앱 시작 시 호출)
  } = useAuthStore();

  return {
    // 상태
    session: isAuthenticated ? user : null, // 인증된 경우 사용자 정보, 아니면 null
    isLoading,
    error,
    isAuthenticated, // Expo Router 등에서 직접 사용하기 편하도록 노출

    // 액션 (기존 프로젝트의 PIN 기반 로그인에 맞춰 일부 수정)
    // signIn: 사용자가 제공한 email/password 기반 예시.
    // 현재 프로젝트는 PIN 기반이므로, loginWithPin을 사용하거나
    // email/password 로그인을 별도로 구현해야 함.
    /*
    signIn: async (email: string, password: string) => {
      try {
        // email/password 기반 로그인을 authStore에 구현했다면 호출
        // await login({ email, password }); // 예시: authStore.login이 email/password를 받는다면
        console.warn('signIn (email/password)은 현재 구현되지 않았습니다. loginWithPin을 사용하세요.');
        throw new Error('Email/password signIn not implemented');
      } catch (err) {
        // 에러는 store에서 이미 설정되므로 여기서는 다시 던지거나 처리
        throw err;
      }
    },
    */
    // PIN 기반 로그인 함수 (기존 프로젝트용)
    signInWithPin: async (pin: string) => {
      try {
        return await loginWithPin(pin);
      } catch (err) {
        throw err;
      }
    },
    signOut: async () => {
      try {
        await logout();
      } catch (err) {
        throw err;
      }
    },
    clearError,
    initializeAuth: initialize, // 앱 초기화 로직 호출용
  };
}

/**
 * 세션 컨텍스트 프로바이더
 * Zustand를 사용하므로, 이 Provider는 Expo Router의 <SessionProvider>와 같은 역할을 하며,
 * _layout.tsx 등에서 앱 최상단을 감싸는 용도로 사용될 수 있습니다.
 * useSession 훅이 Zustand 스토어를 직접 사용하므로, React Context Provider가 반드시 필요하지 않을 수 있지만,
 * 일관된 패턴 또는 향후 Context API 직접 사용 가능성을 위해 구조는 유지합니다.
 */
export function SessionProvider({ children }: PropsWithChildren) {
  // useAuthStore의 initialize 함수는 앱 로드 시 한 번 호출되어야 합니다.
  // SessionProvider가 마운트될 때 호출하거나, Root _layout에서 호출할 수 있습니다.
  // 여기서는 SessionProvider가 그 역할을 하도록 할 수 있으나,
  // 참조한 app/_layout.tsx에서는 useEffect 내에서 initialize를 호출하고 있으므로 그 패턴을 따르는 것이 좋습니다.
  // const initializeAuth = useAuthStore((state) => state.initialize);
  // React.useEffect(() => {
  //  initializeAuth();
  // }, [initializeAuth]);

  return <>{children}</>;
}
