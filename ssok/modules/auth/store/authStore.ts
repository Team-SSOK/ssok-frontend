import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  saveTokens as saveTokensToSecureStore,
  clearTokens as clearTokensFromSecureStore,
  getTokens as getTokensFromSecureStore,
  hasValidTokens,
} from '@/services/tokenService';
import { authApi } from '@/modules/auth/api/authApi';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { ERROR_MESSAGES } from '@/modules/auth/utils/constants';

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

interface PhoneVerificationState {
  phoneNumber: string;
  verificationCode: string;
  verificationSent: boolean;
  verificationConfirmed: boolean;
  isSendingCode: boolean;
  isVerifyingCode: boolean;
}

interface AuthStateInternal extends TokenState, PhoneVerificationState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pin: string;
}

// 액션 타입 정의
interface PhoneVerificationActions {
  setPhoneNumber: (phoneNumber: string) => void;
  setVerificationCode: (code: string) => void;
  sendVerificationCode: () => Promise<{ success: boolean; message?: string }>;
  verifyCodeWithUserCheck: () => Promise<{ 
    success: boolean; 
    data?: { existingUser: boolean; userId: number | null }; 
    message?: string 
  }>;
  resetVerification: () => void;
  formatPhoneNumber: (value: string) => string;
}

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
  signupAndLoginViaApi: (
    inputPin: string,
  ) => Promise<{ success: boolean; message?: string }>;
  loginWithPinViaApi: (
    inputPin: string,
    userId: number,
  ) => Promise<{ success: boolean; message?: string }>;
  login: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  resetAuth: () => Promise<void>;
  handleUserNotFound: () => Promise<void>;
  resetPin: (userId: number, pinCode: string) => Promise<{ success: boolean; message?: string }>;
}

interface NavigationActions {
  setIsLoading: (isLoading: boolean) => void;
  navigateAfterAuthCheck: () => Promise<void>;
}

