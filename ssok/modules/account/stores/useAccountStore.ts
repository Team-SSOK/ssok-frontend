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
 * 계좌 관련 상태 인터페이스
 */
interface AccountState {
  // 상태
  accounts: RegisteredAccount[];
  currentAccount: RegisteredAccount | null;
  verifiedName: NameVerificationResponse | null;
  isLoading: boolean;
  error: string | null;

  // API 액션
  fetchAccounts: () => Promise<RegisteredAccount[]>;
  registerAccount: (
    account: AccountRequest,
  ) => Promise<RegisteredAccount | null>;
  getAccountDetail: (accountId: number) => Promise<RegisteredAccount | null>;
  verifyAccountName: (
    data: NameVerificationRequest,
  ) => Promise<NameVerificationResponse | null>;
  setPrimaryAccount: (accountId: number) => Promise<RegisteredAccount | null>;
  updateAccountAlias: (
    accountId: number,
    alias: string,
  ) => Promise<RegisteredAccount | null>;

  // 유틸리티 액션
  setCurrentAccount: (account: RegisteredAccount | null) => void;
  clearError: () => void;
  getPrimaryAccount: () => RegisteredAccount | null;
}

/**
 * API 응답 처리 유틸리티
 */
const handleApiResponse = <T>(
  response: { data: ApiResponse<T> },
  errorMessage: string,
): T => {
  if (response.data.isSuccess && response.data.result) {
    return response.data.result;
  }
  throw new Error(response.data.message || errorMessage);
};

/**
 * 계좌 관련 전역 상태 관리 스토어
 */
export const useAccountStore = create<AccountState>((set, get) => ({
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
      const accounts = handleApiResponse<RegisteredAccount[]>(
        response,
        '계좌 정보를 불러오는데 실패했습니다.',
      );

      set({ accounts, isLoading: false });
      return accounts;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '계좌 정보를 불러오는데 실패했습니다.';

      set({ error: errorMessage, isLoading: false });
      return [];
    }
  },

  /**
   * 새 계좌 등록
   */
  registerAccount: async (account: AccountRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.registerAccount(account);
      const registeredAccount = handleApiResponse<RegisteredAccount>(
        response,
        '계좌 등록에 실패했습니다.',
      );

      // 불변성을 유지하며 새 계좌 추가
      set((state) => ({
        ...state,
        accounts: [...state.accounts, registeredAccount],
        isLoading: false,
      }));

      return registeredAccount;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '계좌 등록에 실패했습니다.';

      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  /**
   * 계좌 상세 정보 조회
   */
  getAccountDetail: async (accountId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.getAccountDetail(accountId);
      const account = handleApiResponse<RegisteredAccount>(
        response,
        '계좌 상세 정보를 불러오는데 실패했습니다.',
      );

      set({ currentAccount: account, isLoading: false });
      return account;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '계좌 상세 정보를 불러오는데 실패했습니다.';

      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  /**
   * 계좌 실명 조회
   */
  verifyAccountName: async (data: NameVerificationRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.verifyAccountName(data);
      const verifiedName = handleApiResponse<NameVerificationResponse>(
        response,
        '계좌 실명 조회에 실패했습니다.',
      );

      set({ verifiedName, isLoading: false });
      return verifiedName;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '계좌 실명 조회에 실패했습니다.';

      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  /**
   * 주 계좌 설정
   */
  setPrimaryAccount: async (accountId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.setPrimaryAccount(accountId);
      const updatedAccount = handleApiResponse<RegisteredAccount>(
        response,
        '주 연동 계좌 변경에 실패했습니다.',
      );

      // 불변성을 유지하며 주 계좌 상태 업데이트
      set((state) => ({
        ...state,
        accounts: state.accounts.map((account) => ({
          ...account,
          isPrimaryAccount: account.accountId === accountId,
        })),
        currentAccount: updatedAccount,
        isLoading: false,
      }));

      return updatedAccount;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '주 연동 계좌 변경에 실패했습니다.';

      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  /**
   * 계좌 별칭 변경
   */
  updateAccountAlias: async (accountId: number, alias: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.updateAccountAlias(accountId, alias);
      const updatedAccount = handleApiResponse<RegisteredAccount>(
        response,
        '계좌 별칭 변경에 실패했습니다.',
      );

      // 불변성을 유지하며 해당 계좌 정보 업데이트
      set((state) => {
        const updatedAccounts = state.accounts.map((account) =>
          account.accountId === accountId ? updatedAccount : account,
        );

        // 현재 계좌가 변경된 계좌인 경우 함께 업데이트
        const newCurrentAccount =
          state.currentAccount?.accountId === accountId
            ? updatedAccount
            : state.currentAccount;

        return {
          ...state,
          accounts: updatedAccounts,
          currentAccount: newCurrentAccount,
          isLoading: false,
        };
      });

      return updatedAccount;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '계좌 별칭 변경에 실패했습니다.';

      set({ error: errorMessage, isLoading: false });
      return null;
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
