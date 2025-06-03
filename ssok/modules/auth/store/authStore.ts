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
  verificationSent: boolean;
  verificationConfirmed: boolean;
  isSendingCode: boolean;
  isVerifyingCode: boolean;
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

interface VerificationActions {
  sendVerificationCode: (
    phoneNumber: string,
  ) => Promise<{ success: boolean; message?: string }>;
  verifyCode: (
    phoneNumber: string,
    verificationCode: string,
  ) => Promise<{ success: boolean; message?: string }>;
  resetVerification: () => void;
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
}

interface NavigationActions {
  setIsLoading: (isLoading: boolean) => void;
  navigateAfterAuthCheck: () => Promise<void>;
}

// 전체 스토어 타입
export interface AuthStoreState
  extends AuthStateInternal,
    UserActions,
    VerificationActions,
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
      verificationSent: false,
      verificationConfirmed: false,
      isSendingCode: false,
      isVerifyingCode: false,

      // 사용자 정보 관련 액션
      setPin: (pin) => set({ pin }),
      clearPin: () => set({ pin: '' }),

      saveRegistrationInfo: (username, phoneNumber, birthDate, pin) => {
        console.log('[LOG][authStore] 사용자 회원 가입 정보 및 PIN 임시 저장');
        set({
          pin,
          user: {
            username,
            phoneNumber,
            birthDate,
            id: null,
          },
        });
      },

      isUserRegistered: () => {
        const { pin } = get();
        return !!pin;
      },

      // Verification 관련 액션
      sendVerificationCode: async (phoneNumber) => {
        set({ isSendingCode: true, error: null });

        try {
          const response = await authApi.sendVerificationCode({ phoneNumber });

          if (response.data.isSuccess) {
            set({ verificationSent: true, isSendingCode: false });
            return { success: true };
          } else {
            const msg =
              response.data.message || '인증번호 발송에 실패했습니다.';
            set({ error: msg, isSendingCode: false });
            return { success: false, message: msg };
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : '인증번호 발송 중 오류가 발생했습니다.';
          set({ error: errorMessage, isSendingCode: false });
          return { success: false, message: errorMessage };
        }
      },

      verifyCode: async (phoneNumber, verificationCode) => {
        set({ isVerifyingCode: true, error: null });

        try {
          const response = await authApi.verifyCode({
            phoneNumber,
            verificationCode,
          });

          if (response.data.isSuccess) {
            set({ verificationConfirmed: true, isVerifyingCode: false });
            return { success: true };
          } else {
            const msg =
              response.data.message || '인증번호가 올바르지 않습니다.';
            set({ error: msg, isVerifyingCode: false });
            return { success: false, message: msg };
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : '인증 확인 중 오류가 발생했습니다.';
          set({ error: errorMessage, isVerifyingCode: false });
          return { success: false, message: errorMessage };
        }
      },

      resetVerification: () => {
        set({
          verificationSent: false,
          verificationConfirmed: false,
          isSendingCode: false,
          isVerifyingCode: false,
        });
      },

      // 인증 관련 액션
      signupAndLoginViaApi: async (inputPin) => {
        set({ isLoading: true, error: null });
        const tempUser = get().user;

        if (
          !tempUser ||
          !tempUser.username ||
          !tempUser.phoneNumber ||
          !tempUser.birthDate
        ) {
          const msg = '회원가입에 필요한 사용자 정보가 스토어에 없습니다.';
          Toast.show({
            type: 'error',
            text1: '회원가입 정보 오류',
            text2: '필요한 사용자 정보가 없습니다.',
            position: 'bottom',
          });
          set({ error: msg, isLoading: false });
          return { success: false, message: msg };
        }

        try {
          const signupData = {
            username: tempUser.username,
            phoneNumber: tempUser.phoneNumber,
            birthDate: tempUser.birthDate,
            pinCode: Number(inputPin),
          };

          console.log('[LOG][authStore] 회원가입 API 요청:', signupData);
          const signupResponse = await authApi.signup(signupData);
          console.log(
            '[LOG][authStore] 회원가입 API 응답:',
            signupResponse.data,
          );

          if (
            signupResponse.data.isSuccess &&
            signupResponse.data.result?.userId
          ) {
            const userId = signupResponse.data.result.userId;
            console.log(
              '[LOG][authStore] 회원가입 성공. userId:',
              userId,
              '로그인 API 시도.',
            );

            const loginResponse = await authApi.login({
              userId,
              pinCode: Number(inputPin),
            });
            console.log(
              '[LOG][authStore] 로그인 API 응답:',
              loginResponse.data,
            );

            if (loginResponse.data.isSuccess && loginResponse.data.result) {
              const { accessToken, refreshToken } = loginResponse.data.result;

              if (
                typeof accessToken === 'string' &&
                typeof refreshToken === 'string' &&
                accessToken.trim() !== '' &&
                refreshToken.trim() !== ''
              ) {
                const finalUser: User = {
                  id: userId,
                  username: tempUser.username,
                  phoneNumber: tempUser.phoneNumber,
                  birthDate: tempUser.birthDate,
                };
                await get().login(finalUser, accessToken, refreshToken);
                console.log(
                  '[LOG][authStore] signupAndLoginViaApi: 회원가입 및 로그인 성공',
                );
                return { success: true };
              } else {
                const msg =
                  '로그인 API 응답에서 유효한 토큰을 받지 못했습니다.';
                Toast.show({
                  type: 'error',
                  text1: '로그인 토큰 오류',
                  text2: '유효한 인증 토큰을 받지 못했습니다.',
                  position: 'bottom',
                });
                set({ error: msg, isLoading: false });
                return { success: false, message: msg };
              }
            } else {
              const msg =
                loginResponse.data.message || '로그인 API 호출에 실패했습니다.';
              Toast.show({
                type: 'error',
                text1: '로그인 실패',
                text2: msg,
                position: 'bottom',
              });
              set({ error: msg, isLoading: false });
              return { success: false, message: msg };
            }
          } else {
            const msg =
              signupResponse.data.message ||
              '회원가입 API 호출에 실패했거나 userId가 없습니다.';
            Toast.show({
              type: 'error',
              text1: '회원가입 실패',
              text2: msg,
              position: 'bottom',
            });
            set({ error: msg, isLoading: false });
            return { success: false, message: msg };
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : '회원가입 또는 로그인 처리 중 예외 발생';
          Toast.show({
            type: 'error',
            text1: '회원가입/로그인 오류',
            text2: errorMessage,
            position: 'bottom',
          });
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      loginWithPinViaApi: async (inputPin, userId) => {
        set({ isLoading: true, error: null });
        const storedUser = get().user;

        if (!userId) {
          const msg = '로그인에 필요한 userId가 없습니다.';
          Toast.show({
            type: 'error',
            text1: '로그인 정보 오류',
            text2: '사용자 ID가 없습니다.',
            position: 'bottom',
          });
          set({ error: msg, isLoading: false });
          return { success: false, message: msg };
        }

        try {
          console.log(
            `[LOG][authStore] loginWithPinViaApi: userId: ${userId}로 로그인 API 요청`,
          );
          const loginResponse = await authApi.login({
            userId,
            pinCode: Number(inputPin),
          });
          console.log(
            '[LOG][authStore] loginWithPinViaApi: 로그인 API 응답:',
            loginResponse.data,
          );

          if (loginResponse.data.isSuccess && loginResponse.data.result) {
            const {
              accessToken,
              refreshToken,
              username: apiUsername,
              phoneNumber: apiPhoneNumber,
              birthDate: apiBirthDate,
            } = loginResponse.data.result as {
              accessToken: string;
              refreshToken: string;
              username?: string;
              phoneNumber?: string;
              birthDate?: string;
            };

            if (
              typeof accessToken === 'string' &&
              typeof refreshToken === 'string' &&
              accessToken.trim() !== '' &&
              refreshToken.trim() !== ''
            ) {
              const finalUser: User = {
                id: userId,
                username: apiUsername || storedUser?.username || '',
                phoneNumber: apiPhoneNumber || storedUser?.phoneNumber || '',
                birthDate: apiBirthDate || storedUser?.birthDate || '',
              };

              await get().login(finalUser, accessToken, refreshToken);
              console.log('[LOG][authStore] loginWithPinViaApi: 로그인 성공');
              return { success: true };
            } else {
              const msg = '로그인 API 응답에서 유효한 토큰을 받지 못했습니다.';
              Toast.show({
                type: 'error',
                text1: '로그인 토큰 오류',
                text2: '유효한 인증 토큰을 받지 못했습니다.',
                position: 'bottom',
              });
              set({ error: msg, isLoading: false });
              return { success: false, message: msg };
            }
          } else {
            const msg =
              loginResponse.data.message || '로그인 API 호출에 실패했습니다.';
            Toast.show({
              type: 'error',
              text1: '로그인 실패',
              text2: msg,
              position: 'bottom',
            });
            set({ error: msg, isLoading: false });
            return { success: false, message: msg };
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'PIN 로그인 처리 중 예외 발생';
          Toast.show({
            type: 'error',
            text1: 'PIN 로그인 오류',
            text2: errorMessage,
            position: 'bottom',
          });
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
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
            pin: get().pin,
          });
          console.log(
            '[LOG][authStore] 로그인 완료, isAuthenticated:',
            get().isAuthenticated,
          );
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
        }
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
          console.log('[LOG][authStore] navigate: (auth)/pin-confirm으로 이동');
          router.replace('/(auth)/pin-confirm');
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
