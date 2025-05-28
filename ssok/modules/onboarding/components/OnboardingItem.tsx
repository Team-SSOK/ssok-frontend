import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { OnboardingItemProps } from '../types';

/**
 * 개별 온보딩 슬라이드 아이템 컴포넌트
 * 오른쪽 아래에서 올라오고 왼쪽 아래로 내려가는 곡선 애니메이션
 */
export const OnboardingItem: React.FC<OnboardingItemProps> = ({
  item,
  index,
  x,
}) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  /**
   * 이미지 애니메이션 스타일
   * 오른쪽 아래에서 둥글게 올라오고, 왼쪽 아래로 둥글게 내려가는 애니메이션
   */
  const imageAnimatedStyle = useAnimatedStyle(() => {
    // X축 이동 (수평 이동)
    const translateX = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [SCREEN_WIDTH * 0.8, 0, -SCREEN_WIDTH * 0.8],
      Extrapolation.CLAMP,
    );

    // Y축 이동 (곡선 경로)
    // 나타날 때: 오른쪽 아래에서 올라옴 (양수 -> 0)
    // 사라질 때: 중앙에서 왼쪽 아래로 내려감 (0 -> 양수)
    const progress = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [-1, 0, 1],
      Extrapolation.CLAMP,
    );

    // 곡선 경로: 나타날 때와 사라질 때 모두 아래쪽으로 곡선
    let translateY;
    if (progress < 0) {
      // 나타날 때: 오른쪽 아래에서 올라옴
      translateY = Math.sin(Math.abs(progress) * Math.PI * 0.5) * 150;
    } else {
      // 사라질 때: 왼쪽 아래로 내려감
      translateY = Math.sin(progress * Math.PI * 0.5) * 150;
    }

    // 스케일 애니메이션
    const scale = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [0.7, 1, 0.7],
      Extrapolation.CLAMP,
    );

    // 회전 애니메이션 (곡선 움직임에 맞춰)
    const rotate = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [10, 0, -10], // 더 부드러운 회전
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
        { rotate: `${rotate}deg` },
      ],
    };
  }, [index, x]);

  /**
   * 텍스트 애니메이션 스타일
   * 이미지와 유사하지만 더 부드러운 곡선 애니메이션
   */
  const textAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [0, 1, 0],
      Extrapolation.CLAMP,
    );

    // 텍스트도 곡선으로 이동하지만 더 부드럽게
    const translateX = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [SCREEN_WIDTH * 0.3, 0, -SCREEN_WIDTH * 0.3],
      Extrapolation.CLAMP,
    );

    const progress = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [-1, 0, 1],
      Extrapolation.CLAMP,
    );

    // 텍스트도 아래쪽 곡선으로 이동 (더 작은 범위)
    let translateY;
    if (progress < 0) {
      // 나타날 때: 오른쪽 아래에서 올라옴
      translateY = Math.sin(Math.abs(progress) * Math.PI * 0.5) * 70;
    } else {
      // 사라질 때: 왼쪽 아래로 내려감
      translateY = Math.sin(progress * Math.PI * 0.5) * 70;
    }

    return {
      opacity,
      transform: [{ translateX }, { translateY }],
    };
  }, [index, x]);

  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      {/* 이미지 영역 */}
      <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
        <Image source={item.source} style={styles.image} resizeMode="contain" />
      </Animated.View>

      {/* 텍스트 영역 */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>{item.subtitle1}</Text>
          <Text style={styles.subtitle}>{item.subtitle2}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 0.6,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 0.4,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 32,
  },
  subtitleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
