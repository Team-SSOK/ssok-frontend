import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import { StepComponentProps } from '../../types/transferFlow';
import AmountHeader from '../AmountHeader';
import AmountDisplay from '../AmountDisplay';
import TransferKeypad from '../TransferKeypad';

/**
 * 금액 입력 스텝 컴포넌트
 * 계좌 정보, 수취인 정보, 금액 입력, 키패드를 포함합니다
 */
export default function AmountStep({
  data,
  onNext,
  onBack,
}: StepComponentProps) {
  const [amount, setAmount] = useState<string>('');
  const [btnEnabled, setBtnEnabled] = useState<boolean>(false);

  const { accounts } = useAccountStore();

  // 기본 계좌 정보 가져오기
  const primaryAccount =
    accounts.find((acc) => acc.isPrimaryAccount) || accounts[0];
  const accountBalance = primaryAccount?.balance || 0;
  const accountDisplayName = primaryAccount
    ? `내 ${primaryAccount.bankName} 계좌`
    : '내 계좌';

  // 금액 입력 상태에 따른 버튼 활성화
  useEffect(() => {
    const numericAmount = parseInt(amount.replace(/,/g, '')) || 0;
    setBtnEnabled(numericAmount > 0);
  }, [amount]);

  // 숫자 포맷팅 (천 단위 콤마)
  const formatNumber = (num: string) => {
    const number = num.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 키패드 입력 처리
  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      setAmount((prev) => {
        const newAmount = prev.slice(0, -1);
        return formatNumber(newAmount);
      });
      return;
    }

    if (key === '00') {
      setAmount((prev) => {
        const currentNumber = prev.replace(/,/g, '');
        if (currentNumber === '' || currentNumber === '0') return prev;
        const newNumber = currentNumber + '00';
        if (newNumber.length > 10) return prev; // 최대 100억원 제한
        return formatNumber(newNumber);
      });
      return;
    }

    // 일반 숫자 입력
    setAmount((prev) => {
      const currentNumber = prev.replace(/,/g, '');
      if (currentNumber === '0') return formatNumber(key);
      const newNumber = currentNumber + key;
      if (newNumber.length > 10) return prev; // 최대 100억원 제한
      return formatNumber(newNumber);
    });
  };

  // 잔액 전체 입력
  const handleBalanceInput = () => {
    setAmount(accountBalance.toLocaleString('ko-KR'));
  };

  // 다음 버튼 처리
  const handleNext = () => {
    const numericAmount = parseInt(amount.replace(/,/g, '')) || 0;
    if (numericAmount > 0) {
      onNext({ amount: numericAmount });
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 - 계좌 정보 및 수취인 정보 */}
      <AmountHeader
        accountDisplayName={accountDisplayName}
        recipientName={data.userName || '수취인'}
        bankName={data.selectedBank?.name || ''}
        accountNumber={data.accountNumber || ''}
      />

      {/* 금액 표시 및 입력 */}
      <AmountDisplay
        amount={amount}
        accountBalance={accountBalance}
        onBalanceInput={handleBalanceInput}
      />

      {/* 하단 여백 */}
      <View style={styles.bottomSpace} />

      {/* 키패드 및 다음 버튼 */}
      <TransferKeypad
        onKeyPress={handleKeyPress}
        onNext={handleNext}
        showNextButton={btnEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  bottomSpace: {
    height: 100,
  },
});
