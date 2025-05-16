import { create } from 'zustand';
import {
  TransferRequest,
  TransferResponse,
  transferApi,
  BluetoothTransferRequest,
} from '../api/transferApi';

interface TransferState {
  isLoading: boolean;
  error: string | null;
  lastTransfer: TransferResponse | null;
  sendMoney: (data: TransferRequest) => Promise<TransferResponse | null>;
  sendMoneyBluetooth: (
    data: BluetoothTransferRequest,
  ) => Promise<TransferResponse | null>;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  isLoading: false,
  error: null,
  lastTransfer: null,

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
    console.log('sendMoneyBluetooth', data);
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
}));