// 전체 스토어 타입
export interface AuthStoreState
  extends AuthStateInternal,
    PhoneVerificationActions,
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
      
      // 휴대폰 인증 상태
      phoneNumber: '',
      verificationCode: '',
      verificationSent: false,
      verificationConfirmed: false,
      isSendingCode: false,
      isVerifyingCode: false,

      // 휴대폰 인증 관련 액션
      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      
      setVerificationCode: (code) => set({ verificationCode: code }),

      formatPhoneNumber: (value: string): string => {
        // 숫자만 추출
        const digits = value.replace(/[^0-9]/g, '');
        let formattedPhoneNumber = '';

        if (digits.length <= 3) {
          formattedPhoneNumber = digits;
        } else if (digits.length <= 7) {
          formattedPhoneNumber = `${digits.slice(0, 3)}-${digits.slice(3)}`;
        } else {
          formattedPhoneNumber = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
        }

        return formattedPhoneNumber;
      },

      sendVerificationCode: async () => {
        const { phoneNumber } = get();
        
        if (!phoneNumber) {
          const message = ERROR_MESSAGES.REQUIRED_PHONE;
          set({ error: message });
          return { success: false, message };
        }

        set({ isSendingCode: true, error: null });

        try {
          const response = await authApi.sendVerificationCode({ phoneNumber });

          if (response.data.isSuccess) {
            set({ verificationSent: true, isSendingCode: false });
            return { success: true };
          } else {
            const message = response.data.message || ERROR_MESSAGES.SEND_CODE_ERROR;
            set({ error: message, isSendingCode: false });
            return { success: false, message };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SEND_CODE_ERROR;
          set({ error: errorMessage, isSendingCode: false });
          return { success: false, message: errorMessage };
        }
      },

      verifyCodeWithUserCheck: async () => {
        const { phoneNumber, verificationCode } = get();
        
        if (!verificationCode) {
          const message = ERROR_MESSAGES.REQUIRED_VERIFICATION_CODE;
          set({ error: message });
          return { success: false, message };
        }

        set({ isVerifyingCode: true, error: null });

        try {
          const response = await authApi.verifyCodeWithUserCheck({
            phoneNumber,
            verificationCode,
          });

          if (response.data.isSuccess && response.data.result) {
            const { existingUser, userId } = response.data.result;
            
            set({ verificationConfirmed: true, isVerifyingCode: false });
            
            // 사용자 정보를 임시 저장
            if (existingUser && userId) {
              // 기존 사용자
              set({
                user: {
                  id: userId,
                  username: get().user?.username || '',
                  phoneNumber,
                  birthDate: get().user?.birthDate || '',
                },
              });
            } else {
              // 신규 사용자
              set({
                user: {
                  id: null,
                  username: '',
                  phoneNumber,
                  birthDate: '',
                },
              });
            }
            
            return { 
              success: true, 
              data: { existingUser, userId }
            };
          } else {
            const message = response.data.message || ERROR_MESSAGES.INVALID_VERIFICATION_CODE;
            set({ error: message, isVerifyingCode: false });
            return { success: false, message };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.VERIFY_CODE_ERROR;
          set({ error: errorMessage, isVerifyingCode: false });
          return { success: false, message: errorMessage };
        }
      },

      resetVerification: () => {
        set({
          phoneNumber: '',
          verificationCode: '',
          verificationSent: false,
          verificationConfirmed: false,
          isSendingCode: false,
          isVerifyingCode: false,
          error: null,
        });
      },

      // 사용자 정보 관련 액션
      setPin: (pin) => set({ pin }),
      clearPin: () => set({ pin: '' }),

      saveRegistrationInfo: (username, phoneNumber, birthDate, pin) => {
        set({
          user: {
            id: null,
            username,
            phoneNumber,
            birthDate,
          },
          pin,
        });
      },

      isUserRegistered: () => {
        const { user } = get();
        return !!user?.username && !!user?.birthDate;
      },

      // PIN 재설정 액션
      resetPin: async (userId: number, pinCode: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.resetPin({ userId, pinCode });

          if (response.data.isSuccess) {
            set({ isLoading: false });
            return { success: true };
          } else {
            const message = response.data.message || 'PIN 재설정에 실패했습니다.';
            set({ error: message, isLoading: false });
            return { success: false, message };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'PIN 재설정 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      // 인증 관련 액션
      signupAndLoginViaApi: async (inputPin) => {
        const { user } = get();

        if (!user || !user.username || !user.birthDate) {
          const message = ERROR_MESSAGES.MISSING_REGISTRATION_INFO;
          set({ error: message, isLoading: false });
          return { success: false, message };
        }

        set({ isLoading: true, error: null });
        
        try {
          // 1. 회원가입 요청
          const signupResponse = await authApi.signup({
            username: user.username,
            phoneNumber: user.phoneNumber,
            birthDate: user.birthDate,
            pinCode: parseInt(inputPin, 10),
            });

          if (!signupResponse.data.isSuccess || !signupResponse.data.result) {
            const message = signupResponse.data.message || ERROR_MESSAGES.SIGNUP_FAILED;
            set({ error: message, isLoading: false });
            return { success: false, message };
              }
          
          const { userId } = signupResponse.data.result;
          
          // 2. 회원가입 성공 후 바로 로그인 요청
          return get().loginWithPinViaApi(inputPin, userId);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SIGNUP_FAILED;
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      loginWithPinViaApi: async (inputPin, userId) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login({
            userId,
            pinCode: parseInt(inputPin, 10),
          });

          if (response.data.isSuccess && response.data.result) {
            const {
              accessToken,
              refreshToken,
              username,
              phoneNumber,
              birthDate,
            } = response.data.result;

            const currentUser = get().user;

            await get().login(
              {
                id: userId,
                username: username || currentUser?.username || '',
                phoneNumber: phoneNumber || currentUser?.phoneNumber || '',
                birthDate: birthDate || currentUser?.birthDate || '',
              },
              accessToken,
              refreshToken,
            );
              return { success: true };
          } else {
            const message = response.data.message || ERROR_MESSAGES.LOGIN_FAILED;
            set({ error: message, isLoading: false });
            return { success: false, message };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.LOGIN_FAILED;
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      login: async (user, accessToken, refreshToken) => {
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          error: null,
          });
        await saveTokensToSecureStore(accessToken, refreshToken);
      },

      logout: async () => {
        const currentPin = get().pin;
        const isUserPreviouslyRegistered = !!currentPin;

        set({ isLoading: true, error: null });
        console.log('[LOG][authStore] 로그아웃 처리 시작');
        try {
          await clearTokensFromSecureStore();
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            pin: isUserPreviouslyRegistered ? currentPin : '',
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
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        console.log('[LOG][authStore] Initialize 시작');
        try {
          const tokens = await getTokensFromSecureStore();
          const persistedState = get();
          const persistedUser = persistedState.user;
          const persistedPin = persistedState.pin;

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

          const isValidTokenPresent = await hasValidTokens();
          console.log(
            '[LOG][authStore] Initialize - hasValidTokens 결과:',
            isValidTokenPresent,
          );

          if (
            isValidTokenPresent &&
            tokens?.accessToken &&
            tokens?.refreshToken
          ) {
            if (persistedUser?.id && persistedPin) {
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
                '[LOG][authStore] 초기화: 유효한 토큰, SecureStore 사용자 정보 및 PIN으로 인증됨.',
              );
            } else {
              console.warn(
                '[LOG][authStore] 초기화: 토큰은 유효하나 SecureStore 사용자 정보/PIN 불완전. resetAuth 호출.',
              );
              await get().resetAuth();
            }
          } else {
            console.log(
              '[LOG][authStore] 초기화: 유효한 토큰 없음. resetAuth 호출.',
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
        const currentPin = get().pin || '';
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
          pin: currentPin,
        });
        console.log(
          '[LOG][authStore] resetAuth 종료. 최종 isAuthenticated:',
          get().isAuthenticated,
        );
      },

      handleUserNotFound: async () => {
        console.log(
          '[LOG][authStore] handleUserNotFound 시작 - 사용자가 서버에서 삭제됨',
        );
        set({ isLoading: true, error: null });

        try {
          // SecureStorage 토큰 삭제
          await clearTokensFromSecureStore();

          // AsyncStorage 모든 데이터 완전 삭제
          await AsyncStorage.clear();

          // 모든 store들의 상태 초기화
          const { useAccountStore } = await import('@/modules/account/stores/accountStore');
          const { useProfileStore } = await import('@/modules/settings/store/profileStore');
          const { useTransferStore } = await import('@/modules/transfer/stores/transferStore');

          useAccountStore.getState().resetAccountStore();
          useProfileStore.getState().reset();
          useTransferStore.getState().resetTransferStore();

          // Zustand 상태 완전 초기화 (PIN 포함)
          set({
            user: null,
            pin: '',
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            verificationSent: false,
            verificationConfirmed: false,
            isSendingCode: false,
            isVerifyingCode: false,
          });

          router.replace('/(auth)/register');
          console.log('[LOG][authStore] 회원가입 페이지로 라우팅 완료');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : '사용자 데이터 초기화 중 오류 발생';
          console.error(
            '[ERROR][authStore] handleUserNotFound 실패:',
            errorMessage,
          );
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // UI 및 네비게이션 관련 액션
      setIsLoading: (isLoading) => set({ isLoading }),

      navigateAfterAuthCheck: async () => {
        console.log('[LOG][authStore] navigateAfterAuthCheck 호출됨.');
        await get().initialize();
        const { isAuthenticated, pin, user } = get();

        if (isAuthenticated && user?.id) {
          console.log('[LOG][authStore] navigate: (app)/(tabs)로 이동');
          router.replace('/(app)/(tabs)');
        } else if (pin && user?.id) {
          console.log('[LOG][authStore] navigate: (auth)/pin-login으로 이동');
          router.replace('/(auth)/pin-login');
        } else if (pin && !user?.id) {
          console.log('[LOG][authStore] navigate: (auth)/pin-setup으로 이동');
          router.replace('/(auth)/pin-setup');
        } else {
          console.log('[LOG][authStore] navigate: /sign-in으로 이동');
          router.replace('/sign-in');
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => {
          // undefined 값을 null로 변환
          if (value === undefined) {
            return null;
          }
          return value;
        },
        replacer: (key, value) => {
          // undefined 값을 null로 변환하여 저장
          if (value === undefined) {
            return null;
          }
          return value;
        },
      }),
      partialize: (state) => ({
        user: state.user || null,
        pin: state.pin || '',
      }),
      onRehydrateStorage: () => {
        console.log('[LOG][authStore] AsyncStorage로부터 스토어 재수화 감지');
        return (restoredState, error) => {
          if (error) {
            console.error(
              '[ERROR][authStore] AsyncStorage 복원 중 오류:',
              error,
            );
          } else {
            console.log(
              '[LOG][authStore] AsyncStorage에서 성공적으로 복원됨:',
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

// 개발 중 상태 확인용 (프로덕션에서는 제거 권장)
// if (__DEV__) {
//   useAuthStore.subscribe(
//     (state) => console.log('[Zustand State Change][authStore]', state),
//   );
// }
