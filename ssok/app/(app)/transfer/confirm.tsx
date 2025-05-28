import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import Header from '../../../components/Header';
import ConfirmQuestion from '../../../modules/transfer/components/ConfirmQuestion';
import TransactionDetailsCard from '../../../modules/transfer/components/TransactionDetailsCard';
import ConfirmButton from '../../../modules/transfer/components/ConfirmButton';
import AnimatedLayout from '../../../modules/transfer/components/AnimatedLayout';
import { useProfileStore } from '@/modules/settings/store/profileStore';
import { useAuthStore } from '@/modules/auth/store/authStore';

/**
 * 송금 확인 화면
 * 사용자가 입력한 송금 정보를 확인하고 complete 페이지로 이동하는 화면
 */
export default function ConfirmScreen() {
  // useLocalSearchParams의 반환 타입은 기본적으로 string, string[], undefined 입니다
  const { accountNumber, bankName, userName, amount, userId, isBluetooth } =
    useLocalSearchParams();
  const { username, fetchProfile } = useProfileStore();
  const { user } = useAuthStore();

  // 프로필 정보 로드
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user?.id);
    }
  }, [user?.id, fetchProfile]);

  const isBluetoothTransfer = isBluetooth === 'true';

  const handleConfirm = useCallback(async () => {
    // 송금 완료 페이지로 바로 이동 (API 호출은 complete 페이지에서 수행)
    router.push({
      pathname: '/transfer/complete' as any,
      params: {
        amount: amount,
        userName: userName as string,
        accountNumber: accountNumber as string,
        bankName: bankName as string,
        userId: isBluetoothTransfer ? userId : undefined,
        isBluetooth: isBluetoothTransfer ? 'true' : 'false',
      },
    });
  }, [amount, accountNumber, bankName, isBluetoothTransfer, userId, userName]);

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
          accountNumber={
            isBluetoothTransfer ? '블루투스 송금' : (accountNumber as string)
          }
          amount={Number(amount)}
          isBluetoothTransfer={isBluetoothTransfer}
          userId={isBluetoothTransfer ? (userId as string) : undefined}
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
