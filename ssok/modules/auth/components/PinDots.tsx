import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface PinDotsProps {
  length: number;
  inputLength: number;
  maxLength: number;
  hasError?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const PinDots: React.FC<PinDotsProps> = ({
  inputLength,
  maxLength,
  hasError = false,
  containerStyle,
}) => {
  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < maxLength; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.pinDot,
            hasError
              ? styles.pinDotError
              : i < inputLength
                ? styles.pinDotFilled
                : styles.pinDotEmpty,
          ]}
        />,
      );
    }
    return dots;
  };

  return <View style={[styles.container, containerStyle]}>{renderDots()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  pinDotEmpty: {
    backgroundColor: colors.silver,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
  },
  pinDotError: {
    backgroundColor: colors.error,
  },
});

export default PinDots;
