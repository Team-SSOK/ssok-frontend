import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { formatNumber, formatDate } from '@/utils/formatters';

export interface Transaction {
  transferID: number;
  accountId: number;
  counterpartAccount: string;
  counterpartName: string;
  transferType: 'DEPOSIT' | 'WITHDRAW';
  transferMoney: number;
  currencyCode: number;
  transferMethod: number;
  createdAt: string;
  balanceAfterTransaction?: number;
}

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isDeposit = transaction.transferType === 'DEPOSIT';

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionName}>
          {transaction.counterpartName}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text
          style={[
            styles.transactionAmount,
            { color: isDeposit ? colors.primary : colors.black },
          ]}
        >
          {isDeposit ? '' : '-'}
          {formatNumber(transaction.transferMoney)}원
        </Text>
        {transaction.balanceAfterTransaction && (
          <Text style={styles.currentBalance}>
            잔액 {formatNumber(transaction.balanceAfterTransaction)}원
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: colors.mGrey,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  currentBalance: {
    fontSize: 14,
    color: colors.mGrey,
  },
});

export default TransactionItem;
