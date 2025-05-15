import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { NameVerificationRequest } from '@/modules/account/api/accountApi';
import { Text } from '@/components/TextProvider';

// 모듈화된 컴포넌트 임포트
import AccountInput from '@/modules/transfer/components/AccountInput';
import BankSelector from '@/modules/transfer/components/BankSelector';
import NextButton from '@/modules/transfer/components/NextButton';
import { Bank } from '@/mock/bankData';
import Header from '@/components/Header';

export default function TransferScreen() {
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { verifyAccountName } = useAccountStore();
  const { withLoading, isLoading } = useLoadingStore();

  // 은행 선택 처리
  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setErrorMessage(null);
  };

  // 다음 단계로 이동 (계좌 실명 조회 후)
  const handleNextPress = async () => {
    if (accountNumber && selectedBank) {
      const bankCode = Number(selectedBank.code);

      // 입력받은 계좌번호에서 하이픈 제거
      const cleanAccountNumber = accountNumber.replace(/-/g, '');

      // API 요청용 포맷팅 (xxx-xx-xxxx-xxxxxx 형식)
      const formattedAccountNumber = formatAccountNumber(cleanAccountNumber);

      // 요청 데이터 구성
      const verificationRequest: NameVerificationRequest = {
        accountNumber: formattedAccountNumber,
        bankCode,
      };

      await withLoading(async () => {
        try {
          // 실명 조회 API 호출
          const response = await verifyAccountName(verificationRequest);

          if (response) {
            // 성공한 경우 다음 화면으로 이동
            router.push({
              pathname: '/transfer/amount',
              params: {
                accountNumber: response.accountNumber,
                bankId: selectedBank.id,
                bankName: selectedBank.name,
                bankCode: selectedBank.code,
                userName: response.username,
              },
            });
          } else {
            setErrorMessage('계좌 실명 조회에 실패했습니다.');
          }
        } catch (error) {
          setErrorMessage('계좌 실명 조회에 실패했습니다.');
        }
      });
    }
  };

  // 계좌번호 포맷팅 함수 (xxx-xx-xxxx-xxxxxx 형식으로 변환)
  const formatAccountNumber = (accountNumber: string): string => {
    if (!accountNumber) return '';

    // 자리수에 따라 다르게 포맷팅할 수 있도록 구현
    // 기본 형식: xxx-xx-xxxx-xxxxxx
    const digits = accountNumber.replace(/\D/g, '');

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 5) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}-${digits.slice(9)}`;
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

        {/* 에러 메시지 */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <NextButton onPress={handleNextPress} enabled={isNextButtonEnabled} />
      </View>
      {isLoading && <View style={styles.loadingOverlay}></View>}
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
  errorContainer: {
    padding: 10,
    marginTop: 10,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.primary,
  },
});
