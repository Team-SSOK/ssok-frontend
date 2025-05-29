import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { NameVerificationRequest } from '@/modules/account/api/accountApi';
import { Text } from '@/components/TextProvider';
import { StepComponentProps } from '../../types/transferFlow';
import { Bank } from '@/mocks/bankData';

// 기존 컴포넌트 재사용
import AccountInput from '../AccountInput';
import BankSelector from '../BankSelector';
import NextButton from '../NextButton';

/**
 * 계좌 정보 입력 스텝 컴포넌트
 */
export default function AccountStep({ data, onNext }: StepComponentProps) {
  const [accountNumber, setAccountNumber] = useState(data.accountNumber || '');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(
    data.selectedBank || null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { verifyAccountName } = useAccountStore();
  const { withLoading, isLoading } = useLoadingStore();

  // 은행 선택 처리
  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setErrorMessage(null);
  };

  // 계좌번호 포맷팅 함수
  const formatAccountNumber = (accountNumber: string): string => {
    if (!accountNumber) return '';

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

  // 다음 단계로 이동 (계좌 실명 조회 후)
  const handleNextPress = useCallback(async () => {
    if (accountNumber && selectedBank) {
      const bankCode = Number(selectedBank.code);
      const cleanAccountNumber = accountNumber.replace(/-/g, '');
      const formattedAccountNumber = formatAccountNumber(cleanAccountNumber);

      const verificationRequest: NameVerificationRequest = {
        accountNumber: formattedAccountNumber,
        bankCode,
      };

      await withLoading(async () => {
        try {
          const response = await verifyAccountName(verificationRequest);

          if (response) {
            // 성공한 경우 다음 스텝으로 이동
            onNext({
              accountNumber: response.accountNumber,
              selectedBank,
              userName: response.username,
            });
          } else {
            setErrorMessage('계좌 실명 조회에 실패했습니다.');
          }
        } catch (error) {
          setErrorMessage('계좌 실명 조회에 실패했습니다.');
        }
      });
    }
  }, [accountNumber, selectedBank, verifyAccountName, withLoading, onNext]);

  // 다음 버튼 활성화 여부
  const isNextButtonEnabled =
    accountNumber.length > 10 && selectedBank !== null;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 계좌번호 입력 컴포넌트 */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <AccountInput value={accountNumber} onChangeText={setAccountNumber} />
        </Animated.View>

        {/* 은행 선택 컴포넌트 */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <BankSelector
            selectedBankId={selectedBank?.id || null}
            onBankSelect={handleBankSelect}
          />
        </Animated.View>

        {/* 에러 메시지 */}
        {errorMessage && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.errorContainer}
          >
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* 하단 버튼 */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(500)}
        style={styles.footer}
      >
        <NextButton
          onPress={handleNextPress}
          enabled={isNextButtonEnabled && !isLoading}
          title="다음"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 36,
  },
  footer: {
    padding: 16,
  },
  errorContainer: {
    padding: 16,
  },
  errorText: {
    color: colors.error,
  },
});
