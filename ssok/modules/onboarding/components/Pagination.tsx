import React, { useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { PaginationProps } from '../utils/types';

interface ExtendedPaginationProps extends PaginationProps {
  containerStyle?: ViewStyle;
  dotStyle?: ViewStyle;
  activeDotStyle?: ViewStyle;
}

// 개별 페이지네이션 점 컴포넌트
const PaginationDot: React.FC<{
  isActive: boolean;
  index: number;
  onPress: (index: number) => void;
  dotStyle?: ViewStyle;
  activeDotStyle?: ViewStyle;
}> = React.memo(({ isActive, index, onPress, dotStyle, activeDotStyle }) => (
  <TouchableOpacity
    style={[
      styles.dot,
      dotStyle,
      isActive && styles.activeDot,
      isActive && activeDotStyle,
    ]}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={`${index + 1}번째 슬라이드로 이동`}
    accessibilityState={{ selected: isActive }}
    accessibilityHint={`전체 슬라이드 중 ${index + 1}번째 슬라이드로 이동합니다.`}
    onPress={() => onPress(index)}
  />
));

const Pagination: React.FC<ExtendedPaginationProps> = ({
  total,
  current,
  onPageChange,
  containerStyle,
  dotStyle,
  activeDotStyle,
}) => {
  // 페이지 점 배열을 메모이제이션하여 불필요한 재생성 방지
  const dots = useMemo(() => Array.from({ length: total }), [total]);

  // 페이지 변경 이벤트 핸들러
  const handlePageChange = (index: number) => {
    if (onPageChange) {
      onPageChange(index);
    }
  };

  return (
    <View
      style={[styles.container, containerStyle]}
      accessibilityRole="tablist"
      accessibilityLabel={`슬라이드 페이지네이션: ${current + 1} / ${total}`}
    >
      {dots.map((_, index) => (
        <PaginationDot
          key={`dot-${index}`}
          isActive={current === index}
          index={index}
          onPress={handlePageChange}
          dotStyle={dotStyle}
          activeDotStyle={activeDotStyle}
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

export default React.memo(Pagination);
