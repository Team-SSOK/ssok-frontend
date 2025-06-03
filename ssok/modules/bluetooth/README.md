# Bluetooth Module 📶

SSOK 앱의 블루투스 BLE(Bluetooth Low Energy) 연동을 담당하는 모듈입니다. BLE 광고와 스캔을 통해 주변 사용자를 발견하고 계좌 정보 없이 송금할 수 있는 혁신적인 기능을 제공합니다.

## 주요 기능

- 📡 **BLE 광고**: 내 UUID를 주변에 광고하여 다른 사용자가 발견할 수 있게 함
- 🔍 **주변 기기 스캔**: 주변에서 광고하는 다른 사용자의 UUID 감지
- 🎯 **레이더 UI**: 시각적 레이더 인터페이스로 주변 사용자 표시
- 👥 **사용자 매칭**: 발견된 UUID로 서버에서 사용자 정보 조회
- 💸 **블루투스 송금**: 계좌 정보 없이 UUID를 통한 직접 송금
- 🔄 **자동 재연결**: 연결 끊김 시 자동 복구 및 지속적 스캔
- ⚙️ **권한 관리**: Android 버전별 블루투스 권한 처리

## 구조

```
bluetooth/
├── components/              # 블루투스 관련 컴포넌트
│   ├── BluetoothRadar.tsx           # 메인 레이더 UI
│   ├── RadarDevice.tsx              # 레이더 상의 기기 표시
│   ├── PeerDeviceItem.tsx           # 발견된 기기 아이템
│   ├── PeerDeviceList.tsx           # 기기 목록
│   └── BleStatusCard.tsx            # BLE 상태 표시 카드
├── hooks/                   # 커스텀 훅
│   └── useBleScanner.ts             # BLE 스캔 로직
├── services/                # BLE 서비스
│   └── bleService.ts                # BLE 광고/스캔 통합 서비스
├── stores/                  # 상태 관리
│   └── bluetoothStore.ts            # 블루투스 상태 스토어
├── api/                     # API 호출
│   └── bluetoothApi.ts              # 블루투스 관련 API
├── bluetooth-api-spec.md    # API 명세서
└── README.md                # 모듈 문서
```

## 사용법

### 1. 블루투스 레이더 화면

```tsx
import { BluetoothRadar, useBleScanner } from '@/modules/bluetooth';
import { useBluetoothStore } from '@/modules/bluetooth/stores';

export default function BluetoothScreen() {
  const { 
    discoveredDevices, 
    isScanning, 
    startScanning, 
    stopScanning 
  } = useBleScanner();
  
  const { myUUID, users } = useBluetoothStore();

  const handleDevicePress = (device) => {
    // 발견된 사용자와 송금 플로우 시작
    const user = users.find(u => u.uuid === device.uuid);
    if (user) {
      router.push({
        pathname: '/transfer',
        params: {
          uuid: user.uuid,
          userName: user.username,
          isBluetooth: 'true'
        }
      });
    }
  };

  return (
    <View>
      <BluetoothRadar
        devices={discoveredDevices}
        isScanning={isScanning}
        myUUID={myUUID}
        onDevicePress={handleDevicePress}
      />
    </View>
  );
}
```

### 2. BLE 서비스 초기화 및 시작

```tsx
import { BleService } from '@/modules/bluetooth/services';

// 서비스 초기화
const bleService = BleService.getInstance();

useEffect(() => {
  const initializeBLE = async () => {
    // BLE 서비스 초기화
    const success = await bleService.initialize({
      advertisingUUID: myUUID, // 내 UUID
      autoStart: true,         // 자동 시작
      major: 1,               // iBeacon major
      minor: 1,               // iBeacon minor
    });

    if (success) {
      console.log('BLE 서비스 초기화 성공');
      
      // 이벤트 리스너 등록
      bleService.addListener({
        onPeerDiscovered: (device) => {
          console.log('새로운 기기 발견:', device);
        },
        onPeerLost: (deviceId) => {
          console.log('기기 연결 해제:', deviceId);
        },
        onError: (error) => {
          console.error('BLE 오류:', error);
        },
      });
    }
  };

  initializeBLE();
}, []);
```

### 3. 사용자 정보 조회 및 매칭

