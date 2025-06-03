import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { DiscoveredDevice } from '@/modules/bluetooth/hooks/useBleScanner';
import { colors } from '@/constants/colors';
import { useBluetoothStore } from '@/modules/bluetooth/stores/bluetoothStore';

interface RadarDeviceProps {
  device: DiscoveredDevice;
  position: { x: number; y: number };
  onPress: () => void;
  animated?: boolean;
}

const RadarDevice: React.FC<RadarDeviceProps> = ({
  device,
  position,
  onPress,
  animated = false,
}) => {
  // 애니메이션 값 설정
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  // Bluetooth store에서 UUID에 해당하는 사용자 정보 가져오기
  const getUserByUuid = useBluetoothStore((state) => state.getUserByUuid);

  // RSSI 강도에 따른 색상 계산
  const getSignalColor = (rssi: number | null): string => {
    if (!rssi) return colors.grey; // RSSI 값이 없으면 회색

    if (rssi >= -60) return colors.primary; // 매우 강함
    if (rssi >= -75) return colors.success; // 강함
    if (rssi >= -85) return colors.warning; // 중간
    return colors.error; // 약함
  };

  // 펄스 애니메이션 실행
  useEffect(() => {
    if (animated) {
      // 펄스 효과 애니메이션
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // 투명도 애니메이션
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [animated, pulseAnim, opacityAnim]);

  // 기기 UUID로부터 사용자 이름과 프로필 이미지 가져오기
  const user = device.iBeaconData
    ? getUserByUuid(device.iBeaconData.uuid)
    : undefined;
  const userName = user ? user.username : '알 수 없음';
  const userProfileImage = user?.profileImage;
  const signalColor = getSignalColor(device.rssi);

  console.log('RadarDevice user:', user); // 디버깅용

  return (
    <TouchableOpacity
      style={[
        styles.deviceContainer,
        {
          left: position.x - 30, // 가운데 정렬을 위해 기기 너비의 절반만큼 조정 (60/2)
          top: position.y - 30,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 펄스 효과 */}
      {animated && (
        <Animated.View
          style={[
            styles.pulse,
            {
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
              borderColor: signalColor,
              backgroundColor: 'transparent',
            },
          ]}
        />
      )}

      {/* 기기 표시 */}
      <View style={[styles.device, { borderColor: signalColor }]}>
        <Image
          source={
            userProfileImage
              ? { uri: userProfileImage }
              : require('@/assets/images/profile.webp')
          }
          style={styles.profileImage}
          resizeMode="cover"
        />
      </View>

      {/* 사용자 이름 */}
      <Text style={styles.deviceName} numberOfLines={1}>
        {userName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deviceContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  device: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  pulse: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    opacity: 0.6,
    borderWidth: 2,
  },
  deviceName: {
    position: 'absolute',
    bottom: -24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    fontSize: 12,
    color: colors.black,
    maxWidth: 100,
    textAlign: 'center',
    overflow: 'hidden',
    elevation: 1,
  },
});

export default RadarDevice;
