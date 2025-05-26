import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import Header from '../../../components/Header';
import ConfirmQuestion from '../../../modules/transfer/components/ConfirmQuestion';
import TransactionDetailsCard from '../../../modules/transfer/components/TransactionDetailsCard';
import ConfirmButton from '../../../modules/transfer/components/ConfirmButton';
import AnimatedLayout from '../../../modules/transfer/components/AnimatedLayout';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useTransferStore } from '@/modules/transfer/stores/useTransferStore';
import {
  TransferRequest,
  BluetoothTransferRequest,
} from '@/modules/transfer/api/transferApi';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import { getBankCodeByName } from '@/modules/transfer/utils/bankUtils';
import { useProfileStore } from '@/modules/settings/store/profileStore';
import { useAuthStore } from '@/modules/auth/store/authStore';

/**
 * 송금 확인 화면
 * 사용자가 입력한 송금 정보를 확인하고 최종 송금을 진행하는 화면
 */
export default function ConfirmScreen() {
  // useLocalSearchParams의 반환 타입은 기본적으로 string, string[], undefined 입니다
  const { accountNumber, bankName, userName, amount, userId, isBluetooth } =
    useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { sendMoney, sendMoneyBluetooth } = useTransferStore();
  const { accounts } = useAccountStore();
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
    try {
      // 로딩 상태 활성화
      setIsLoading(true);

      // 사용자의 출금 계좌 (기본 계좌 또는 첫 번째 계좌)
      const sendAccount =
        accounts.find((acc) => acc.isPrimaryAccount) || accounts[0];

      if (!sendAccount) {
        Alert.alert('출금 계좌 없음', '송금할 출금 계좌가 존재하지 않습니다.');
        setIsLoading(false);
        return;
      }

      // 사용자 이름이 없는 경우 대체 값 사용
      const senderName = username || '사용자';

      // 블루투스 송금인 경우 (userId로 송금)
      if (isBluetoothTransfer && userId) {
        // 블루투스 송금 API 호출
        const bluetoothTransferData: BluetoothTransferRequest = {
          sendAccountId: sendAccount.accountId,
          sendBankCode: sendAccount.bankCode,
          sendName: senderName,
          recvUserId: Number(userId),
          amount: Number(amount),
        };

        console.log(
          'Sending bluetooth transfer with data:',
          bluetoothTransferData,
        );

        // API 호출
        const response = await sendMoneyBluetooth(bluetoothTransferData);

        if (!response) {
          throw new Error('블루투스 송금 요청이 실패했습니다.');
        }
      }
      // 일반 계좌 송금인 경우
      else {
        // 송금 요청 데이터 구성
        const transferData: TransferRequest = {
          sendAccountId: sendAccount.accountId,
          sendBankCode: sendAccount.bankCode,
          sendName: senderName,
          recvAccountNumber: accountNumber as string,
          recvBankCode: getBankCodeByName(bankName as string),
          recvName: userName as string,
          amount: Number(amount),
        };

        console.log('Sending transfer with username:', senderName);

        // API 호출
        const response = await sendMoney(transferData);

        if (!response) {
          throw new Error('송금 요청이 실패했습니다.');
        }
      }

      // 로딩 상태 비활성화
      setIsLoading(false);

      // 송금 완료 페이지로 이동
      router.push({
        pathname: '/transfer/complete' as any,
        params: {
          amount: amount,
          userName: userName as string,
          userId: isBluetoothTransfer ? userId : undefined,
          isBluetooth: isBluetoothTransfer ? 'true' : 'false',
        },
      });
    } catch (error) {
      // 로딩 상태 비활성화
      setIsLoading(false);

      console.error('송금 처리 중 오류:', error);
      Alert.alert(
        '송금 실패',
        error instanceof Error
          ? error.message
          : '송금 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        [{ text: '확인', style: 'default' }],
      );
    }
  }, [
    accounts,
    amount,
    accountNumber,
    bankName,
    isBluetoothTransfer,
    userId,
    userName,
    username,
    sendMoney,
    sendMoneyBluetooth,
  ]);

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

      {/* 로딩 컴포넌트 - 단순 Lottie 애니메이션만 표시 */}
      <LoadingIndicator visible={isLoading} />
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
