import {
  Platform,
  PermissionsAndroid,
  Linking,
  Alert,
  AppState,
} from 'react-native';
import { generateUUID, parseIBeaconData } from '@/utils/ble';
import { DiscoveredDevice } from '@/hooks/useBleScanner';
// BLE 광고 모듈 가져오기 (타입 오류 무시)
// @ts-ignore
import BleAdvertise from 'react-native-ble-advertise';

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
  private appStateSubscription: any = null;

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
      const LOG_TAG = '[BLE Service]';

      // 안드로이드에서는 블루투스 권한 요청
      if (Platform.OS === 'android') {
        try {
          // 권한 요청
          await this.requestBluetoothPermissions();
          console.log(`${LOG_TAG} 권한 요청 완료`);

          // 권한 확인
          const hasPermissions = await this.checkBlePermissions();
          if (!hasPermissions) {
            console.warn(
              `${LOG_TAG} 일부 블루투스 권한이 없습니다. 제한된 기능으로 작동합니다.`,
            );
          }

          // AppState 리스너 등록 - 사용자가 설정에서 돌아올 때 권한 재확인
          this.setupAppStateListener();
        } catch (error) {
          console.warn(`${LOG_TAG} 권한 요청 중 오류:`, error);
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
      console.error('[BLE Service] 초기화 오류:', error);
      this.notifyError('BLE 서비스 초기화에 실패했습니다.');
      return false;
    }
  }

  /**
   * AppState 리스너 설정 - 사용자가 설정 화면에서 돌아올 때 권한 재확인
   */
  private setupAppStateListener(): void {
    // 기존 리스너가 있으면 제거
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    // 새 리스너 등록
    this.appStateSubscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        // 앱이 백그라운드에서 포그라운드로 전환될 때만 처리
        if (nextAppState === 'active') {
          console.log('[BLE Service] 앱이 활성화되었습니다. 권한 재확인 중...');

          // 권한 재확인
          const hasPermissions = await this.checkBlePermissions();
          if (hasPermissions) {
            console.log('[BLE Service] 필요한 모든 권한이 허용됨');

            // 광고 중이었다면 재시작 시도
            if (this.isAdvertising) {
              console.log('[BLE Service] 광고 재시작 시도');
              // 광고 중지 후 재시작
              await this.stopAdvertising();
              await this.startAdvertising();
            }
          }
        }
      },
    );
  }

  /**
   * 안드로이드 블루투스 권한 요청
   */
  private async requestBluetoothPermissions(): Promise<void> {
    // Android SDK 버전 확인
    const sdkVersion = Platform.OS === 'android' ? Platform.Version : 0;
    const LOG_TAG = '[BLE Service]';

    console.log(`${LOG_TAG} Android SDK Version: ${sdkVersion}`);

    // Android 14 (API 34) 이상
    if (Platform.OS === 'android' && sdkVersion >= 34) {
      console.log(`${LOG_TAG} 안드로이드 14+ 권한 요청`);

      // 최신 안드로이드에서는 권한을 개별적으로 요청하여 더 명확한 피드백 제공
      // BLUETOOTH_CONNECT 권한 먼저 요청
      const connectResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: '블루투스 연결 권한',
          message: '블루투스 기기에 연결하기 위해 권한이 필요합니다.',
          buttonPositive: '확인',
        },
      );

      console.log(`${LOG_TAG} BLUETOOTH_CONNECT 권한 결과: ${connectResult}`);

      // BLUETOOTH_SCAN 권한 요청
      const scanResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: '블루투스 스캔 권한',
          message: '주변 블루투스 기기를 검색하기 위해 권한이 필요합니다.',
          buttonPositive: '확인',
        },
      );

      console.log(`${LOG_TAG} BLUETOOTH_SCAN 권한 결과: ${scanResult}`);

      // BLUETOOTH_ADVERTISE 권한 요청
      const advertiseResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        {
          title: '블루투스 광고 권한',
          message: '내 기기를 다른 기기에 표시하기 위해 권한이 필요합니다.',
          buttonPositive: '확인',
        },
      );

      console.log(
        `${LOG_TAG} BLUETOOTH_ADVERTISE 권한 결과: ${advertiseResult}`,
      );

      // 위치 권한 요청 (일부 기기에서 필요)
      const locationResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '위치 접근 권한',
          message: '블루투스 기기를 검색하기 위해 위치 접근 권한이 필요합니다.',
          buttonPositive: '확인',
        },
      );

      console.log(`${LOG_TAG} 위치 권한 결과: ${locationResult}`);

      // 권한이 'never_ask_again'인 경우 설정 화면 안내
      if (advertiseResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.log(`${LOG_TAG} 광고 권한이 '다시 묻지 않음'으로 설정됨`);
        this.showPermissionSettings('블루투스 광고', true);
      }
    }
    // 안드로이드 12-13 (API 31-33)
    else if (Platform.OS === 'android' && sdkVersion >= 31 && sdkVersion < 34) {
      console.log(`${LOG_TAG} 안드로이드 12-13 권한 요청`);

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

        // 광고 권한이 'never_ask_again'인 경우
        if (
          permission === PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE &&
          result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          this.showPermissionSettings('블루투스 광고');
        }
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
   * 사용자에게 앱 설정으로 이동하라는 알림 표시
   */
  private showPermissionSettings(
    permissionType: string,
    forceShow: boolean = false,
  ): void {
    if (Platform.OS !== 'android') return;

    Alert.alert(
      '권한 필요',
      `${permissionType} 기능을 사용하려면 앱 설정에서 권한을 허용해주세요.\n\n설정 > 앱 > ssok > 권한 으로 이동하여 블루투스 권한을 허용해주세요.`,
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
      console.log('[BLE Service] 광고 시작', this.uuid);

      // 코드가 실행되는 환경이 실제 기기라면 광고 시작
      if (Platform.OS === 'android') {
        try {
          // 공식 문서에 따른 구현
          // 광고 시작 전에 회사 ID 설정
          BleAdvertise.setCompanyId(0x00e0);

          // 블루투스 권한 다시 확인
          const hasAdvertisePermission = await this.checkAdvertisePermission();

          if (!hasAdvertisePermission) {
            console.warn('[BLE Service] 블루투스 광고 권한이 없습니다.');

            // 안드로이드 버전에 따라 다른 안내 처리
            const sdkVersion = Platform.OS === 'android' ? Platform.Version : 0;

            if (sdkVersion >= 34) {
              // Android 14+ - App 설정에서 직접 권한 부여 필요
              Alert.alert(
                '광고 권한 필요',
                '안드로이드 14 이상에서는 블루투스 광고를 위해 설정에서 직접 권한을 허용해야 합니다.\n\n설정 > 앱 > ssok > 권한 으로 이동하여 블루투스 권한을 모두 허용해주세요.',
                [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '설정으로 이동',
                    onPress: () => Linking.openSettings(),
                  },
                ],
              );
            } else {
              // 기존 권한 요청 로직
              const permissionStatus = await this.requestAdvertisePermission();

              if (!permissionStatus) {
                this.notifyError(
                  '블루투스 광고 권한이 없어 광고를 시작할 수 없습니다.',
                );
                return false;
              }
            }

            // 권한이 없으면 광고 실패
            return false;
          }

          // 광고 시작
          await BleAdvertise.broadcast(this.uuid, this.major, this.minor);

          this.isAdvertising = true;
          this.notifyAdvertisingStarted(this.uuid);

          console.log('[BLE Service] 광고 시작 성공');
          return true;
        } catch (error) {
          console.error('[BLE Service] 광고 시작 오류:', error);

          // 권한 오류인 경우 사용자에게 설정 화면으로 이동하는 안내 메시지 표시
          if (
            error instanceof Error &&
            (error.message.includes('BLUETOOTH_ADVERTISE permission') ||
              error.message.includes('Missing Manifest.permission'))
          ) {
            // Android 버전 확인
            const sdkVersion = Platform.OS === 'android' ? Platform.Version : 0;
            const isAndroid14OrHigher = sdkVersion >= 34;

            Alert.alert(
              '블루투스 권한 오류',
              isAndroid14OrHigher
                ? '안드로이드 14에서는 설정에서 블루투스 광고 권한을 직접 허용해야 합니다.'
                : '블루투스 권한이 필요합니다.',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '설정으로 이동',
                  onPress: () => Linking.openSettings(),
                },
              ],
            );
          }

          this.notifyError('BLE 광고 시작에 실패했습니다.');
          return false;
        }
      } else {
        // iOS에서는 광고를 지원하지 않음
        return false;
      }
    } catch (error) {
      console.error('[BLE Service] 광고 시작 오류:', error);
      this.notifyError('BLE 광고 시작에 실패했습니다.');
      return false;
    }
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
      console.error('[BLE Service] 권한 확인 오류:', error);
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
      console.error('[BLE Service] 권한 요청 오류:', error);
      return false;
    }
  }

  /**
   * BLUETOOTH_ADVERTISE 권한만 체크
   */
  private async checkAdvertisePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const sdkVersion = Platform.Version;

      // 안드로이드 12 이상에서만 BLUETOOTH_ADVERTISE 권한 확인
      if (sdkVersion >= 31) {
        const hasAdvertisePermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        );

        console.log(
          `[BLE Service] BLUETOOTH_ADVERTISE 권한 상태: ${hasAdvertisePermission}`,
        );
        return hasAdvertisePermission;
      }

      // 안드로이드 11 이하에서는 위치 권한만 확인
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    } catch (error) {
      console.error('[BLE Service] 권한 확인 오류:', error);
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
      console.log('[BLE Service] 광고 중지');

      // 코드가 실행되는 환경이 실제 기기라면 광고 중지
      if (Platform.OS === 'android') {
        try {
          // 광고 중지
          await BleAdvertise.stopBroadcast();

          this.isAdvertising = false;
          this.notifyAdvertisingStopped();

          console.log('[BLE Service] 광고 중지 성공');
          return true;
        } catch (error) {
          console.error('[BLE Service] 광고 중지 오류:', error);
          this.notifyError('BLE 광고 중지에 실패했습니다.');
          return false;
        }
      } else {
        // iOS에서는 광고를 지원하지 않음
        return false;
      }
    } catch (error) {
      console.error('[BLE Service] 광고 중지 오류:', error);
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
      console.log('[BLE Service] 스캔 시작');

      // 스캔 시작 전에 발견된 기기 목록 초기화
      this.discoveredPeers.clear();

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
            console.error('[BLE Service] 스캔 오류:', error);
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

      // 5초 후에 스캔 자동 중지 타이머 설정
      setTimeout(() => {
        if (this.isScanning) {
          console.log('[BLE Service] 5초 스캔 제한 도달, 자동 중지');
          this.stopScanning();
        }
      }, 5000);

      console.log('[BLE Service] 스캔 시작 성공');
      return true;
    } catch (error) {
      console.error('[BLE Service] 스캔 시작 오류:', error);
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
      console.log('[BLE Service] 스캔 중지');

      // 실제 사용 시에는 아래 코드 활성화
      if (this.bleManager) {
        this.bleManager.stopDeviceScan();
      }

      // 시뮬레이션 코드
      this.isScanning = false;
      this.notifyScanningStopped();

      console.log('[BLE Service] 스캔 중지 성공');
      return true;
    } catch (error) {
      console.error('[BLE Service] 스캔 중지 오류:', error);
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
        `[BLE Service] 장치 발견: ${device.id}, 제조사 데이터 있음: ${!!device.manufacturerData}`,
      );

      // 제조사 데이터가 없으면 처리하지 않음
      if (!device.manufacturerData) {
        return;
      }

      // 제조사 데이터 파싱
      const iBeaconData = parseIBeaconData(device.manufacturerData);

      // iBeacon 데이터 파싱 실패 시 무시 (iBeacon 형식이 아닌 일반 BLE 기기)
      if (!iBeaconData) {
        console.warn(
          `[BLE Service] iBeacon 데이터 파싱 실패, 일반 BLE 기기로 판단하여 무시`,
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

      console.log(`[BLE Service] 발견한 UUID: ${iBeaconData.uuid}`);
      console.log(`[BLE Service] 내 UUID: ${this.uuid}`);

      // UUID가 내 UUID와 다를 경우만 처리 (내 신호는 무시)
      if (iBeaconData.uuid !== this.uuid) {
        this.discoveredPeers.set(device.id, discoveredDevice);
        this.notifyPeerDiscovered(discoveredDevice);

        console.log('[BLE Service] 상대방 기기 발견:', {
          id: device.id,
          uuid: iBeaconData.uuid,
          major: iBeaconData.major,
          minor: iBeaconData.minor,
        });

        // 피어를 발견하면 스캔 중지 안함 - 5초간 계속 스캔
      } else {
        console.log('[BLE Service] 내 기기 신호 무시');
      }
    } catch (error) {
      console.error('[BLE Service] 장치 처리 오류:', error);
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

      // AppState 리스너 제거
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }

      this.isInitialized = false;
      console.log('[BLE Service] 정리 완료');
    } catch (error) {
      console.error('[BLE Service] 정리 중 오류:', error);
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
