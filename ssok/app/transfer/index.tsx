import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

// 은행 정보 타입
type BankOption = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

// 은행 옵션 데이터
const bankOptions: BankOption[] = [
  {
    id: 'toss',
    name: '토스뱅크',
    icon: 'wallet-outline',
    color: '#3182F6', // 토스뱅크 파란색
  },
  {
    id: 'kakao',
    name: '카카오뱅크',
    icon: 'chatbubble-outline',
    color: '#FFDE00', // 카카오뱅크 노란색
  },
  {
    id: 'kb',
    name: '국민은행',
    icon: 'business-outline',
    color: '#FFBA0A', // 국민은행 노란색
  },
];

export default function TransferScreen() {
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  // 계좌번호 입력 처리
  const handleAccountNumberChange = (text: string) => {
    // 숫자만 입력 가능하도록 필터링
    const filtered = text.replace(/[^0-9]/g, '');
    setAccountNumber(filtered);
  };

  // 은행 선택 처리
  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
  };

  // 뒤로가기 처리
  const handleBackPress = () => {
    router.back();
  };

  // 다음 단계로 이동
  const handleNextPress = () => {
    if (accountNumber && selectedBank) {
      // 다음 단계(금액 입력 등)로 이동
      console.log('다음 단계로 이동', { accountNumber, selectedBank });
      // router.push('/transfer/amount');
    }
  };

  // 다음 버튼 활성화 여부
  const isNextButtonEnabled =
    accountNumber.length > 10 && selectedBank !== null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>어디로 보낼까요?</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 계좌번호 입력 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계좌번호</Text>
          <TextInput
            style={styles.accountInput}
            placeholder="'-' 없이 입력해주세요"
            placeholderTextColor={colors.lGrey}
            value={accountNumber}
            onChangeText={handleAccountNumberChange}
            keyboardType="number-pad"
            autoFocus
          />
        </View>

        {/* 은행 선택 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>은행 선택</Text>
          <View style={styles.bankOptions}>
            {bankOptions.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[
                  styles.bankOption,
                  selectedBank === bank.id && styles.selectedBankOption,
                ]}
                onPress={() => handleBankSelect(bank.id)}
              >
                <View
                  style={[
                    styles.bankIconContainer,
                    { backgroundColor: bank.color },
                    selectedBank === bank.id &&
                      styles.selectedBankIconContainer,
                  ]}
                >
                  <Ionicons name={bank.icon} size={24} color={colors.white} />
                </View>
                <Text
                  style={[
                    styles.bankName,
                    selectedBank === bank.id && styles.selectedBankName,
                  ]}
                >
                  {bank.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            isNextButtonEnabled
              ? styles.nextButtonEnabled
              : styles.nextButtonDisabled,
          ]}
          onPress={handleNextPress}
          disabled={!isNextButtonEnabled}
        >
          <Text
            style={[
              styles.nextButtonText,
              isNextButtonEnabled
                ? styles.nextButtonTextEnabled
                : styles.nextButtonTextDisabled,
            ]}
          >
            다음
          </Text>
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
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
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.black,
  },
  accountInput: {
    borderWidth: 1,
    borderColor: colors.silver,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
  },
  bankOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bankOption: {
    alignItems: 'center',
    width: '30%',
    padding: 8,
    borderRadius: 8,
  },
  selectedBankOption: {
    backgroundColor: colors.silver,
  },
  bankIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  selectedBankIconContainer: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bankName: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.black,
    marginTop: 4,
  },
  selectedBankName: {
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.silver,
  },
  nextButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonEnabled: {
    backgroundColor: colors.primary,
  },
  nextButtonDisabled: {
    backgroundColor: colors.silver,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextEnabled: {
    color: colors.white,
  },
  nextButtonTextDisabled: {
    color: colors.lGrey,
  },
});
