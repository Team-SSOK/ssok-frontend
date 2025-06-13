import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
// @ts-ignore
import BleAdvertise from 'react-native-ble-advertise';

/**
 * BLE 광고 기능을 관리하는 커스텀 훅
 *
 * @param uuid - 광고할 UUID
 * @param major - iBeacon Major 값
 * @param minor - iBeacon Minor 값
 */
export const useBleAdvertiser = (
  uuid: string,
  major = 100,
  minor = 200,
) => {
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdvertisingRef = useRef(isAdvertising);
  isAdvertisingRef.current = isAdvertising;

  const LOG_TAG = '[useBleAdvertiser]';

  // 광고 권한 확인
  const checkAdvertisePermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false; // iOS는 광고 미지원
    if (Platform.Version < 31) return true; // Android 11 이하는 별도 권한 불필요

    try {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      );
      return hasPermission;
    } catch (e) {
      console.error(`${LOG_TAG} 권한 확인 오류:`, e);
      return false;
    }
  }, []);

  // 권한 요청
  const requestAdvertisePermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || Platform.Version < 31) return true;

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      );
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          '권한 필요',
          '광고 기능을 사용하려면 앱 설정에서 블루투스 권한을 허용해야 합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '설정으로 이동', onPress: () => Linking.openSettings() },
          ],
        );
      }
      return false;
    } catch (e) {
      console.error(`${LOG_TAG} 권한 요청 오류:`, e);
      return false;
    }
  }, []);

  // 광고 시작
  const startAdvertising = useCallback(async () => {
    if (isAdvertisingRef.current || Platform.OS !== 'android') return;

    setError(null);

    try {
      const hasPermission = await checkAdvertisePermission();
      if (!hasPermission) {
        const permissionGranted = await requestAdvertisePermission();
        if (!permissionGranted) {
          throw new Error('블루투스 광고 권한이 거부되었습니다.');
        }
      }

      BleAdvertise.setCompanyId(0x00e0); // 예시 Company ID
      await BleAdvertise.broadcast(uuid, major, minor);
      setIsAdvertising(true);
      console.log(`${LOG_TAG} 광고 시작:`, { uuid, major, minor });
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : '알 수 없는 광고 오류';
      setError(errorMessage);
      console.error(`${LOG_TAG} 광고 시작 오류:`, e);
      setIsAdvertising(false);
    }
  }, [uuid, major, minor, checkAdvertisePermission, requestAdvertisePermission]);

  // 광고 중지
  const stopAdvertising = useCallback(async () => {
    if (!isAdvertisingRef.current || Platform.OS !== 'android') return;

    try {
      await BleAdvertise.stopBroadcast();
      setIsAdvertising(false);
      console.log(`${LOG_TAG} 광고 중지`);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : '알 수 없는 광고 중지 오류';
      setError(errorMessage);
      console.error(`${LOG_TAG} 광고 중지 오류:`, e);
    }
  }, []);

  return { isAdvertising, error, startAdvertising, stopAdvertising };
}; 