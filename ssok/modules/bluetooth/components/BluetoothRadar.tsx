import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  Pressable,
  FlatList,
} from 'react-native';
import { DiscoveredDevice } from '@/modules/bluetooth/hooks/useBleScanner';
import RadarDevice from './RadarDevice';
import { colors } from '@/constants/colors';
import { useBluetoothStore } from '@/modules/bluetooth/stores/bluetoothStore';

interface BluetoothRadarProps {
  isScanning: boolean;
  myUUID: string;
  profileImage: string | null;
  onDevicePress: (device: DiscoveredDevice) => void;
}

const { width } = Dimensions.get('window');
const RADAR_SIZE = width * 1.2;
const CENTER_POINT = RADAR_SIZE / 2;

// 레이더 내 기기 고정 위치 (5개)
const FIXED_POSITIONS = [
  { angle: 0, distance: 0.65 },
  { angle: 70, distance: 0.65 },
  { angle: 120, distance: 0.65 },
  { angle: 188, distance: 0.65 },
  { angle: 248, distance: 0.65 },
];

const BluetoothRadar: React.FC<BluetoothRadarProps> = ({
  isScanning,
  myUUID,
  onDevicePress,
  profileImage,
}) => {
  const [showList, setShowList] = useState(false);
  
  // 스토어에서 직접 원본 기기 목록과 사용자 조회 함수를 가져옴
  const rawDevices = useBluetoothStore(s => s.rawDiscoveredDevices);
  const getMatchedUserByUuid = useBluetoothStore(s => s.getMatchedUserByUuid);

  // 기기 ID와 레이더 위치 인덱스를 매핑
  const [devicePositions, setDevicePositions] = useState<Map<string, number>>(new Map());

  // 발견된 기기 중 "매칭된 사용자"가 있는 기기만 필터링하고, 중복된 사용자는 신호가 가장 강한 기기 하나만 선택
  const sortedDevices = useMemo(() => {
    // 1. 사용자 UUID별로 기기를 그룹화하고, 각 그룹에서 신호가 가장 강한 기기만 선택
    const bestDeviceByUuid = new Map<string, DiscoveredDevice>();

    for (const device of rawDevices.values()) {
      const uuid = device.iBeaconData?.uuid;
      if (!uuid || !getMatchedUserByUuid(uuid)) {
        continue; // 매칭된 사용자가 없는 기기는 무시
      }

      const existingDevice = bestDeviceByUuid.get(uuid);
      if (!existingDevice || (device.rssi || -100) > (existingDevice.rssi || -100)) {
        bestDeviceByUuid.set(uuid, device);
      }
    }

    // 2. 신호 강도순으로 정렬
    return [...bestDeviceByUuid.values()].sort((a, b) => (b.rssi || -100) - (a.rssi || -100));
  }, [rawDevices, getMatchedUserByUuid]);

  // 새로 발견된 기기에 대해 레이더 위치 할당
  useEffect(() => {
    sortedDevices.forEach((device) => {
      if (!devicePositions.has(device.id)) {
        setDevicePositions((prev) => {
          const newMap = new Map(prev);
          const nextIndex = newMap.size % FIXED_POSITIONS.length;
          newMap.set(device.id, nextIndex);
          return newMap;
        });
      }
    });
  }, [sortedDevices]);

  // 레이더에 표시할 기기 (최대 5개)와 리스트에 표시할 기기 분리
  const radarDevices = sortedDevices.slice(0, 5);
  const listDevices = sortedDevices.slice(5);

  const getPositionFromFixed = (deviceId: string) => {
    const index = devicePositions.get(deviceId);
    if (index === undefined) {
      // 위치가 할당되지 않은 경우 (이론상 발생하지 않음)
      return { x: CENTER_POINT, y: CENTER_POINT };
    }
    const position = FIXED_POSITIONS[index];
    const radians = (position.angle * Math.PI) / 180;
    const radius = CENTER_POINT * position.distance;
    const x = CENTER_POINT + radius * Math.cos(radians);
    const y = CENTER_POINT + radius * Math.sin(radians);
    return { x, y };
  };

  return (
    <View style={styles.container}>
      <View style={styles.radarContainer}>
        <View style={styles.scanEffect} />
        <View style={[styles.radarCircle, styles.radarCircle1]} />
        <View style={[styles.radarCircle, styles.radarCircle2]} />
        <View style={[styles.radarCircle, styles.radarCircle3]} />
        
        <View style={styles.myProfileContainer}>
          <View style={styles.myProfile}>
            <Image
              source={profileImage ? { uri: profileImage } : require('@/assets/images/profile.webp')}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <Text style={styles.myInitial}></Text>
          </View>
        </View>

        {/* 발견된 기기들 (레이더 위에 표시) */}
        {radarDevices.map((device) => (
          <RadarDevice
            key={device.id}
            device={device}
            position={getPositionFromFixed(device.id)}
            onPress={() => onDevicePress(device)}
            animated={true}
          />
        ))}

        {listDevices.length > 0 && (
          <Pressable style={styles.moreDevicesButton} onPress={() => setShowList(!showList)}>
            <Text style={styles.moreDevicesText}>+{listDevices.length}개 더 보기</Text>
          </Pressable>
        )}
      </View>

      {showList && listDevices.length > 0 && (
        <View style={styles.deviceListContainer}>
          <View style={styles.deviceListHeader}>
            <Text style={styles.deviceListTitle}>추가 발견된 기기 ({listDevices.length})</Text>
            <Pressable onPress={() => setShowList(false)}>
              <Text style={styles.closeButton}>닫기</Text>
            </Pressable>
          </View>
          <FlatList
            data={listDevices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const user = item.iBeaconData ? getMatchedUserByUuid(item.iBeaconData.uuid) : undefined;
              const userName = user?.username || '확인 중...';

              return (
                <Pressable style={styles.deviceListItem} onPress={() => onDevicePress(item)}>
                  <View style={[styles.deviceSignal, { backgroundColor: getSignalColor(item.rssi) }]} />
                  <Text style={styles.deviceName}>{userName}</Text>
                  <Text style={styles.deviceRssi}>{item.rssi || '-'} dBm</Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}
    </View>
  );
};

// RSSI 값에 따른 색상 결정 함수
const getSignalColor = (rssi: number | null): string => {
  if (!rssi) return colors.grey;
  if (rssi >= -60) return colors.primary; // 매우 강함
  if (rssi >= -75) return colors.success; // 강함
  if (rssi >= -85) return colors.warning; // 중간
  return colors.error; // 약함
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  radarContainer: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  scanEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: 'rgba(82, 145, 255, 0.05)',
    borderColor: 'rgba(82, 145, 255, 0.2)',
  },
  radarCircle: {
    position: 'absolute',
    borderRadius: RADAR_SIZE / 2,
  },
  radarCircle1: {
    width: '100%',
    height: '100%',

    backgroundColor: 'rgba(82, 145, 255, 0.02)',
  },
  radarCircle2: {
    width: '66%',
    height: '66%',
    backgroundColor: 'rgba(82, 145, 255, 0.03)',
  },
  radarCircle3: {
    width: '33%',
    height: '33%',
    backgroundColor: 'rgba(82, 145, 255, 0.05)',
  },
  myProfileContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  myProfile: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  myInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  moreDevicesButton: {
    position: 'absolute',
    bottom: -40,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 2,
  },
  moreDevicesText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deviceListContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  deviceListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.black,
  },
  closeButton: {
    fontSize: 14,
    color: colors.primary,
  },
  deviceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  deviceSignal: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  deviceName: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
  },
  deviceRssi: {
    fontSize: 12,
    color: colors.grey,
    marginLeft: 8,
  },
});

export default BluetoothRadar;
