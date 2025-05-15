import { create } from 'zustand';
import {
  AccountRequest,
  RegisteredAccount,
  accountApi,
} from '../api/accountApi';

interface AccountState {
  accounts: RegisteredAccount[];
  currentAccount: RegisteredAccount | null;
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  registerAccount: (account: AccountRequest) => Promise<void>;
  getAccountDetail: (accountId: number) => Promise<RegisteredAccount | null>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  currentAccount: null,
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.getAccountsWithBalance();
      if (response.data.isSuccess && response.data.result) {
        set({ accounts: response.data.result, isLoading: false });
      } else {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      set({ error: '계좌 정보를 불러오는데 실패했습니다.', isLoading: false });
    }
  },

  registerAccount: async (account: AccountRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.registerAccount(account);
      if (response.data.isSuccess && response.data.result) {
        set((state) => ({
          accounts: [...state.accounts, response.data.result!],
          isLoading: false,
        }));
      } else {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      set({ error: '계좌 등록에 실패했습니다.', isLoading: false });
    }
  },

  getAccountDetail: async (accountId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.getAccountDetail(accountId);
      if (response.data.isSuccess && response.data.result) {
        set({
          currentAccount: response.data.result,
          isLoading: false,
        });
        return response.data.result;
      } else {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      set({
        error: '계좌 상세 정보를 불러오는데 실패했습니다.',
        isLoading: false,
      });
      return null;
    }
  },
}));
