import api from '@/api/ApiInstance';

// 인터페이스 정의
export interface TransferRequest {
  sendAccountId: number;
  sendBankCode: number;
  sendName: string;
  recvAccountNumber: string;
  recvBankCode: number;
  recvName: string;
  amount: number;
}

export interface BluetoothTransferRequest {
  sendAccountId: number;
  sendBankCode: number;
  sendName: string;
  recvUuid: string;
  amount: number;
}

export interface TransferResponse {
  sendAccountId: number;
  recvAccountNumber: string;
  recvName: string;
  amount: number;
}

export interface TransferHistory {
  transferId: number;
  transferType: 'WITHDRAWAL' | 'DEPOSIT';
  transferMoney: number;
  currencyCode: string;
  transferMethod: string;
  counterpartAccount: string;
  counterpartName: string;
  createdAt: string;
}

export interface RecentTransferHistory {
  transferId: number;
  transferType: 'WITHDRAWAL' | 'DEPOSIT';
  counterpartName: string;
  transferMoney: number;
  currencyCode: string;
  transferMethod: string;
  createdAt: string;
}

export interface TransferCounterpart {
  counterpartName: string;
  counterpartAccountNumber: string;
  counterpartBankCode: number;
  createdAt: string;
}

interface ApiResponse<T = any> {
  isSuccess: boolean;
  code: number;
  message: string;
  result?: T;
}

// API 함수
export const transferApi = {
  /**
   * 송금 요청
   */
  sendMoney: async (data: TransferRequest) => {
    console.log('sendMoney', data);
    return api.post<ApiResponse<TransferResponse>>(
      '/api/transfers/openbank',
      data,
    );
  },

  /**
   * 블루투스 송금 요청
   */
  sendMoneyBluetooth: async (data: BluetoothTransferRequest) => {
    console.log('sendMoneyBluetooth', data);
    return api.post<ApiResponse<TransferResponse>>(
      '/api/bluetooth/transfers',
      data,
    );
  },

  /**
   * 송금 내역 조회
   */
  getTransferHistory: async (accountId: number) => {
    console.log('getTransferHistory', accountId);
    return api.get<ApiResponse<TransferHistory[]>>(
      `/api/transfers/histories?accountId=${accountId}`,
    );
  },

  /**
   * 최근 송금 내역 조회
   */
  getRecentTransferHistory: async () => {
    return api.get<ApiResponse<RecentTransferHistory[]>>(
      '/api/transfers/history',
    );
  },

  /**
   * 최근 송금 상대방 조회
   */
  getRecentCounterparts: async () => {
    return api.get<ApiResponse<TransferCounterpart[]>>(
      '/api/transfers/counterparts',
    );
  },
};
