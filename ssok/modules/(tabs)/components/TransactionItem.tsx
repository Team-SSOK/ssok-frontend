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
  const isDeposit = transaction.transferType === 'DEPOSIT';

  // 날짜 표시 형식 간소화
  const formattedDate = () => {
    const txDate = new Date(transaction.createdAt);
    const today = new Date();

    // 오늘인 경우 "Today"로 표시
    if (
      txDate.getDate() === today.getDate() &&
      txDate.getMonth() === today.getMonth() &&
      txDate.getFullYear() === today.getFullYear()
    ) {
      return '오늘';
    }

    // 그 외의 경우 "월 일" 형식으로 표시 (예: "May 12")
    return `${txDate.getMonth() + 1}월 ${txDate.getDate()}일`;
  };

  return (
    <View style={styles.transactionItem}>
      <View style={styles.leftSection}>
        <Text style={[typography.body1, styles.merchantName]}>
          {transaction.counterpartName}
        </Text>
        <Text style={[typography.caption, styles.transactionDate]}>
          {formattedDate()}
        </Text>
      </View>

      <Text
        style={[
          typography.body2,
          styles.transactionAmount,
          { color: isDeposit ? colors.primary : colors.black },
        ]}
      >
        {isDeposit ? '' : '-'}
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver + '30', // 약간 투명한 경계선
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  merchantName: {
    fontWeight: '500',
    color: colors.black,
    marginBottom: 4,
  },
  transactionDate: {
    color: colors.grey,
  },
  transactionAmount: {
    fontWeight: '600',
  },
});

export default memo(TransactionItem);
