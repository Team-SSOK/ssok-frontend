import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { parseIBeaconData } from '@/utils/ble';

// BLE 스캐너 상태 타입 정의
type ScannerState = {
  isScanning: boolean;
  discoveredDevices: Map<string, DiscoveredDevice>;
  error: string | null;
};

// 발견된 장치 타입 정의
export type DiscoveredDevice = {
  id: string;
  name: string | null;
  rssi: number | null;
  iBeaconData: {
    uuid: string;
    major: number;
    minor: number;
    txPower: number;
  } | null;
  lastSeen: Date;
};

// iBeacon UUID 발견 시 콜백 타입 정의
type OnDeviceDiscoveredCallback = (device: DiscoveredDevice) => void;

/**
 * BLE 스캐닝 기능을 위한 커스텀 훅
 * Central 모드로 작동하여 주변 iBeacon 장치를 스캔
 */
export const useBleScanner = () => {
  // BLE 매니저 인스턴스
  const [bleManager] = useState(() => new BleManager());

  // 스캐너 상태 관리
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    discoveredDevices: new Map<string, DiscoveredDevice>(),
    error: null,
  });

  // 장치 발견 콜백
  const [onDeviceDiscovered, setOnDeviceDiscovered] =
    useState<OnDeviceDiscoveredCallback | null>(null);

  // 장치 검색 시 추적할 목표 UUID
  const [targetUUID, setTargetUUID] = useState<string | null>(null);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (state.isScanning) {
        stopScan();
      }
      // BLE 매니저 정리
      bleManager.destroy();
    };
  }, []);

  /**
   * 위치 권한 요청 함수 (Android)
   *
   * @returns 권한 허용 여부
   */
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // Android 12+ (API 31+)는 BLUETOOTH_SCAN, BLUETOOTH_CONNECT 권한 필요
        if (Platform.Version >= 31) {
          const bluetoothScanGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
              title: '블루투스 스캔 권한',
              message: '주변 Bluetooth 기기를 검색하기 위해 권한이 필요합니다.',
              buttonPositive: '확인',
            },
          );

          const bluetoothConnectGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
              title: '블루투스 연결 권한',
              message: 'Bluetooth 기기에 연결하기 위해 권한이 필요합니다.',
              buttonPositive: '확인',
            },
          );

          return (
            bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED &&
            bluetoothConnectGranted === PermissionsAndroid.RESULTS.GRANTED
          );
        }
        // Android 6.0 (API 23) ~ Android 11은 위치 권한 필요
        else if (Platform.Version >= 23) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: '위치 권한',
              message: 'Bluetooth 기기를 찾기 위해 위치 권한이 필요합니다.',
              buttonPositive: '확인',
            },
          );

          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }

        // Android 6.0 미만은 런타임 권한 불필요
        return true;
      } catch (error) {
        console.error('[BLE Scanner] 권한 요청 오류:', error);
        return false;
      }
    } else {
      // iOS는 info.plist에서 권한 설정 (런타임 권한 요청 필요 없음)
      return true;
    }
  };

  /**
   * BLE 스캔 시작 함수
   *
   * @param callback - 장치 발견 시 호출할 콜백
   * @param targetUuid - 특정 UUID만 필터링하려면 지정
   * @returns 스캔 시작 성공 여부
   */
  const startScan = async (
    callback?: OnDeviceDiscoveredCallback,
    targetUuid?: string,
  ): Promise<boolean> => {
    try {
      // 이미 스캔 중이면 중지
      if (state.isScanning) {
        await stopScan();
      }

      // 콜백 설정
      if (callback) {
        setOnDeviceDiscovered(() => callback);
      }

      // 목표 UUID 설정
      if (targetUuid) {
        setTargetUUID(targetUuid);
      } else {
        setTargetUUID(null);
      }

      // 권한 확인
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setState((prev) => ({
          ...prev,
          error: '블루투스 스캔 권한이 거부되었습니다.',
        }));
        return false;
      }

      // 디바이스 목록 초기화
      setState((prev) => ({
        ...prev,
        discoveredDevices: new Map(),
        isScanning: true,
        error: null,
      }));

      console.log('[BLE Scanner] 스캔 시작');

      // BLE 스캔 시작
      bleManager.startDeviceScan(
        null, // 모든 서비스 UUID 스캔
        { allowDuplicates: false }, // 중복 장치 필터링
        (error, device) => {
          // 오류 처리
          if (error) {
            console.error('[BLE Scanner] 스캔 오류:', error);
            setState((prev) => ({
              ...prev,
              isScanning: false,
              error: `스캔 중 오류 발생: ${error.message}`,
            }));
            return;
          }

          // 장치 발견
          if (device) {
            handleDiscoveredDevice(device);
          }
        },
      );

      return true;
    } catch (error) {
      console.error('[BLE Scanner] 스캔 시작 오류:', error);
      setState((prev) => ({
        ...prev,
        isScanning: false,
        error: '스캔 시작에 실패했습니다.',
      }));
      return false;
    }
  };

  /**
   * 발견된 장치 처리 함수
   *
   * @param device - BLE-PLX에서 발견한 장치
   */
  const handleDiscoveredDevice = (device: Device) => {
    // 제조사 데이터 파싱
    const iBeaconData = parseIBeaconData(device.manufacturerData);

    // 목표 UUID가 설정되어 있고, iBeacon 데이터가 있을 경우 UUID 필터링
    if (targetUUID && iBeaconData && iBeaconData.uuid !== targetUUID) {
      return;
    }

    // 발견된 iBeacon 정보 로깅
    if (iBeaconData) {
      console.log('[BLE Scanner] iBeacon 발견:', {
        deviceId: device.id,
        uuid: iBeaconData.uuid,
        major: iBeaconData.major,
        minor: iBeaconData.minor,
      });

      // 목표 UUID를 찾았을 경우 스캔 중지
      if (targetUUID && iBeaconData.uuid === targetUUID) {
        console.log('[BLE Scanner] 목표 UUID 발견, 스캔 중지');
        stopScan();
      }
    }

    // 발견된 장치 정보 생성
    const discoveredDevice: DiscoveredDevice = {
      id: device.id,
      name: device.name,
      rssi: device.rssi,
      iBeaconData,
      lastSeen: new Date(),
    };

    // 장치 목록 업데이트
    setState((prev) => {
      const updatedDevices = new Map(prev.discoveredDevices);
      updatedDevices.set(device.id, discoveredDevice);
      return {
        ...prev,
        discoveredDevices: updatedDevices,
      };
    });

    // 콜백 호출
    if (onDeviceDiscovered && iBeaconData) {
      onDeviceDiscovered(discoveredDevice);
    }
  };

  /**
   * BLE 스캔 중지 함수
   */
  const stopScan = useCallback((): void => {
    if (state.isScanning) {
      console.log('[BLE Scanner] 스캔 중지');
      bleManager.stopDeviceScan();
      setState((prev) => ({
        ...prev,
        isScanning: false,
      }));
    }
  }, [state.isScanning, bleManager]);

  // API 반환
  return {
    isScanning: state.isScanning,
    discoveredDevices: Array.from(state.discoveredDevices.values()),
    error: state.error,
    startScan,
    stopScan,
  };
};
