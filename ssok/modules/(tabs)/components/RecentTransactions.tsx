import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';
import TransactionItem from './TransactionItem';
import { useTransferStore } from '@/modules/transfer/stores/transferStore';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface RecentTransactionsProps {
  limit?: number;
}

// forwardRef로 ref를 받을 수 있도록 구현
export type RecentTransactionsRefType = {
  refresh: () => Promise<void>;
};

const RecentTransactions = forwardRef<
  RecentTransactionsRefType,
  RecentTransactionsProps
>(({ limit = 3 }, ref) => {
  const { transactions, isLoading, fetchRecentTransactions, error } =
    useTransferStore();

  // 최근 거래내역을 가져오는 함수 (스토어 액션 호출)
  const loadTransactions = async () => {
    await fetchRecentTransactions(limit);
  };

  useImperativeHandle(ref, () => ({
    refresh: loadTransactions,
  }));

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  // 최근 거래내역 최대 limit개만 표시
  const limitedTransactions = transactions.slice(0, limit);

  return (
    <View style={styles.container}>
      {isLoading && limitedTransactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : limitedTransactions.length > 0 ? (
        <View style={styles.transactionsList}>
          <Text style={[typography.body1, styles.sectionTitle]}>
            최근 거래내역
          </Text>
          {limitedTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.transferID.toString()}
              transaction={transaction}
            />
          ))}
        </View>
      ) : (
        !isLoading &&
        !error && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>최근 거래내역이 없습니다</Text>
          </View>
        )
      )}
    </View>
  );
});

export default RecentTransactions;

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
  sectionTitle: {
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
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
  transactionsList: {},
});
