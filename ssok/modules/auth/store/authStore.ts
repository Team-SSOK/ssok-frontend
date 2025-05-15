import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// 토큰 키 이름 - ApiInstance.ts와 일치시키기
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// SecureStore에 토큰 저장 헬퍼 함수
const storeTokensInSecureStore = async (
  accessToken: string,
  refreshToken: string,
) => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    console.log('[LOG] 토큰 SecureStore 저장 완료');
  } catch (error) {
    console.error('[ERROR] SecureStore 토큰 저장 실패:', error);
  }
};

// 인증 상태 타입 정의
interface AuthState {
  // 상태 (State)
  userId: number | null;
  username: string;
  phoneNumber: string;
  birthDate: string;
  pin: string;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  // 기본 액션 (상태 변경 함수)
  setUserId: (userId: number) => void;
  setUserInfo: (
    username: string,
    phoneNumber: string,
    birthDate: string,
  ) => void;
  setPin: (pin: string) => void;
  clearPin: () => void;
  setAuthTokens: (accessToken: string, refreshToken: string) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;

  // 복합 액션 (여러 상태를 한번에 변경하는 함수)
  saveRegistrationInfo: (
    username: string,
    phoneNumber: string,
    birthDate: string,
    pin: string,
  ) => void;
  saveUserRegistration: (phoneNumber: string, pin: string) => Promise<void>;
  verifyPin: (inputPin: string) => boolean;
  verifyAndLogin: (inputPin: string) => Promise<boolean>;
  login: (
    userId: number,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  logout: () => Promise<void>;

  // 네비게이션 액션
  navigateAfterAuthCheck: () => Promise<void>;

  // 유틸리티 함수
  isUserRegistered: () => boolean;
  getAuthTokens: () => {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

// Zustand 스토어 생성
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

      // 기본 액션 (상태 변경 함수)
      setUserId: (userId) => set({ userId }),

      setUserInfo: (username, phoneNumber, birthDate) =>
        set({ username, phoneNumber, birthDate }),

      setPin: (pin) => set({ pin }),

      clearPin: () => set({ pin: '' }),

      setAuthTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),

      setIsLoading: (isLoading) => set({ isLoading }),

      // 복합 액션 (여러 상태를 한번에 변경하는 함수)
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
          console.log('[LOG] phoneNumber: ', phoneNumber, 'PIN: ', pin);
          set({ phoneNumber, pin });
        } catch (error) {
          console.error('Error saving user registration:', error);
        }
      },

      verifyPin: (inputPin) => {
        const storedPin = get().pin;
        console.log('[LOG] storedPin: ', storedPin);
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
          console.error('Error verifying PIN:', error);
          return false;
        }
      },

      login: async (userId, accessToken, refreshToken) => {
        console.log('[LOG] 로그인 성공, 토큰 저장 시작');

        // SecureStore에 토큰 저장
        await storeTokensInSecureStore(accessToken, refreshToken);

        // Zustand 상태 업데이트
        set({
          userId,
          accessToken,
          refreshToken,
          isLoggedIn: true,
        });

        console.log('[LOG] 로그인 완료 (Zustand 및 SecureStore에 토큰 저장됨)');
      },

      logout: async () => {
        console.log('[LOG] 로그아웃');

        // SecureStore에서 토큰 제거
        try {
          await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
          console.log('[LOG] SecureStore 토큰 제거 완료');
        } catch (error) {
          console.error('[ERROR] SecureStore 토큰 제거 실패:', error);
        }

        // Zustand 상태 업데이트
        set({
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
        });
      },

      // 네비게이션 액션
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
          console.error('[Error]:', error);
          set({ isLoading: false });
        }
      },

      // 유틸리티 함수
      isUserRegistered: () => {
        const { phoneNumber, pin } = get();
        const isRegistered = !!phoneNumber && !!pin;
        console.log('[LOG] isRegistered: ', isRegistered);
        return isRegistered;
      },

      getAuthTokens: () => {
        const { accessToken, refreshToken } = get();
        return { accessToken, refreshToken };
      },
    }),
    {
      name: 'auth-storage', // 스토리지 키 이름
      storage: createJSONStorage(() => AsyncStorage), // AsyncStorage 사용
      partialize: (state) => ({
        // 영구 저장할 상태만 선택
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

// 정적 메서드 추가 (API 인터셉터에서 호출할 수 있도록)
export const authStoreActions = {
  resetAuth: async () => {
    try {
      // SecureStore에서 토큰 제거
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

      // 스토어 상태 초기화
      useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        isLoggedIn: false,
      });

      console.log('[LOG] 토큰 만료로 인한 강제 로그아웃 처리 완료');

      // 다음 렌더링 사이클에서 라우팅이 동작하도록 setTimeout 사용
      setTimeout(() => {
        // 세션 만료 파라미터를 포함하여 로그인 화면으로 리디렉션
        router.replace({
          pathname: '/auth/pin-login',
          params: { sessionExpired: 'true' },
        });
      }, 100);
    } catch (error) {
      console.error('[Error] 강제 로그아웃 처리 중 오류:', error);
    }
  },
};
