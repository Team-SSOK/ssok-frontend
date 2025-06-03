# Bluetooth Module 📶

SSOK 앱의 블루투스 디바이스 연결 및 관리를 담당하는 모듈입니다. 카드 리더기와의 블루투스 통신을 통해 카드 정보 읽기/쓰기 기능을 제공합니다.

## 주요 기능

- 🔍 **디바이스 스캔**: 주변 블루투스 디바이스 검색
- 🔗 **자동 연결**: 등록된 디바이스 자동 연결
- 💳 **카드 읽기**: NFC/RFID 카드 정보 읽기
- ✏️ **카드 쓰기**: 카드에 데이터 쓰기 작업
- 📱 **연결 상태 관리**: 실시간 연결 상태 모니터링
- 🔄 **자동 재연결**: 연결 끊김 시 자동 재연결 시도
- 🛡️ **보안 통신**: 암호화된 데이터 전송
- 📋 **디바이스 관리**: 페어링된 디바이스 목록 관리

## 구조

```
bluetooth/
├── components/              # 블루투스 관련 컴포넌트
│   ├── DeviceScanner.tsx           # 디바이스 스캔 화면
│   ├── DeviceList.tsx              # 디바이스 목록
│   ├── ConnectionStatus.tsx        # 연결 상태 표시
│   ├── CardReader.tsx              # 카드 읽기 인터페이스
│   └── index.ts                    # 컴포넌트 exports
├── hooks/                   # 커스텀 훅
│   ├── useBluetoothManager.ts      # 블루투스 전반 관리
│   ├── useDeviceScanner.ts         # 디바이스 스캔 로직
│   ├── useCardReader.ts            # 카드 읽기/쓰기 로직
│   └── index.ts                    # 훅 exports
├── stores/                  # 상태 관리
│   └── bluetoothStore.ts           # 블루투스 상태 스토어
├── services/                # 비즈니스 로직
│   ├── BluetoothService.ts         # 블루투스 서비스 클래스
│   ├── CardReaderService.ts        # 카드 리더 서비스
│   └── DeviceManager.ts            # 디바이스 관리
├── api/                     # API 호출
│   ├── bluetoothApi.ts             # 블루투스 관련 API
│   └── types.ts                    # API 타입 정의
├── bluetooth-api-spec.md    # API 명세서
└── index.ts                # 모듈 exports
```

## 사용법

### 1. 블루투스 초기화 및 디바이스 스캔

```tsx
import { useBluetoothManager, DeviceScanner } from '@/modules/bluetooth';

export default function BluetoothSetupScreen() {
  const {
    isEnabled,
    isScanning,
    devices,
    connectedDevice,
    enableBluetooth,
    startScan,
    stopScan,
    connectDevice
  } = useBluetoothManager();

  useEffect(() => {
    if (!isEnabled) {
      enableBluetooth();
    }
  }, [isEnabled]);

  const handleDeviceSelect = async (device) => {
    await connectDevice(device.id);
  };

  return (
    <View>
      <DeviceScanner
        isScanning={isScanning}
        devices={devices}
        onStartScan={startScan}
        onStopScan={stopScan}
        onDeviceSelect={handleDeviceSelect}
      />
      {connectedDevice && (
        <ConnectionStatus device={connectedDevice} />
      )}
    </View>
  );
}
```

### 2. 카드 읽기/쓰기

```tsx
import { useCardReader, CardReader } from '@/modules/bluetooth';

export default function CardReaderScreen() {
  const {
    isReading,
    cardData,
    error,
    readCard,
    writeCard,
    clearCard
  } = useCardReader();

  const handleReadCard = async () => {
    const result = await readCard();
    if (result.success) {
      console.log('카드 정보:', result.data);
    }
  };

  const handleWriteCard = async (data) => {
    const result = await writeCard(data);
    if (result.success) {
      console.log('카드 쓰기 완료');
    }
  };

  return (
    <View>
      <CardReader
        isReading={isReading}
        cardData={cardData}
        error={error}
        onReadCard={handleReadCard}
        onWriteCard={handleWriteCard}
        onClearCard={clearCard}
      />
    </View>
  );
}
```

### 3. 연결 상태 모니터링

```tsx
import { useBluetoothStore } from '@/modules/bluetooth';

export default function HomeScreen() {
  const { 
    connectionStatus, 
    connectedDevice, 
    isAutoReconnecting 
  } = useBluetoothStore();

  return (
    <View>
      <View style={styles.statusBar}>
        <Icon 
          name="bluetooth" 
          color={connectionStatus === 'connected' ? 'green' : 'gray'} 
        />
        <Text>
          {connectionStatus === 'connected' 
            ? `연결됨: ${connectedDevice?.name}`
            : isAutoReconnecting 
              ? '재연결 시도 중...'
              : '연결 안됨'
          }
        </Text>
      </View>
    </View>
  );
}
```

## API 명세

자세한 API 명세는 [bluetooth-api-spec.md](./bluetooth-api-spec.md)를 참조하세요.

### 주요 API 엔드포인트

- `POST /bluetooth/devices/register`: 디바이스 등록
- `GET /bluetooth/devices`: 등록된 디바이스 목록
- `POST /bluetooth/cards/read`: 카드 읽기 결과 전송
- `POST /bluetooth/cards/write`: 카드 쓰기 요청

## 상태 관리

### BluetoothStore 상태

