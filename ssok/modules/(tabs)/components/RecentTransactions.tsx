import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/colors';
import TransactionItem from './TransactionItem';
import { transferApi } from '@/modules/transfer/api/transferApi';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import { Transaction } from '@/utils/types';

interface RecentTransactionsProps {
  limit?: number;
}

export default function RecentTransactions({
  limit = 3,
}: RecentTransactionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await transferApi.getRecentTransferHistory();
        if (response.data.isSuccess && response.data.result) {
          // API 응답 데이터를 Transaction 형식으로 변환
          const historyData = response.data.result.map((item) => ({
            transferID: item.transferId,
            accountId: 0, // 계좌 ID는 필요 없음
            counterpartAccount: '', // API에서 제공하지 않음
            counterpartName: item.counterpartName,
            transferType:
              item.transferType === 'WITHDRAWAL'
                ? 'WITHDRAW'
                : ('DEPOSIT' as 'WITHDRAW' | 'DEPOSIT'),
            transferMoney: item.transferMoney,
            currencyCode: item.currencyCode === 'KRW' ? 1 : 2,
            transferMethod: item.transferMethod === 'GENERAL' ? 0 : 1,
            createdAt: item.createdAt,
            balanceAfterTransaction: 0, // API에서 제공하지 않음
          }));
          setTransactions(historyData);
        }
      } catch (error) {
        console.error('최근 거래내역 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, []);

  // 최근 거래내역 최대 limit개만 표시
  const limitedTransactions = transactions.slice(0, limit);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : limitedTransactions.length > 0 ? (
        <View style={styles.transactionsList}>
          {limitedTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.transferID.toString()}
              transaction={transaction}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>최근 거래내역이 없습니다.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    color: colors.black,
    fontSize: 18,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: colors.silver,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: colors.grey,
    fontSize: 14,
  },
  transactionsList: {
    marginTop: 8,
  },
});
