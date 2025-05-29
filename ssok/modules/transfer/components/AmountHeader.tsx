import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';

interface AmountHeaderProps {
  accountDisplayName: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
}

/**
 * 송금 금액 입력 화면의 헤더 컴포넌트
 * 계좌 정보와 수취인 정보를 표시합니다
 */
export default function AmountHeader({
  accountDisplayName,
  recipientName,
  bankName,
  accountNumber,
}: AmountHeaderProps) {
  // 애니메이션을 위한 shared value
  const headerOpacity = useSharedValue(0);

  React.useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
  }, []);

  // 애니메이션 스타일
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      { translateY: withTiming(headerOpacity.value === 1 ? 0 : -20) },
    ],
  }));

  return (
    <Animated.View style={[styles.container, headerAnimatedStyle]}>
      {/* 상단 계좌 정보 */}
      <View style={styles.header}>
        <Text style={styles.accountTitle}>{accountDisplayName}에서</Text>
      </View>

      {/* 수취인 정보 */}
      <View style={styles.recipientSection}>
        <Text style={styles.recipientLabel}>{recipientName}님에게</Text>
        <View style={styles.recipientInfo}>
          <Text style={styles.bankIcon}>✓</Text>
          <Text style={styles.accountInfo}>
            {bankName} {accountNumber}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 12,
  },
  accountTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  recipientSection: {
    paddingVertical: 16,
  },
  recipientLabel: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 8,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIcon: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    fontWeight: 'bold',
  },
  accountInfo: {
    fontSize: 14,
    color: colors.grey,
  },
});