```typescript
interface BluetoothState {
  // 블루투스 상태
  isEnabled: boolean;
  isScanning: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  
  // 디바이스 관리
  devices: BluetoothDevice[];
  connectedDevice: BluetoothDevice | null;
  pairedDevices: BluetoothDevice[];
  
  // 카드 리더 상태
  isReading: boolean;
  isWriting: boolean;
  cardData: CardData | null;
  
  // 자동 재연결
  isAutoReconnecting: boolean;
  reconnectAttempts: number;
  
  // 에러 처리
  error: string | null;
}
```

### 주요 액션

```typescript
interface BluetoothActions {
  // 블루투스 제어
  enableBluetooth: () => Promise<boolean>;
  disableBluetooth: () => Promise<boolean>;
  
  // 디바이스 스캔
  startScan: () => Promise<void>;
  stopScan: () => void;
  
  // 연결 관리
  connectDevice: (deviceId: string) => Promise<boolean>;
  disconnectDevice: () => Promise<void>;
  
  // 카드 작업
  readCard: () => Promise<CardReadResult>;
  writeCard: (data: CardData) => Promise<CardWriteResult>;
  
  // 상태 관리
  setConnectionStatus: (status: ConnectionStatus) => void;
  clearError: () => void;
  addDevice: (device: BluetoothDevice) => void;
}
```

## 서비스 상세

### BluetoothService

블루투스 하드웨어와의 직접적인 통신을 담당하는 서비스

**주요 메서드:**
- `initialize()`: 블루투스 초기화
- `scanDevices()`: 디바이스 스캔
- `connect(deviceId)`: 디바이스 연결
- `disconnect()`: 연결 해제
- `sendData(data)`: 데이터 전송
- `onDataReceived(callback)`: 데이터 수신 콜백

### CardReaderService

카드 리더기와의 통신을 담당하는 서비스

**주요 메서드:**
- `readCard()`: 카드 정보 읽기
- `writeCard(data)`: 카드에 데이터 쓰기
- `formatCard()`: 카드 포맷
- `validateCard(data)`: 카드 데이터 검증

### DeviceManager

디바이스 관리 및 페어링을 담당하는 서비스

**주요 메서드:**
- `getPairedDevices()`: 페어링된 디바이스 목록
- `pairDevice(device)`: 디바이스 페어링
- `unpairDevice(deviceId)`: 페어링 해제
- `getDeviceInfo(deviceId)`: 디바이스 정보 조회

## 컴포넌트 상세

### DeviceScanner

블루투스 디바이스 스캔 및 선택 컴포넌트

**Props:**
- `isScanning: boolean` - 스캔 진행 상태
- `devices: BluetoothDevice[]` - 발견된 디바이스 목록
- `onStartScan: () => void` - 스캔 시작 핸들러
- `onStopScan: () => void` - 스캔 중지 핸들러
- `onDeviceSelect: (device: BluetoothDevice) => void` - 디바이스 선택 핸들러

### ConnectionStatus

블루투스 연결 상태를 표시하는 컴포넌트

**Props:**
- `device: BluetoothDevice | null` - 연결된 디바이스
- `status: ConnectionStatus` - 연결 상태
- `onReconnect?: () => void` - 재연결 핸들러

### CardReader

카드 읽기/쓰기 인터페이스 컴포넌트

**Props:**
- `isReading: boolean` - 카드 읽기 진행 상태
- `cardData: CardData | null` - 읽은 카드 데이터
- `onReadCard: () => void` - 카드 읽기 핸들러
- `onWriteCard: (data: CardData) => void` - 카드 쓰기 핸들러
- `onClearCard: () => void` - 카드 데이터 지우기 핸들러

## 보안 고려사항

### 1. 데이터 암호화
- 카드 데이터는 AES-256으로 암호화
- 블루투스 통신 시 페어링 키 사용
- 민감한 정보는 로컬 저장 금지

### 2. 접근 권한
- 블루투스 권한 확인
- 위치 권한 확인 (Android)
- 백그라운드 스캔 제한

### 3. 디바이스 검증
- 허가된 디바이스만 연결 허용
- 디바이스 인증서 검증
- 비정상 연결 시도 차단

## 에러 처리

### 에러 타입
- `BLUETOOTH_DISABLED`: 블루투스 비활성화
- `PERMISSION_DENIED`: 권한 거부
- `DEVICE_NOT_FOUND`: 디바이스 찾을 수 없음
- `CONNECTION_FAILED`: 연결 실패
- `CARD_READ_ERROR`: 카드 읽기 오류
- `CARD_WRITE_ERROR`: 카드 쓰기 오류

### 자동 재연결
```typescript
const reconnectConfig = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};
```

## 테스트

### 단위 테스트
- 블루투스 서비스 로직
- 카드 리더 기능
- 에러 처리 로직

### 통합 테스트
- 디바이스 연결 플로우
- 카드 읽기/쓰기 플로우
- 자동 재연결 로직

### 하드웨어 테스트
- 실제 카드 리더기와의 통신
- 다양한 카드 타입 테스트
- 연결 안정성 테스트

## 의존성

### 외부 라이브러리
- `react-native-bluetooth-serial`: 블루투스 통신
- `react-native-permissions`: 권한 관리
- `crypto-js`: 데이터 암호화

### 내부 의존성
- `@/utils`: 암호화 유틸리티
- `@/constants`: 블루투스 설정 상수
- `@/components`: 공통 UI 컴포넌트

## 성능 최적화

### 스캔 최적화
- 스캔 시간 제한 (30초)
- 중복 디바이스 필터링
- 신호 강도 기반 정렬

### 연결 최적화
- 연결 풀링으로 빠른 재연결
- 백그라운드에서 연결 상태 유지
- 불필요한 데이터 전송 최소화

---

**📶 블루투스 관련 문의나 하드웨어 호환성 문제가 있다면 하드웨어팀에 연락해주세요!** 