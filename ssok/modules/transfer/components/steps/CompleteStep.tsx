import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { StepComponentProps } from '../../types/transferFlow';
import { useTransferStore } from '../../stores/transferStore';
import { useAccountStore } from '@/modules/account/stores/accountStore';
import { useAuthStore } from '@/modules/auth/store/authStore';
import useDialog from '@/hooks/useDialog';

// 기존 컴포넌트 재사용
import CompleteMessage from '../CompleteMessage';
import NextButton from '../NextButton';

/**
 * 송금 완료 스텝 컴포넌트
 */
export default function CompleteStep({ data, onBack }: StepComponentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const {
    processTransfer,
    lastTransfer,
    error: transferError,
  } = useTransferStore();
  const { accounts } = useAccountStore();
  const { user } = useAuthStore();
  const { showDialog } = useDialog();

  // 송금 실행 함수
  const executeTransfer = useCallback(async () => {
    try {
      setIsLoading(true);

      // 사용자의 출금 계좌 (선택된 계좌 또는 기본 계좌 또는 첫 번째 계좌)
      const sendAccount = data.sourceAccountId 
        ? accounts.find((acc) => acc.accountId === Number(data.sourceAccountId))
        : accounts.find((acc) => acc.primaryAccount) || accounts[0];

      if (!sendAccount) {
        showDialog({
          title: '출금 계좌 없음',
          content: '송금할 출금 계좌가 존재하지 않습니다.',
          confirmText: '확인',
          onConfirm: () => onBack?.(),
        });
        return;
      }

      // 필수 데이터 검증
      if (!data.amount || data.amount <= 0) {
        throw new Error('송금 금액이 올바르지 않습니다.');
      }

      if (!data.userName) {
        throw new Error('수취인 정보가 없습니다.');
      }

      // 블루투스 송금과 일반 송금 구분하여 검증
      if (data.isBluetoothTransfer) {
        if (!data.uuid) {
          throw new Error('블루투스 송금에 필요한 UUID가 없습니다.');
        }
      } else {
        if (!data.accountNumber || !data.selectedBank) {
          throw new Error('송금에 필요한 계좌 정보가 없습니다.');
        }
      }

      // 사용자 이름이 없는 경우 대체 값 사용
      const senderName = user?.username || '사용자';

      // 송금 처리 데이터 구성
      const transferData = {
        amount: data.amount,
        userName: data.userName,
        accountNumber: data.accountNumber || '',
        bankName: data.selectedBank?.name || '',
        uuid: data.uuid || '',
        isBluetoothTransfer: data.isBluetoothTransfer || false,
        senderName,
        sendAccountId: sendAccount.accountId,
        sendBankCode: sendAccount.bankCode,
      };

      // 송금 API 호출
      const result = await processTransfer(transferData);

      if (result.success && result.data) {
        setTransferSuccess(true);
      } else {
        throw new Error(result.message || '송금 처리 결과를 받지 못했습니다.');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '송금 처리 중 오류가 발생했습니다.';

      // 재시도 로직 (최대 2회)
      if (retryCount < 2) {
        showDialog({
          title: '송금 실패',
          content: `${errorMessage}\n\n다시 시도하시겠습니까?`,
          confirmText: '재시도',
          cancelText: '취소',
          onConfirm: () => {
            setRetryCount((prev) => prev + 1);
            // 1초 후 재시도
            setTimeout(() => {
              executeTransfer();
            }, 1000);
          },
          onCancel: () => onBack?.(),
        });
      } else {
        // 재시도 횟수 초과
        showDialog({
          title: '송금 실패',
          content: `${errorMessage}\n\n계속해서 문제가 발생하고 있습니다. 잠시 후 다시 시도해주세요.`,
          confirmText: '확인',
          onConfirm: () => onBack?.(),
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    data,
    accounts,
    user?.username,
    processTransfer,
    onBack,
    retryCount,
    showDialog,
  ]);

  // 컴포넌트 마운트 시 송금 실행
  useEffect(() => {
    // 약간의 딜레이를 주어 UI가 안정화된 후 실행
    const timer = setTimeout(() => {
      executeTransfer();
    }, 1500);

    return () => clearTimeout(timer);
  }, []); // 의존성 배열을 비워서 한 번만 실행

  const handleGoHome = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 송금 완료 메시지와 애니메이션 */}
        <CompleteMessage
          amount={data.amount || 0}
          isBluetoothTransfer={data.isBluetoothTransfer || false}
          recipientName={
            data.isBluetoothTransfer ? data.userName : lastTransfer?.recvName
          }
          accountNumber={
            data.isBluetoothTransfer
              ? undefined
              : lastTransfer?.recvAccountNumber
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
