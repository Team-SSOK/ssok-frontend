import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import Header from '../../components/Header';
import AmountDisplay from '../../modules/transfer/components/AmountDisplay';
import Keypad from '../../modules/transfer/components/Keypad';
import NextButton from '../../modules/transfer/components/NextButton';
import AnimatedLayout from '../../modules/transfer/components/AnimatedLayout';
import { Text } from '@/components/TextProvider';

/**
 * 송금 금액 입력 화면
 */
export default function AmountScreen() {
  const { accountNumber, bankName, userName, userId, isBluetooth } =
    useLocalSearchParams();
  const [amount, setAmount] = useState<number>(0);
  const [btnEnabled, setBtnEnabled] = useState<boolean>(false);

  const isBluetoothTransfer = isBluetooth === 'true';

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
    // 유효성 검사 추가
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    // 다음 단계로 이동 (송금 확인 페이지)
    router.push({
      pathname: '/transfer/confirm' as any,
      params: {
        amount: amount,
        accountNumber,
        bankName,
        userName,
        userId: isBluetoothTransfer ? userId : undefined,
        isBluetooth: isBluetoothTransfer ? 'true' : 'false',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header title="얼마를 보낼까요?" />

      <AnimatedLayout style={styles.content}>
        <AmountDisplay
          amount={amount}
          recipientName={userName as string}
          bankName={bankName as string}
          accountNumber={
            isBluetoothTransfer ? undefined : (accountNumber as string)
          }
        />

        <View style={styles.spacer} />

        <Keypad onKeyPress={handleKeyPress} />

        <View style={styles.buttonContainer}>
          <NextButton onPress={handleNext} enabled={btnEnabled} title="다음" />
        </View>
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
    paddingHorizontal: 20,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 24,
  },
  recipientInfo: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
    marginBottom: 20,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  recipientAccount: {
    fontSize: 14,
    color: colors.grey,
  },
});
