import api from '@/api/ApiInstance';

const LOG_TAG = '[LOG][authApi]';

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

  // 인증코드 확인 및 사용자 존재 여부 확인 요청
  CodeVerificationWithUserCheck: {
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

  // 포그라운드 복귀 요청 (PIN 재인증)
  Foreground: {
    userId: number;
    pinCode: number;
  };

  // PIN 재등록 요청 (기존 사용자)
  PinReset: {
    userId: number;
    pinCode: string;
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

  // 토큰 관련 응답 (로그인, 토큰 갱신, 포그라운드 복귀)
  TokenResponse: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    username?: string;
    phoneNumber?: string;
    birthDate?: string;
  };

  // 사용자 존재 여부 확인 응답
  UserExistenceCheck: {
    existingUser: boolean;
    userId: number | null;
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
    console.log(`${LOG_TAG} sendVerificationCode: `, data);
    return api.post<ApiResponse>('/api/users/phone', data);
  },

  /**
   * 휴대폰 인증 코드 확인
   * @param data 요청 데이터 (휴대폰 번호, 인증코드)
   * @returns API 응답
   */
  verifyCode: (data: AuthRequestTypes['CodeVerification']) => {
    console.log(`${LOG_TAG} verifyCode: `, data);
    return api.post<ApiResponse>('/api/users/phone/verify', data);
  },

  /**
   * 휴대폰 인증 코드 확인 및 사용자 존재 여부 확인
   * @param data 요청 데이터 (휴대폰 번호, 인증코드)
   * @returns API 응답 (사용자 존재 여부 및 userId 포함)
   */
  verifyCodeWithUserCheck: (data: AuthRequestTypes['CodeVerificationWithUserCheck']) => {
    console.log(`${LOG_TAG} verifyCodeWithUserCheck: `, data);
    return api.post<ApiResponse<AuthResponseTypes['UserExistenceCheck']>>(
      '/api/users/phone/verify-with-user-check',
      data,
    );
  },

  /**
   * 회원가입
   * @param data 요청 데이터 (사용자명, 휴대폰 번호, 생년월일, PIN 코드)
   * @returns API 응답 (사용자 ID 포함)
   */
  signup: (data: AuthRequestTypes['Signup']) => {
    console.log(`${LOG_TAG} signup: `, data);
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
    console.log(`${LOG_TAG} login: `, data);
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
    console.log(`${LOG_TAG} refreshToken: `, data);
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
    console.log(`${LOG_TAG} logout: `);
    return api.post<ApiResponse>('/api/auth/logout');
  },

  /**
   * 앱 백그라운드 전환
   * 현재 Access Token을 블랙리스트에 추가
   * @returns API 응답
   */
  background: () => {
    console.log(`${LOG_TAG} background: `);
    return api.post<ApiResponse>('/api/auth/background');
  },

  /**
   * 앱 포그라운드 복귀
   * PIN 코드 재인증 후 새로운 토큰 발급
   * @param data 요청 데이터 (사용자 ID, PIN 코드)
   * @returns API 응답 (새 액세스 토큰, 리프레시 토큰 포함)
   */
  foreground: (data: AuthRequestTypes['Foreground']) => {
    console.log(`${LOG_TAG} foreground: `, data);
    return api.post<ApiResponse<AuthResponseTypes['TokenResponse']>>(
      '/api/auth/foreground',
      data,
    );
  },

  /**
   * PIN 재등록 (기존 사용자)
   * @param data 요청 데이터 (사용자 ID, PIN 코드)
   * @returns API 응답
   */
  resetPin: (data: AuthRequestTypes['PinReset']) => {
    console.log(`${LOG_TAG} resetPin: `, data);
    return api.patch<ApiResponse>('/api/users/pin/existing-user', data);
  }
};

export default authApi;
