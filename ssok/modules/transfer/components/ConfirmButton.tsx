import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface ConfirmButtonProps {
  onPress: () => void;
  title?: string;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

/**
 * 확인 버튼 컴포넌트
 */
export default function ConfirmButton({
  onPress,
  title = '송금하기',
  variant = 'primary',
  style,
}: ConfirmButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const buttonStyle =
    variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
  const textStyle =
    variant === 'primary' ? styles.primaryText : styles.secondaryText;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {
      duration: 150,
      dampingRatio: 0.8,
    });
    opacity.value = withTiming(0.8, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      duration: 200,
      dampingRatio: 0.8,
    });
    opacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePress = () => {
    // 햅틱 피드백
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={buttonStyle}
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        delayPressIn={0}
        delayPressOut={0}
      >
        <Text style={[typography.button, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.text.secondary,
  },
});
