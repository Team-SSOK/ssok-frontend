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

export interface TransferResponse {
  sendAccountId: number;
  recvAccountNumber: string;
  recvName: string;
  amount: number;
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
};
