import api from '@/api/ApiInstance';

/**
 * API 응답 기본 인터페이스
 */
export interface ApiResponse<T = any> {
  isSuccess: boolean;
  code: string | number;
  message: string;
  result?: T;
}

/**
 * 인증 관련 API 요청 인터페이스
 */
export interface AuthRequestTypes {
  // 휴대폰 인증 요청
  PhoneVerification: {
    phoneNumber: string;
  };

  // 인증코드 확인 요청
  CodeVerification: {
    phoneNumber: string;
    verificationCode: string;
  };

  // 회원가입 요청
  Signup: {
    username: string;
    phoneNumber: string;
    birthDate: string;
    pinCode: number;
  };

  // 로그인 요청
  Login: {
    userId: number;
    pinCode: number;
  };

  // 토큰 갱신 요청
  RefreshToken: {
    refreshToken: string;
  };
}

/**
 * 인증 관련 API 응답 인터페이스
 */
export interface AuthResponseTypes {
  // 회원가입 응답
  Signup: {
    userId: number;
  };

  // 로그인 및 토큰 갱신 응답
  TokenResponse: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
  };
}

/**
 * 인증 관련 API 서비스
 *
 * 회원가입, 로그인, 토큰 갱신 등의 인증 관련 API를 제공합니다.
 */
export const authApi = {
  /**
   * 휴대폰 인증 코드 발송
   * @param data 요청 데이터 (휴대폰 번호)
   * @returns API 응답
   */
  sendVerificationCode: (data: AuthRequestTypes['PhoneVerification']) => {
    console.log('sendVerificationCode', data);
    return api.post<ApiResponse>('/api/users/phone', data);
  },

  /**
   * 휴대폰 인증 코드 확인
   * @param data 요청 데이터 (휴대폰 번호, 인증코드)
   * @returns API 응답
   */
  verifyCode: (data: AuthRequestTypes['CodeVerification']) => {
    console.log('verifyCode', data);
    return api.post<ApiResponse>('/api/users/phone/verify', data);
  },

  /**
   * 회원가입
   * @param data 요청 데이터 (사용자명, 휴대폰 번호, 생년월일, PIN 코드)
   * @returns API 응답 (사용자 ID 포함)
   */
  signup: (data: AuthRequestTypes['Signup']) => {
    console.log('signup', data);
    return api.post<ApiResponse<AuthResponseTypes['Signup']>>(
      '/api/users/signup',
      data,
    );
  },

  /**
   * 로그인
   * @param data 요청 데이터 (사용자 ID, PIN 코드)
   * @returns API 응답 (액세스 토큰, 리프레시 토큰 포함)
   */
  login: (data: AuthRequestTypes['Login']) => {
    console.log('login', data);
    return api.post<ApiResponse<AuthResponseTypes['TokenResponse']>>(
      '/api/auth/login',
      data,
    );
  },

  /**
   * 토큰 갱신
   * @param data 요청 데이터 (리프레시 토큰)
   * @returns API 응답 (새 액세스 토큰, 리프레시 토큰 포함)
   */
  refreshToken: (data: AuthRequestTypes['RefreshToken']) => {
    return api.post<ApiResponse<AuthResponseTypes['TokenResponse']>>(
      '/api/auth/refresh',
      data,
    );
  },

  /**
   * 로그아웃
   * @returns API 응답
   */
  logout: () => {
    return api.post<ApiResponse>('/api/auth/logout');
  },
};

export default authApi;
