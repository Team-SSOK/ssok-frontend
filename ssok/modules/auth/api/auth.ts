import api from '@/api/ApiInstance';

// 인터페이스 정의
interface PhoneVerificationRequest {
  phoneNumber: string;
}

interface PhoneVerificationCodeRequest {
  phoneNumber: string;
  verificationCode: string;
}

interface SignupRequest {
  username: string;
  phoneNumber: string;
  birthDate: string;
  pinCode: number;
}

interface LoginRequest {
  userId: number;
  pinCode: number;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface ApiResponse<T = any> {
  isSuccess: boolean;
  code: string | number;
  message: string;
  result?: T;
}

// API 함수
export const authApi = {
  /**
   * 휴대폰 인증 코드 발송
   */
  sendVerificationCode: (data: PhoneVerificationRequest) => {
    console.log('sendVerificationCode', data);
    return api.post<ApiResponse>('/api/users/phone', data);
  },

  /**
   * 휴대폰 인증 코드 확인
   */
  verifyCode: (data: PhoneVerificationCodeRequest) => {
    console.log('verifyCode', data);
    return api.post<ApiResponse>('/api/users/phone/verify', data);
  },

  /**
   * 회원가입
   */
  signup: (data: SignupRequest) => {
    console.log('signup', data);
    return api.post<ApiResponse<{ userId: number }>>('/api/users/signup', data);
  },

  /**
   * 로그인
   */
  login: (data: LoginRequest) => {
    console.log('login', data);
    return api.post<
      ApiResponse<{
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresIn: number;
      }>
    >('/api/auth/login', data);
  },

  /**
   * 토큰 갱신
   */
  refreshToken: (data: RefreshTokenRequest) => {
    return api.post<
      ApiResponse<{
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresIn: number;
      }>
    >('/api/auth/refresh', data);
  },

  /**
   * 로그아웃
   */
  logout: () => {
    return api.post<ApiResponse>('/api/auth/logout');
  },
};
