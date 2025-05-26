import axios from 'axios';
import { useAuthStore } from '@/modules/auth/store/authStore';
import {
  getTokens as getTokensFromSecureStore,
  saveTokens as saveTokensToSecureStore,
} from '@/services/tokenService';

const BASE_URL = 'http://api.ssok.kr/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// 요청 인터셉터: accessToken이 있으면 헤더에 붙임
api.interceptors.request.use(async (config) => {
  const { accessToken } = await getTokensFromSecureStore();
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
      console.log('토큰 갱신 시도');
      const { refreshToken } = await getTokensFromSecureStore();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${BASE_URL}api/auth/refresh`, {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        data.result;
      console.log('토큰 갱신 성공');
      await saveTokensToSecureStore(newAccessToken, newRefreshToken);

      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(config);
    } catch (refreshError) {
      if (config.url?.includes('/api/notification/fcm/register')) {
        console.log('푸시 알림 등록 중 토큰 오류, 로그인 프로세스 유지');
        return Promise.reject(new Error('No refresh token'));
      }

      // 갱신 실패 시 상태 초기화
      console.error('토큰 갱신 실패, 로그아웃 처리:', refreshError);
      // useAuthStore.getState().resetAuth(); // 스토어의 resetAuth 직접 호출
      return Promise.reject(refreshError);
    }
  },
);

export default api;
