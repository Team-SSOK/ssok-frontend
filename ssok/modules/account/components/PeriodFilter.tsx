import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';

export type PeriodFilterType = '1주일' | '1개월' | '3개월';

interface PeriodFilterProps {
  selectedPeriod: PeriodFilterType;
  onPeriodChange: (period: PeriodFilterType) => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const periods: PeriodFilterType[] = ['1주일', '1개월', '3개월'];

  return (
    <View style={styles.container}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.selectedPeriodButton,
          ]}
          onPress={() => onPeriodChange(period)}
        >
          <Text
            style={[
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
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.silver,
  },
  selectedPeriodButton: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: colors.black,
  },
  selectedPeriodButtonText: {
    color: colors.white,
  },
});

export default PeriodFilter;
