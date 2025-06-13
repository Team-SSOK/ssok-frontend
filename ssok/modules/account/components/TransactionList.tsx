import React, { memo } from 'react';
import { StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
import { colors } from '@/constants/colors';
import TransactionItem from './TransactionItem';
import { Transaction } from '@/utils/types';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  errorMessage?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  errorMessage,
}) => {

  if (errorMessage) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={[typography.body2, styles.errorText]}>{errorMessage}</Text>
      </View>
    );
  }

  // 데이터 없는 상태 UI
  if (transactions.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={[typography.body1, styles.emptyText]}>
          거래내역이 없습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.transferID.toString()}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyText: {
    color: colors.grey,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.silver,
    marginVertical: 8,
  },
});

// props가 변경될 때만 리렌더링하도록 메모이제이션
export default memo(TransactionList);