```tsx
import { useBluetoothStore } from '@/modules/bluetooth/stores';

export default function BluetoothManager() {
  const { 
    updateUsersByUuids, 
    users, 
    primaryAccount 
  } = useBluetoothStore();

  // 발견된 UUID들로 사용자 정보 조회
  const handleDiscoveredDevices = useCallback(async (devices) => {
    const uuids = devices.map(device => device.uuid);
    if (uuids.length > 0) {
      await updateUsersByUuids(uuids);
    }
  }, [updateUsersByUuids]);

  return (
    <View>
      {users.map(user => (
        <PeerDeviceItem
          key={user.uuid}
          user={user}
          onPress={() => handleUserPress(user)}
        />
      ))}
    </View>
  );
}
```

## API 명세

자세한 API 명세는 [bluetooth-api-spec.md](./bluetooth-api-spec.md)를 참조하세요.

### 주요 API 엔드포인트

- `POST /api/bluetooth/users`: 발견된 UUID로 사용자 정보 조회
- `POST /api/bluetooth/transfers`: 블루투스 송금 요청

## 상태 관리

### BluetoothStore 상태

```typescript
interface BluetoothState {
  // 사용자 정보
  users: BluetoothUser[];
  primaryAccount: PrimaryAccount | null;
  
  // 로딩 상태
  isLoading: boolean;
  error: string | null;
  
  // UUID 관리
  myUUID: string;
}

interface BluetoothUser {
  uuid: string;
  username: string;
  phoneSuffix: string;
  profileImage?: string;
}
```

### 주요 액션

```typescript
interface BluetoothActions {
  // 사용자 정보 관리
  updateUsersByUuids: (uuids: string[]) => Promise<void>;
  getUserByUuid: (uuid: string) => BluetoothUser | undefined;
  
  // UUID 관리
  setMyUUID: (uuid: string) => void;
  
  // 상태 관리
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUsers: () => void;
}
```

## 컴포넌트 상세

### BluetoothRadar

메인 레이더 UI 컴포넌트로 주변 기기들을 시각적으로 표시

**Props:**
- `devices: DiscoveredDevice[]` - 발견된 기기 목록
- `isScanning: boolean` - 스캔 중 여부
- `myUUID: string` - 내 UUID (중앙 표시용)
- `profileImage?: string` - 내 프로필 이미지
- `onDevicePress: (device: DiscoveredDevice) => void` - 기기 선택 핸들러

**Features:**
- 360도 회전하는 레이더 애니메이션
- 거리에 따른 기기 위치 표시
- 신호 강도 기반 거리 계산
- 터치 인터랙션 지원

### RadarDevice

레이더 상에서 개별 기기를 나타내는 컴포넌트

**Props:**
- `device: DiscoveredDevice` - 기기 정보
- `centerX: number` - 레이더 중심 X 좌표
- `centerY: number` - 레이더 중심 Y 좌표
- `radarRadius: number` - 레이더 반지름
- `onPress: () => void` - 기기 선택 핸들러

### PeerDeviceItem

발견된 사용자를 목록에서 표시하는 아이템 컴포넌트

**Props:**
- `user: BluetoothUser` - 사용자 정보
- `onPress: () => void` - 선택 핸들러
- `showDistance?: boolean` - 거리 표시 여부

### BleStatusCard

BLE 연결 상태를 표시하는 카드 컴포넌트

**Props:**
- `isAdvertising: boolean` - 광고 중 여부
- `isScanning: boolean` - 스캔 중 여부
- `deviceCount: number` - 발견된 기기 수
- `error?: string` - 오류 메시지

## 서비스 상세

### BleService

BLE 광고와 스캔을 통합 관리하는 싱글톤 서비스

**주요 메서드:**
```typescript
class BleService {
  // 초기화
  initialize(options?: BleServiceOptions): Promise<boolean>;
  
  // 광고 관리
  startAdvertising(): Promise<boolean>;
  stopAdvertising(): Promise<boolean>;
  
  // 스캔 관리
  startScanning(): Promise<boolean>;
  stopScanning(): Promise<boolean>;
  
  // 이벤트 리스너
  addListener(listener: BleServiceListener): void;
  removeListener(listener: BleServiceListener): void;
  
  // 상태 확인
  isAdvertising(): boolean;
  isScanning(): boolean;
  getDiscoveredPeers(): Map<string, DiscoveredDevice>;
}
```

