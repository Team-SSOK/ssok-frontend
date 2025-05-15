import api from '@/api/ApiInstance';

// 인터페이스 정의
interface UserInfoResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result?: {
    username: string;
    phoneNumber: string;
    profileImage: string | null;
  };
}

// API 함수
export const profileApi = {
  /**
   * 사용자 기본 정보 조회
   */
  getUserInfo: (userId: number) => {
    return api.get<UserInfoResponse>('/api/users/info', {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
  },
};
