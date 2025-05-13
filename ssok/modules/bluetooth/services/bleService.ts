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
  private LOG_TAG = '[BLE Service]';

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

  // 중복 로그 방지를 위한 마지막 로그 시간 확인
  private loggedDevices: Map<string, number> = new Map();
  private discoveredLogTimes: Map<string, number> = new Map();

  // 클래스 상단에 속성 추가
  private deviceLastSeen: Map<string, number> = new Map();
  private deviceActivityCheck: number | null = null;

  /**
   * 생성자 - 직접 호출하지 말고 getInstance() 사용
   */
  private constructor() {
    // UUID는 initialize에서 설정
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
    const FUNC_NAME = 'initialize()';

    try {
      // UUID 설정 (옵션으로 전달된 UUID가 있으면 사용, 없으면 새로 생성)
      this.uuid = options?.advertisingUUID || generateUUID();
      console.log(`${this.LOG_TAG}-${FUNC_NAME} UUID 설정:`, this.uuid);

      // 안드로이드에서는 블루투스 권한 요청
      if (Platform.OS === 'android') {
        try {
          // 권한 요청
          await this.requestBluetoothPermissions();
          console.log(`${this.LOG_TAG}-${FUNC_NAME} 권한 요청 완료`);

          // 권한 확인
          const hasPermissions = await this.checkBlePermissions();
          if (!hasPermissions) {
            console.warn(
              `${this.LOG_TAG}-${FUNC_NAME} 일부 블루투스 권한이 없습니다. 제한된 기능으로 작동합니다.`,
            );
          }

          // AppState 리스너 등록 - 사용자가 설정에서 돌아올 때 권한 재확인
          this.setupAppStateListener();
        } catch (error) {
          console.warn(
            `${this.LOG_TAG}-${FUNC_NAME} 권한 요청 중 오류:`,
            error,
          );
        }
      }

      // 옵션에서 설정값 가져오기
      if (options) {
        if (options.major !== undefined) {
          this.major = options.major;
        }
        if (options.minor !== undefined) {
          this.minor = options.minor;
        }
      }

      console.log(`${this.LOG_TAG}-${FUNC_NAME} 초기화 완료:`, {
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
      console.error(`${this.LOG_TAG}-${FUNC_NAME} 초기화 오류:`, error);
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
    const FUNC_NAME = 'requestBluetoothPermissions()';

    console.log(
      `${this.LOG_TAG}-${FUNC_NAME} Android SDK Version: ${sdkVersion}`,
    );

    // Android 14 (API 34) 이상
    if (Platform.OS === 'android' && sdkVersion >= 34) {
      console.log(`${this.LOG_TAG}-${FUNC_NAME} 안드로이드 14+ 권한 요청`);

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

      console.log(
        `${this.LOG_TAG}-${FUNC_NAME} BLUETOOTH_CONNECT 권한 결과: ${connectResult}`,
      );

      // BLUETOOTH_SCAN 권한 요청
      const scanResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: '블루투스 스캔 권한',
          message: '주변 블루투스 기기를 검색하기 위해 권한이 필요합니다.',
          buttonPositive: '확인',
        },
      );

      console.log(
        `${this.LOG_TAG}-${FUNC_NAME} BLUETOOTH_SCAN 권한 결과: ${scanResult}`,
      );

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
        `${this.LOG_TAG}-${FUNC_NAME} BLUETOOTH_ADVERTISE 권한 결과: ${advertiseResult}`,
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

      console.log(
        `${this.LOG_TAG}-${FUNC_NAME} 위치 권한 결과: ${locationResult}`,
      );

      // 권한이 'never_ask_again'인 경우 설정 화면 안내
      if (advertiseResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.log(
          `${this.LOG_TAG}-${FUNC_NAME} 광고 권한이 '다시 묻지 않음'으로 설정됨`,
        );
        this.showPermissionSettings('블루투스 광고', true);
      }
    }
    // 안드로이드 12-13 (API 31-33)
    else if (Platform.OS === 'android' && sdkVersion >= 31 && sdkVersion < 34) {
      console.log(`${this.LOG_TAG}-${FUNC_NAME} 안드로이드 12-13 권한 요청`);

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
        console.log(
          `${this.LOG_TAG}-${FUNC_NAME} 권한 결과: ${permission} - ${result}`,
        );

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
      console.log(`${this.LOG_TAG}-${FUNC_NAME} 안드로이드 11 이하 권한 요청`);

      // 위치 권한만 요청 (블루투스 스캔에 필요)
      const locationResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '위치 접근 권한',
          message: '블루투스 기기를 검색하기 위해 위치 접근 권한이 필요합니다.',
          buttonPositive: '확인',
        },
      );

      console.log(
        `${this.LOG_TAG}-${FUNC_NAME} 위치 권한 결과: ${locationResult}`,
      );
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
   * 블루투스 관련 동작에서 발생하는 오류를 일관되게 처리하는 헬퍼 함수
   */
  private handleBleError(action: string, error: any): boolean {
    console.error(`[BLE Service] ${action} 오류:`, error);

    // 블루투스 권한 관련 오류 확인
    if (error instanceof Error) {
      const errorMsg = error.message || '';

      // 권한 오류인 경우
      if (
        errorMsg.includes('BLUETOOTH_') ||
        errorMsg.includes('Missing Manifest.permission')
      ) {
        // Android 버전 확인
        const sdkVersion = Platform.OS === 'android' ? Platform.Version : 0;
        const isAndroid14OrHigher = sdkVersion >= 34;

        Alert.alert(
          '블루투스 권한 오류',
          isAndroid14OrHigher
            ? '안드로이드 14에서는 설정에서 블루투스 권한을 직접 허용해야 합니다.'
            : '블루투스 권한이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: () => Linking.openSettings(),
            },
          ],
        );

        this.notifyError(`블루투스 권한 오류: ${errorMsg}`);
        return false;
      }

      // 블루투스 비활성화 상태 오류인 경우
      if (
        errorMsg.includes('bluetooth') &&
        errorMsg.toLowerCase().includes('disabled')
      ) {
        this.openBluetoothSettings();
        return false;
      }
    }

    // 기타 일반 오류
    this.notifyError(`${action}에 실패했습니다.`);
    return false;
  }

  /**
   * BleManager 초기화 함수
   */
  private async initializeBleManager(): Promise<boolean> {
    try {
      if (!this.bleManager) {
        const { BleManager } = require('react-native-ble-plx');
        this.bleManager = new BleManager();
      }
      return true;
    } catch (error) {
      return this.handleBleError('BleManager 초기화', error);
    }
  }

  /**
   * 블루투스 활성화 여부 확인
   */
  private async isBluetoothEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      await this.initializeBleManager();
      const state = await this.bleManager.state();
      return state === 'PoweredOn';
    } catch (error) {
      console.warn('[BLE Service] 블루투스 상태 확인 오류:', error);
      return false;
    }
  }

  /**
   * 블루투스 설정 화면 열기
   */
  public openBluetoothSettings(): void {
    Alert.alert(
      '블루투스가 꺼져 있습니다',
      '블루투스 기능을 사용하려면 블루투스를 켜야 합니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '블루투스 설정',
          onPress: () =>
            Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS'),
        },
      ],
    );
  }

  /**
   * 광고 시작 함수 (내 UUID 광고)
   */
  public async startAdvertising(): Promise<boolean> {
    // 기본 상태 확인
    if (!this.isInitialized) {
      this.notifyError('BLE 서비스가 초기화되지 않았습니다.');
      return false;
    }

    if (this.isAdvertising) {
      return true;
    }

    // iOS는 지원하지 않음
    if (Platform.OS !== 'android') {
      this.notifyError('BLE 광고는 Android 기기에서만 지원됩니다.');
      return false;
    }

    // 블루투스 상태 확인
    const bluetoothEnabled = await this.isBluetoothEnabled();
    if (!bluetoothEnabled) {
      console.log('[BLE Service] 블루투스가 비활성화 상태입니다.');
      this.openBluetoothSettings();
      return false;
    }

    // 광고 권한 확인
    const hasAdvertisePermission = await this.checkAdvertisePermission();
    if (!hasAdvertisePermission) {
      console.warn('[BLE Service] 블루투스 광고 권한이 없습니다.');

      // 안드로이드 버전에 따른 처리
      const sdkVersion = Platform.OS === 'android' ? Platform.Version : 0;
      if (sdkVersion >= 34) {
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
      return false;
    }

    try {
      // 광고 시작 전에 회사 ID 설정
      BleAdvertise.setCompanyId(0x00e0);

      // 광고 시작
      await BleAdvertise.broadcast(this.uuid, this.major, this.minor);

      this.isAdvertising = true;
      this.notifyAdvertisingStarted(this.uuid);

      console.log('[BLE Service] 광고 시작 성공:', this.uuid);
      return true;
    } catch (error) {
      return this.handleBleError('광고 시작', error);
    }
  }

  /**
   * 광고 중지 함수
   */
  public async stopAdvertising(): Promise<boolean> {
    if (!this.isAdvertising) {
      return true;
    }

    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      await BleAdvertise.stopBroadcast();
      this.isAdvertising = false;
      this.notifyAdvertisingStopped();

      console.log('[BLE Service] 광고 중지 성공');
      return true;
    } catch (error) {
      return this.handleBleError('광고 중지', error);
    }
  }

  /**
   * 스캔 시작 함수 (다른 UUID 검색)
   */
  public async startScanning(): Promise<boolean> {
    // 기본 상태 확인
    if (!this.isInitialized) {
      this.notifyError('BLE 서비스가 초기화되지 않았습니다.');
      return false;
    }

    if (this.isScanning) {
      return true;
    }

    // 블루투스 상태 확인
    const bluetoothEnabled = await this.isBluetoothEnabled();
    if (!bluetoothEnabled) {
      console.log('[BLE Service] 블루투스가 비활성화 상태입니다.');
      this.openBluetoothSettings();
      return false;
    }

    // BleManager 초기화
    if (!(await this.initializeBleManager())) {
      return false;
    }

    // 스캔 시작 전에 발견된 기기 목록 초기화
    this.discoveredPeers.clear();

    try {
      // 스캔 시작 - 중지 시간 제한 없이 계속 실행
      this.bleManager.startDeviceScan(
        null, // 모든 서비스 UUID 스캔
        { allowDuplicates: true }, // 중복 장치 허용 (신호 업데이트 위해)
        (error: any, device: any) => {
          if (error) {
            console.error('[BLE Service] 스캔 중 오류:', error);
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

      // 기기 활동 감시 시작
      this.startDeviceActivityMonitoring();

      // 5초 제한 타이머 제거 - 지속적으로 스캔하도록 변경
      console.log('[BLE Service] 지속적 스캔 시작 (제한 없음)');

      return true;
    } catch (error) {
      return this.handleBleError('스캔 시작', error);
    }
  }

  /**
   * 스캔 중지 함수
   */
  public async stopScanning(): Promise<boolean> {
    if (!this.isScanning) {
      return true;
    }

    // 블루투스가 꺼져 있으면 스캔 상태만 업데이트
    const bluetoothEnabled = await this.isBluetoothEnabled();
    if (!bluetoothEnabled) {
      this.isScanning = false;
      this.notifyScanningStopped();
      return true;
    }

    try {
      if (this.bleManager) {
        this.bleManager.stopDeviceScan();
      }

      this.isScanning = false;
      this.notifyScanningStopped();

      // 기기 활동 감시 중지
      this.stopDeviceActivityMonitoring();

      console.log('[BLE Service] 스캔 중지 성공');
      return true;
    } catch (error) {
      return this.handleBleError('스캔 중지', error);
    }
  }

  /**
   * 장치 발견 처리 함수
   */
  private handleDiscoveredDevice(device: any): void {
    // 제조사 데이터가 없으면 처리하지 않음
    if (!device.manufacturerData) {
      return;
    }

    try {
      // 제조사 데이터 파싱
      const iBeaconData = parseIBeaconData(device.manufacturerData);

      // iBeacon 데이터 파싱 실패 시 무시 (iBeacon 형식이 아닌 일반 BLE 기기)
      if (!iBeaconData) {
        // 같은 기기에 대한 로그 반복 방지 (마지막 로그 시간 기록)
        if (!this.loggedDevices) {
          this.loggedDevices = new Map<string, number>();
        }

        const now = Date.now();
        const lastLogTime = this.loggedDevices.get(device.id) || 0;

        // 같은 기기에 대해 최소 5초 간격으로만 로그 출력
        if (now - lastLogTime > 5000) {
          // console.warn(
          //   '[BLE Service] iBeacon 데이터 파싱 실패, 일반 BLE 기기로 판단하여 무시',
          // );
          this.loggedDevices.set(device.id, now);
        }
        return;
      }

      // 기기 정보 구성
      const discoveredDevice: DiscoveredDevice = {
        id: device.id || 'unknown-id',
        name: device.name || 'Unknown Device',
        rssi: device.rssi || -100,
        iBeaconData,
        lastSeen: new Date(),
      };

      // UUID가 내 UUID와 다를 경우만 처리 (내 신호는 무시)
      if (iBeaconData.uuid !== this.uuid) {
        const isNewDevice = !this.discoveredPeers.has(device.id);

        // 기기 마지막 발견 시간 업데이트
        this.deviceLastSeen.set(device.id, Date.now());

        // 중복 로그 방지를 위한 마지막 로그 시간 확인
        if (!this.discoveredLogTimes) {
          this.discoveredLogTimes = new Map<string, number>();
        }

        const now = Date.now();
        const lastLogTime = this.discoveredLogTimes.get(device.id) || 0;

        // 새 기기이거나 마지막 로그로부터 3초 이상 지났을 때만 로그
        if (isNewDevice || now - lastLogTime > 3000) {
          console.log('[BLE Service] 상대방 기기 발견:', {
            id: device.id,
            uuid: iBeaconData.uuid,
            major: iBeaconData.major,
            minor: iBeaconData.minor,
            rssi: device.rssi,
          });

          // 로그 시간 업데이트
          this.discoveredLogTimes.set(device.id, now);
        }

        // 기기 정보 저장
        this.discoveredPeers.set(device.id, discoveredDevice);

        // 중요: 기기가 발견될 때마다 항상 이벤트 발생
        // RSSI 필터링을 제거하여 모든 업데이트가 UI에 반영되도록 함
        this.notifyPeerDiscovered(discoveredDevice);
      }
    } catch (error) {
      console.warn('[BLE Service] 장치 처리 오류:', error);
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
    const FUNC_NAME = 'cleanup()';
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
      console.log(`${this.LOG_TAG}-${FUNC_NAME} 정리 완료`);
    } catch (error) {
      console.error(`${this.LOG_TAG}-${FUNC_NAME} 정리 중 오류:`, error);
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

  /**
   * 블루투스 활성화 여부 확인
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
   * 기기 활동 감시 시작 (주기적으로 비활성 기기 확인)
   */
  private startDeviceActivityMonitoring(): void {
    // 이미 실행 중인 경우 중지
    if (this.deviceActivityCheck) {
      clearInterval(this.deviceActivityCheck);
    }

    // 2초마다 비활성 기기 확인
    this.deviceActivityCheck = setInterval(() => {
      if (!this.isScanning) return;

      const now = Date.now();
      const inactiveDeviceIds: string[] = [];

      // 모든 발견된 기기 확인
      this.deviceLastSeen.forEach((lastSeen, deviceId) => {
        // 마지막으로 본 지 3초 이상 지난 기기는 비활성으로 간주
        if (now - lastSeen > 3000) {
          inactiveDeviceIds.push(deviceId);
        }
      });

      // 비활성 기기 처리
      inactiveDeviceIds.forEach((deviceId) => {
        // 기기 정보 가져오기
        const device = this.discoveredPeers.get(deviceId);

        if (device) {
          // 비활성 기기 제거
          this.discoveredPeers.delete(deviceId);
          this.deviceLastSeen.delete(deviceId);

          // 기기 사라짐 이벤트 발생
          console.log(`[BLE Service] 기기 광고 중단 감지: ${deviceId}`);
          this.notifyPeerLost(deviceId);
        }
      });
    }, 2000);
  }

  /**
   * 기기 활동 감시 중지
   */
  private stopDeviceActivityMonitoring(): void {
    if (this.deviceActivityCheck) {
      clearInterval(this.deviceActivityCheck);
      this.deviceActivityCheck = null;
    }
  }
}

// 싱글톤 인스턴스 내보내기
export default BleService.getInstance();
