import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import { generateUUID, parseIBeaconData } from '@/utils/ble';
import { DiscoveredDevice } from '@/hooks/useBleScanner';
// BLE 광고 모듈 가져오기 (타입 오류 무시)
// @ts-ignore
import BleAdvertise from 'react-native-ble-advertise';

// 로그 프리픽스 상수화
const LOG_TAG = '[BleService]';

// BLE 서비스 이벤트 리스너 타입
export type BleServiceListener = {
  onPeerDiscovered?: (device: DiscoveredDevice) => void;
  onPeerLost?: (deviceId: string) => void;
  onAdvertisingStarted?: (uuid: string) => void;
  onAdvertisingStopped?: () => void;
  onScanningStarted?: () => void;
  onScanningStopped?: () => void;
  onError?: (error: string) => void;
};

// 서비스 설정 옵션
export type BleServiceOptions = {
  advertisingUUID?: string;
  major?: number;
  minor?: number;
  autoStart?: boolean; // 자동 시작 여부
};

/**
 * BLE 서비스 싱글톤 클래스
 * 광고와 스캔을 동시에 관리하는 통합 서비스
 */
class BleService {
  // 싱글톤 인스턴스
  private static instance: BleService;

  // UUID 정보
  private uuid: string = '';
  private major: number = 0;
  private minor: number = 0;

  // 상태 정보
  private isInitialized: boolean = false;
  private isAdvertising: boolean = false;
  private isScanning: boolean = false;

  // 발견된 peers
  private discoveredPeers: Map<string, DiscoveredDevice> = new Map();

  // 이벤트 리스너
  private listeners: BleServiceListener[] = [];

  // BleManager 속성 추가
  private bleManager: any = null;

  /**
   * 생성자 - 직접 호출하지 말고 getInstance() 사용
   */
  private constructor() {
    this.uuid = generateUUID();
    this.major = Math.floor(Math.random() * 65535);
    this.minor = Math.floor(Math.random() * 65535);
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): BleService {
    if (!BleService.instance) {
      BleService.instance = new BleService();
    }
    return BleService.instance;
  }

  /**
   * 서비스 초기화
   *
   * @param options - 서비스 옵션
   */
  public async initialize(options?: BleServiceOptions): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // 안드로이드에서는 블루투스 권한 요청
      if (Platform.OS === 'android') {
        try {
          // 권한 요청 - 여기서는 실패해도 진행 (일부 기능만 제한)
          await this.requestBluetoothPermissions();
          console.log(`${LOG_TAG} 권한 요청 완료`);
        } catch (error) {
          console.warn(`${LOG_TAG} 권한 요청 중 오류:`, error);
          // 권한이 없더라도 초기화는 계속 진행
        }
      }

      // 옵션에서 설정값 가져오기
      if (options) {
        if (options.advertisingUUID) {
          this.uuid = options.advertisingUUID;
        }
        if (options.major !== undefined) {
          this.major = options.major;
        }
        if (options.minor !== undefined) {
          this.minor = options.minor;
        }
      }

      console.log(`${LOG_TAG} 초기화 완료:`, {
        uuid: this.uuid,
        major: this.major,
        minor: this.minor,
      });

      this.isInitialized = true;

      // 자동 시작 옵션이 있는 경우
      if (options?.autoStart) {
        // 광고 시작
        await this.startAdvertising();
        // 스캔 시작
        await this.startScanning();
      }

