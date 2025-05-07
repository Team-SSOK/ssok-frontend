import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Alert } from 'react-native';
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
  const { accountNumber, bankName, userName, amount, userId, isBluetooth } =
    useLocalSearchParams();

  const isBluetoothTransfer = isBluetooth === 'true';

  const handleConfirm = async () => {
    try {
      // 로딩 표시
      Alert.alert('송금 처리 중', '송금을 처리하고 있습니다...');

      // 블루투스 송금인 경우 (userId로 송금)
      if (isBluetoothTransfer && userId) {
        // 블루투스 송금 API 호출 (userId 기반)
        // 실제 구현 시에는 아래 주석을 해제하고 API를 호출
        // const response = await fetch('/api/transfer/bluetooth', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     userId: userId,
        //     amount: Number(amount)
        //   }),
        // });

        // 임시 구현: 송금 성공 가정 (2초 지연)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('블루투스 송금 완료:', { userId, amount });
      }
      // 일반 계좌 송금인 경우
      else {
        // 기존 계좌 기반 송금 API 호출
        // 실제 구현 시에는 아래 주석을 해제하고 API를 호출
        // const response = await fetch('/api/transfer/account', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     accountNumber: accountNumber,
        //     bankCode: getBankCode(bankName as string),
        //     amount: Number(amount)
        //   }),
        // });

        // 임시 구현: 송금 성공 가정 (2초 지연)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('계좌 송금 완료:', { accountNumber, bankName, amount });
      }

      // 송금 완료 페이지로 이동
      router.push({
        pathname: '/transfer/complete' as any,
        params: {
          amount: amount,
          userId: isBluetoothTransfer ? userId : undefined,
          isBluetooth: isBluetoothTransfer ? 'true' : 'false',
        },
      });
    } catch (error) {
      console.error('송금 처리 중 오류:', error);
      Alert.alert(
        '송금 실패',
        '송금 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        [{ text: '확인', style: 'default' }],
      );
    }
  };

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
