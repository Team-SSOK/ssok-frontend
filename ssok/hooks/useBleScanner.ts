/**
 * 블루투스 디바이스 타입 정의
 * 이 타입은 BleService에서 사용하는 공통 타입입니다.
 */

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
