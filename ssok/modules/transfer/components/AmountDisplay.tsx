import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface AmountDisplayProps {
  amount: string;
  recipientName: string;
  bankName: string;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  recipientName,
  bankName,
}) => {
  // 금액을 한국어 표기법으로 포맷팅 (천 단위 콤마)
  const formattedAmount = parseInt(amount, 10).toLocaleString('ko-KR');

  return (
    <View style={styles.container}>
      <View style={styles.recipientInfo}>
        <Text style={styles.recipientLabel}>받는 분</Text>
        <Text style={styles.recipientText}>{recipientName}</Text>
        <Text style={styles.bankNameText}>{bankName}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currency}>{formattedAmount}원</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  recipientInfo: {
    padding: 16,
    backgroundColor: colors.silver,
    borderRadius: 12,
    marginBottom: 40,
  },
  recipientLabel: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
  },
  recipientText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  bankNameText: {
    fontSize: 14,
    color: colors.black,
  },
  amountContainer: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 18,
    color: colors.black,
    marginBottom: 16,
  },
  currency: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default AmountDisplay;
