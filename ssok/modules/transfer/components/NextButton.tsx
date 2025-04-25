import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';

interface NextButtonProps {
  onPress: () => void;
  enabled: boolean;
  title?: string;
}

const NextButton: React.FC<NextButtonProps> = ({
  onPress,
  enabled,
  title = '다음',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        enabled ? styles.enabledButton : styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={!enabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.buttonText,
          enabled ? styles.enabledText : styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  enabledButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  enabledText: {
    color: colors.white,
  },
  disabledText: {
    color: colors.grey,
  },
});

export default NextButton;
