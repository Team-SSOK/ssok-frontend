import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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
  login: (userId: number, accessToken: string, refreshToken: string) => void;
  logout: () => void;

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

      login: (userId, accessToken, refreshToken) => {
        console.log('[LOG] 로그인 성공');
        set({
          userId,
          accessToken,
          refreshToken,
          isLoggedIn: true,
        });
      },

      logout: () => {
        console.log('[LOG] 로그아웃');
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
