import axios from 'axios';
import {
  getTokens as getTokensFromSecureStore,
  saveTokens as saveTokensToSecureStore,
} from '@/services/tokenService';

// const BASE_URL = 'https://api.ssok.kr/';
const BASE_URL = 'http://kudong.kr:55030/';
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processFailedQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

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
    const { response, config: originalRequest } = err; // config를 originalRequest로 명명

    if (response?.status !== 401 || (originalRequest as any)._retry) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      // 현재 토큰 갱신 중이라면, 요청을 큐에 추가
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          (originalRequest as any).headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest); // 원래 요청 재시도
        })
        .catch((err) => {
          return Promise.reject(err); // 큐에서 에러가 발생하면 전파
        });
    }

    (originalRequest as any)._retry = true;
    isRefreshing = true;

    try {
      console.log('토큰 갱신 시도 (단일 인스턴스)');
      const { refreshToken } = await getTokensFromSecureStore();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${BASE_URL}api/auth/refresh`, {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        data.result;
      console.log('토큰 갱신 성공 (단일 인스턴스)');
      await saveTokensToSecureStore(newAccessToken, newRefreshToken);

      (originalRequest as any).headers['Authorization'] =
        `Bearer ${newAccessToken}`;
      processFailedQueue(null, newAccessToken); // 대기 중인 요청들 성공 처리
      return api(originalRequest); // 현재 실패한 요청 재시도
    } catch (refreshError: any) {
      processFailedQueue(refreshError, null); // 대기 중인 요청들 실패 처리

      // FCM 등록 중 발생한 특정 에러는 로그인 프로세스 유지 (기존 로직)
      if (
        originalRequest.url?.includes('/api/notification/fcm/register') &&
        refreshError.message === 'No refresh token'
      ) {
        console.log('푸시 알림 등록 중 토큰 오류, 로그인 프로세스 유지');
        isRefreshing = false; // 플래그 리셋
        return Promise.reject(refreshError); // No refresh token 에러는 그대로 reject
      }

      console.error('토큰 갱신 실패, 로그아웃 처리:', refreshError);
      // useAuthStore.getState().resetAuth(); // 스토어의 resetAuth 직접 호출 (주석 처리 유지 또는 활성화 결정)

      isRefreshing = false; // 플래그 리셋
      return Promise.reject(refreshError);
    } finally {
      // try-catch 후에는 isRefreshing = false;를 여기로 옮기는 것이 더 안전할 수 있으나,
      // 현재 로직에서는 refreshError 발생 시 reject 후 finally가 실행되므로,
      // 각 에러 처리 경로에서 isRefreshing을 false로 설정하는 것이 명확할 수 있습니다.
      // 단, 성공 경로에서도 isRefreshing = false;가 필요합니다. (아래 추가)
      if (isRefreshing) {
        // 성공적으로 try 블록을 마쳤다면
        isRefreshing = false;
      }
    }
  },
);

export default api;