**이벤트 타입:**
```typescript
interface BleServiceListener {
  onPeerDiscovered?: (device: DiscoveredDevice) => void;
  onPeerLost?: (deviceId: string) => void;
  onAdvertisingStarted?: (uuid: string) => void;
  onAdvertisingStopped?: () => void;
  onScanningStarted?: () => void;
  onScanningStopped?: () => void;
  onError?: (error: string) => void;
}
```

## 훅 상세

### useBleScanner

BLE 스캔 기능을 관리하는 훅

**반환값:**
- `discoveredDevices: DiscoveredDevice[]` - 발견된 기기 목록
- `isScanning: boolean` - 스캔 중 여부
- `isAdvertising: boolean` - 광고 중 여부
- `startScanning: () => Promise<void>` - 스캔 시작
- `stopScanning: () => Promise<void>` - 스캔 중지
- `startAdvertising: () => Promise<void>` - 광고 시작
- `stopAdvertising: () => Promise<void>` - 광고 중지

## 보안 고려사항

### 1. UUID 관리
- 사용자별 고유 UUID 생성 및 관리
- UUID 변경을 통한 추적 방지
- 서버 측에서 UUID와 사용자 매핑 검증

### 2. 권한 관리
- Android 버전별 블루투스 권한 처리
- 사용자 동의 없는 권한 요청 방지
- 권한 거부 시 적절한 가이드 제공

### 3. 데이터 보안
- 블루투스 통신에서 개인정보 노출 방지
- UUID 외 민감정보 전송 금지
- 서버 API를 통한 안전한 사용자 정보 교환

## 에러 처리

### 주요 에러 타입
- `BLUETOOTH_DISABLED`: 블루투스 비활성화
- `PERMISSION_DENIED`: 권한 거부
- `ADVERTISING_FAILED`: 광고 시작 실패
- `SCANNING_FAILED`: 스캔 시작 실패
- `DEVICE_NOT_SUPPORTED`: 디바이스 미지원

### 에러 처리 전략
```typescript
const handleBleError = (error: BleError) => {
  switch (error.type) {
    case 'BLUETOOTH_DISABLED':
      // 블루투스 설정 화면으로 이동
      openBluetoothSettings();
      break;
    case 'PERMISSION_DENIED':
      // 권한 설정 가이드 표시
      showPermissionGuide();
      break;
    case 'ADVERTISING_FAILED':
      // 광고 재시도 또는 대안 제시
      retryAdvertising();
      break;
    default:
      // 일반적인 오류 처리
      showErrorToast(error.message);
  }
};
```

## 성능 최적화

### 1. 스캔 최적화
- 적응형 스캔 주기 조정
- 배터리 효율성 고려한 스캔 간격
- 중복 기기 필터링

### 2. UI 최적화
- 레이더 애니메이션 최적화
- 기기 목록 가상화
- 불필요한 리렌더링 방지

### 3. 메모리 관리
- 오래된 기기 정보 자동 정리
- 메모리 누수 방지
- 적절한 cleanup 함수 구현

## 의존성

### 외부 라이브러리
- `react-native-ble-advertise`: BLE 광고 기능
- `react-native-ble-plx`: BLE 스캔 기능  
- `react-native-ble-manager`: BLE 관리 기능
- `zustand`: 상태 관리

### 내부 의존성
- `@/utils/ble`: BLE 관련 유틸리티
- `@/components`: 공통 UI 컴포넌트
- `@/constants`: 앱 전역 상수

## 플랫폼 지원

### Android
- ✅ BLE 광고 지원 (Android 5.0+)
- ✅ BLE 스캔 지원
- ✅ 권한 관리 (Android 버전별)
- ✅ 백그라운드 동작

### iOS
- ❌ BLE 광고 제한 (iOS 정책상 제한)
- ✅ BLE 스캔 지원
- ✅ 백그라운드 동작 제한적 지원

---

**📶 블루투스 기능 관련 문의나 개선 사항이 있다면 프론트엔드팀에 연락해주세요!** 