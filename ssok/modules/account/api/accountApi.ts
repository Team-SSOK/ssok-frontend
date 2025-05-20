import api from '@/api/ApiInstance';

/**
 * API 응답 기본 인터페이스
 */
export interface ApiResponse<T = any> {
  isSuccess: boolean;
  code: number;
  message: string;
  result?: T;
}

/**
 * 계좌 등록 요청 인터페이스
 */
export interface AccountRequest {
  accountNumber: string;
  bankCode: number;
  accountTypeCode: number;
}

/**
 * 연동 가능한 계좌 정보 인터페이스
 */
export interface Account {
  bankCode: number;
  bankName: string;
  accountNumber: string;
  accountTypeCode: string | number;
}

/**
 * 등록된 계좌 정보 인터페이스
 */
export interface RegisteredAccount {
  accountId: number;
  accountNumber: string;
  bankCode: number;
  bankName: string;
  accountAlias: string | null;
  isPrimaryAccount: boolean;
  accountTypeCode: string;
  balance?: number;
}

/**
 * 계좌 실명 조회 요청 인터페이스
 */
export interface NameVerificationRequest {
  accountNumber: string;
  bankCode: number;
}

/**
 * 계좌 실명 조회 응답 인터페이스
 */
export interface NameVerificationResponse {
  username: string;
  accountNumber: string;
}

/**
 * 계좌 관련 API 서비스
 *
 * 계좌 연동, 조회, 등록 등의 기능을 제공합니다.
 */
export const accountApi = {
  /**
   * 연동 계좌 조회
   *
   * 연동 가능한 계좌 목록을 조회합니다.
   * @returns 연동 가능한 계좌 목록
   */
  getLinkedAccounts: async () => {
    return api.post<ApiResponse<Account[]>>('/api/accounts/openbank');
  },

  /**
   * 연동 계좌 등록
   *
   * 선택한 계좌를 사용자 계정에 등록합니다.
   * @param data 등록할 계좌 정보
   * @returns 등록된 계좌 정보
   */
  registerAccount: async (data: AccountRequest) => {
    return api.post<ApiResponse<RegisteredAccount>>('/api/accounts', data);
  },

  /**
   * 연동 계좌 및 잔액 조회
   *
   * 사용자가 등록한 모든 계좌와 잔액을 조회합니다.
   * @returns 등록된 계좌 목록
   */
  getAccountsWithBalance: async () => {
    return api.get<ApiResponse<RegisteredAccount[]>>('/api/accounts');
  },

  /**
   * 연동 계좌 상세 조회
   *
   * 특정 계좌의 상세 정보를 조회합니다.
   * @param accountId 조회할 계좌 ID
   * @returns 계좌 상세 정보
   */
  getAccountDetail: async (accountId: number) => {
    return api.get<ApiResponse<RegisteredAccount>>(
      `/api/accounts/${accountId}`,
    );
  },

  /**
   * 계좌 실명 조회
   *
   * 계좌번호와 은행코드로 실명을 조회합니다.
   * @param data 실명 조회 요청 정보
   * @returns 실명 조회 결과
   */
  verifyAccountName: async (data: NameVerificationRequest) => {
    return api.post<ApiResponse<NameVerificationResponse>>(
      '/api/accounts/openbank/verify-name',
      data,
    );
  },

  /**
   * 주 연동 계좌 변경
   *
   * 특정 계좌를 주 계좌로 설정합니다.
   * @param accountId 주 계좌로 설정할 계좌 ID
   * @returns 업데이트된 계좌 정보
   */
  setPrimaryAccount: async (accountId: number) => {
    return api.patch<ApiResponse<RegisteredAccount>>(
      `/api/accounts/${accountId}/primary`,
    );
  },

  /**
   * 계좌 별칭 변경
   *
   * 계좌의 별칭을 변경합니다.
   * @param accountId 별칭을 변경할 계좌 ID
   * @param alias 새 별칭
   * @returns 업데이트된 계좌 정보
   */
  updateAccountAlias: async (accountId: number, alias: string) => {
    return api.patch<ApiResponse<RegisteredAccount>>(
      `/api/accounts/${accountId}/alias`,
      { alias },
    );
  },
};
