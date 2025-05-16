import api from '@/api/ApiInstance';

// 인터페이스 정의
export interface AccountRequest {
  accountNumber: string;
  bankCode: number;
  accountTypeCode: number;
}

export interface Account {
  bankCode: number;
  bankName: string;
  accountNumber: string;
  accountTypeCode: string;
}

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

export interface NameVerificationRequest {
  accountNumber: string;
  bankCode: number;
}

export interface NameVerificationResponse {
  username: string;
  accountNumber: string;
}

interface ApiResponse<T = any> {
  isSuccess: boolean;
  code: number;
  message: string;
  result?: T;
}

// API 함수
export const accountApi = {
  /**
   * 연동 계좌 조회
   */
  getLinkedAccounts: async () => {
    return api.post<ApiResponse<Account[]>>('/api/accounts/openbank');
  },

  /**
   * 연동 계좌 등록
   */
  registerAccount: async (data: AccountRequest) => {
    return api.post<ApiResponse<RegisteredAccount>>('/api/accounts', data);
  },

  /**
   * 연동 계좌 및 잔액 조회
   */
  getAccountsWithBalance: async () => {
    return api.get<ApiResponse<RegisteredAccount[]>>('/api/accounts');
  },

  /**
   * 연동 계좌 상세 조회
   */
  getAccountDetail: async (accountId: number) => {
    return api.get<ApiResponse<RegisteredAccount>>(
      `/api/accounts/${accountId}`,
    );
  },

  /**
   * 계좌 실명 조회
   */
  verifyAccountName: async (data: NameVerificationRequest) => {
    return api.post<ApiResponse<NameVerificationResponse>>(
      '/api/accounts/openbank/verify-name',
      data,
    );
  },

  /**
   * 주 연동 계좌 변경
   */
  setPrimaryAccount: async (accountId: number) => {
    console.log('setPrimaryAccount', accountId);
    return api.patch<ApiResponse<RegisteredAccount>>(
      `/api/accounts/${accountId}/primary`,
    );
  },
};
