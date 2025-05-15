import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { transactions } from '@/mock/transactionData';
import { filterTransactionsByPeriod } from '@/utils/dateUtils';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';

// 컴포넌트 임포트
import AccountInfoSection from '@/modules/account/components/AccountInfoSection';
import PeriodFilter, {
  PeriodFilterType,
} from '@/modules/account/components/PeriodFilter';
import TransactionList from '@/modules/account/components/TransactionList';
import { Transaction } from '@/utils/types';
import Header from '@/components/Header';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams();
  const accountId = id ? Number(id) : 0;
  const { currentAccount, getAccountDetail } = useAccountStore();

  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodFilterType>('1주일');
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  // 계좌 정보 로드
  useEffect(() => {
    if (accountId > 0 && !currentAccount) {
      getAccountDetail(accountId);
    }
  }, [accountId, getAccountDetail, currentAccount]);

  // 기간이 변경될 때마다 거래내역 필터링
  useEffect(() => {
    // 모든 거래내역에서 선택된 기간에 맞게 필터링
    const filtered = filterTransactionsByPeriod(transactions, selectedPeriod);
    setFilteredTransactions(filtered);
  }, [selectedPeriod]);

  const handleBackPress = () => {
    router.back();
  };

  const handlePeriodChange = (period: PeriodFilterType) => {
    setSelectedPeriod(period);
  };

  const handleViewAllPress = () => {
    console.log('거래내역 전체보기');
  };

  if (!currentAccount) {
    return null; // 계좌 정보가 로드되기 전에는 아무것도 렌더링하지 않음
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* 헤더 */}
      <Header title="나의 입출금 통장" />

      <ScrollView style={styles.scrollView}>
        {/* 계좌 정보 섹션 */}
        <AccountInfoSection
          accountNumber={currentAccount.accountNumber}
          accountType={
            currentAccount.accountAlias || currentAccount.accountTypeCode
          }
          balance={currentAccount.balance || 0}
        />

        {/* 기간 필터 */}
        <PeriodFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
        />

        {/* 거래 목록 */}
        <TransactionList
          transactions={filteredTransactions}
          onViewAllPress={handleViewAllPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 4,
  },
  headerText: {
    color: colors.black,
  },
  settingsButton: {
    padding: 4,
  },
});
