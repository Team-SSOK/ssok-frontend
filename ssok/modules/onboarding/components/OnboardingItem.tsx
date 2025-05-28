import React from 'react';
import {
  View,
  Text,
  ImageBackground,
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
 * 배경 이미지와 오버레이를 사용한 풀스크린 레이아웃
 */
export const OnboardingItem: React.FC<OnboardingItemProps> = ({
  item,
  index,
  x,
}) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  /**
   * 텍스트 애니메이션 스타일
   * 위에서 아래로 스르륵 나타나는 효과
   */
  const textAnimatedStyle = useAnimatedStyle(() => {
    // 투명도 애니메이션 (0에서 1로 스르륵)
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

    // 텍스트가 위에서 아래로 스르륵 내려오는 효과
    const translateY = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [-100, 0, 100],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  }, [index, x]);

  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      {/* 배경 이미지 */}
      <ImageBackground
        source={item.source}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* 반투명 오버레이 */}
        <View style={styles.overlay} />

        {/* 콘텐츠 영역 */}
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>{item.subtitle1}</Text>
              <Text style={styles.subtitle}>{item.subtitle2}</Text>
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 40% 투명도의 검정색 오버레이
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
