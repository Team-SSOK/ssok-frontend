import { create } from 'zustand';
import {
  bluetoothApi,
  BluetoothUuidRequest,
  BluetoothMatchRequest,
  User,
  PrimaryAccount,
} from '../api/bluetoothApi';
import { DiscoveredDevice } from '@/modules/bluetooth/hooks/useBleScanner';

/**
 * API 응답 표준 타입
 */
type StoreResponse<T = any> =
  | { success: true; data: T; message?: string }
  | { success: false; data?: never; message: string };

interface BluetoothState {
  // 상태
  myUuid: string | null;
  registeredUuid: boolean;
  discoveredUsers: User[];
  uuidToUserMap: Map<string, User>;
  primaryAccount: PrimaryAccount | null;
  isLoading: boolean;
  error: string | null;

  // 액션 - 통일된 반환 타입 사용
  registerUuid: (uuid: string) => Promise<StoreResponse<boolean>>;
  matchUsers: (
    uuids: string[],
    showLoading?: boolean,
  ) => Promise<StoreResponse<User[]>>;
  updateDiscoveredDevices: (devices: DiscoveredDevice[]) => void;
  getUserByUuid: (uuid: string) => User | undefined;
  resetState: () => void;
  clearError: () => void;
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

// UUID와 사용자를 매핑하는 헬퍼 함수
const updateUuidUserMap = (
  uuids: string[],
  users: User[],
  map: Map<string, User>,
) => {
  uuids.forEach((uuid, index) => {
    if (index < users.length) {
      map.set(uuid, users[index]);
    }
  });
  return map;
};

export const useBluetoothStore = create<BluetoothState>((set, get) => ({
  // 초기 상태
  myUuid: null,
  registeredUuid: false,
  discoveredUsers: [],
  uuidToUserMap: new Map(),
  primaryAccount: null,
  isLoading: false,
  error: null,

  // UUID 등록 함수
  registerUuid: async (uuid: string) => {
    const currentState = get();
    const isAlreadyRegistered =
      currentState.registeredUuid && currentState.myUuid === uuid;

    if (!isAlreadyRegistered) {
      set({ isLoading: true, error: null });
    }

    try {
      const request: BluetoothUuidRequest = { bluetoothUUID: uuid };
      const response = await bluetoothApi.registerUuid(request);

      const isSuccess =
        (response.data.message &&
          response.data.message.includes('정상적으로 등록')) ||
        response.data.code === 2000 ||
        response.data.code === 200;

      if (isSuccess) {
        set({
          myUuid: uuid,
          registeredUuid: true,
          isLoading: false,
        });
        return createSuccessResponse(true, 'UUID가 성공적으로 등록되었습니다.');
      } else {
        const message = response.data.message || 'UUID 등록에 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'UUID 등록 중 오류가 발생했습니다.';

      // 성공 메시지가 포함된 경우 실제로는 성공으로 처리
      if (errorMessage.includes('정상적으로 등록')) {
        set({
          myUuid: uuid,
          registeredUuid: true,
          isLoading: false,
          error: null,
        });
        return createSuccessResponse(true, 'UUID가 성공적으로 등록되었습니다.');
      }

      set({ error: errorMessage, isLoading: false });
      console.error('Bluetooth UUID 등록 실패:', errorMessage);
      return createErrorResponse(errorMessage);
    }
  },

  // 발견된 UUID 매칭 및 사용자 조회
  matchUsers: async (uuids: string[], showLoading = false) => {
    if (uuids.length === 0) {
      return createSuccessResponse([] as User[], '매칭할 UUID가 없습니다.');
    }

    if (showLoading) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const request: BluetoothMatchRequest = { bluetoothUUIDs: uuids };
      const response = await bluetoothApi.matchUsers(request);

      const isSuccess =
        (response.data.message &&
          (response.data.message.includes('매칭된 유저 조회 성공') ||
            response.data.message.includes(
              'Bluetooth UUID에 대한 유저가 조회되었습니다',
            ))) ||
        response.data.code === 200;

      if (isSuccess && response.data.result) {
        const { users, primaryAccount } = response.data.result;

        console.log('🔍 매칭된 사용자들:', users);

        const newUuidToUserMap = new Map(get().uuidToUserMap);
        updateUuidUserMap(uuids, users, newUuidToUserMap);

        console.log(
          '🗺️ UUID 매핑 결과:',
          Array.from(newUuidToUserMap.entries()),
        );

        set({
          discoveredUsers: users,
          primaryAccount,
          uuidToUserMap: newUuidToUserMap,
          isLoading: false,
        });

        return createSuccessResponse(users, '사용자 조회가 완료되었습니다.');
      } else {
        const message = response.data.message || '사용자 조회에 실패했습니다.';
        set({ error: message, isLoading: false });
        return createErrorResponse(message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '사용자 조회 중 오류가 발생했습니다.';

      // 성공 메시지가 포함된 경우 실제로는 성공으로 처리
      if (
        (errorMessage.includes('매칭된 유저 조회 성공') ||
          errorMessage.includes(
            'Bluetooth UUID에 대한 유저가 조회되었습니다',
          )) &&
        error instanceof Error &&
        (error as any).response?.data?.result
      ) {
        const { users, primaryAccount } = (error as any).response.data.result;

        const newUuidToUserMap = new Map(get().uuidToUserMap);
        updateUuidUserMap(uuids, users, newUuidToUserMap);

        set({
          discoveredUsers: users,
          primaryAccount,
          uuidToUserMap: newUuidToUserMap,
          isLoading: false,
          error: null,
        });

        return createSuccessResponse(users, '사용자 조회가 완료되었습니다.');
      }

      set({ error: errorMessage, isLoading: false });
      console.error('사용자 조회 실패:', errorMessage);
      return createErrorResponse(errorMessage);
    }
  },

  // 발견된 기기 목록 업데이트 및 매칭
  updateDiscoveredDevices: (devices: DiscoveredDevice[]) => {
    if (devices.length === 0) return;

    const validDevices = devices.filter(
      (device) => device.iBeaconData !== null,
    );
    if (validDevices.length === 0) return;

    const uuids = validDevices.map((device) => device.iBeaconData!.uuid);
    const uniqueUuids = [...new Set(uuids)];

    const myUuid = get().myUuid;
    const otherUuids = uniqueUuids.filter((uuid) => uuid !== myUuid);

    if (otherUuids.length > 0) {
      get().matchUsers(otherUuids, false);
    }
  },

  // 상태 초기화
  resetState: () => {
    set({
      discoveredUsers: [],
      uuidToUserMap: new Map(),
      error: null,
      isLoading: false,
    });
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  },

  // 사용자 선택 핸들러 - UUID로 사용자 찾기
  getUserByUuid: (uuid: string) => {
    return get().uuidToUserMap.get(uuid);
  },
}));
