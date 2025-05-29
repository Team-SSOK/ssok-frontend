import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';

interface AmountDisplayProps {
  amount: string;
  accountBalance: number;
  onBalanceInput: () => void;
}

/**
 * 금액 입력 및 표시 컴포넌트
 * 현재 입력된 금액과 잔액 전체 입력 버튼을 표시합니다
 */
export default function AmountDisplay({
  amount,
  accountBalance,
  onBalanceInput,
}: AmountDisplayProps) {
  // 애니메이션을 위한 shared value
  const amountOpacity = useSharedValue(0);
  const amountScale = useSharedValue(0.95);
  const amountTranslateY = useSharedValue(10);

  React.useEffect(() => {
    // 더 자연스러운 spring-like 애니메이션
    amountOpacity.value = withDelay(
      150,
      withTiming(1, {
        duration: 700,
        easing: Easing.out(Easing.quad),
      }),
    );
    amountScale.value = withDelay(
      150,
      withTiming(1, {
        duration: 700,
        easing: Easing.out(Easing.back(1.1)),
      }),
    );
    amountTranslateY.value = withDelay(
      150,
      withTiming(0, {
        duration: 700,
        easing: Easing.out(Easing.quad),
      }),
    );
  }, []);

  // 애니메이션 스타일
  const amountAnimatedStyle = useAnimatedStyle(() => ({
    opacity: amountOpacity.value,
    transform: [
      { scale: amountScale.value },
      { translateY: amountTranslateY.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, amountAnimatedStyle]}>
      {/* 금액 입력 표시 */}
      <View style={styles.amountInputContainer}>
        <Text style={styles.amountText}>{amount || '0'}</Text>
        <Text style={styles.currencyText}>원</Text>
      </View>

      {/* 잔액 전체 입력 버튼 */}
      <View style={styles.presetContainer}>
        <TouchableOpacity style={styles.presetButton} onPress={onBalanceInput}>
          <Text style={styles.presetButtonText}>
            잔액 • {accountBalance.toLocaleString('ko-KR')}원 입력
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.black,
    marginRight: 8,
  },
  currencyText: {
    fontSize: 20,
    color: colors.grey,
    fontWeight: '500',
  },
  presetContainer: {
    marginTop: 8,
  },
  presetButton: {
    backgroundColor: colors.silver,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  presetButtonText: {
    fontSize: 14,
    color: colors.lGrey,
  },
});
