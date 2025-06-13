import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import { BleManager, ScanMode, BleError, Device } from 'react-native-ble-plx';
import { parseIBeaconData } from '@/utils/ble';
import { useBluetoothStore } from '../stores/bluetoothStore';

const LOG_TAG = '[useBleScanner]';

// DiscoveredDevice 타입을 useBleScanner 파일 내에서 직접 정의하거나,
// 또는 공유 타입 파일에서 가져옵니다. bluetoothStore.ts와 타입을 일치시킵니다.
export interface DiscoveredDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  iBeaconData?: {
    uuid: string;
    major: number;
    minor: number;
    txPower: number;
  } | null;
  lastSeen: Date;
}

/**
 * BLE 스캐닝 기능을 위한 커스텀 훅
 * Central 모드로 작동하여 주변 iBeacon 장치를 스캔
 */
export const useBleScanner = () => {
  const bleManager = useMemo(() => new BleManager(), []);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isScanningRef = useRef(isScanning);
  isScanningRef.current = isScanning;

  const addOrUpdateDevice = useBluetoothStore(s => s.addOrUpdateDevice);

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
    if (isScanningRef.current) {
      console.log(`${LOG_TAG} 이미 스캔 중입니다.`);
      return;
    }

    // 권한 확인
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      const errorMessage = '블루투스 스캔 권한이 필요합니다.';
      setError(errorMessage);
      console.error(`${LOG_TAG} ${errorMessage}`);
      return;
    }

    console.log(`${LOG_TAG} 스캔 시작`);
    setIsScanning(true);
    setError(null);
    
    bleManager.startDeviceScan(
      null,
      { scanMode: ScanMode.LowLatency },
      (err, device) => {
        if (err) {
          const errorMessage = `스캔 오류: ${err.message}`;
          setError(errorMessage);
          console.error(LOG_TAG, errorMessage, err);
          setIsScanning(false);
          bleManager.stopDeviceScan();
          return;
        }
        if (device?.manufacturerData) {
          const iBeaconData = parseIBeaconData(device.manufacturerData);
          if (iBeaconData) {
            addOrUpdateDevice({
              id: device.id,
              name: device.name,
              rssi: device.rssi,
              iBeaconData: iBeaconData,
              lastSeen: new Date(),
            });
          }
        }
      },
    );
  }, [bleManager, addOrUpdateDevice, requestPermissions]);

  const stopScan = useCallback(() => {
    bleManager.stopDeviceScan();
    setIsScanning(false);
    console.log(`${LOG_TAG} 스캔 중지`);
  }, [bleManager]);

  // 컴포넌트 언마운트 시 bleManager 정리
  useEffect(() => {
    return () => {
      bleManager.destroy();
    };
  }, [bleManager]);

  return { isScanning, error, startScan, stopScan };
};
