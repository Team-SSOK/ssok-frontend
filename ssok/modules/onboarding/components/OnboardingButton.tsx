import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { OnboardingButtonProps } from '../types';

// Pressable을 Animated 컴포넌트로 변환
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * 온보딩 네비게이션 버튼 컴포넌트
 * 마지막 슬라이드에서는 '시작하기' 버튼으로 변경되며, 애니메이션 효과를 포함
 */
export const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  currentIndex,
  length,
  onComplete,
  onNext,
}) => {
  /**
   * 버튼 컨테이너 애니메이션 스타일
   * 마지막 슬라이드에서 버튼 너비가 확장됨
   */
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const isLastSlide = currentIndex.value === length - 1;

    return {
      width: withSpring(isLastSlide ? 200 : 60),
      height: 60,
    };
  }, [currentIndex, length]);

  /**
   * 텍스트 애니메이션 스타일
   * 마지막 슬라이드에서만 텍스트가 표시됨
   */
  const textAnimatedStyle = useAnimatedStyle(() => {
    const isLastSlide = currentIndex.value === length - 1;

    return {
      opacity: withTiming(isLastSlide ? 1 : 0, { duration: 300 }),
      transform: [
        {
          translateX: withTiming(isLastSlide ? 0 : 50, { duration: 300 }),
        },
      ],
    };
  }, [currentIndex, length]);

  /**
   * 화살표 아이콘 애니메이션 스타일
   * 마지막 슬라이드가 아닐 때만 화살표가 표시됨
   */
  const arrowAnimatedStyle = useAnimatedStyle(() => {
    const isLastSlide = currentIndex.value === length - 1;

    return {
      opacity: withTiming(isLastSlide ? 0 : 1, { duration: 300 }),
      transform: [
        {
          translateX: withTiming(isLastSlide ? -50 : 0, { duration: 300 }),
        },
      ],
    };
  }, [currentIndex, length]);

  /**
   * 버튼 클릭 핸들러
   */
  const handlePress = () => {
    const isLastSlide = currentIndex.value === length - 1;

    if (isLastSlide) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <AnimatedPressable
      style={[styles.container, buttonAnimatedStyle]}
      onPress={handlePress}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
    >
      {/* 시작하기 텍스트 */}
      <Animated.Text style={[styles.text, textAnimatedStyle]}>
        시작하기
      </Animated.Text>

      {/* 화살표 아이콘 */}
      <Animated.Text style={[styles.arrow, arrowAnimatedStyle]}>
        →
      </Animated.Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#007AFF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
  },
});
