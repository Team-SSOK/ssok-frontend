import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';
import TransactionItem from './TransactionItem';
import { transferApi } from '@/modules/transfer/api/transferApi';
import { Text } from '@/components/TextProvider';
import { Transaction } from '@/utils/types';
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
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 최근 거래내역을 가져오는 함수
  const fetchRecentTransactions = async () => {
    setIsLoading(true);
    try {
      console.log('getRecentTransferHistory');
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
      // 오류 발생 시 빈 배열로 설정하여 UI에 빈 상태 표시
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ref를 통해 외부에서 호출할 수 있는 함수를 노출
  useImperativeHandle(ref, () => ({
    refresh: fetchRecentTransactions,
  }));

  useEffect(() => {
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
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>최근 거래내역이 없습니다.</Text>
        </View>
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
  },
  sectionTitle: {
    color: colors.black,
    fontWeight: '700',
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
