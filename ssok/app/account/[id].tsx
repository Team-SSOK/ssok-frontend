import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { mockAccount, getAccountBalance } from '@/mock/accountData';
import { transactions } from '@/mock/transactionData';
import { filterTransactionsByPeriod } from '@/utils/dateUtils';

// 컴포넌트 임포트
import AccountInfoSection from '@/modules/account/components/AccountInfoSection';
import PeriodFilter, {
  PeriodFilterType,
} from '@/modules/account/components/PeriodFilter';
import TransactionList from '@/modules/account/components/TransactionList';
import { Transaction } from '@/modules/account/components/TransactionItem';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams();
  const accountId = id ? Number(id) : mockAccount.accountID;
  const account = mockAccount; // 실제로는 accountId로 계좌 정보를 가져옴
  const balance = getAccountBalance();

  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodFilterType>('1주일');
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  // 기간이 변경될 때마다 거래내역 필터링
  useEffect(() => {
    // 모든 거래내역에서 선택된 기간에 맞게 필터링
    const filtered = filterTransactionsByPeriod(transactions, selectedPeriod);
    setFilteredTransactions(filtered);
  }, [selectedPeriod]);

  const handleBackPress = () => {
    router.back();
  };

  const handleSettingsPress = () => {
    // 계좌 설정 페이지로 이동
    console.log('계좌 설정');
  };

  const handlePeriodChange = (period: PeriodFilterType) => {
    setSelectedPeriod(period);
  };

  const handleViewAllPress = () => {
    console.log('거래내역 전체보기');
    // 전체 거래내역 페이지로 이동
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>나의 입출금 통장</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleSettingsPress}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 계좌 정보 섹션 */}
        <AccountInfoSection
          accountNumber={account.accountNumber}
          accountType={account.accountAlias}
          balance={balance}
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
    fontSize: 18,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 4,
  },
});
