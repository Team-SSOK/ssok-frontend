import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '@/constants/colors';

interface TransactionDetailsCardProps {
  recipientName: string;
  bankName: string;
  accountNumber: string;
  amount: number;
}

/**
 * 송금 상세 정보를 표시하는 카드 컴포넌트
 */
export default function TransactionDetailsCard({
  recipientName,
  bankName,
  accountNumber,
  amount,
}: TransactionDetailsCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>받는 분</Text>
        <Text style={styles.detailValue}>{recipientName}</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>받는 계좌</Text>
        <Text style={styles.detailValue}>
          {bankName} {accountNumber}
        </Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.detailRow}>
        <Text style={styles.amountLabel}>송금액</Text>
        <Text style={styles.amountValue}>
          {amount.toLocaleString('ko-KR')}
          <Text style={styles.wonSymbol}>원</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.lGrey,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.black,
  },
  separator: {
    height: 1,
    backgroundColor: colors.silver,
    marginVertical: 2,
  },
  amountLabel: {
    fontSize: 15,
    color: colors.lGrey,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  wonSymbol: {
    fontWeight: 'normal',
    color: colors.black,
  },
});
