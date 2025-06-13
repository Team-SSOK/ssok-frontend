import api from '@/api/ApiInstance';

// 인터페이스 정의
export interface BluetoothUuidRequest {
  bluetoothUUID: string;
}

export interface BluetoothMatchRequest {
  bluetoothUUIDs: string[];
}

export interface User {
  uuid: string;
  phoneSuffix: string;
  username: string;
  profileImage: string | null;
}

export interface PrimaryAccount {
  accountId: number;
  accountNumber: string;
  bankCode: number;
  balance: number;
}

export interface BluetoothMatchResponse {
  users: User[];
  primaryAccount: PrimaryAccount;
}

interface ApiResponse<T = any> {
  code: number;
  message: string;
  result?: T;
}

// API 함수
export const bluetoothApi = {
  /**
   * UUID 등록
   * 프론트엔드에서 전달한 Bluetooth UUID를 백엔드 Redis에 캐싱
   */
  registerUuid: async (data: BluetoothUuidRequest) => {
    return api.post<ApiResponse<{}>>('/api/bluetooth/uuid', data);
  },

  /**
   * UUID 매칭 및 사용자 조회
   * 클라이언트가 탐색한 주변 Bluetooth UUID 리스트를 서버에 전송
   */
  matchUsers: async (data: BluetoothMatchRequest) => {
    try {
      const response = await api.post<ApiResponse<BluetoothMatchResponse>>(
        '/api/bluetooth/match',
        data,
      );
      return response;
    } catch (error: any) {
      // 404 에러이고 "매칭된 유저가 없음" 메시지인 경우, 에러가 아닌 빈 결과로 처리
      if (error.response?.status === 404 && error.response?.data?.code === 4403) {
        console.log('[bluetoothApi] 매칭되는 사용자가 없어 빈 결과를 반환합니다.');
        return { 
          ...error.response, 
          data: {
            ...error.response.data,
            result: { users: [], primaryAccount: null },
          }
        };
      }
      // 그 외의 경우는 실제 에러로 처리
      console.error('블루투스 매칭 API 오류:', error.message);
      throw error;
    }
  },
};
