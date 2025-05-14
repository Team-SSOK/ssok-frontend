import React, { useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { PaginationProps } from '../utils/types';

interface ExtendedPaginationProps extends PaginationProps {
  containerStyle?: ViewStyle;
  dotStyle?: ViewStyle;
  activeDotStyle?: ViewStyle;
}

const Pagination: React.FC<ExtendedPaginationProps> = ({
  total,
  current,
  onPageChange,
  containerStyle,
  dotStyle,
  activeDotStyle,
}) => {
  // Create array of dots based on total slides
  const dots = useMemo(() => Array.from({ length: total }), [total]);

  return (
    <View style={[styles.container, containerStyle]}>
      {dots.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dot,
            dotStyle,
            current === index && styles.activeDot,
            current === index && activeDotStyle,
          ]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Go to slide ${index + 1}`}
          accessibilityState={{ selected: current === index }}
          onPress={() => onPageChange && onPageChange(index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.silver,
    marginHorizontal: 5,
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.primary,
  },
});

export default Pagination;
