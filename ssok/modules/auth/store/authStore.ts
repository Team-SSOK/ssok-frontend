import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// 토큰 상수
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
};

// 상태 타입 정의
interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
}

interface UserState {
  userId: number | null;
  username: string;
  phoneNumber: string;
  birthDate: string;
  pin: string;
}

interface UiState {
  isLoggedIn: boolean;
  isLoading: boolean;
}

// 액션 타입 정의
interface UserActions {
  setUserId: (userId: number) => void;
  setUserInfo: (
    username: string,
    phoneNumber: string,
    birthDate: string,
  ) => void;
  setPin: (pin: string) => void;
  clearPin: () => void;
  saveRegistrationInfo: (
    username: string,
    phoneNumber: string,
    birthDate: string,
    pin: string,
  ) => void;
  saveUserRegistration: (phoneNumber: string, pin: string) => Promise<void>;
  isUserRegistered: () => boolean;
}

interface AuthActions {
  setAuthTokens: (accessToken: string, refreshToken: string) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  verifyPin: (inputPin: string) => boolean;
  verifyAndLogin: (inputPin: string) => Promise<boolean>;
  login: (
    userId: number,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  getAuthTokens: () => TokenState;
}

interface NavigationActions {
  setIsLoading: (isLoading: boolean) => void;
  navigateAfterAuthCheck: () => Promise<void>;
}

// 전체 스토어 타입
interface AuthState
  extends UserState,
    TokenState,
    UiState,
    UserActions,
    AuthActions,
    NavigationActions {}

/**
 * 토큰 관리를 위한 SecureStore 유틸리티 함수
 */
const tokenStorage = {
  /**
   * SecureStore에 토큰 저장
   */
  storeTokens: async (
    accessToken: string,
    refreshToken: string,
  ): Promise<void> => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
      console.log('[LOG] 토큰 SecureStore 저장 완료');
    } catch (error) {
      console.error('[ERROR] SecureStore 토큰 저장 실패:', error);
      throw new Error('토큰 저장 실패');
    }
  },

  /**
   * SecureStore에서 토큰 제거
   */
  clearTokens: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
      console.log('[LOG] SecureStore 토큰 제거 완료');
    } catch (error) {
      console.error('[ERROR] SecureStore 토큰 제거 실패:', error);
      throw new Error('토큰 제거 실패');
    }
  },

  /**
   * SecureStore에서 토큰 조회
   */
  getTokens: async (): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> => {
    try {
      const accessToken = await SecureStore.getItemAsync(
        TOKEN_KEYS.ACCESS_TOKEN,
      );
      const refreshToken = await SecureStore.getItemAsync(
        TOKEN_KEYS.REFRESH_TOKEN,
      );
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('[ERROR] SecureStore 토큰 조회 실패:', error);
      return { accessToken: null, refreshToken: null };
    }
  },
};

