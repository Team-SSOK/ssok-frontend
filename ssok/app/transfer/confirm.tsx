import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import Header from '../../modules/transfer/components/Header';
import ConfirmQuestion from '../../modules/transfer/components/ConfirmQuestion';
import TransactionDetailsCard from '../../modules/transfer/components/TransactionDetailsCard';
import ConfirmButton from '../../modules/transfer/components/ConfirmButton';
import AnimatedLayout from '../../modules/transfer/components/AnimatedLayout';

/**
 * 송금 확인 화면
 * 사용자가 입력한 송금 정보를 확인하고 최종 송금을 진행하는 화면
 */
export default function ConfirmScreen() {
  const { accountNumber, bankName, userName, amount } = useLocalSearchParams();

  // NaN 문제 해결: 유효한 숫자가 아닐 경우 기본값 사용
  const parsedAmount = parseFloat(amount as string);
  const formattedAmount = !isNaN(parsedAmount)
    ? parsedAmount.toLocaleString('ko-KR')
    : '0';

  const handleConfirm = () => {
    router.push({
      pathname: '/transfer/complete' as any,
      params: { amount: parsedAmount },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header title="송금 확인" />

      <AnimatedLayout style={styles.content}>
        {/* Top spacer to push content down */}
        <View style={styles.spacer} />

        {/* Main question section - centered vertically */}
        <ConfirmQuestion
          recipientName={userName as string}
          amount={formattedAmount}
        />

        {/* Middle spacer to push details card down */}
        <View style={styles.spacer} />

        {/* Transaction details - right above the button */}
        <TransactionDetailsCard
          recipientName={userName as string}
          bankName={bankName as string}
          accountNumber={accountNumber as string}
          amount={formattedAmount}
        />

        {/* Confirm button */}
        <ConfirmButton onPress={handleConfirm} />
      </AnimatedLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: 24,
    paddingBottom: 36,
    display: 'flex',
    flexDirection: 'column',
  },
  spacer: {
    flex: 1,
  },
});
