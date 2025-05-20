import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DiscoveredDevice } from '@/modules/bluetooth/hooks/useBleScanner';
import { colors } from '@/constants/colors';
import { shortenUUID } from '@/utils/ble';

interface PeerDeviceItemProps {
  device: DiscoveredDevice;
  onPress?: (device: DiscoveredDevice) => void;
}

/**
 * 발견된 피어 디바이스를 표시하는 컴포넌트
 */
const PeerDeviceItem: React.FC<PeerDeviceItemProps> = ({ device, onPress }) => {
  // 발견된 시간 계산
  const timeAgo = getTimeAgo(device.lastSeen);

  // RSSI 강도에 따른 색상 (신호 강도)
  const signalColor = getRssiColor(device.rssi);

  // UUID 간소화
  const shortUuid = device.iBeaconData
    ? shortenUUID(device.iBeaconData.uuid)
    : '알 수 없음';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(device)}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.deviceName}>
            {device.name || '이름 없는 기기'}
          </Text>
          <View
            style={[styles.signalIndicator, { backgroundColor: signalColor }]}
          />
        </View>

        <Text style={styles.deviceId}>ID: {device.id}</Text>

        {device.iBeaconData && (
          <View style={styles.beaconInfoContainer}>
            <Text style={styles.beaconInfoText}>UUID: {shortUuid}</Text>
            <Text style={styles.beaconInfoText}>
              Major: {device.iBeaconData.major}, Minor:{' '}
              {device.iBeaconData.minor}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rightContainer}>
        <Text style={styles.rssiValue}>{device.rssi || 'N/A'} dBm</Text>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * RSSI 값에 따른 색상 반환
 *
 * @param rssi - RSSI 값 (dBm)
 * @returns 적절한 색상 코드
 */
const getRssiColor = (rssi: number | null): string => {
  if (rssi === null) return colors.grey;

  if (rssi >= -60) return colors.success; // 강함 (녹색)
  if (rssi >= -75) return '#FFA500'; // 중간 (주황색)
  return colors.error; // 약함 (빨간색)
};

/**
 * 시간 경과 계산
 *
 * @param date - 기준 시간
 * @returns 경과 시간 문자열
 */
const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}초 전`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  return `${Math.floor(seconds / 86400)}일 전`;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  leftContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginRight: 8,
  },
  signalIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deviceId: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 8,
  },
  beaconInfoContainer: {
    backgroundColor: colors.silver,
    borderRadius: 4,
    padding: 8,
  },
  beaconInfoText: {
    fontSize: 11,
    color: colors.grey,
    fontFamily: 'monospace',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  rssiValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.grey,
  },
});

export default PeerDeviceItem;