/**
 * 인증 상태 관리 스토어
 *
 * 사용자 인증, 토큰 관리, 사용자 정보 등을 관리합니다.
 *
 * @example
 * ```ts
 * // 로그인 상태 확인
 * const isLoggedIn = useAuthStore(state => state.isLoggedIn);
 *
 * // 로그인 처리
 * const login = useAuthStore(state => state.login);
 * await login(userId, accessToken, refreshToken);
 *
 * // 로그아웃 처리
 * const logout = useAuthStore(state => state.logout);
 * await logout();
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      userId: null,
      username: '',
      phoneNumber: '',
      birthDate: '',
      pin: '',
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      isLoading: false,

      // 사용자 정보 관련 액션
      setUserId: (userId) => set({ userId }),

      setUserInfo: (username, phoneNumber, birthDate) =>
        set({ username, phoneNumber, birthDate }),

      setPin: (pin) => set({ pin }),

      clearPin: () => set({ pin: '' }),

      saveRegistrationInfo: (username, phoneNumber, birthDate, pin) => {
        console.log('[LOG] 사용자 회원 가입 정보 저장');
        set({
          username,
          phoneNumber,
          birthDate,
          pin,
        });
      },

      saveUserRegistration: async (phoneNumber, pin) => {
        try {
          console.log('[LOG] 사용자 회원 가입 정보 저장');
          set({ phoneNumber, pin });
        } catch (error) {
          console.error('[ERROR] 사용자 등록 정보 저장 실패:', error);
          throw new Error('사용자 등록 정보 저장 실패');
        }
      },

      isUserRegistered: () => {
        const { phoneNumber, pin } = get();
        const isRegistered = !!phoneNumber && !!pin;
        console.log('[LOG] isRegistered: ', isRegistered);
        return isRegistered;
      },

      // 인증 관련 액션
      setAuthTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),

      verifyPin: (inputPin) => {
        const storedPin = get().pin;
        return storedPin === inputPin;
      },

      verifyAndLogin: async (inputPin) => {
        try {
          const isValid = get().verifyPin(inputPin);
          if (isValid) {
            set({ isLoggedIn: true });
          }
          return isValid;
        } catch (error) {
          console.error('[ERROR] PIN 검증 실패:', error);
          return false;
        }
      },

      login: async (userId, accessToken, refreshToken) => {
        console.log('[LOG] 로그인 성공, 토큰 저장 시작');

        try {
          // SecureStore에 토큰 저장
          await tokenStorage.storeTokens(accessToken, refreshToken);

          // Zustand 상태 업데이트
          set({
            userId,
            accessToken,
            refreshToken,
            isLoggedIn: true,
          });

          console.log(
            '[LOG] 로그인 완료 (Zustand 및 SecureStore에 토큰 저장됨)',
          );
        } catch (error) {
          console.error('[ERROR] 로그인 처리 실패:', error);
          throw new Error('로그인 처리 실패');
        }
      },

      logout: async () => {
        console.log('[LOG] 로그아웃');

        try {
          // SecureStore에서 토큰 제거
          await tokenStorage.clearTokens();

          // Zustand 상태 업데이트
          set({
            accessToken: null,
            refreshToken: null,
            isLoggedIn: false,
          });
        } catch (error) {
          console.error('[ERROR] 로그아웃 처리 실패:', error);
          throw new Error('로그아웃 처리 실패');
        }
      },

      getAuthTokens: () => {
        const { accessToken, refreshToken } = get();
        return { accessToken, refreshToken };
      },

      // UI 및 네비게이션 관련 액션
      setIsLoading: (isLoading) => set({ isLoading }),

      navigateAfterAuthCheck: async () => {
        try {
          set({ isLoading: true });
          const isRegistered = get().isUserRegistered();
          const { isLoggedIn } = get();

          setTimeout(() => {
            if (isRegistered && !isLoggedIn) {
              router.replace('/auth/pin-login');
            } else if (isLoggedIn) {
              router.replace('/(tabs)');
            }
            set({ isLoading: false });
          }, 100);
        } catch (error) {
          console.error('[ERROR] 인증 확인 후 네비게이션 실패:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId,
        username: state.username,
        phoneNumber: state.phoneNumber,
        birthDate: state.birthDate,
        pin: state.pin,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);

/**
 * API 인터셉터에서 사용할 수 있는 정적 메서드들
 */
export const authStoreActions = {
  /**
   * 인증 정보 초기화
   */
  resetAuth: async () => {
    try {
      // SecureStore에서 토큰 제거
      await tokenStorage.clearTokens();

      // 스토어 상태 초기화
      useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        isLoggedIn: false,
      });

      // 로그인 화면으로 이동
      router.replace('/auth/pin-login?sessionExpired=true');
    } catch (error) {
      console.error('[ERROR] 인증 초기화 실패:', error);
    }
  },

  /**
   * 토큰 새로고침
   */
  updateTokens: async (accessToken: string, refreshToken: string) => {
    try {
      // SecureStore에 토큰 저장
      await tokenStorage.storeTokens(accessToken, refreshToken);

      // Zustand 상태 업데이트
      useAuthStore.setState({
        accessToken,
        refreshToken,
        isLoggedIn: true,
      });
    } catch (error) {
      console.error('[ERROR] 토큰 업데이트 실패:', error);
    }
  },

  /**
   * 로그인 상태 확인 (API 인터셉터에서 사용)
   */
  isAuthenticated: () => {
    const state = useAuthStore.getState();
    return !!state.accessToken && state.isLoggedIn;
  },
};