      return true;
    } catch (error) {
      console.error(`${LOG_TAG} 초기화 오류:`, error);
      this.notifyError('BLE 서비스 초기화에 실패했습니다.');
      return false;
    }
  }

  /**
   * 안드로이드 블루투스 권한 요청
   */
  private async requestBluetoothPermissions(): Promise<void> {
    // Android SDK 버전 확인
    const sdkVersion = Platform.OS === 'android' ? Platform.Version : 0;

    console.log(`${LOG_TAG} Android SDK Version: ${sdkVersion}`);

    // 안드로이드 12 (API 31) 이상
    if (Platform.OS === 'android' && sdkVersion >= 31) {
      console.log(`${LOG_TAG} 안드로이드 12+ 권한 요청`);

      // 블루투스 권한 요청
      const bluetoothPermissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ];

      const bleResults =
        await PermissionsAndroid.requestMultiple(bluetoothPermissions);

      // 위치 권한도 요청 (일부 기기에서 필요)
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '위치 접근 권한',
          message: '블루투스 기기를 검색하기 위해 위치 접근 권한이 필요합니다.',
          buttonPositive: '확인',
        },
      );

      // 권한 결과 로그
      Object.entries(bleResults).forEach(([permission, result]) => {
        console.log(`${LOG_TAG} 권한 결과: ${permission} - ${result}`);
      });
    }
    // 안드로이드 11 (API 30) 이하
    else if (Platform.OS === 'android') {
      console.log(`${LOG_TAG} 안드로이드 11 이하 권한 요청`);

      // 위치 권한만 요청 (블루투스 스캔에 필요)
      const locationResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '위치 접근 권한',
          message: '블루투스 기기를 검색하기 위해 위치 접근 권한이 필요합니다.',
          buttonPositive: '확인',
        },
      );

      console.log(`${LOG_TAG} 위치 권한 결과: ${locationResult}`);
    }
  }

  /**
   * 광고 시작 함수 (내 UUID 광고)
   */
  public async startAdvertising(): Promise<boolean> {
    if (!this.isInitialized) {
      this.notifyError('BLE 서비스가 초기화되지 않았습니다.');
      return false;
    }

    if (this.isAdvertising) {
      return true;
    }

    try {
      // Android 전용 기능 확인
      if (Platform.OS !== 'android') {
        this.notifyError('BLE 광고는 Android 기기에서만 지원됩니다.');
        return false;
      }

      // 실제 구현에서는 react-native-ble-advertise 사용
      console.log(`${LOG_TAG} 광고 시작`, this.uuid);

      // 코드가 실행되는 환경이 실제 기기라면 광고 시작
      if (Platform.OS === 'android') {
        try {
          // 공식 문서에 따른 구현
          // 광고 시작 전에 회사 ID 설정
          BleAdvertise.setCompanyId(0x00e0);

          // 블루투스 권한 다시 확인
          const hasPermissions = await this.checkBlePermissions();
          if (!hasPermissions) {
            console.warn(`${LOG_TAG} 블루투스 광고 권한이 없습니다.`);

            // 권한 재요청 - 사용자가 "다시 묻지 않음"을 선택했을 수 있으므로
            // 일반적인 권한 요청이 작동하지 않을 수 있음
            const permissionStatus = await this.requestAdvertisePermission();

            if (!permissionStatus) {
              // 권한을 얻지 못했으면 광고 실패
              this.notifyError(
                '블루투스 광고 권한이 없어 광고를 시작할 수 없습니다.',
              );
              return false;
            }
          }

          // 광고 시작
          await BleAdvertise.broadcast(this.uuid, this.major, this.minor);

          this.isAdvertising = true;
          this.notifyAdvertisingStarted(this.uuid);

          console.log(`${LOG_TAG} 광고 시작 성공`);
          return true;
        } catch (error) {
          console.error(`${LOG_TAG} 광고 시작 오류:`, error);

          // 권한 오류인 경우 사용자에게 설정 화면으로 이동하는 안내 메시지 표시
          if (
            error instanceof Error &&
            error.message.includes('BLUETOOTH_ADVERTISE permission')
          ) {
            this.showPermissionSettings('블루투스 광고');
          }

          this.notifyError('BLE 광고 시작에 실패했습니다.');
          return false;
        }
      } else {
        // iOS에서는 광고를 지원하지 않음
        return false;
      }
    } catch (error) {
      console.error(`${LOG_TAG} 광고 시작 오류:`, error);
      this.notifyError('BLE 광고 시작에 실패했습니다.');
      return false;
    }
  }

  /**
   * 블루투스 광고 권한 요청 - 거부된 경우 설정으로 안내
   */
  private async requestAdvertisePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      // 현재 권한 상태 확인
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      );

      if (hasPermission) return true;

      // 권한 요청
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      );

      // 권한이 부여되었는지 확인
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      // 사용자가 '다시 묻지 않음'을 선택한 경우
      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        this.showPermissionSettings('블루투스 광고');
        return false;
      }

      return false;
    } catch (error) {
      console.error(`${LOG_TAG} 권한 요청 오류:`, error);
      return false;
    }
  }

  /**
   * 사용자에게 앱 설정으로 이동하라는 알림 표시
   */
  private showPermissionSettings(permissionType: string): void {
    if (Platform.OS !== 'android') return;

    Alert.alert(
      '권한 필요',
      `${permissionType} 기능을 사용하려면 앱 설정에서 권한을 허용해주세요.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '설정으로 이동',
          onPress: () => {
            // 앱 설정 화면으로 이동
            Linking.openSettings();
          },
        },
      ],
    );
  }

  /**
   * 블루투스 권한 확인
   */
  private async checkBlePermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const sdkVersion = Platform.Version;

      // 안드로이드 12 이상
      if (sdkVersion >= 31) {
        const results = await Promise.all([
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          ),
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ),
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          ),
        ]);

        return results.every((result) => result === true);
      }
      // 안드로이드 11 이하
      else {
        const hasLocationPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return hasLocationPermission;
      }
    } catch (error) {
      console.error(`${LOG_TAG} 권한 확인 오류:`, error);
      return false;
    }
  }

  /**
   * 광고 중지 함수
   */
  public async stopAdvertising(): Promise<boolean> {
    if (!this.isAdvertising) {
      return true;
    }

    try {
      // Android 전용 기능 확인
      if (Platform.OS !== 'android') {
        return false;
      }

      // 실제 구현에서는 react-native-ble-advertise 사용
      console.log(`${LOG_TAG} 광고 중지`);

      // 코드가 실행되는 환경이 실제 기기라면 광고 중지
      if (Platform.OS === 'android') {
        try {
          // 광고 중지
          await BleAdvertise.stopBroadcast();

          this.isAdvertising = false;
          this.notifyAdvertisingStopped();

          console.log(`${LOG_TAG} 광고 중지 성공`);
          return true;
        } catch (error) {
          console.error(`${LOG_TAG} 광고 중지 오류:`, error);
          this.notifyError('BLE 광고 중지에 실패했습니다.');
          return false;
        }
      } else {
        // iOS에서는 광고를 지원하지 않음
        return false;
      }
    } catch (error) {
      console.error(`${LOG_TAG} 광고 중지 오류:`, error);
      this.notifyError('BLE 광고 중지에 실패했습니다.');
      return false;
    }
  }

  /**
   * 스캔 시작 함수 (다른 UUID 검색)
   */
  public async startScanning(): Promise<boolean> {
    if (!this.isInitialized) {
      this.notifyError('BLE 서비스가 초기화되지 않았습니다.');
      return false;
    }

    if (this.isScanning) {
      return true;
    }

    try {
      // 실제 구현에서는 react-native-ble-plx 사용
      console.log(`${LOG_TAG} 스캔 시작`);

      // 실제 앱에서 사용 시에는 아래 코드 활성화
      // 실제 사용 시 스캔 코드
      const { BleManager } = require('react-native-ble-plx');
      this.bleManager = new BleManager();

      // 스캔 시작
      this.bleManager.startDeviceScan(
        null, // 모든 서비스 UUID 스캔
        { allowDuplicates: false }, // 중복 장치 필터링
        (error: any, device: any) => {
          if (error) {
            console.error(`${LOG_TAG} 스캔 오류:`, error);
            this.notifyError(`스캔 중 오류 발생: ${error.message}`);
            this.isScanning = false;
            return;
          }

          if (device && device.manufacturerData) {
            this.handleDiscoveredDevice(device);
          }
        },
      );

      this.isScanning = true;
      this.notifyScanningStarted();

      console.log(`${LOG_TAG} 스캔 시작 성공`);
      return true;
    } catch (error) {
      console.error(`${LOG_TAG} 스캔 시작 오류:`, error);
      this.notifyError('BLE 스캔 시작에 실패했습니다.');
      return false;
    }
  }

  /**
   * 스캔 중지 함수
   */
  public async stopScanning(): Promise<boolean> {
    if (!this.isScanning) {
      return true;
    }

    try {
      // 실제 구현에서는 react-native-ble-plx 사용
      console.log(`${LOG_TAG} 스캔 중지`);

      // 실제 사용 시에는 아래 코드 활성화
      if (this.bleManager) {
        this.bleManager.stopDeviceScan();
      }

      // 시뮬레이션 코드
      this.isScanning = false;
      this.notifyScanningStopped();

      console.log(`${LOG_TAG} 스캔 중지 성공`);
      return true;
    } catch (error) {
      console.error(`${LOG_TAG} 스캔 중지 오류:`, error);
      this.notifyError('BLE 스캔 중지에 실패했습니다.');
      return false;
    }
  }

  /**
   * 장치 발견 처리 함수
   *
   * @param device - 발견된 BLE 장치
   */
  private handleDiscoveredDevice(device: any): void {
    try {
      console.log(
        `${LOG_TAG} 장치 발견: ${device.id}, 제조사 데이터 있음: ${!!device.manufacturerData}`,
      );

      // 제조사 데이터가 없으면 처리하지 않음
      if (!device.manufacturerData) {
        return;
      }

      // 제조사 데이터 파싱
      const iBeaconData = parseIBeaconData(device.manufacturerData);

      // 파싱 실패 시 더미 데이터 사용 (테스트 환경에서만)
      if (!iBeaconData) {
        console.warn(
          `${LOG_TAG} iBeacon 데이터 파싱 실패, 제조사 데이터: ${device.manufacturerData}`,
        );
        return;
      }

      const discoveredDevice: DiscoveredDevice = {
        id: device.id || 'unknown-id',
        name: device.name || 'Unknown Device',
        rssi: device.rssi || -100,
        iBeaconData,
        lastSeen: new Date(),
      };

      console.log(`${LOG_TAG} 발견한 UUID: ${iBeaconData.uuid}`);
      console.log(`${LOG_TAG} 내 UUID: ${this.uuid}`);

      // UUID가 내 UUID와 다를 경우만 처리 (내 신호는 무시)
      if (iBeaconData.uuid !== this.uuid) {
        this.discoveredPeers.set(device.id, discoveredDevice);
        this.notifyPeerDiscovered(discoveredDevice);

        console.log(`${LOG_TAG} 상대방 기기 발견:`, {
          id: device.id,
          uuid: iBeaconData.uuid,
          major: iBeaconData.major,
          minor: iBeaconData.minor,
        });

        // 피어를 발견하면 스캔 중지 (요구사항에 따라)
        this.stopScanning();
      } else {
        console.log(`${LOG_TAG} 내 기기 신호 무시`);
      }
    } catch (error) {
      console.error(`${LOG_TAG} 장치 처리 오류:`, error);
    }
  }

  /**
   * 리스너 등록 함수
   *
   * @param listener - BLE 서비스 이벤트 리스너
   * @returns 리스너 제거 함수
   */
  public addListener(listener: BleServiceListener): () => void {
    this.listeners.push(listener);

    // 리스너 제거 함수 반환
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 서비스 정리 함수
   */
  public async cleanup(): Promise<void> {
    try {
      await this.stopAdvertising();
      await this.stopScanning();
      this.discoveredPeers.clear();
      this.listeners = [];
      this.isInitialized = false;
      console.log(`${LOG_TAG} 정리 완료`);
    } catch (error) {
      console.error(`${LOG_TAG} 정리 중 오류:`, error);
    }
  }

  // 이벤트 알림 함수들
  private notifyPeerDiscovered(device: DiscoveredDevice): void {
    this.listeners.forEach((listener) => {
      if (listener.onPeerDiscovered) {
        listener.onPeerDiscovered(device);
      }
    });
  }

  private notifyPeerLost(deviceId: string): void {
    this.listeners.forEach((listener) => {
      if (listener.onPeerLost) {
        listener.onPeerLost(deviceId);
      }
    });
  }

  private notifyAdvertisingStarted(uuid: string): void {
    this.listeners.forEach((listener) => {
      if (listener.onAdvertisingStarted) {
        listener.onAdvertisingStarted(uuid);
      }
    });
  }

  private notifyAdvertisingStopped(): void {
    this.listeners.forEach((listener) => {
      if (listener.onAdvertisingStopped) {
        listener.onAdvertisingStopped();
      }
    });
  }

  private notifyScanningStarted(): void {
    this.listeners.forEach((listener) => {
      if (listener.onScanningStarted) {
        listener.onScanningStarted();
      }
    });
  }

  private notifyScanningStopped(): void {
    this.listeners.forEach((listener) => {
      if (listener.onScanningStopped) {
        listener.onScanningStopped();
      }
    });
  }

  private notifyError(error: string): void {
    this.listeners.forEach((listener) => {
      if (listener.onError) {
        listener.onError(error);
      }
    });
  }

  // 상태 조회 함수들
  public getMyUUID(): string {
    return this.uuid;
  }

  public isActive(): boolean {
    return this.isAdvertising || this.isScanning;
  }

  public getDiscoveredPeers(): DiscoveredDevice[] {
    return Array.from(this.discoveredPeers.values());
  }
}

// 싱글톤 인스턴스 내보내기
export default BleService.getInstance();
