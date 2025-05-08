import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';
import { formatNumber, formatDate } from '@/utils/formatters';
import { Transaction } from '@/utils/types';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isDeposit = transaction.transferType === 'DEPOSIT';

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={[typography.body1, styles.transactionName]}>
          {transaction.counterpartName}
        </Text>
        <Text style={[typography.caption, styles.transactionDate]}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text
          style={[
            typography.body1,
            styles.transactionAmount,
            { color: isDeposit ? colors.primary : colors.black },
          ]}
        >
          {isDeposit ? '' : '-'}
          {formatNumber(transaction.transferMoney)}원
        </Text>
        <Text style={[typography.caption, styles.currentBalance]}>
          잔액 {formatNumber(transaction.balanceAfterTransaction)}원
        </Text>
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
    marginBottom: 4,
  },
  transactionDate: {
    color: colors.mGrey,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    marginBottom: 4,
  },
  currentBalance: {
    color: colors.mGrey,
  },
});

export default TransactionItem;
