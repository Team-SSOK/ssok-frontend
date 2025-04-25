import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import Header from '../../modules/transfer/components/Header';
import NextButton from '../../modules/transfer/components/NextButton';

export default function ConfirmScreen() {
  const { accountNumber, bankName, userName, amount } = useLocalSearchParams();
  const formattedAmount = parseInt(amount as string, 10).toLocaleString(
    'ko-KR',
  );

  const handleBackPress = () => {
    router.back();
  };

  const handleConfirm = () => {
    // 송금 처리 로직 구현 예정
    // 성공 시 완료 페이지로 이동
    router.push('/transfer/complete' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header title="송금 확인" onBackPress={handleBackPress} />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>송금 정보</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>받는 분</Text>
            <Text style={styles.infoValue}>{userName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>받는 계좌</Text>
            <Text style={styles.infoValue}>
              {bankName} {accountNumber}
            </Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>송금액</Text>
            <Text style={styles.amountValue}>{formattedAmount}원</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <NextButton onPress={handleConfirm} enabled={true} title="송금하기" />
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
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.black,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.grey,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginTop: 4,
  },
  amountLabel: {
    fontSize: 16,
    color: colors.grey,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 24,
  },
});
