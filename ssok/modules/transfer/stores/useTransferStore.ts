import { create } from 'zustand';
import {
  TransferRequest,
  TransferResponse,
  transferApi,
  BluetoothTransferRequest,
  RecentTransferHistory,
} from '../api/transferApi';
import { Transaction } from '@/utils/types';
import { getBankCodeByName } from '../utils/bankUtils';

interface TransferProcessData {
  amount: number;
  userName: string;
  accountNumber?: string;
  bankName?: string;
  userId?: string;
  isBluetoothTransfer: boolean;
  senderName: string;
  sendAccountId: number;
  sendBankCode: number;
}

interface TransferState {
  isLoading: boolean;
  error: string | null;
  lastTransfer: TransferResponse | null;
  transactions: Transaction[];
  sendMoney: (data: TransferRequest) => Promise<TransferResponse | null>;
  sendMoneyBluetooth: (
    data: BluetoothTransferRequest,
  ) => Promise<TransferResponse | null>;
  processTransfer: (
    data: TransferProcessData,
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

  processTransfer: async (data: TransferProcessData) => {
    set({ isLoading: true, error: null });
    try {
      let response: TransferResponse | null = null;

      if (data.isBluetoothTransfer && data.userId) {
        // 블루투스 송금 처리
        const bluetoothTransferData: BluetoothTransferRequest = {
          sendAccountId: data.sendAccountId,
          sendBankCode: data.sendBankCode,
          sendName: data.senderName,
          recvUserId: Number(data.userId),
          amount: data.amount,
        };

        response = await get().sendMoneyBluetooth(bluetoothTransferData);
      } else if (data.accountNumber && data.bankName) {
        // 일반 계좌 송금 처리
        const transferData: TransferRequest = {
          sendAccountId: data.sendAccountId,
          sendBankCode: data.sendBankCode,
          sendName: data.senderName,
          recvAccountNumber: data.accountNumber,
          recvBankCode: getBankCodeByName(data.bankName),
          recvName: data.userName,
          amount: data.amount,
        };

        response = await get().sendMoney(transferData);
      } else {
        throw new Error('송금에 필요한 정보가 부족합니다.');
      }

      if (!response) {
        throw new Error('송금 처리에 실패했습니다.');
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '송금 처리 중 오류가 발생했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error; // 에러를 다시 throw하여 complete 페이지에서 처리할 수 있도록 함
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
