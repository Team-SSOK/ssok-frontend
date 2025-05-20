import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';
import { formatNumber, formatDate } from '@/utils/formatters';
import { Transaction } from '@/utils/types';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface TransactionItemProps {
  /**
   * 거래 내역
   */
  transaction: Transaction;
}

/**
 * 거래 내역 아이템 컴포넌트
 *
 * 개별 거래 내역 정보를 표시합니다.
 * 입금/출금에 따라 다른 스타일을 적용하고, 거래 방식(일반/블루투스)도 표시합니다.
 */
const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  // 입금 여부 확인
  const isDeposit = transaction.transferType === 'DEPOSIT';

  // 금액 표시 스타일 설정 (단순 조건문이므로 useMemo 불필요)
  const amountColor = isDeposit ? colors.primary : colors.black;

  // 송금 방식 표시 (0: 일반, 1: 블루투스) (단순 조건문이므로 useMemo 불필요)
  const transferMethodText =
    transaction.transferMethod === 0 ? '일반' : '블루투스';

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
            { color: amountColor },
          ]}
        >
          {isDeposit ? '+' : '-'}
          {formatNumber(transaction.transferMoney)}원
        </Text>
        <Text style={[typography.caption, styles.transferMethod]}>
          {transferMethodText}
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
    fontWeight: '600',
  },
  transferMethod: {
    color: colors.mGrey,
  },
});

// props가 변경될 때만 리렌더링하도록 메모이제이션
export default memo(TransactionItem);
