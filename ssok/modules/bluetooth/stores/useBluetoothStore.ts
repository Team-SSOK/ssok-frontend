import { create } from 'zustand';
import {
  bluetoothApi,
  BluetoothUuidRequest,
  BluetoothMatchRequest,
  User,
  PrimaryAccount,
} from '../api/bluetoothApi';
import { DiscoveredDevice } from '@/hooks/useBleScanner';

interface BluetoothState {
  // 상태
  myUuid: string | null;
  registeredUuid: boolean;
  discoveredUsers: User[];
  uuidToUserMap: Map<string, User>;
  primaryAccount: PrimaryAccount | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  registerUuid: (uuid: string) => Promise<boolean>;
  matchUsers: (uuids: string[]) => Promise<User[] | null>;
  updateDiscoveredDevices: (devices: DiscoveredDevice[]) => void;
  getUserByUuid: (uuid: string) => User | undefined;
  resetState: () => void;
}

// UUID와 사용자를 매핑하는 헬퍼 함수
// 현재는 간단한 1:1 매핑을 생성하지만 실제 구현에서는 더 복잡한 로직이 필요할 수 있음
const updateUuidUserMap = (
  uuids: string[],
  users: User[],
  map: Map<string, User>,
) => {
  // 가장 단순한 구현: 발견된 UUID 순서대로 사용자 매핑 (사용자가 충분한 경우)
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
    set({ isLoading: true, error: null });
    try {
      const request: BluetoothUuidRequest = { bluetoothUUID: uuid };
      const response = await bluetoothApi.registerUuid(request);

      // 성공 메시지가 포함되어 있거나, 코드가 2000인 경우 성공으로 처리
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
        console.log('Bluetooth UUID 등록 성공:', uuid);
        return true;
      } else {
        throw new Error(response.data.message || 'UUID 등록에 실패했습니다.');
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
        console.log(
          'Bluetooth UUID 등록 성공 (에러 응답이지만 성공 메시지):',
          uuid,
        );
        return true;
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
      console.error('Bluetooth UUID 등록 실패:', errorMessage);
      return false;
    }
  },

  // 발견된 UUID 매칭 및 사용자 조회
  matchUsers: async (uuids: string[]) => {
    if (uuids.length === 0) return [];

    set({ isLoading: true, error: null });
    try {
      const request: BluetoothMatchRequest = { bluetoothUUIDs: uuids };
      const response = await bluetoothApi.matchUsers(request);

      // 성공 메시지가 포함되어 있거나, 코드가 200인 경우 성공으로 처리
      const isSuccess =
        (response.data.message &&
          response.data.message.includes('매칭된 유저 조회 성공')) ||
        response.data.code === 200;

      if (isSuccess && response.data.result) {
        const { users, primaryAccount } = response.data.result;

        // UUID와 사용자의 매핑 생성
        const newUuidToUserMap = new Map(get().uuidToUserMap);
        updateUuidUserMap(uuids, users, newUuidToUserMap);

        set({
          discoveredUsers: users,
          primaryAccount,
          uuidToUserMap: newUuidToUserMap,
          isLoading: false,
        });

        console.log('발견된 사용자:', users.length);
        return users;
      } else {
        throw new Error(response.data.message || '사용자 조회에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '사용자 조회 중 오류가 발생했습니다.';

      // 성공 메시지가 포함된 경우 실제로는 성공으로 처리
      if (
        errorMessage.includes('매칭된 유저 조회 성공') &&
        error instanceof Error &&
        (error as any).response?.data?.result
      ) {
        const { users, primaryAccount } = (error as any).response.data.result;

        // UUID와 사용자의 매핑 생성
        const newUuidToUserMap = new Map(get().uuidToUserMap);
        updateUuidUserMap(uuids, users, newUuidToUserMap);

        set({
          discoveredUsers: users,
          primaryAccount,
          uuidToUserMap: newUuidToUserMap,
          isLoading: false,
          error: null,
        });

        console.log(
          '발견된 사용자 (에러 응답이지만 성공 메시지):',
          users.length,
        );
        return users;
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
      console.error('사용자 조회 실패:', errorMessage);
      return null;
    }
  },

  // 발견된 기기 목록 업데이트 및 매칭
  updateDiscoveredDevices: (devices: DiscoveredDevice[]) => {
    if (devices.length === 0) return;

    // iBeacon 데이터가 있는 기기만 필터링
    const validDevices = devices.filter(
      (device) => device.iBeaconData !== null,
    );

    if (validDevices.length === 0) return;

    // UUID 목록 추출
    const uuids = validDevices.map((device) => device.iBeaconData!.uuid);

    // 중복 제거
    const uniqueUuids = [...new Set(uuids)];

    // 자신의 UUID 제외
    const myUuid = get().myUuid;
    const otherUuids = uniqueUuids.filter((uuid) => uuid !== myUuid);

    // UUID가 있으면 사용자 조회
    if (otherUuids.length > 0) {
      get().matchUsers(otherUuids);
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

  // 사용자 선택 핸들러 - UUID로 사용자 찾기
  getUserByUuid: (uuid: string) => {
    return get().uuidToUserMap.get(uuid);
  },
}));
