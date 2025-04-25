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
        enabled ? styles.buttonEnabled : styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={!enabled}
    >
      <Text
        style={[
          styles.buttonText,
          enabled ? styles.buttonTextEnabled : styles.buttonTextDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.silver,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextEnabled: {
    color: colors.white,
  },
  buttonTextDisabled: {
    color: colors.lGrey,
  },
});

export default NextButton;
