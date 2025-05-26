import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import HomeHeader from '@/modules/(tabs)/components/HomeHeader';
import AccountCard from '@/modules/(tabs)/components/AccountCard';
import RecentTransactions, {
  RecentTransactionsRefType,
} from '@/modules/(tabs)/components/RecentTransactions';
import NoAccountsState from '@/modules/(tabs)/components/NoAccountsState';
import { useLoadingStore } from '@/stores/loadingStore';
import { transferApi } from '@/modules/transfer/api/transferApi';

export default function HomeScreen() {
  const router = useRouter();
  const { accounts, fetchAccounts, getAccountDetail } = useAccountStore();
  const { withLoading } = useLoadingStore();
  const [refreshing, setRefreshing] = useState(false);
  const recentTransactionsRef = useRef<RecentTransactionsRefType>(null);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const reloadAllData = async () => {
    await fetchAccounts();
    if (recentTransactionsRef.current) {
      await recentTransactionsRef.current.refresh();
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadAllData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchAccounts]);

  const handleRegisterAccount = () => {
    router.push('/account/register');
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleAccountPress = async (accountId: number) => {
    await withLoading(async () => {
      await getAccountDetail(accountId);
      router.push(`/account/${accountId}`);
    });
  };

  const hasAccounts = accounts && accounts.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.background, colors.disabled]}
        style={styles.background}
      />

      <HomeHeader onSettingsPress={handleSettingsPress} />

      {!hasAccounts ? (
        <View style={styles.centerContainer}>
          <NoAccountsState onRegisterPress={handleRegisterAccount} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]} // 앱의 프라이머리 컬러 사용
              tintColor={colors.primary} // iOS에서 인디케이터 컬러
            />
          }
        >
          {accounts[0] && (
            <AccountCard
              account={accounts[0]}
              balance={accounts[0].balance || 0}
              onPress={() => handleAccountPress(accounts[0].accountId)}
            />
          )}
          <RecentTransactions ref={recentTransactionsRef} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20, // Extra padding for iOS
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
