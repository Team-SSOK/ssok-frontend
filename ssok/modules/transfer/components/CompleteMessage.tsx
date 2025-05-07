import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '@/constants/colors';

interface CompleteMessageProps {
  amount: number;
  message?: string;
  isBluetoothTransfer?: boolean;
  userId?: string;
}

/**
 * 송금 완료 메시지 및 애니메이션을 표시하는 컴포넌트
 */
export default function CompleteMessage({
  amount,
  message,
  isBluetoothTransfer = false,
  userId,
}: CompleteMessageProps) {
  // 송금 방식에 따른 메시지 생성
  const defaultMessage = isBluetoothTransfer
    ? '블루투스 송금이 성공적으로 완료되었습니다.'
    : '송금이 성공적으로 완료되었습니다.';

  const displayMessage = message || defaultMessage;

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

      {isBluetoothTransfer && userId && (
        <Text style={styles.bluetoothInfo}>
          <Text style={styles.bluetoothLabel}>Bluetooth 송금 | </Text>
          <Text style={styles.userId}>ID: {userId}</Text>
        </Text>
      )}

      <Text style={styles.message}>{displayMessage}</Text>
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
  bluetoothInfo: {
    fontSize: 16,
    marginBottom: 16,
    color: colors.black,
  },
  bluetoothLabel: {
    fontWeight: '500',
    color: colors.primary,
  },
  userId: {
    fontWeight: 'normal',
  },
  message: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
