import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';
import { formatNumber, formatDate } from '@/utils/formatters';
import { Transaction } from '@/utils/types';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={[typography.body1, styles.transactionDescription]}>
          {transaction.counterpartName}
        </Text>
        <Text style={[typography.caption, styles.transactionDate]}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
      <Text
        style={[
          typography.body1,
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
    color: colors.black,
    marginBottom: 4,
  },
  transactionDate: {
    color: colors.mGrey,
  },
  transactionAmount: {
    fontWeight: '600',
  },
});

export default memo(TransactionItem);
