import React, { useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface PaginationProps {
  totalSlides: number;
  currentIndex: number;
  containerStyle?: ViewStyle;
  dotStyle?: ViewStyle;
  activeDotStyle?: ViewStyle;
}

const Pagination: React.FC<PaginationProps> = ({
  totalSlides,
  currentIndex,
  containerStyle,
  dotStyle,
  activeDotStyle,
}) => {
  // Create array of dots based on total slides
  const dots = useMemo(
    () => Array.from({ length: totalSlides }),
    [totalSlides],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {dots.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dot,
            dotStyle,
            currentIndex === index && styles.activeDot,
            currentIndex === index && activeDotStyle,
          ]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Go to slide ${index + 1}`}
          accessibilityState={{ selected: currentIndex === index }}
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
