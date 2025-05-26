import axios from 'axios';
// import * as SecureStore from 'expo-secure-store'; // tokenService를 사용하므로 직접 호출 제거
import { useAuthStore } from '@/modules/auth/store/authStore'; // authStoreActions import 제거
import {
  getTokens as getTokensFromSecureStore,
  saveTokens as saveTokensToSecureStore,
} from '@/services/tokenService'; // tokenService import

const BASE_URL = 'http://api.ssok.kr/';
// ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY 상수 제거 - tokenService에서 관리
// const ACCESS_TOKEN_KEY = 'accessToken';
// const REFRESH_TOKEN_KEY = 'refreshToken';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// getTokens 함수 제거 - tokenService로 대체
// async function getTokens() {
//   const [accessToken, refreshToken] = await Promise.all([
//     SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
//     SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
//   ]);
//   return { accessToken, refreshToken };
// }

// saveTokens 함수 제거 - tokenService로 대체
// async function saveTokens(accessToken: string, refreshToken: string) {
//   await Promise.all([
//     SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
//     SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
//   ]);
// }

// 요청 인터셉터: accessToken이 있으면 헤더에 붙임
api.interceptors.request.use(async (config) => {
  const { accessToken } = await getTokensFromSecureStore(); // tokenService 사용
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 응답 인터셉터: 401 → 토큰 갱신 → 원래 요청 재시도
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err;
    if (response?.status !== 401 || (config as any)._retry) {
      return Promise.reject(err);
    }

    (config as any)._retry = true;

    try {
      const { refreshToken } = await getTokensFromSecureStore(); // tokenService 사용
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${BASE_URL}api/auth/refresh`, {
        refreshToken,
      });

      const { accessToken: newAccess, refreshToken: newRefresh } = data.result;
      await saveTokensToSecureStore(newAccess, newRefresh); // tokenService 사용

      config.headers.Authorization = `Bearer ${newAccess}`;
      return api(config);
    } catch (refreshError) {
      // 특정 API 경로에 대해서는 로그아웃 처리를 하지 않음
      // 푸시 알림 등록 API는 로그인 과정 중에 호출될 수 있으므로 예외 처리
      if (config.url?.includes('/api/notification/fcm/register')) {
        console.log('푸시 알림 등록 중 토큰 오류, 로그인 프로세스 유지');
        return Promise.reject(new Error('No refresh token'));
      }

      // 갱신 실패 시 상태 초기화
      console.error('토큰 갱신 실패, 로그아웃 처리:', refreshError);
      useAuthStore.getState().resetAuth(); // 스토어의 resetAuth 직접 호출
      return Promise.reject(refreshError);
    }
  },
);

export default api;
