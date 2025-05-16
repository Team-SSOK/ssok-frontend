import React from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';
import TransactionItem from './TransactionItem';
import { Transaction } from '@/utils/types';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface TransactionListProps {
  transactions: Transaction[];
  onViewAllPress: () => void;
  isLoading?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onViewAllPress,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>거래내역이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {transactions.map((transaction) => (
        <React.Fragment key={transaction.transferID}>
          <TransactionItem transaction={transaction} />
          <View style={styles.separator} />
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    color: colors.grey,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
  },
  balanceLabel: {
    color: colors.mGrey,
  },
  separator: {
    height: 1,
    backgroundColor: colors.silver,
    marginVertical: 4,
  },
});

export default TransactionList;
