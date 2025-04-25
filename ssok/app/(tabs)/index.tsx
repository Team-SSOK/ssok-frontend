import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';

// Components
import AccountHeader from '@/modules/(tabs)/components/AccountHeader';
import AccountCard from '@/modules/(tabs)/components/AccountCard';
import RecentTransactions from '@/modules/(tabs)/components/RecentTransactions';

// Mock data
import { mockAccount, getAccountBalance } from '@/mock/accountData';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [accountBalance, setAccountBalance] = useState<number>(0);

  // 계좌 잔액 정보 로드
  useEffect(() => {
    const balance = getAccountBalance();
    setAccountBalance(balance);
  }, []);

  // 새로고침 처리
  const onRefresh = () => {
    setRefreshing(true);

    // 새로고침 시 데이터를 다시 불러오는 로직
    setTimeout(() => {
      const updatedBalance = getAccountBalance();
      setAccountBalance(updatedBalance);
      setRefreshing(false);
    }, 1000);
  };

  // 설정 버튼 클릭 처리
  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleAccountPress = () => {
    // @ts-ignore - Expo Router typing issue
    router.push(`/account/${mockAccount.accountID}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <AccountHeader onSettingsPress={handleSettingsPress} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 계좌 카드 */}
        <AccountCard
          account={mockAccount}
          balance={accountBalance}
          onPress={handleAccountPress}
        />

        {/* 최근 거래내역 */}
        <RecentTransactions
          onViewAllPress={() => console.log('거래내역 전체보기')}
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
  contentContainer: {
    padding: 20,
  },
});
