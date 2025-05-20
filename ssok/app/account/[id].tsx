import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { filterTransactionsByPeriod } from '@/utils/dateUtils';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import { transferApi } from '@/modules/transfer/api/transferApi';
import { useLoadingStore } from '@/stores/loadingStore';

// 컴포넌트 임포트
import AccountInfoSection from '@/modules/account/components/AccountInfoSection';
import PeriodFilter, {
  PeriodFilterType,
} from '@/modules/account/components/PeriodFilter';
import TransactionList from '@/modules/account/components/TransactionList';
import { Transaction } from '@/utils/types';
import Header from '@/components/Header';

/**
 * 계좌 상세 화면
 *
 * 계좌 정보와 거래내역을 표시하는 화면입니다.
 */
export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams();
  const accountId = id ? Number(id) : 0;
  const { currentAccount, getAccountDetail } = useAccountStore();
  const { startLoading, stopLoading } = useLoadingStore();

  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodFilterType>('1주일');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  // 계좌 정보 로드
  useEffect(() => {
    const loadAccountDetails = async () => {
      if (accountId > 0 && !currentAccount) {
        await getAccountDetail(accountId);
      }
    };

    loadAccountDetails();
  }, [accountId, getAccountDetail, currentAccount]);

  // 거래내역 로드 (API 호출이 있어 useCallback 유지)
  const fetchTransferHistory = useCallback(async () => {
    if (!currentAccount) return;

    setIsLoading(true);
    startLoading();

    try {
      const response = await transferApi.getTransferHistory(accountId);
      if (response.data.isSuccess && response.data.result) {
        // API 응답 데이터를 Transaction 형식으로 변환
        const historyData = response.data.result.map((item) => ({
          transferID: item.transferId,
          accountId: accountId,
          counterpartAccount: item.counterpartAccount,
          counterpartName: item.counterpartName,
          transferType:
            item.transferType === 'WITHDRAWAL'
              ? 'WITHDRAW'
              : ('DEPOSIT' as 'WITHDRAW' | 'DEPOSIT'),
          transferMoney: item.transferMoney,
          currencyCode: item.currencyCode === 'KRW' ? 1 : 2,
          transferMethod: item.transferMethod === 'GENERAL' ? 0 : 1,
          createdAt: item.createdAt,
          balanceAfterTransaction: 0, // API에서 제공되지 않음
        }));
        setTransactions(historyData);
      }
    } catch (error) {
      console.error('거래내역 조회 실패:', error);
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  }, [currentAccount, accountId, startLoading, stopLoading]);

  // 현재 계좌가 로드되면 거래내역 조회
  useEffect(() => {
    if (currentAccount) {
      fetchTransferHistory();
    }
  }, [currentAccount, fetchTransferHistory]);

  // 기간이 변경될 때마다 거래내역 필터링
  useEffect(() => {
    const filtered = filterTransactionsByPeriod(transactions, selectedPeriod);
    setFilteredTransactions(filtered);
  }, [selectedPeriod, transactions]);

  // 기간 변경 핸들러 (단순 상태 업데이트이므로 useCallback 불필요)
  const handlePeriodChange = (period: PeriodFilterType) => {
    setSelectedPeriod(period);
  };

  // 거래내역 전체보기 핸들러 (단순 로그이므로 useCallback 불필요)
  const handleViewAllPress = () => {
    console.log('거래내역 전체보기');
    // 전체보기 화면으로 이동하는 로직 추가
  };

  // 계좌 정보가 없으면 로딩 중 또는 오류 상태
  if (!currentAccount) {
    return null; // 로딩 UI 또는 오류 UI로 대체 가능
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
          isLoading={isLoading}
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
