import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StepComponentProps } from '../../types/transferFlow';

// 기존 컴포넌트 재사용
import AmountDisplay from '../AmountDisplay';
import Keypad from '../Keypad';
import NextButton from '../NextButton';

/**
 * 금액 입력 스텝 컴포넌트
 */
export default function AmountStep({
  data,
  onNext,
  onBack,
}: StepComponentProps) {
  const [amount, setAmount] = useState<number>(data.amount || 0);
  const [btnEnabled, setBtnEnabled] = useState<boolean>(false);

  useEffect(() => {
    setBtnEnabled(!isNaN(amount) && amount > 0);
  }, [amount]);

  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      // 백스페이스 기능
      setAmount((prev) => {
        if (String(prev).length <= 1) return 0;
        return Number(String(prev).slice(0, -1));
      });
      return;
    }

    if (key === 'clear') {
      // 금액 초기화
      setAmount(0);
      return;
    }

    // 일반 숫자 입력
    setAmount((prev) => {
      if (prev === 0) return Number(key);

      // 최대 7자리 (백만원까지)로 제한
      if (String(prev).length >= 7) return prev;

      return Number(String(prev) + key);
    });
  };

  const handleNext = () => {
    // 유효성 검사
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    // 다음 스텝으로 이동
    onNext({ amount });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AmountDisplay
          amount={amount}
          recipientName={data.userName || ''}
          bankName={data.selectedBank?.name || ''}
          accountNumber={
            data.isBluetoothTransfer ? undefined : data.accountNumber
          }
        />

        <View style={styles.spacer} />

        <Keypad onKeyPress={handleKeyPress} />

        <View style={styles.buttonContainer}>
          <NextButton onPress={handleNext} enabled={btnEnabled} title="다음" />
        </View>
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
    paddingHorizontal: 20,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 24,
  },
});
