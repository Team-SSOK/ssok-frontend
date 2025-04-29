import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '@/constants/colors';

interface CompleteMessageProps {
  amount: number;
  message?: string;
}

/**
 * 송금 완료 메시지 및 애니메이션을 표시하는 컴포넌트
 */
export default function CompleteMessage({
  amount,
  message = '송금이 성공적으로 완료되었습니다.',
}: CompleteMessageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          source={require('@/assets/lottie/success.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />
      </View>

      <Text style={styles.title}>송금 완료</Text>
      <Text style={styles.amountText}>{amount.toLocaleString('ko-KR')}원</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  amountText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
