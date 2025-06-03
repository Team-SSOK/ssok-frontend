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
  const [transferError, setTransferError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    processTransfer,
    lastTransfer,
    error: transferErrorFromStore,
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
        setTransferError(null); // 성공 시 에러 초기화
      } else {
        // API 호출은 성공했지만 비즈니스 로직 실패
        setTransferSuccess(false);
        setTransferError(result.message || '송금 처리에 실패했습니다.');
        throw new Error(result.message || '송금 처리 결과를 받지 못했습니다.');
      }
    } catch (error) {
      // 네트워크 에러나 기타 예외 발생
      setTransferSuccess(false);
      
      // 사용자 친화적인 에러 메시지로 변경
      let userFriendlyMessage = '송금 처리 중 문제가 발생했습니다.';
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // 네트워크 관련 에러
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          userFriendlyMessage = '네트워크 연결에 문제가 발생했습니다. 연결 상태를 확인해주세요.';
        }
        // 서버 에러 (500, 503 등)
        else if (errorMessage.includes('status code 5') || errorMessage.includes('server error')) {
          userFriendlyMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        // 클라이언트 에러 (400, 401, 403 등)
        else if (errorMessage.includes('status code 4')) {
          userFriendlyMessage = '요청 처리 중 문제가 발생했습니다. 입력 정보를 확인해주세요.';
        }
        // 타임아웃 에러
        else if (errorMessage.includes('timeout')) {
          userFriendlyMessage = '요청 처리 시간이 초과되었습니다. 다시 시도해주세요.';
        }
        // 기타 알려진 에러들
        else if (errorMessage.includes('unauthorized')) {
          userFriendlyMessage = '인증에 문제가 발생했습니다. 다시 로그인해주세요.';
        }
        else if (errorMessage.includes('forbidden')) {
          userFriendlyMessage = '접근 권한이 없습니다. 계정 상태를 확인해주세요.';
        }
      }

      setTransferError(userFriendlyMessage);

      // 재시도 로직 (최대 2회)
      if (retryCount < 2) {
        showDialog({
          title: '송금 실패',
          content: `${userFriendlyMessage}\n\n다시 시도하시겠습니까?`,
          confirmText: '재시도',
          cancelText: '취소',
          onConfirm: () => {
            setRetryCount((prev) => prev + 1);
            // 재시도 시 에러 상태 초기화
            setTransferError(null);
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
          content: `${userFriendlyMessage}\n\n계속해서 문제가 발생하고 있습니다. 잠시 후 다시 시도해주세요.`,
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
          isSuccess={transferSuccess}
          message={transferError || undefined}
        />

        <View style={styles.spacer} />

        {/* 송금 완료/실패 후 버튼 표시 */}
        {!isLoading && (
          <View style={styles.buttonContainer}>
            {transferSuccess ? (
              // 성공 시: 홈으로 버튼
              <NextButton onPress={handleGoHome} enabled={true} title="홈으로" />
            ) : transferError ? (
              // 실패 시: 홈으로 버튼 (재시도는 다이얼로그에서 처리)
              <NextButton onPress={handleGoHome} enabled={true} title="홈으로" />
            ) : null}
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
