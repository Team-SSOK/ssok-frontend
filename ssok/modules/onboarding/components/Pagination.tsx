import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface PaginationProps {
  totalSlides: number;
  currentIndex: number;
  onDotPress?: (index: number) => void;
  containerStyle?: ViewStyle;
  dotStyle?: ViewStyle;
  activeDotStyle?: ViewStyle;
}

const Pagination: React.FC<PaginationProps> = ({
  totalSlides,
  currentIndex,
  onDotPress,
  containerStyle,
  dotStyle,
  activeDotStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dot,
            dotStyle,
            currentIndex === index && styles.activeDot,
            currentIndex === index && activeDotStyle,
          ]}
          onPress={() => onDotPress?.(index)}
          activeOpacity={0.8}
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
