import { Peripheral } from 'react-native-ble-manager';

// Extend the Peripheral interface from react-native-ble-manager
declare module 'react-native-ble-manager' {
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

// Type for peripheral service information
export interface PeripheralService {
  peripheralId: string;
  serviceUUID: string;
  characteristicUUID: string;
}

// Type for device scanning state
export interface ScanState {
  isScanning: boolean;
  peripherals: Map<string, Peripheral>;
}
