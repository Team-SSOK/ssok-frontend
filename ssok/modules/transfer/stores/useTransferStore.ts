import { create } from 'zustand';
import {
  TransferRequest,
  TransferResponse,
  transferApi,
  BluetoothTransferRequest,
  RecentTransferHistory,
} from '../api/transferApi';
import { Transaction } from '@/utils/types';

interface TransferState {
  isLoading: boolean;
  error: string | null;
  lastTransfer: TransferResponse | null;
  transactions: Transaction[];
  sendMoney: (data: TransferRequest) => Promise<TransferResponse | null>;
  sendMoneyBluetooth: (
    data: BluetoothTransferRequest,
  ) => Promise<TransferResponse | null>;
  fetchRecentTransactions: (limit?: number) => Promise<void>;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  isLoading: false,
  error: null,
  lastTransfer: null,
  transactions: [],

  sendMoney: async (data: TransferRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transferApi.sendMoney(data);
      if (response.data.isSuccess && response.data.result) {
        set({
          lastTransfer: response.data.result,
          isLoading: false,
        });
        return response.data.result;
      } else {
        throw new Error(response.data.message || '송금에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '송금 처리 중 오류가 발생했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  sendMoneyBluetooth: async (data: BluetoothTransferRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transferApi.sendMoneyBluetooth(data);

      if (response.data.isSuccess && response.data.result) {
        set({
          lastTransfer: response.data.result,
          isLoading: false,
        });
        return response.data.result;
      } else {
        throw new Error(
          response.data.message || '블루투스 송금에 실패했습니다.',
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '블루투스 송금 처리 중 오류가 발생했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  fetchRecentTransactions: async (limit?: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transferApi.getRecentTransferHistory();
      if (response.data.isSuccess && response.data.result) {
        const historyData: Transaction[] = response.data.result.map(
          (item: RecentTransferHistory) => ({
            transferID: item.transferId,
            accountId: 0,
            counterpartAccount: '',
            counterpartName: item.counterpartName,
            transferType:
              item.transferType === 'WITHDRAWAL' ? 'WITHDRAW' : 'DEPOSIT',
            transferMoney: item.transferMoney,
            currencyCode: item.currencyCode === 'KRW' ? 1 : 2,
            transferMethod: item.transferMethod === 'GENERAL' ? 0 : 1,
            createdAt: item.createdAt,
            balanceAfterTransaction: 0,
          }),
        );
        set({ transactions: historyData, isLoading: false });
      } else {
        throw new Error(
          response.data.message || '최근 거래내역 조회에 실패했습니다.',
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '최근 거래내역 조회 중 오류가 발생했습니다.';
      set({
        transactions: [],
        error: errorMessage,
        isLoading: false,
      });
    }
  },
}));
