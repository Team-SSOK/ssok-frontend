import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';

interface AmountHeaderProps {
  accountDisplayName: string;
  recipientName: string;
  bankName: string;
  accountNumber?: string; // 블루투스 송금 시에는 계좌번호가 없을 수 있음
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
  const headerTranslateY = useSharedValue(-15);

  React.useEffect(() => {
    // 더 부드러운 easing과 짧은 딜레이로 자연스러운 애니메이션
    headerOpacity.value = withDelay(
      50,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );
    headerTranslateY.value = withDelay(
      50,
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, []);

  // 애니메이션 스타일
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
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
            {bankName}
            {accountNumber ? ` ${accountNumber}` : ''}
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
