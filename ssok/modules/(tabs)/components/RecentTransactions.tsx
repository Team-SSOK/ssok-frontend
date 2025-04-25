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

// Transaction interface based on TransferHistory table
export interface Transaction {
  transferID: number; // 송금ID (PK, auto increment)
  accountId: number; // 계좌ID (본인 계좌ID)
  counterpartAccount: string; // 상대계좌번호
  counterpartName: string; // 상대이름
  transferType: 'DEPOSIT' | 'WITHDRAW'; // 송금타입 (입금/출금)
  transferMoney: number; // 송금금액
  currencyCode: 1 | 2; // 통화코드 (1: 원화, 2: 달러)
  transferMethod: 0 | 1; // 송금방식 (0: 일반, 1: 빠른이체)
  createdAt: string; // 생성일자
}

const mockTransactions: Transaction[] = [
  {
    transferID: 1,
    accountId: 10001,
    counterpartAccount: '110-456-789012',
    counterpartName: '카페',
    transferType: 'WITHDRAW',
    transferMoney: 4500,
    currencyCode: 1, // 원화
    transferMethod: 0, // 일반
    createdAt: '2025-04-25T09:30:00Z',
  },
  {
    transferID: 2,
    accountId: 10001,
    counterpartAccount: '210-123-456789',
    counterpartName: '월급',
    transferType: 'DEPOSIT',
    transferMoney: 2500000,
    currencyCode: 1, // 원화
    transferMethod: 0, // 일반
    createdAt: '2025-04-24T12:00:00Z',
  },
  {
    transferID: 3,
    accountId: 10001,
    counterpartAccount: '110-789-123456',
    counterpartName: '편의점',
    transferType: 'WITHDRAW',
    transferMoney: 8700,
    currencyCode: 1, // 원화
    transferMethod: 0, // 일반
    createdAt: '2025-04-24T18:45:00Z',
  },
];

interface RecentTransactionsProps {
  onViewAllPress?: () => void;
}

export default function RecentTransactions({
  onViewAllPress,
}: RecentTransactionsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>최근 거래내역</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllButton}>전체보기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockTransactions}
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
