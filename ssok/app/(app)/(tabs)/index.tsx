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
import { useRouter, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAccountStore } from '@/modules/account/stores/accountStore';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import HomeHeader from '@/modules/(tabs)/components/HomeHeader';
import AccountCarousel from '@/modules/(tabs)/components/AccountCarousel';
import RecentTransactionList, {
  RecentTransactionListRefType,
} from '@/modules/(tabs)/components/RecentTransactionList';
import NoAccountsState from '@/modules/(tabs)/components/NoAccountsState';
import { useLoadingStore } from '@/stores/loadingStore';
import { useProfileStore } from '@/modules/settings/store/profileStore';
import {
  useAuthStore,
  type AuthStoreState,
} from '@/modules/auth/store/authStore';

export default function HomeScreen() {
  const { accounts, fetchAccounts, getAccountDetail } = useAccountStore();
  const [refreshing, setRefreshing] = useState(false);
  const recentTransactionsRef = useRef<RecentTransactionListRefType>(null);
  const router = useRouter();

  const { withLoading } = useLoadingStore();
  const { fetchProfile } = useProfileStore();

  const hasAccounts = !!accounts?.length;

  const userId = useAuthStore((state: AuthStoreState) => state.user?.id);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [fetchProfile, userId]);

  useFocusEffect(
    useCallback(() => {
      console.log('[LOG][HomeScreen] Screen focused - fetching latest accounts');
      fetchAccounts();
    }, [fetchAccounts])
  );

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
      Toast.show({
        type: 'error',
        text1: '데이터 새로고침 실패',
        text2: '데이터를 새로고침하는 중 오류가 발생했습니다.',
        position: 'bottom',
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

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

  console.log(accounts)

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
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.carouselContainer}>
            <AccountCarousel
              accounts={accounts}
              onAccountPress={handleAccountPress}
              onAddAccountPress={handleRegisterAccount}
            />
          </View>
          <RecentTransactionList ref={recentTransactionsRef} />
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    marginBottom: 20,
  },
});
