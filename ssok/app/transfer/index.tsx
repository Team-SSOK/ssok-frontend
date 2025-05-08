import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';

// 모듈화된 컴포넌트 임포트
import AccountInput from '@/modules/transfer/components/AccountInput';
import BankSelector from '@/modules/transfer/components/BankSelector';
import NextButton from '@/modules/transfer/components/NextButton';
import { Bank } from '@/mock/bankData';
import Header from '@/components/Header';

export default function TransferScreen() {
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  // 은행 선택 처리
  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
  };

  // 다음 단계로 이동
  const handleNextPress = () => {
    if (accountNumber && selectedBank) {
      router.push({
        pathname: '/transfer/amount',
        params: {
          accountNumber,
          bankId: selectedBank.id,
          bankName: selectedBank.name,
          bankCode: selectedBank.code,
        },
      });
    }
  };

  // 다음 버튼 활성화 여부
  const isNextButtonEnabled =
    accountNumber.length > 10 && selectedBank !== null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* 헤더 */}
      <Header title="어디로 보낼까요?" />

      <ScrollView style={styles.content}>
        {/* 계좌번호 입력 컴포넌트 */}
        <AccountInput value={accountNumber} onChangeText={setAccountNumber} />

        {/* 은행 선택 컴포넌트 */}
        <BankSelector
          selectedBankId={selectedBank?.id || null}
          onBankSelect={handleBankSelect}
        />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <NextButton onPress={handleNextPress} enabled={isNextButtonEnabled} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 26,
  },
  footer: {
    padding: 16,
  },
});
