import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { authStoreActions } from '@/modules/auth/store/authStore';

const BASE_URL = 'http://kudong.kr:55030/';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

async function getTokens() {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);
  return { accessToken, refreshToken };
}

async function saveTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

// 요청 인터셉터: accessToken이 있으면 헤더에 붙임
api.interceptors.request.use(async (config) => {
  const { accessToken } = await getTokens();
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
      const { refreshToken } = await getTokens();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${BASE_URL}api/auth/refresh`, {
        refreshToken,
      });

      const { accessToken: newAccess, refreshToken: newRefresh } = data.result;
      await saveTokens(newAccess, newRefresh);

      config.headers.Authorization = `Bearer ${newAccess}`;
      return api(config);
    } catch (refreshError) {
      // 갱신 실패 시 상태 초기화
      authStoreActions.resetAuth();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
