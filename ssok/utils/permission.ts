import { PermissionsAndroid, Platform } from 'react-native';

export const handleAndroidPermissions = async (): Promise<boolean> => {
  console.log('[Permissions] Checking Android version:', Platform.Version);

  if (Platform.OS !== 'android') {
    console.log('[Permissions] Not Android, permissions not needed');
    return true;
  }

  try {
    if (Platform.Version >= 31) {
      // Android 12+
      console.log(
        '[Permissions] Android 12+ detected, requesting Bluetooth permissions',
      );

      // Android 12+ 권한 요청
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

      console.log(
        '[Permissions] BLUETOOTH_SCAN permission:',
        bluetoothScanGranted,
      );
      console.log(
        '[Permissions] BLUETOOTH_CONNECT permission:',
        bluetoothConnectGranted,
      );

      const allPermissionsGranted =
        bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED &&
        bluetoothConnectGranted === PermissionsAndroid.RESULTS.GRANTED;

      if (allPermissionsGranted) {
        console.log('[Permissions] Android 12+ Bluetooth permissions granted');
        return true;
      } else {
        console.error('[Permissions] Android 12+ Bluetooth permissions denied');
        return false;
      }
    } else if (Platform.Version >= 23) {
      // Android 6+
      console.log(
        '[Permissions] Android 6+ to 11 detected, requesting location permission',
      );

      // Android 6-11 권한 요청 (위치 권한이 블루투스에 필요)
      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '위치 권한',
          message: 'Bluetooth 기기를 찾기 위해 위치 권한이 필요합니다.',
          buttonPositive: '확인',
        },
      );

      // 블루투스 관련 권한도 요청
      console.log(
        '[Permissions] Checking additional permissions for Android 6-11',
      );
      if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN) {
        const bluetoothAdminGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
        );
        console.log(
          '[Permissions] BLUETOOTH_ADMIN permission:',
          bluetoothAdminGranted,
        );
      }

      console.log(
        '[Permissions] FINE_LOCATION permission:',
        fineLocationGranted,
      );

      if (fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[Permissions] Android 6-11 location permission granted');
        return true;
      } else {
        console.error('[Permissions] Android 6-11 location permission denied');
        return false;
      }
    } else {
      console.log(
        '[Permissions] Android version < 6, no runtime permissions needed',
      );
      return true;
    }
  } catch (error) {
    console.error('[Permissions] Error requesting permissions:', error);
    return false;
  }
};
