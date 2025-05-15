import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/modules/auth/store/authStore';

// 토큰 키 상수
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * 토큰 진단 도구 - 토큰 관련 문제를 진단하고 로그를 남깁니다.
 */
class TokenDiagnostics {
  /**
   * 토큰 상태를 진단하고 결과를 콘솔에 출력합니다.
   */
  static async diagnoseTokens(): Promise<void> {
    console.log('=============== 토큰 진단 시작 ===============');

    try {
      // 1. SecureStore에서 토큰 확인
      console.log('[진단] SecureStore 토큰 확인:');
      const secureAccessToken =
        await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const secureRefreshToken =
        await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      console.log(
        `[진단] SecureStore accessToken: ${secureAccessToken ? '존재함' : '없음'}`,
      );
      if (secureAccessToken) {
        console.log(
          `[진단] SecureStore accessToken 일부: ${secureAccessToken.substring(0, 10)}...`,
        );
      }

      console.log(
        `[진단] SecureStore refreshToken: ${secureRefreshToken ? '존재함' : '없음'}`,
      );
      if (secureRefreshToken) {
        console.log(
          `[진단] SecureStore refreshToken 일부: ${secureRefreshToken.substring(0, 10)}...`,
        );
      }

      // 2. Zustand 스토어 상태 확인
      console.log('\n[진단] Zustand 스토어 상태 확인:');
      const { accessToken, refreshToken, isLoggedIn, userId } =
        useAuthStore.getState();

      console.log(
        `[진단] Zustand accessToken: ${accessToken ? '존재함' : '없음'}`,
      );
      if (accessToken) {
        console.log(
          `[진단] Zustand accessToken 일부: ${accessToken.substring(0, 10)}...`,
        );
      }

      console.log(
        `[진단] Zustand refreshToken: ${refreshToken ? '존재함' : '없음'}`,
      );
      if (refreshToken) {
        console.log(
          `[진단] Zustand refreshToken 일부: ${refreshToken.substring(0, 10)}...`,
        );
      }

      console.log(`[진단] Zustand isLoggedIn: ${isLoggedIn}`);
      console.log(`[진단] Zustand userId: ${userId}`);

      // 3. AsyncStorage에 저장된 Zustand 상태 확인
      console.log('\n[진단] AsyncStorage에 저장된 Zustand 상태 확인:');
      const zustandState = await AsyncStorage.getItem('auth-storage');

      if (zustandState) {
        const parsedState = JSON.parse(zustandState);
        console.log(
          `[진단] AsyncStorage에 저장된 상태: ${parsedState ? '존재함' : '없음'}`,
        );

        if (parsedState.state) {
          console.log(
            `[진단] AsyncStorage accessToken: ${parsedState.state.accessToken ? '존재함' : '없음'}`,
          );
          if (parsedState.state.accessToken) {
            console.log(
              `[진단] AsyncStorage accessToken 일부: ${parsedState.state.accessToken.substring(0, 10)}...`,
            );
          }

          console.log(
            `[진단] AsyncStorage refreshToken: ${parsedState.state.refreshToken ? '존재함' : '없음'}`,
          );
          if (parsedState.state.refreshToken) {
            console.log(
              `[진단] AsyncStorage refreshToken 일부: ${parsedState.state.refreshToken.substring(0, 10)}...`,
            );
          }

          console.log(
            `[진단] AsyncStorage isLoggedIn: ${parsedState.state.isLoggedIn}`,
          );
          console.log(
            `[진단] AsyncStorage userId: ${parsedState.state.userId}`,
          );
        }
      } else {
        console.log('[진단] AsyncStorage에 저장된 Zustand 상태가 없습니다.');
      }

      // 4. 일관성 확인
      console.log('\n[진단] 토큰 저장소 간 일관성 확인:');

      // SecureStore와 Zustand 비교
      const secureZustandAccessMatch = secureAccessToken === accessToken;
      const secureZustandRefreshMatch = secureRefreshToken === refreshToken;

      console.log(
        `[진단] SecureStore와 Zustand accessToken 일치: ${secureZustandAccessMatch}`,
      );
      console.log(
        `[진단] SecureStore와 Zustand refreshToken 일치: ${secureZustandRefreshMatch}`,
      );

      // 일관성이 없는 경우 문제 해결 방법 제안
      if (!secureZustandAccessMatch || !secureZustandRefreshMatch) {
        console.log('\n[진단] 문제 발견: 토큰 저장소 간 불일치가 있습니다.');
        console.log('[진단] 해결 방법: 로그아웃 후 다시 로그인하세요.');
      }
    } catch (error) {
      console.error('[진단 오류]:', error);
    }

    console.log('=============== 토큰 진단 완료 ===============');
  }

  /**
   * 문제가 발생한 경우 토큰을 동기화합니다.
   * (SecureStore에 Zustand 토큰을 저장)
   */
  static async syncTokens(): Promise<void> {
    try {
      console.log('[토큰 동기화] 시작');

      // Zustand 상태에서 토큰 가져오기
      const { accessToken, refreshToken } = useAuthStore.getState();

      if (accessToken && refreshToken) {
        // SecureStore에 토큰 저장
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        console.log(
          '[토큰 동기화] 성공: Zustand에서 SecureStore로 토큰 동기화 완료',
        );
      } else {
        console.log('[토큰 동기화] 실패: Zustand에 토큰이 없습니다.');
      }
    } catch (error) {
      console.error('[토큰 동기화 오류]:', error);
    }
  }

  /**
   * 모든 토큰 저장소를 초기화합니다.
   * (문제 해결을 위한 마지막 수단)
   */
  static async resetAllTokenStorage(): Promise<void> {
    try {
      console.log('[토큰 초기화] 시작');

      // SecureStore 토큰 삭제
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

      // Zustand 상태 초기화
      useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        isLoggedIn: false,
      });

      console.log('[토큰 초기화] 완료: 모든 토큰 저장소가 초기화되었습니다.');
    } catch (error) {
      console.error('[토큰 초기화 오류]:', error);
    }
  }
}

export default TokenDiagnostics;
