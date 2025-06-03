import { create } from 'zustand';
import {
  TransferRequest,
  TransferResponse,
  transferApi,
  BluetoothTransferRequest,
  RecentTransferHistory,
  TransferHistory,
} from '../api/transferApi';
import { Transaction } from '@/utils/types';
import { getBankCodeByName } from '../utils/bankUtils';

/**
 * API 응답 표준 타입
 */
type StoreResponse<T = any> =
  | { success: true; data: T; message?: string }
  | { success: false; data?: never; message: string };

interface TransferProcessData {
  amount: number;
  userName: string;
  accountNumber?: string;
  bankName?: string;
  uuid?: string;
  isBluetoothTransfer: boolean;
  senderName: string;
  sendAccountId: number;
  sendBankCode: number;
}

interface TransferState {
  // 상태
  isLoading: boolean;
  error: string | null;
  lastTransfer: TransferResponse | null;
  transactions: Transaction[];

  // 액션 - 통일된 반환 타입 사용
  sendMoney: (
    data: TransferRequest,
  ) => Promise<StoreResponse<TransferResponse>>;
  sendMoneyBluetooth: (
    data: BluetoothTransferRequest,
  ) => Promise<StoreResponse<TransferResponse>>;
  processTransfer: (
    data: TransferProcessData,
  ) => Promise<StoreResponse<TransferResponse>>;
  fetchRecentTransactions: (
    limit?: number,
  ) => Promise<StoreResponse<Transaction[]>>;
  getTransferHistory: (
    accountId: number,
  ) => Promise<StoreResponse<Transaction[]>>;
  clearError: () => void;

  /**
   * 모든 송금 상태 초기화 (사용자 삭제 시 사용)
   */
  resetTransferStore: () => void;
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

export const useTransferStore = create<TransferState>((set, get) => ({
  // 초기 상태
  isLoading: false,
  error: null,
  lastTransfer: null,
  transactions: [],

  sendMoney: async (data: TransferRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transferApi.sendMoney(data);

      if (response.data.isSuccess && response.data.result) {
        const result = response.data.result;
        set({ lastTransfer: result, isLoading: false });
        return createSuccessResponse(result, '송금이 완료되었습니다.');
      } else {
        const message = response.data.message || '송금에 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '송금 처리 중 오류가 발생했습니다.';
      set({ error: message, isLoading: false });
      return createErrorResponse(message);
    }
  },

  sendMoneyBluetooth: async (data: BluetoothTransferRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transferApi.sendMoneyBluetooth(data);

      if (response.data.isSuccess && response.data.result) {
        const result = response.data.result;
        set({ lastTransfer: result, isLoading: false });
        return createSuccessResponse(result, '블루투스 송금이 완료되었습니다.');
      } else {
        const message =
          response.data.message || '블루투스 송금에 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '블루투스 송금 처리 중 오류가 발생했습니다.';
      set({ error: message, isLoading: false });
      return createErrorResponse(message);
    }
  },

  processTransfer: async (data: TransferProcessData) => {
    set({ isLoading: true, error: null });
    try {
      if (data.isBluetoothTransfer && data.uuid) {
        // 블루투스 송금 처리
        console.log('🔄 블루투스 송금 처리', data);
        const bluetoothTransferData: BluetoothTransferRequest = {
          sendAccountId: data.sendAccountId,
          sendBankCode: data.sendBankCode,
          sendName: data.senderName,
          recvUuid: data.uuid,
          amount: data.amount,
        };

        const result = await get().sendMoneyBluetooth(bluetoothTransferData);
        return result;
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

        const result = await get().sendMoney(transferData);
        return result;
      } else {
        const message = '송금에 필요한 정보가 부족합니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '송금 처리 중 오류가 발생했습니다.';
      set({ error: message, isLoading: false });
      return createErrorResponse(message);
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
        return createSuccessResponse(
          historyData,
          '최근 거래내역을 조회했습니다.',
        );
      } else {
        const message =
          response.data.message || '최근 거래내역 조회에 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '최근 거래내역 조회 중 오류가 발생했습니다.';
      set({ transactions: [], error: message, isLoading: false });
      return createErrorResponse(message);
    }
  },

  getTransferHistory: async (accountId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transferApi.getTransferHistory(accountId);

      if (response.data.isSuccess && response.data.result) {
        const historyData: Transaction[] = response.data.result.map(
          (item: TransferHistory) => ({
            transferID: item.transferId,
            accountId: accountId,
            counterpartAccount: item.counterpartAccount,
            counterpartName: item.counterpartName,
            transferType:
              item.transferType === 'WITHDRAWAL' ? 'WITHDRAW' : 'DEPOSIT',
            transferMoney: item.transferMoney,
            currencyCode: item.currencyCode === 'KRW' ? 1 : 2,
            transferMethod: item.transferMethod === 'GENERAL' ? 0 : 1,
            createdAt: item.createdAt,
            balanceAfterTransaction: 0, // API에서 제공되지 않음
          }),
        );

        set({ isLoading: false });
        return createSuccessResponse(historyData, '거래내역을 조회했습니다.');
      } else {
        const message =
          response.data.message || '거래내역 조회에 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '거래내역 조회 중 오류가 발생했습니다.';
      set({ error: message, isLoading: false });
      return createErrorResponse(message);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  /**
   * 모든 송금 상태 초기화 (사용자 삭제 시 사용)
   */
  resetTransferStore: () => {
    console.log('[LOG][transferStore] resetTransferStore - 모든 송금 상태 초기화');
    set({
      isLoading: false,
      error: null,
      lastTransfer: null,
      transactions: [],
    });
  },
}));
