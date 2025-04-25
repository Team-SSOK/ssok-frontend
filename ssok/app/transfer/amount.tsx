import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import Header from '../../modules/transfer/components/Header';
import AmountDisplay from '../../modules/transfer/components/AmountDisplay';
import Keypad from '../../modules/transfer/components/Keypad';
import NextButton from '../../modules/transfer/components/NextButton';

export default function AmountScreen() {
  const { accountNumber, bankName, userName } = useLocalSearchParams();
  const [amount, setAmount] = useState<string>('0');
  const [btnEnabled, setBtnEnabled] = useState<boolean>(false);

  useEffect(() => {
    // 금액이 0보다 크면 다음 버튼 활성화
    setBtnEnabled(parseInt(amount, 10) > 0);
  }, [amount]);

  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      // 백스페이스 기능
      setAmount((prev) => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
      return;
    }

    if (key === 'clear') {
      // 금액 초기화
      setAmount('0');
      return;
    }

    // 일반 숫자 입력
    setAmount((prev) => {
      if (prev === '0') return key;

      // 최대 7자리 (백만원까지)로 제한
      if (prev.length >= 7) return prev;

      return prev + key;
    });
  };

  const handleNext = () => {
    // 다음 단계로 이동 (송금 확인 페이지)
    router.push({
      pathname: '/transfer/confirm' as any,
      params: {
        amount,
        accountNumber,
        bankName,
        userName,
      },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header title="얼마를 보낼까요?" onBackPress={handleBackPress} />

      <View style={styles.content}>
        <AmountDisplay
          amount={amount}
          recipientName={userName as string}
          bankName={bankName as string}
        />

        <View style={styles.spacer} />

        <Keypad onKeyPress={handleKeyPress} />

        <View style={styles.buttonContainer}>
          <NextButton onPress={handleNext} enabled={btnEnabled} title="다음" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
