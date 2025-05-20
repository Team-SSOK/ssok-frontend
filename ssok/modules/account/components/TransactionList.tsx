import React, { memo } from 'react';
import { StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
import { colors } from '@/constants/colors';
import TransactionItem from './TransactionItem';
import { Transaction } from '@/utils/types';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface TransactionListProps {
  /**
   * 거래내역 목록
   */
  transactions: Transaction[];

  /**
   * 전체보기 버튼 클릭 시 실행할 함수
   */
  onViewAllPress: () => void;

  /**
   * 로딩 상태
   */
  isLoading?: boolean;

  /**
   * 에러 메시지
   */
  errorMessage?: string;
}

/**
 * 거래내역 목록 컴포넌트
 *
 * 계좌의 거래내역을 리스트로 표시합니다.
 * 로딩 상태, 비어있는 상태, 에러 상태 처리를 포함합니다.
 */
const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onViewAllPress,
  isLoading = false,
  errorMessage,
}) => {
  // 로딩 중 상태 UI
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 에러 상태 UI
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

  // 거래 내역 렌더링
  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.transferID.toString()}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // 부모 ScrollView에서 스크롤 처리
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
