import { create } from 'zustand';
import {
  AccountRequest,
  RegisteredAccount,
  accountApi,
  NameVerificationRequest,
  NameVerificationResponse,
  ApiResponse,
} from '../api/accountApi';

/**
 * API 응답 표준 타입
 */
type StoreResponse<T = any> =
  | { success: true; data: T; message?: string }
  | { success: false; data?: never; message: string };

/**
 * 계좌 관련 상태 인터페이스
 */
interface AccountState {
  // 상태
  accounts: RegisteredAccount[];
  currentAccount: RegisteredAccount | null;
  verifiedName: NameVerificationResponse | null;
  isLoading: boolean;
  error: string | null;

  // API 액션 - 모두 통일된 반환 타입 사용
  fetchAccounts: () => Promise<StoreResponse<RegisteredAccount[]>>;
  registerAccount: (
    account: AccountRequest,
  ) => Promise<StoreResponse<RegisteredAccount>>;
  getAccountDetail: (
    accountId: number,
  ) => Promise<StoreResponse<RegisteredAccount>>;
  verifyAccountName: (
    data: NameVerificationRequest,
  ) => Promise<StoreResponse<NameVerificationResponse>>;
  setPrimaryAccount: (
    accountId: number,
  ) => Promise<StoreResponse<RegisteredAccount>>;
  updateAccountAlias: (
    accountId: number,
    alias: string,
  ) => Promise<StoreResponse<RegisteredAccount>>;

  // 유틸리티 액션
  setCurrentAccount: (account: RegisteredAccount | null) => void;
  clearError: () => void;
  getPrimaryAccount: () => RegisteredAccount | null;
}

/**
 * API 응답 처리 헬퍼
 */
const createSuccessResponse = <T>(
  data: T,
  message?: string,
): StoreResponse<T> => ({
  success: true,
  data,
  message,
});

const createErrorResponse = <T>(message: string): StoreResponse<T> => ({
  success: false,
  message,
});

/**
 * 계좌 관련 전역 상태 관리 스토어
 */
export const useAccountStore = create<AccountState>((set, get) => ({
  // 초기 상태
  accounts: [],
  currentAccount: null,
  verifiedName: null,
  isLoading: false,
  error: null,

  /**
   * 모든 등록된 계좌 조회
   */
  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.getAccountsWithBalance();

      if (response.data.isSuccess && response.data.result) {
        const accounts = response.data.result;
        set({ accounts, isLoading: false });
        return createSuccessResponse(accounts);
      } else {
        const message =
          response.data.message || '계좌 정보를 불러오는데 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '계좌 정보를 불러오는데 실패했습니다.';
      set({ error: message, isLoading: false });
      return createErrorResponse(message);
    }
  },

  /**
   * 새 계좌 등록
   */
  registerAccount: async (account: AccountRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.registerAccount(account);

      if (response.data.isSuccess && response.data.result) {
        const registeredAccount = response.data.result;
        set((state) => ({
          accounts: [...state.accounts, registeredAccount],
          isLoading: false,
        }));
        return createSuccessResponse(registeredAccount);
      } else {
        const message = response.data.message || '계좌 등록에 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '계좌 등록에 실패했습니다.';
      set({ error: message, isLoading: false });
      return createErrorResponse(message);
    }
  },

  /**
   * 계좌 상세 정보 조회
   */
  getAccountDetail: async (accountId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.getAccountDetail(accountId);

      if (response.data.isSuccess && response.data.result) {
        const account = response.data.result;
        set({ currentAccount: account, isLoading: false });
        return createSuccessResponse(account);
      } else {
        const message =
          response.data.message || '계좌 상세 정보를 불러오는데 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '계좌 상세 정보를 불러오는데 실패했습니다.';
      set({ error: message, isLoading: false });
      return createErrorResponse(message);
    }
  },

  /**
   * 계좌 실명 조회
   */
  verifyAccountName: async (data: NameVerificationRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.verifyAccountName(data);

      if (response.data.isSuccess && response.data.result) {
        const verifiedName = response.data.result;
        set({ verifiedName, isLoading: false });
        return createSuccessResponse(verifiedName);
      } else {
        const message =
          response.data.message || '계좌 실명 조회에 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '계좌 실명 조회에 실패했습니다.';
      set({ error: message, isLoading: false });
      return createErrorResponse(message);
    }
  },

  /**
   * 주 계좌 설정
   */
  setPrimaryAccount: async (accountId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.setPrimaryAccount(accountId);

      if (response.data.isSuccess && response.data.result) {
        const updatedAccount = response.data.result;
        set((state) => ({
          accounts: state.accounts.map((account) => ({
            ...account,
            isPrimaryAccount: account.accountId === accountId,
          })),
          currentAccount: updatedAccount,
          isLoading: false,
        }));
        return createSuccessResponse(updatedAccount);
      } else {
        const message =
          response.data.message || '주 연동 계좌 변경에 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '주 연동 계좌 변경에 실패했습니다.';
      set({ error: message, isLoading: false });
      return createErrorResponse(message);
    }
  },

  /**
   * 계좌 별칭 변경
   */
  updateAccountAlias: async (accountId: number, alias: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.updateAccountAlias(accountId, alias);

      if (response.data.isSuccess && response.data.result) {
        const updatedAccount = response.data.result;
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.accountId === accountId ? updatedAccount : account,
          ),
          currentAccount:
            state.currentAccount?.accountId === accountId
              ? updatedAccount
              : state.currentAccount,
          isLoading: false,
        }));
        return createSuccessResponse(updatedAccount);
      } else {
        const message =
          response.data.message || '계좌 별칭 변경에 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '계좌 별칭 변경에 실패했습니다.';
      set({ error: message, isLoading: false });
      return createErrorResponse(message);
    }
  },

  /**
   * 현재 계좌 설정
   */
  setCurrentAccount: (account: RegisteredAccount | null) => {
    set({ currentAccount: account });
  },

  /**
   * 에러 초기화
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * 주 계좌 조회
   */
  getPrimaryAccount: () => {
    const { accounts } = get();
    return accounts.find((account) => account.isPrimaryAccount) || null;
  },
}));
