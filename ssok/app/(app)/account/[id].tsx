import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { colors } from '@/constants/colors';
import { filterTransactionsByPeriod } from '@/utils/dateUtils';
import { useAccountStore } from '@/modules/account/stores/accountStore';
import { useTransferStore } from '@/modules/transfer/stores/transferStore';
import { useLoadingStore } from '@/stores/loadingStore';

// 컴포넌트 임포트
import AccountInfoSection from '@/modules/account/components/AccountInfoSection';
import PeriodFilter, {
  PeriodFilterType,
} from '@/modules/account/components/PeriodFilter';
import TransactionList from '@/modules/account/components/TransactionList';
import { Transaction } from '@/utils/types';
import Header from '@/components/CommonHeader';

/**
 * 계좌 상세 화면
 *
 * 계좌 정보와 거래내역을 표시하는 화면입니다.
 */
export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams();
  const accountId = id ? Number(id) : 0;
  const { currentAccount, getAccountDetail } = useAccountStore();
  const { getTransferHistory } = useTransferStore();
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
      const result = await getTransferHistory(accountId);

      if (result.success && result.data) {
        setTransactions(result.data);
      } else {
        Toast.show({
          type: 'error',
          text1: '거래내역 조회 실패',
          text2: result.message || '거래내역을 불러올 수 없습니다.',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '거래내역 조회 오류',
        text2: '거래내역 조회 중 오류가 발생했습니다.',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  }, [
    currentAccount,
    accountId,
    startLoading,
    stopLoading,
    getTransferHistory,
  ]);

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

  const handlePeriodChange = (period: PeriodFilterType) => {
    setSelectedPeriod(period);
  };


  if (!currentAccount) {
    return null; // 로딩 UI 또는 오류 UI로 대체 가능
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* 헤더 */}
      <Header title={`나의 ${currentAccount.bankName} 통장`}/>

      <ScrollView style={styles.scrollView}>
        {/* 계좌 정보 섹션 */}
        <AccountInfoSection
          accountId={accountId}
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
