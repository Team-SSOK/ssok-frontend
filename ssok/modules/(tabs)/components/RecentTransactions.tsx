import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors } from '@/constants/colors';
import TransactionItem from './TransactionItem';
import { transactions } from '@/mock/transactionData';

interface RecentTransactionsProps {
  limit?: number;
}

export default function RecentTransactions({
  limit = 3,
}: RecentTransactionsProps) {
  // 최근 거래내역 최대 3개만 표시
  const limitedTransactions = transactions.slice(0, limit);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>최근 거래내역</Text>
      </View>

      <FlatList
        data={limitedTransactions}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        keyExtractor={(item) => item.transferID.toString()}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  viewAllButton: {
    fontSize: 14,
    color: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.silver,
  },
});
