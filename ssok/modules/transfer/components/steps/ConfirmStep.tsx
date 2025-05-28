import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StepComponentProps } from '../../types/transferFlow';

// 기존 컴포넌트 재사용
import ConfirmQuestion from '../ConfirmQuestion';
import TransactionDetailsCard from '../TransactionDetailsCard';
import ConfirmButton from '../ConfirmButton';

/**
 * 송금 확인 스텝 컴포넌트
 */
export default function ConfirmStep({
  data,
  onNext,
  onBack,
}: StepComponentProps) {
  const handleConfirm = () => {
    // 확인 완료 후 다음 스텝으로 이동
    onNext({ isConfirmed: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.spacer} />

        <ConfirmQuestion
          recipientName={data.userName || ''}
          amount={data.amount || 0}
        />

        {/* Middle spacer to push details card down */}
        <View style={styles.spacer} />

        {/* Transaction details - right above the button */}
        <TransactionDetailsCard
          recipientName={data.userName || ''}
          bankName={data.selectedBank?.name || ''}
          accountNumber={
            data.isBluetoothTransfer
              ? '블루투스 송금'
              : data.accountNumber || ''
          }
          amount={data.amount || 0}
          isBluetoothTransfer={data.isBluetoothTransfer || false}
          userId={data.isBluetoothTransfer ? data.userId : undefined}
        />

        {/* Confirm button */}
        <ConfirmButton onPress={handleConfirm} />
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
    padding: 24,
    paddingBottom: 36,
    display: 'flex',
    flexDirection: 'column',
  },
  spacer: {
    flex: 1,
  },
});
