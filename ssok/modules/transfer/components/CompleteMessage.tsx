import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

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

      <Text style={[typography.h1, styles.title]}>송금 완료</Text>
      <Text style={[typography.h1, styles.amountText]}>
        {amount.toLocaleString('ko-KR')}원
      </Text>

      {isBluetoothTransfer && userId && (
        <Text style={[typography.body1, styles.bluetoothInfo]}>
          <Text style={[typography.body1, styles.bluetoothLabel]}>
            Bluetooth 송금 |{' '}
          </Text>
          <Text style={[typography.body1, styles.userId]}>ID: {userId}</Text>
        </Text>
      )}

      <Text style={[typography.body1, styles.message]}>{displayMessage}</Text>
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
    color: colors.black,
    marginBottom: 16,
  },
  amountText: {
    color: colors.primary,
    marginBottom: 20,
  },
  bluetoothInfo: {
    marginBottom: 16,
    color: colors.black,
  },
  bluetoothLabel: {
    color: colors.primary,
    fontWeight: '500',
  },
  userId: {
    fontWeight: 'normal',
  },
  message: {
    color: colors.grey,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
