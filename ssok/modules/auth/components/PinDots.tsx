import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface PinDotsProps {
  /**
   * 현재 입력된 PIN의 길이
   */
  inputLength: number;

  /**
   * PIN의 최대 길이
   */
  maxLength: number;

  /**
   * 에러 상태 여부
   */
  hasError?: boolean;

  /**
   * 컨테이너 스타일
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * @deprecated inputLength와 중복되어 곧 삭제 예정
   */
  length: number;
}

/**
 * PIN 입력 점 표시 컴포넌트
 *
 * 사용자가 입력한 PIN 번호를 시각적으로 표시합니다.
 * 각 점은 입력 여부에 따라 채워지거나 비워집니다.
 */
export const PinDots: React.FC<PinDotsProps> = ({
  inputLength,
  maxLength,
  hasError = false,
  containerStyle,
}) => {
  // 렌더링이 자주 일어나지 않는 단순한 UI 컴포넌트이므로 useMemo 제거
  const renderDots = () => {
    return Array.from({ length: maxLength }).map((_, i) => (
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
      />
    ));
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

// 이 컴포넌트는 props 변경 시에만 리렌더링하면 되므로 memo 유지
export default React.memo(PinDots);
