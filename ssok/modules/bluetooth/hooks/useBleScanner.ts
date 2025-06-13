import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { parseIBeaconData } from '@/utils/ble';
import { useBluetoothStore } from '../stores/bluetoothStore';
import { useFocusEffect } from 'expo-router';

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
  const [bleManager] = useState(() => new BleManager());
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addOrUpdateDevice = useBluetoothStore(s => s.addOrUpdateDevice);
  const LOG_TAG = '[useBleScanner]';

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    const permissions =
      Platform.Version >= 31
        ? [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]
        : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

    try {
      const results = await PermissionsAndroid.requestMultiple(permissions);
      const allGranted = Object.values(results).every(
        r => r === PermissionsAndroid.RESULTS.GRANTED,
      );

      if (!allGranted) {
        const neverAskAgain = Object.values(results).some(
          r => r === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        );
        if (neverAskAgain) {
          Alert.alert(
            '권한 필요',
            '주변 기기를 찾으려면 앱 설정에서 블루투스 및 위치 권한을 허용해야 합니다.',
            [
              { text: '취소', style: 'cancel' },
              { text: '설정으로 이동', onPress: () => Linking.openSettings() },
            ],
          );
        }
      }
      return allGranted;
    } catch (e) {
      console.error(`${LOG_TAG} 권한 요청 오류:`, e);
      return false;
    }
  }, []);

  const startScan = useCallback(async () => {
    setError(null);
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      const msg = '블루투스 스캔 권한이 없습니다.';
      setError(msg);
      console.log(`${LOG_TAG} ${msg}`);
      return;
    }

    // 블루투스 상태 확인
    const state = await bleManager.state();
    if (state !== 'PoweredOn') {
      const msg = '블루투스가 꺼져있습니다. 활성화 후 다시 시도해주세요.';
      setError(msg);
      Alert.alert('블루투스 비활성화', msg);
      return;
    }

    console.log(`${LOG_TAG} 스캔 시작`);
    setIsScanning(true);

    bleManager.startDeviceScan(null, { allowDuplicates: true }, (err, dev) => {
      if (err) {
        setError(err.message);
        setIsScanning(false);
        console.error(`${LOG_TAG} 스캔 오류:`, err);
        return;
      }
      if (dev?.manufacturerData) {
        const iBeaconData = parseIBeaconData(dev.manufacturerData);
        if (iBeaconData) {
          addOrUpdateDevice({
            id: dev.id,
            name: dev.name,
            rssi: dev.rssi,
            iBeaconData,
            lastSeen: new Date(),
          });
        }
      }
    });
  }, [bleManager, requestPermissions, addOrUpdateDevice]);

  const stopScan = useCallback(() => {
    bleManager.stopDeviceScan();
    setIsScanning(false);
    console.log(`${LOG_TAG} 스캔 중지`);
  }, [bleManager]);
  
  // 화면 포커스 시 스캔 시작, 블러 시 중지
  useFocusEffect(
    useCallback(() => {
      startScan();
      return () => {
        stopScan();
      };
    }, [startScan, stopScan]),
  );
  
  // 컴포넌트 언마운트 시 bleManager 정리
  useEffect(() => {
    return () => {
      bleManager.destroy();
    };
  }, [bleManager]);

  return { isScanning, error, startScan, stopScan };
};
