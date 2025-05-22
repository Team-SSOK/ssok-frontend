import api from '@/api/ApiInstance';

/**
 * FCM 토큰 등록 요청 타입
 */
export interface RegisterFcmTokenRequest {
  token: string;
}

/**
 * FCM 토큰 등록 응답 타입
 */
export interface RegisterFcmTokenResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: Record<string, never>;
}

/**
 * 알림 API 클라이언트
 */
export const notificationApi = {
  /**
   * FCM 토큰 등록 API
   *
   * @param token FCM 토큰
   * @returns API 응답
   */
  registerFcmToken: async (token: string) => {
    return api.post<RegisterFcmTokenResponse>(
      '/api/notification/fcm/register',
      { token },
    );
  },
};
