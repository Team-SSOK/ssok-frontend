import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import NextButton from '../../../modules/transfer/components/NextButton';
import AnimatedLayout from '../../../modules/transfer/components/AnimatedLayout';
import CompleteMessage from '../../../modules/transfer/components/CompleteMessage';
import { useTransferStore } from '@/modules/transfer/stores/useTransferStore';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import { useProfileStore } from '@/modules/settings/store/profileStore';

/**
 * 송금 완료 화면
 * 렌더링과 동시에 송금 API를 호출하고 결과를 표시하는 화면
 */
export default function CompleteScreen() {
  const { amount, isBluetooth, userId, userName, accountNumber, bankName } =
    useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const isBluetoothTransfer = isBluetooth === 'true';
  const { processTransfer, lastTransfer, error } = useTransferStore();
  const { accounts } = useAccountStore();
  const { username } = useProfileStore();

  // 컴포넌트 마운트 시 송금 API 호출
  useEffect(() => {
    const executeTransfer = async () => {
      try {
        // 사용자의 출금 계좌 (기본 계좌 또는 첫 번째 계좌)
        const sendAccount =
          accounts.find((acc) => acc.isPrimaryAccount) || accounts[0];

        if (!sendAccount) {
          Alert.alert(
            '출금 계좌 없음',
            '송금할 출금 계좌가 존재하지 않습니다.',
          );
          router.back();
          return;
        }

        // 사용자 이름이 없는 경우 대체 값 사용
        const senderName = username || '사용자';

        // 송금 처리 데이터 구성
        const transferData = {
          amount: Number(amount),
          userName: userName as string,
          accountNumber: accountNumber as string,
          bankName: bankName as string,
          userId: userId as string,
          isBluetoothTransfer,
          senderName,
          sendAccountId: sendAccount.accountId,
          sendBankCode: sendAccount.bankCode,
        };

        console.log('Executing transfer with data:', transferData);

        // 송금 API 호출
        await processTransfer(transferData);

        setTransferSuccess(true);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('송금 처리 중 오류:', error);

        Alert.alert(
          '송금 실패',
          error instanceof Error
            ? error.message
            : '송금 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
          [
            {
              text: '확인',
              onPress: () => router.back(), // 이전 페이지로 돌아가기
            },
          ],
        );
      }
    };

    executeTransfer();
  }, [
    amount,
    userName,
    accountNumber,
    bankName,
    userId,
    isBluetoothTransfer,
    accounts,
    username,
    processTransfer,
  ]);

  const handleGoHome = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <AnimatedLayout style={styles.content} duration={300}>
        {/* 송금 완료 메시지와 애니메이션 */}
        <CompleteMessage
          amount={Number(amount)}
          isBluetoothTransfer={isBluetoothTransfer}
          userId={isBluetoothTransfer ? (userId as string) : undefined}
          recipientName={
            isBluetoothTransfer ? (userName as string) : lastTransfer?.recvName
          }
          accountNumber={
            isBluetoothTransfer ? undefined : lastTransfer?.recvAccountNumber
          }
          isLoading={isLoading}
        />

        <View style={styles.spacer} />

        {/* 송금 성공 시에만 홈으로 돌아가기 버튼 표시 */}
        {transferSuccess && !isLoading && (
          <View style={styles.buttonContainer}>
            <NextButton onPress={handleGoHome} enabled={true} title="홈으로" />
          </View>
        )}
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
    minHeight: 100,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 24,
  },
});
