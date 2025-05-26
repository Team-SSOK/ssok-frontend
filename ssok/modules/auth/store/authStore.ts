import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  saveTokens as saveTokensToSecureStore,
  clearTokens as clearTokensFromSecureStore,
  getTokens as getTokensFromSecureStore,
  hasValidTokens,
} from '@/services/tokenService';

// 상태 타입 정의
interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
}

interface User {
  id: number | null;
  username: string;
  phoneNumber: string;
  birthDate: string;
}

interface AuthStateInternal extends TokenState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pin: string;
}

// 액션 타입 정의
interface UserActions {
  setPin: (pin: string) => void;
  clearPin: () => void;
  saveRegistrationInfo: (
    username: string,
    phoneNumber: string,
    birthDate: string,
    pin: string,
  ) => void;
  isUserRegistered: () => boolean;
}

interface AuthActions {
  loginWithPin: (inputPin: string) => Promise<boolean>;
  login: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  resetAuth: () => Promise<void>;
}

interface NavigationActions {
  setIsLoading: (isLoading: boolean) => void;
  navigateAfterAuthCheck: () => Promise<void>;
}

// 전체 스토어 타입
export interface AuthStoreState
  extends AuthStateInternal,
    UserActions,
    AuthActions,
    NavigationActions {}

/**
 * 인증 상태 관리 스토어
 */
export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      pin: '',
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 사용자 정보 관련 액션
      setPin: (pin) => set({ pin }),
      clearPin: () => set({ pin: '' }),

      saveRegistrationInfo: (username, phoneNumber, birthDate, pin) => {
        console.log('[LOG][authStore] 사용자 회원 가입 정보 임시 저장');
        set({
          pin,
          user: {
            ...(get().user || {}),
            username,
            phoneNumber,
            birthDate,
            id: null,
          } as User,
        });
      },

      isUserRegistered: () => {
        const { pin } = get();
        return !!pin;
      },

      // 인증 관련 액션
      loginWithPin: async (inputPin) => {
        set({ isLoading: true, error: null });
        const storedPin = get().pin;
        if (storedPin === inputPin) {
          const { accessToken, refreshToken } =
            await getTokensFromSecureStore();
          if (accessToken && refreshToken) {
            set({ isAuthenticated: true, isLoading: false });
            console.log('[LOG][authStore] PIN 로그인 성공 (토큰 존재 가정)');
            return true;
          } else {
            set({
              isAuthenticated: false,
              error: '토큰이 없어 PIN으로 로그인할 수 없습니다.',
              isLoading: false,
            });
            console.warn(
              '[WARN][authStore] PIN은 일치하지만 SecureStore에 토큰 없음',
            );
            return false;
          }
        } else {
          set({
            isAuthenticated: false,
            error: 'PIN이 일치하지 않습니다.',
            isLoading: false,
          });
          return false;
        }
      },

      login: async (user, accessToken, refreshToken) => {
        set({ isLoading: true, error: null });
        console.log('[LOG][authStore] 로그인 처리 시작', user);
        try {
          await saveTokensToSecureStore(accessToken, refreshToken);
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log('[LOG][authStore] 로그인 완료');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : '로그인 처리 중 오류 발생';
          console.error('[ERROR][authStore] 로그인 실패:', errorMessage);
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        console.log('[LOG][authStore] 로그아웃 처리 시작');
        try {
          await clearTokensFromSecureStore();
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            pin: get().isUserRegistered() ? get().pin : '',
            isLoading: false,
          });
          console.log('[LOG][authStore] 로그아웃 완료');
          router.replace('/sign-in');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : '로그아웃 처리 중 오류 발생';
          console.error('[ERROR][authStore] 로그아웃 실패:', errorMessage);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        console.log('[LOG][authStore] Initialize 시작');
        try {
          const tokens = await getTokensFromSecureStore();
          const persistedUser = get().user;
          const persistedPin = get().pin;

          console.log(
            '[LOG][authStore] Initialize - SecureStore tokens:',
            tokens,
          );
          console.log(
            '[LOG][authStore] Initialize - Zustand persistedUser:',
            persistedUser,
          );
          console.log(
            '[LOG][authStore] Initialize - Zustand persistedPin:',
            persistedPin,
          );

          const isValid = await hasValidTokens();
          console.log(
            '[LOG][authStore] Initialize - hasValidTokens 결과:',
            isValid,
          );

          if (isValid) {
            if (persistedUser && persistedUser.id && persistedPin) {
              set({
                user: persistedUser,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                isAuthenticated: true,
                pin: persistedPin,
                isLoading: false,
                error: null,
              });
              console.log(
                '[LOG][authStore] 초기화: 유효한 토큰과 AsyncStorage 사용자 정보/PIN으로 인증됨. isAuthenticated:',
                get().isAuthenticated,
              );
            } else {
              console.warn(
                '[LOG][authStore] 초기화: 토큰은 유효하나 AsyncStorage 사용자 정보/PIN 불완전. resetAuth 호출.',
              );
              await get().resetAuth();
            }
          } else {
            console.log(
              '[LOG][authStore] 초기화: 유효한 토큰 없음 (hasValidTokens false). resetAuth 호출.',
            );
            await get().resetAuth();
          }
        } catch (error) {
          console.error('[ERROR][authStore] 초기화 중 예외 발생:', error);
          await get().resetAuth();
        } finally {
          set({ isLoading: false });
          console.log(
            '[LOG][authStore] Initialize 종료. 최종 isAuthenticated:',
            get().isAuthenticated,
          );
        }
      },

      clearError: () => set({ error: null }),

      resetAuth: async () => {
        console.log(
          '[LOG][authStore] resetAuth 시작. 현재 isAuthenticated:',
          get().isAuthenticated,
        );
        await clearTokensFromSecureStore();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
        console.log(
          '[LOG][authStore] resetAuth 종료. 최종 isAuthenticated:',
          get().isAuthenticated,
        );
      },

      // UI 및 네비게이션 관련 액션
      setIsLoading: (isLoading) => set({ isLoading }),

      navigateAfterAuthCheck: async () => {
        console.log(
          '[LOG][authStore] navigateAfterAuthCheck 호출됨 (현재 사용되지 않을 수 있음)',
        );
        const { isAuthenticated, isUserRegistered } = get();
        if (isAuthenticated) {
          router.replace('/(app)/(tabs)');
        } else if (isUserRegistered()) {
          router.replace('/(auth)/pin-login');
        } else {
          router.replace('/sign-in');
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, pin: state.pin }),
      onRehydrateStorage: (state) => {
        console.log(
          '[LOG][authStore] AsyncStorage로부터 스토어 재수화 시작',
          state,
        );
        return (restoredState, error) => {
          if (error) {
            console.error('[ERROR][authStore] AsyncStorage 복원 실패:', error);
          } else {
            console.log(
              '[LOG][authStore] AsyncStorage 복원 완료:',
              restoredState,
            );
          }
        };
      },
    },
  ),
);

// User 인터페이스를 export하여 다른 모듈(예: useSession)에서 타입 참조 가능하게 함
export type { User as AuthUser };

// 개발 중 상태 확인용 (프로덕션에서는 제거)
// if (__DEV__) {
//   useAuthStore.subscribe(
//     (state, prevState) => console.log('[Zustand State Change][authStore]', { newState: state, oldState: prevState })
//   );
// }
