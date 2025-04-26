import React, { useEffect, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedLayoutProps {
  children: ReactNode;
  style?: object;
  duration?: number;
}

/**
 * 페이드인 및 슬라이드 애니메이션이 적용된 레이아웃 컴포넌트
 */
export default function AnimatedLayout({
  children,
  style,
  duration = 300,
}: AnimatedLayoutProps) {
  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    // Animate content in when component mounts
    opacity.value = withTiming(1, { duration, easing: Easing.ease });
    translateY.value = withTiming(0, { duration, easing: Easing.ease });
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
