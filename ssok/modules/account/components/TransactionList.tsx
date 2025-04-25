import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import TransactionItem from './TransactionItem';
import { Transaction } from '@/utils/types';

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

      {/* 더보기 버튼 */}
      <Pressable style={styles.moreButton} onPress={onViewAllPress}>
        <Text style={styles.moreButtonText}>더보기</Text>
      </Pressable>
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
    fontSize: 16,
    fontWeight: '600',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.mGrey,
  },
  separator: {
    height: 1,
    backgroundColor: colors.silver,
    marginVertical: 4,
  },
  moreButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.silver,
    borderRadius: 8,
  },
  moreButtonText: {
    fontSize: 16,
    color: colors.mGrey,
  },
});

export default TransactionList;
