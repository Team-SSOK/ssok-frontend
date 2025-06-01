import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';
import { useTransferStore } from '@/modules/transfer/stores/transferStore';
import TransactionItem from './TransactionItem';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import LoadingIndicator from '@/components/LoadingIndicator';

// Props 인터페이스 - List 형태로 명명
interface RecentTransactionListProps {
  limit?: number;
}

// Ref 타입 - List 형태로 명명
export type RecentTransactionListRefType = {
  refresh: () => Promise<void>;
};

const RecentTransactionList = forwardRef<
  RecentTransactionListRefType,
  RecentTransactionListProps
>((props, ref) => {
  const { transactions, isLoading, fetchRecentTransactions, error } =
    useTransferStore();

  const limit = props.limit || 5;

  const refresh = useCallback(async () => {
    await fetchRecentTransactions(limit);
  }, [fetchRecentTransactions, limit]);

  useImperativeHandle(ref, () => ({
    refresh,
  }));

  if (isLoading && transactions.length === 0) {
    return <LoadingIndicator visible={true} />;
  }

  if (error && transactions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h3, styles.title]}>최근 송금내역</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[typography.body2, styles.errorText]}>
            송금내역을 불러올 수 없습니다
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.body1, styles.title]}>최근 송금내역</Text>
      </View>

      {transactions.slice(0, limit).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[typography.body2, styles.emptyText]}>
            아직 송금내역이 없습니다
          </Text>
        </View>
      ) : (
        <View style={styles.transactionContainer}>
          {transactions.slice(0, limit).map((transaction) => (
            <TransactionItem
              key={transaction.transferID.toString()}
              transaction={transaction}
            />
          ))}
        </View>
      )}
    </View>
  );
});

export default RecentTransactionList;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    minHeight: 150,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  errorTextDetails: {
    color: colors.text.secondary,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  transactionContainer: {
    // Add appropriate styles for the transaction container
  },
});
