import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
} from 'react-native-reanimated';
import { PaginationDotsProps } from '../types';

/**
 * 페이지네이션 도트 컴포넌트
 * 스크롤 위치에 따라 도트의 크기와 색상이 애니메이션됨
 */
export const PaginationDots: React.FC<PaginationDotsProps> = ({
  length,
  x,
}) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  /**
   * 개별 도트 컴포넌트
   */
  const PaginationDot: React.FC<{ index: number }> = ({ index }) => {
    const dotAnimatedStyle = useAnimatedStyle(() => {
      // 도트 너비 애니메이션 (활성 도트는 더 넓게)
      const width = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [12, 28, 12],
        Extrapolation.CLAMP,
      );

      // 도트 색상 애니메이션 (활성 도트는 파란색)
      const backgroundColor = interpolateColor(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        ['#E0E0E0', '#007AFF', '#E0E0E0'],
      );

      // 도트 투명도 애니메이션
      const opacity = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [0.5, 1, 0.5],
        Extrapolation.CLAMP,
      );

      return {
        width,
        backgroundColor,
        opacity,
      };
    }, [index, x]);

    return <Animated.View style={[styles.dot, dotAnimatedStyle]} />;
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <PaginationDot key={index} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
