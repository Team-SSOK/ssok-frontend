import api from '@/api/ApiInstance';

// 인터페이스 정의
export interface BluetoothUuidRequest {
  bluetoothUUID: string;
}

export interface BluetoothMatchRequest {
  bluetoothUUIDs: string[];
}

export interface User {
  userId: number;
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
    } catch (error) {
      // 에러 응답 처리
      if ((error as any).response?.data) {
        const errorData = (error as any).response.data;

        // 2400 코드는 성공으로 처리 (Bluetooth UUID에 대한 유저가 조회되었습니다)
        if (errorData.code === 2400 && errorData.result) {
          return { data: errorData };
        }

        if (
          errorData.result &&
          (errorData.message?.includes('매칭된 유저 조회 성공') ||
            errorData.message?.includes(
              'Bluetooth UUID에 대한 유저가 조회되었습니다',
            ))
        ) {
          return { data: errorData };
        }
      } else {
        // 실제 오류만 로깅
        console.error('블루투스 매칭 오류:', error);
      }
      throw error;
    }
  },
};
