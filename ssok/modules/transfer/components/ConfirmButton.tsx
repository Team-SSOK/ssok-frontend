import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
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
  const buttonStyle =
    variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
  const textStyle =
    variant === 'primary' ? styles.primaryText : styles.secondaryText;

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[typography.button, textStyle]}>{title}</Text>
    </TouchableOpacity>
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
