import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import Header from '../../components/Header';
import ConfirmQuestion from '../../modules/transfer/components/ConfirmQuestion';
import TransactionDetailsCard from '../../modules/transfer/components/TransactionDetailsCard';
import ConfirmButton from '../../modules/transfer/components/ConfirmButton';
import AnimatedLayout from '../../modules/transfer/components/AnimatedLayout';

/**
 * 송금 확인 화면
 * 사용자가 입력한 송금 정보를 확인하고 최종 송금을 진행하는 화면
 */
export default function ConfirmScreen() {
  // useLocalSearchParams의 반환 타입은 기본적으로 string, string[], undefined 입니다
  const { accountNumber, bankName, userName, amount } = useLocalSearchParams();

  const handleConfirm = () => {
    router.push({
      pathname: '/transfer/complete' as any,
      params: { amount: amount },
    });
  };

  console.log(typeof amount);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header title="송금 확인" />

      <AnimatedLayout style={styles.content}>
        <View style={styles.spacer} />

        <ConfirmQuestion
          recipientName={userName as string}
          amount={Number(amount)}
        />

        {/* Middle spacer to push details card down */}
        <View style={styles.spacer} />

        {/* Transaction details - right above the button */}
        <TransactionDetailsCard
          recipientName={userName as string}
          bankName={bankName as string}
          accountNumber={accountNumber as string}
          amount={Number(amount)}
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
