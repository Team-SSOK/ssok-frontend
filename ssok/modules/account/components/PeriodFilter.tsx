import React, { memo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

/**
 * 거래내역 기간 필터 타입
 */
export type PeriodFilterType = '1주일' | '1개월' | '3개월';

interface PeriodFilterProps {
  /**
   * 현재 선택된 기간
   */
  selectedPeriod: PeriodFilterType;

  /**
   * 기간 변경 시 호출되는 콜백 함수
   */
  onPeriodChange: (period: PeriodFilterType) => void;
}

/**
 * 거래내역 기간 필터 컴포넌트
 *
 * 1주일, 1개월, 3개월 등의 기간 필터 선택 UI를 제공합니다.
 */
const PeriodFilter: React.FC<PeriodFilterProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const periods: PeriodFilterType[] = ['1주일', '1개월', '3개월'];

  // 기간 버튼 클릭 핸들러 (단순 조건 검사이므로 useCallback 불필요)
  const handlePeriodPress = (period: PeriodFilterType) => {
    if (selectedPeriod !== period) {
      onPeriodChange(period);
    }
  };

  return (
    <View style={styles.container} accessibilityLabel="거래내역 기간 필터">
      {periods.map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.selectedPeriodButton,
          ]}
          onPress={() => handlePeriodPress(period)}
          accessibilityLabel={`${period} 기간 필터`}
          accessibilityState={{ selected: selectedPeriod === period }}
          accessibilityHint={`${period} 동안의 거래내역을 표시합니다`}
        >
          <Text
            style={[
              typography.caption,
              styles.periodButtonText,
              selectedPeriod === period && styles.selectedPeriodButtonText,
            ]}
          >
            {period}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: colors.silver,
  },
  selectedPeriodButton: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    color: colors.black,
  },
  selectedPeriodButtonText: {
    color: colors.white,
  },
});

// props가 변경될 때만 리렌더링하도록 메모이제이션
export default memo(PeriodFilter);
