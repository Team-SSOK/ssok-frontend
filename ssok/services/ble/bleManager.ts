import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const BleManagerModule = NativeModules.BleManager;
export const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// BLE Manager 초기화
export const initBleManager = async (): Promise<boolean> => {
  try {
    console.log('[BLE] Initializing BLE Manager...');
    // BLE 모듈 정보 로깅
    console.log('[BLE] Available BLE Module methods:', Object.keys(BleManager));
    console.log('[BLE] Platform:', Platform.OS, Platform.Version);

    await BleManager.start({ showAlert: false });
    console.log('[BLE] BLE Manager initialized successfully');
    return true;
  } catch (error) {
    console.error('[BLE] Failed to initialize BLE Manager:', error);
    return false;
  }
};

// 블루투스 상태 확인 함수
export const checkBluetoothState = async (): Promise<boolean> => {
  try {
    console.log('[BLE] Checking Bluetooth state...');
    const state = await BleManager.checkState();
    console.log('[BLE] Current Bluetooth state:', state);

    // 'on'은 블루투스가 켜져 있음을 의미
    return state === 'on';
  } catch (error) {
    console.error('[BLE] Error checking Bluetooth state:', error);
    return false;
  }
};

// 블루투스 활성화 (Android only)
export const enableBluetooth = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      console.log('[BLE] Enabling Bluetooth...');
      await BleManager.enableBluetooth();
      console.log('[BLE] Bluetooth enabled successfully');

      // 상태 다시 확인
      const state = await BleManager.checkState();
      console.log('[BLE] Bluetooth state after enabling:', state);

      return state === 'on';
    }
    return false;
  } catch (error) {
    console.error('[BLE] Failed to enable Bluetooth:', error);
    return false;
  }
};

// BLE 스캔 시작
export const startScan = async (
  serviceUUIDs: string[] = [],
  seconds: number = 5,
  allowDuplicates: boolean = true,
): Promise<boolean> => {
  try {
    console.log('[BLE] Starting scan with params:', {
      serviceUUIDs,
      seconds,
      allowDuplicates,
    });

    // 스캔 전 상태 확인
    const state = await BleManager.checkState();
    if (state !== 'on') {
      console.error('[BLE] Cannot start scan, Bluetooth is not enabled');
      return false;
    }

    await BleManager.scan(serviceUUIDs, seconds, allowDuplicates);
    console.log(`[BLE] Scan started (timeout: ${seconds}s)`);

    return true;
  } catch (error) {
    console.error('[BLE] Failed to start scan:', error);
    return false;
  }
};

// BLE 스캔 중지
export const stopScan = async (): Promise<boolean> => {
  try {
    console.log('[BLE] Stopping scan...');
    await BleManager.stopScan();
    console.log('[BLE] Scan stopped');
    return true;
  } catch (error) {
    console.error('[BLE] Failed to stop scan:', error);
    return false;
  }
};

// 디바이스 연결
export const connectToDevice = async (
  peripheralId: string,
): Promise<boolean> => {
  try {
    console.log(`[BLE] Connecting to device: ${peripheralId}...`);
    await BleManager.connect(peripheralId);
    console.log(`[BLE] Connected to device: ${peripheralId}`);
    return true;
  } catch (error) {
    console.error(`[BLE] Failed to connect to device ${peripheralId}:`, error);
    return false;
  }
};

// 디바이스 연결 해제
export const disconnectFromDevice = async (
  peripheralId: string,
): Promise<boolean> => {
  try {
    console.log(`[BLE] Disconnecting from device: ${peripheralId}...`);
    await BleManager.disconnect(peripheralId);
    console.log(`[BLE] Disconnected from device: ${peripheralId}`);
    return true;
  } catch (error) {
    console.error(
      `[BLE] Failed to disconnect from device ${peripheralId}:`,
      error,
    );
    return false;
  }
};

// 주변 장치 가져오기 테스트
export const getConnectedPeripherals = async (): Promise<any[]> => {
  try {
    console.log('[BLE] Getting connected peripherals...');
    const peripherals = await BleManager.getConnectedPeripherals([]);
    console.log('[BLE] Connected peripherals:', peripherals);
    return peripherals;
  } catch (error) {
    console.error('[BLE] Failed to get connected peripherals:', error);
    return [];
  }
};

// 주변 장치 스캔 결과 확인
export const logScanResults = async () => {
  try {
    console.log('[BLE] Getting discovered peripherals...');
    // @ts-ignore - 이 메서드가 타입 정의에 없을 수 있음
    const peripherals = await BleManager.getDiscoveredPeripherals();
    console.log('[BLE] Discovered peripherals:', peripherals);
    return peripherals;
  } catch (error) {
    console.error('[BLE] Failed to get discovered peripherals:', error);
    return [];
  }
};

// 현재 운영체제 정보 로깅
console.log(
  '[BLE] BLE Manager module loaded on',
  Platform.OS,
  Platform.Version,
);
