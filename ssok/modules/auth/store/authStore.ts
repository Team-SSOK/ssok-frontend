import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // 액션 (Actions)
  setUserId: (userId: number) => void;
  setUserInfo: (
    username: string,
    phoneNumber: string,
    birthDate: string,
  ) => void;
  setPin: (pin: string) => void;
  setAuthTokens: (accessToken: string, refreshToken: string) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;

  // 복합 액션 (Thunks)
  saveRegistrationInfo: (
    username: string,
    phoneNumber: string,
    birthDate: string,
    pin: string,
  ) => void;
  verifyPin: (inputPin: string) => boolean;
  login: (userId: number, accessToken: string, refreshToken: string) => void;
  logout: () => void;

  // 유틸리티 함수
  isUserRegistered: () => boolean;
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
      isLoading: true,

      // 기본 액션 (상태 변경 함수)
      setUserId: (userId) => set({ userId }),
      setUserInfo: (username, phoneNumber, birthDate) =>
        set({ username, phoneNumber, birthDate }),
      setPin: (pin) => set({ pin }),
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

      verifyPin: (inputPin) => {
        const storedPin = get().pin;
        console.log('[LOG] storedPin: ', storedPin);
        return storedPin === inputPin;
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

      // 유틸리티 함수
      isUserRegistered: () => {
        const { phoneNumber, pin } = get();
        const isRegistered = !!phoneNumber && !!pin;
        console.log('[LOG] isRegistered: ', isRegistered);
        return isRegistered;
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
      }),
    },
  ),
);
