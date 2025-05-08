import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import TransactionItem from './TransactionItem';
import { Transaction } from '@/utils/types';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface TransactionListProps {
  transactions: Transaction[];
  onViewAllPress: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onViewAllPress,
}) => {
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
