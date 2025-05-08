import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface ConfirmButtonProps {
  onPress: () => void;
  title?: string;
}

/**
 * 확인 버튼 컴포넌트
 */
export default function ConfirmButton({
  onPress,
  title = '송금하기',
}: ConfirmButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[typography.button, styles.buttonText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
  },
});
