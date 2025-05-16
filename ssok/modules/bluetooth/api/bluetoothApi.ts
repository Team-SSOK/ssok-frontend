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
    console.log('registerUuid', data);
    return api.post<ApiResponse<{}>>('/api/bluetooth/uuid', data);
  },

  /**
   * UUID 매칭 및 사용자 조회
   * 클라이언트가 탐색한 주변 Bluetooth UUID 리스트를 서버에 전송
   */
  matchUsers: async (data: BluetoothMatchRequest) => {
    console.log('📤 매칭 요청 UUIDs:', data.bluetoothUUIDs);

    try {
      const response = await api.post<ApiResponse<BluetoothMatchResponse>>(
        '/api/bluetooth/match',
        data,
      );

      // 응답 구조 간략하게 로그
      console.log('📥 매칭 응답 코드:', response.data.code);
      console.log('📥 매칭 응답 메시지:', response.data.message);

      if (response.data.result) {
        const { users, primaryAccount } = response.data.result;
        console.log('📥 매칭된 사용자 수:', users?.length || 0);
        console.log('📥 매칭된 사용자 목록:', JSON.stringify(users, null, 2));
        console.log(
          '📥 주 계좌 정보:',
          primaryAccount
            ? `${primaryAccount.bankCode} - ${primaryAccount.accountNumber} (잔액: ${primaryAccount.balance})`
            : '없음',
        );
      }

      return response;
    } catch (error) {
      // 에러 응답도 로깅
      if ((error as any).response?.data) {
        console.log('❌ 매칭 에러 응답:', (error as any).response.data);

        // 에러지만 실제론 성공인 경우가 있는지 확인
        const errorData = (error as any).response.data;
        if (
          errorData.result &&
          errorData.message?.includes('매칭된 유저 조회 성공')
        ) {
          console.log(
            '📥 (에러 응답이지만) 매칭된 사용자:',
            errorData.result.users?.length || 0,
          );
        }
      } else {
        console.log('❌ 매칭 에러:', error);
      }
      throw error;
    }
  },
};
