import { create } from 'zustand';
import {
  bluetoothApi,
  BluetoothUuidRequest,
  BluetoothMatchRequest,
  User,
  PrimaryAccount,
} from '../api/bluetoothApi';
import { DiscoveredDevice } from '@/modules/bluetooth/hooks/useBleScanner';

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
  matchUsers: (
    uuids: string[],
    showLoading?: boolean,
  ) => Promise<User[] | null>;
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
    // 이미 등록된 상태인지 확인하고, 등록된 상태라면 로딩 표시 없이 처리
    const currentState = get();
    const isAlreadyRegistered =
      currentState.registeredUuid && currentState.myUuid === uuid;

    if (!isAlreadyRegistered) {
      set({ isLoading: true, error: null });
    }

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
  matchUsers: async (uuids: string[], showLoading = false) => {
    if (uuids.length === 0) return [];

    // 로딩 상태는 명시적으로 요청한 경우에만 표시
    if (showLoading) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const request: BluetoothMatchRequest = { bluetoothUUIDs: uuids };
      const response = await bluetoothApi.matchUsers(request);

      // 성공 메시지가 포함되어 있거나, 코드가 200인 경우 성공으로 처리
      const isSuccess =
        (response.data.message &&
          (response.data.message.includes('매칭된 유저 조회 성공') ||
            response.data.message.includes(
              'Bluetooth UUID에 대한 유저가 조회되었습니다',
            ))) ||
        response.data.code === 200;

      if (isSuccess && response.data.result) {
        const { users, primaryAccount } = response.data.result;

        console.log('🔍 매칭된 사용자들:', users); // 디버깅용

        // UUID와 사용자의 매핑 생성
        const newUuidToUserMap = new Map(get().uuidToUserMap);
        updateUuidUserMap(uuids, users, newUuidToUserMap);

        console.log(
          '🗺️ UUID 매핑 결과:',
          Array.from(newUuidToUserMap.entries()),
        ); // 디버깅용

        set({
          discoveredUsers: users,
          primaryAccount,
          uuidToUserMap: newUuidToUserMap,
          isLoading: false,
        });

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
        (errorMessage.includes('매칭된 유저 조회 성공') ||
          errorMessage.includes(
            'Bluetooth UUID에 대한 유저가 조회되었습니다',
          )) &&
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

        return users;
      }

      // 오류 상태 설정 (로딩은 종료)
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

    // UUID가 있으면 사용자 조회 (로딩 표시 없이)
    if (otherUuids.length > 0) {
      // 백그라운드에서 매칭 - 로딩 표시 없이 (false)
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

  // 사용자 선택 핸들러 - UUID로 사용자 찾기
  getUserByUuid: (uuid: string) => {
    return get().uuidToUserMap.get(uuid);
  },
}));
