import { create } from 'zustand';
import {
  bluetoothApi,
  BluetoothUuidRequest,
  BluetoothMatchRequest,
  User,
  PrimaryAccount,
} from '../api/bluetoothApi';
import { DiscoveredDevice } from '@/modules/bluetooth/hooks/useBleScanner';
import { devtools } from 'zustand/middleware';

const LOG_TAG = '[BluetoothStore]';

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
  
  // 원본 기기 목록 (스캐너에서 직접 받음)
  rawDiscoveredDevices: Map<string, DiscoveredDevice>;

  // 서버에서 매칭된 사용자 정보
  discoveredUsers: User[];
  primaryAccount: PrimaryAccount | null;

  isLoading: boolean;
  error: string | null;
}

interface BluetoothActions {
  setup: (uuid: string) => void;
  registerMyUuid: () => Promise<void>;
  
  // 스캐너로부터 받은 기기 정보 처리
  addOrUpdateDevice: (device: DiscoveredDevice) => void;
  
  // 주기적으로 실행될 액션
  matchFoundUsers: () => Promise<void>;
  clearInactiveDevices: () => void;

  reset: () => void;
  
  // Computed-like-getters
  getMatchedUserByUuid: (uuid: string) => User | undefined;
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

const initialState: BluetoothState = {
  myUuid: null,
  registeredUuid: false,
  rawDiscoveredDevices: new Map(),
  discoveredUsers: [],
  primaryAccount: null,
  isLoading: false,
  error: null,
};

export const useBluetoothStore = create<BluetoothState & BluetoothActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 초기 UUID 설정 및 등록
      setup: (uuid: string) => {
        set({ myUuid: uuid });
        get().registerMyUuid();
      },

      registerMyUuid: async () => {
        const myUuid = get().myUuid;
        if (!myUuid || get().registeredUuid) return;
        
        console.log(`${LOG_TAG} 내 UUID 등록 시도:`, myUuid);
        try {
          const response = await bluetoothApi.registerUuid({ bluetoothUUID: myUuid });
          if (response.data.code === 2000 || response.data.message.includes('정상적으로 등록')) {
            set({ registeredUuid: true });
            console.log(`${LOG_TAG} 내 UUID 등록 성공`);
          }
        } catch (e) {
          console.error(`${LOG_TAG} UUID 등록 실패:`, e);
        }
      },

      // 스캐너에서 기기 발견 시 호출
      addOrUpdateDevice: (device) => {
        // 내 UUID는 추가하지 않음
        if (device.iBeaconData?.uuid === get().myUuid) return;

        set((state) => {
          const newDevices = new Map(state.rawDiscoveredDevices);
          newDevices.set(device.id, { ...device, lastSeen: new Date() });
          return { rawDiscoveredDevices: newDevices };
        });
      },

      // 발견된 UUID들로 서버에 사용자 정보 요청
      matchFoundUsers: async () => {
        const { rawDiscoveredDevices, myUuid } = get();
        if (rawDiscoveredDevices.size === 0) return;

        const uuids = [...rawDiscoveredDevices.values()]
          .map((d) => d.iBeaconData?.uuid)
          .filter((uuid): uuid is string => !!uuid && uuid !== myUuid);
        
        const uniqueUuids = [...new Set(uuids)];
        if (uniqueUuids.length === 0) return;

        try {
          const response = await bluetoothApi.matchUsers({ bluetoothUUIDs: uniqueUuids });

          if (response.data.result) {
            const { users, primaryAccount } = response.data.result;
            set({ discoveredUsers: users || [], primaryAccount: primaryAccount || null });
            console.log(`${LOG_TAG} 사용자 매칭 성공:`, users.length, '명');
          }
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : '사용자 매칭 오류';
          set({ error: errorMessage });
          console.error(`${LOG_TAG} 사용자 매칭 실패:`, e);
        }
      },

      // 10초 이상 보이지 않은 기기 제거
      clearInactiveDevices: () => {
        set((state) => {
          const now = new Date().getTime();
          const newDevices = new Map(state.rawDiscoveredDevices);
          let changed = false;

          newDevices.forEach((device, id) => {
            if (now - device.lastSeen.getTime() > 10000) { // 10초 초과
              newDevices.delete(id);
              changed = true;
            }
          });
          
          if(changed) {
            console.log(`${LOG_TAG} 비활성 기기 정리. 현재:`, newDevices.size, '개');
            // 비활성 기기가 정리되었으면, 매칭된 사용자 목록도 다시 동기화
            get().matchFoundUsers();
            return { rawDiscoveredDevices: newDevices };
          }
          
          return state; // 변경 없으면 상태 업데이트 방지
        });
      },

      // 상태 리셋
      reset: () => {
        set(initialState);
      },
      
      // UUID로 매칭된 사용자 정보 조회
      getMatchedUserByUuid: (uuid) => {
        return get().discoveredUsers.find(user => user.uuid === uuid);
      },
    }),
    { name: 'BluetoothStore' },
  )
);
