import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import {
  formatNumber,
  formatDate,
  maskAccountNumber,
} from '@/utils/formatters';
import { Transaction } from './RecentTransactions';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>
          {transaction.counterpartName}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {
            color:
              transaction.transferType === 'DEPOSIT'
                ? colors.primary
                : colors.black,
          },
        ]}
      >
        {transaction.transferType === 'DEPOSIT' ? '+' : '-'}{' '}
        {formatNumber(transaction.transferMoney)}원
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 4,
  },
  transactionAccount: {
    fontSize: 12,
    color: colors.mGrey,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: colors.mGrey,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default memo(TransactionItem);
