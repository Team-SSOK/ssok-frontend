import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { DiscoveredDevice } from '@/modules/bluetooth/hooks/useBleScanner';
import RadarDevice from './RadarDevice';
import { colors } from '@/constants/colors';
import { useBluetoothStore } from '@/modules/bluetooth/stores/useBluetoothStore';

interface BluetoothRadarProps {
  devices: DiscoveredDevice[];
  isScanning: boolean;
  myUUID: string;
  onDevicePress: (device: DiscoveredDevice) => void;
}

const { width } = Dimensions.get('window');
const RADAR_SIZE = width * 1.2;
const CENTER_POINT = RADAR_SIZE / 2;

// 레이더 내 기기 고정 위치 (5개) - 반경을 약간 늘려 더 큰 기기 크기에 맞게 조정
const FIXED_POSITIONS = [
  { angle: 0, distance: 0.65 }, // 우측
  { angle: 70, distance: 0.65 }, // 우측 상단
  { angle: 120, distance: 0.65 }, // 좌측 상단
  { angle: 188, distance: 0.65 }, // 좌측 하단
  { angle: 248, distance: 0.65 }, // 우측 하단
];

const BluetoothRadar: React.FC<BluetoothRadarProps> = ({
  devices,
  isScanning,
  myUUID,
  onDevicePress,
}) => {
  // 추가 기기 리스트 표시 상태
  const [showList, setShowList] = useState(false);

  // Bluetooth store에서 UUID에 해당하는 사용자 정보 가져오기
  const getUserByUuid = useBluetoothStore((state) => state.getUserByUuid);

  // 기기 ID와 위치 인덱스를 매핑하는 상태
  const [devicePositions, setDevicePositions] = useState<Map<string, number>>(
    new Map(),
  );

  // 기기를 RSSI 신호 강도 기준으로 정렬 (강한 신호가 앞에 오도록)
  const sortedDevices = [...devices].sort((a, b) => {
    const rssiA = a.rssi || -100;
    const rssiB = b.rssi || -100;
    return rssiB - rssiA; // 강한 신호(값이 큰)가 앞에 오도록 내림차순 정렬
  });

  // 기기 위치 매핑 업데이트 (최초 1회만)
  useEffect(() => {
    // 새로 발견된 기기를 확인하고 고정 위치 할당
    devices.forEach((device) => {
      if (!devicePositions.has(device.id)) {
        setDevicePositions((prev) => {
          const newMap = new Map(prev);
          // 다음 가용 위치 인덱스 할당 (최대 5개 위치 순환)
          const nextIndex = newMap.size % 5;
          newMap.set(device.id, nextIndex);
          return newMap;
        });
      }
    });
  }, [devices]);

  // 레이더에 표시할 기기와 리스트에 표시할 기기로 분리
  // 레이더에는 위치가 할당된 기기만 표시 (최대 5개)
  const radarDevices = sortedDevices.filter((device) =>
    devicePositions.has(device.id),
  );
  const listDevices = sortedDevices.filter(
    (device) => !devicePositions.has(device.id),
  );

  // 고정 위치 기준으로 x, y 좌표 계산
  const getPositionFromFixed = (index: number) => {
    const position = FIXED_POSITIONS[index];
    const radians = (position.angle * Math.PI) / 180;
    const radius = CENTER_POINT * position.distance;
    const x = CENTER_POINT + radius * Math.cos(radians);
    const y = CENTER_POINT + radius * Math.sin(radians);
    return { x, y };
  };

  // 신호 강도(RSSI)에 따른 색상 그라데이션
  // const getRadarGradientStyle = () => {
  //   return {
  //     backgroundColor: 'transparent',
  //     borderColor: 'rgba(82, 145, 255, 0.6)',
  //     borderWidth: 1,
  //   };
  // };

  return (
    <View style={styles.container}>
      <View style={styles.radarContainer}>
        {/* 레이더 스캔 애니메이션 효과 */}
        <View style={styles.scanEffect} />

        {/* 레이더 그라데이션 원 */}
        <View style={[styles.radarCircle, styles.radarCircle1]} />
        <View style={[styles.radarCircle, styles.radarCircle2]} />
        <View style={[styles.radarCircle, styles.radarCircle3]} />

        {/* 중앙 내 프로필 */}
        <View style={styles.myProfileContainer}>
          <View style={styles.myProfile}>
            <Image
              source={require('@/assets/images/profile.webp')}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <Text style={styles.myInitial}></Text>
          </View>
        </View>

        {/* 발견된 기기들 (레이더 위에 표시) - 고정 위치 사용 */}
        {radarDevices.map((device) => {
          // 각 기기의 고정 위치 인덱스 가져오기
          const positionIndex = devicePositions.get(device.id) || 0;
          const position = getPositionFromFixed(positionIndex);

          return (
            <RadarDevice
              key={device.id}
              device={device}
              position={position}
              onPress={() => onDevicePress(device)}
              animated={true}
            />
          );
        })}

        {/* 추가 기기 버튼 (5개 초과 시) */}
        {listDevices.length > 0 && (
          <TouchableOpacity
            style={styles.moreDevicesButton}
            onPress={() => setShowList(!showList)}
          >
            <Text style={styles.moreDevicesText}>
              +{listDevices.length}개 더 보기
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 추가 기기 리스트 (고정 5개 초과 시) */}
      {showList && listDevices.length > 0 && (
        <View style={styles.deviceListContainer}>
          <View style={styles.deviceListHeader}>
            <Text style={styles.deviceListTitle}>
              추가 발견된 기기 ({listDevices.length})
            </Text>
            <TouchableOpacity onPress={() => setShowList(false)}>
              <Text style={styles.closeButton}>닫기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={listDevices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              // 기기 UUID로부터 사용자 이름 가져오기
              const user = item.iBeaconData
                ? getUserByUuid(item.iBeaconData.uuid)
                : undefined;
              const userName = user ? user.username : '알 수 없음';

              return (
                <TouchableOpacity
                  style={styles.deviceListItem}
                  onPress={() => onDevicePress(item)}
                >
                  <View
                    style={[
                      styles.deviceSignal,
                      { backgroundColor: getSignalColor(item.rssi) },
                    ]}
                  />
                  <Text style={styles.deviceName}>{userName}</Text>
                  <Text style={styles.deviceRssi}>{item.rssi || '-'} dBm</Text>
                </TouchableOpacity>
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
