import { PermissionsAndroid, Platform } from 'react-native';
import * as Device from 'expo-device';

export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const apiLevel = Device.platformApiLevel ?? -1;

  if (apiLevel < 31) {
    // Android 11 이하
    const fineLocation = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location access.',
        buttonPositive: 'OK',
      },
    );
    return fineLocation === PermissionsAndroid.RESULTS.GRANTED;
  } else {
    // Android 12 이상
    const scan = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Bluetooth Permission',
        message: 'Scanning for Bluetooth devices requires permission.',
        buttonPositive: 'OK',
      },
    );

    const connect = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Bluetooth Permission',
        message: 'Connecting to Bluetooth devices requires permission.',
        buttonPositive: 'OK',
      },
    );

    const location = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location access.',
        buttonPositive: 'OK',
      },
    );

    return (
      scan === PermissionsAndroid.RESULTS.GRANTED &&
      connect === PermissionsAndroid.RESULTS.GRANTED &&
      location === PermissionsAndroid.RESULTS.GRANTED
    );
  }
}
