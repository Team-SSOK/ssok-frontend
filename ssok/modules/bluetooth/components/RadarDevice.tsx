import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { DiscoveredDevice } from '@/hooks/useBleScanner';
import { colors } from '@/constants/colors';

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

  // 기기 이름 표시 (없으면 알 수 없음)
  const deviceName = device.name || '알 수 없음';
  const signalColor = getSignalColor(device.rssi);

  return (
    <TouchableOpacity
      style={[
        styles.deviceContainer,
        {
          left: position.x - 20, // 가운데 정렬을 위해 기기 너비의 절반만큼 조정
          top: position.y - 20,
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
              backgroundColor: signalColor,
            },
          ]}
        />
      )}

      {/* 기기 표시 */}
      <View style={[styles.device, { backgroundColor: signalColor }]} />

      {/* 기기 이름 */}
      <Text style={styles.deviceName} numberOfLines={1}>
        {deviceName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deviceContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  device: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  pulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.6,
  },
  deviceName: {
    position: 'absolute',
    bottom: -18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    color: colors.black,
    maxWidth: 80,
    textAlign: 'center',
    overflow: 'hidden',
    elevation: 1,
  },
});

export default RadarDevice;
