# BLE 광고 및 스캔 기능 구현

React Native와 Expo에서 BLE(Bluetooth Low Energy) 광고 및 스캔 기능을 구현한 프로젝트입니다.

## 주요 기능

- BLE 광고 기능 (Android 전용)
- BLE 스캔 기능 (Android, iOS)
- iBeacon 형식 데이터 파싱
- 근처 기기 발견 및 표시
- 블루투스 권한 관리

## 종속성

이 프로젝트는 다음 패키지를 사용합니다:

```json
{
  "dependencies": {
    "react-native-ble-advertise": "^0.0.15",
    "react-native-ble-plx": "^2.0.3",
    "buffer": "^6.0.3"
  }
}
```

## 설치 방법

1. 패키지 설치:

```bash
yarn add react-native-ble-advertise react-native-ble-plx buffer
```

2. 안드로이드 권한 추가 (AndroidManifest.xml):

```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- API 31+ (Android 12+) -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
    android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
```

3. iOS 권한 추가 (info.plist):

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>블루투스 통신을 위해 권한이 필요합니다.</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>블루투스 통신을 위해 권한이 필요합니다.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>블루투스 기기 검색을 위해 위치 권한이 필요합니다.</string>
```

## 파일 구조

```
project/
├── utils/
│   └── ble.ts                  # BLE 유틸리티 함수
├── hooks/
│   ├── useBleAdvertiser.ts     # BLE 광고 커스텀 훅
│   └── useBleScanner.ts        # BLE 스캔 커스텀 훅
├── modules/
│   └── bluetooth/
│       ├── components/         # BLE 관련 컴포넌트
│       │   ├── BleStatusCard.tsx
│       │   ├── PeerDeviceItem.tsx
│       │   └── PeerDeviceList.tsx
│       └── services/
│           └── bleService.ts   # BLE 통합 서비스
└── app/
    └── (tabs)/
        └── bluetooth.tsx       # 블루투스 화면
```

## 코드 설명

- **utils/ble.ts**: iBeacon 데이터 파싱 및 생성 유틸리티
- **hooks/useBleAdvertiser.ts**: BLE 광고 기능 훅
- **hooks/useBleScanner.ts**: BLE 스캔 기능 훅
- **modules/bluetooth/services/bleService.ts**: 광고와 스캔을 결합한 통합 서비스
- **modules/bluetooth/components/**: UI 컴포넌트
- **app/(tabs)/bluetooth.tsx**: 메인 블루투스 화면

## 사용 방법

이 코드는 다음과 같이 사용할 수 있습니다:

```typescript
// 메인 화면에서 bleService 초기화 및 사용
import bleService from '@/modules/bluetooth/services/bleService';

// 서비스 초기화
await bleService.initialize({
  advertisingUUID: 'custom-uuid-if-needed',
  autoStart: true, // 자동 시작 여부
});

// 이벤트 리스너 등록
const removeListener = bleService.addListener({
  onPeerDiscovered: (device) => {
    console.log('기기 발견:', device);
  },
});

// 광고 시작/중지
await bleService.startAdvertising();
await bleService.stopAdvertising();

// 스캔 시작/중지
await bleService.startScanning();
await bleService.stopScanning();

// 정리
bleService.cleanup();
```

## 참고사항

- BLE 광고 기능은 Android에서만 작동합니다.
- iOS에서는 스캔 기능만 지원됩니다.
- Android 12+ (API 31+)에서는 BLUETOOTH_SCAN, BLUETOOTH_CONNECT, BLUETOOTH_ADVERTISE 권한이 필요합니다.
- Android 6.0-11에서는 ACCESS_FINE_LOCATION 권한이 필요합니다.
- iBeacon 형식은 회사 ID와 UUID, Major, Minor 값으로 구성됩니다.
