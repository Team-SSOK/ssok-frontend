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
import { useNotificationInitializer } from '@/modules/notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETUP_KEY = 'notification_setup_completed';

export default function HomeScreen() {
  const { accounts, fetchAccounts, getAccountDetail } = useAccountStore();
  const [refreshing, setRefreshing] = useState(false);
  const [shouldSetupNotification, setShouldSetupNotification] = useState(false);
  const { withLoading } = useLoadingStore();
  const recentTransactionsRef = useRef<RecentTransactionsRefType>(null);

  const router = useRouter();

  const hasAccounts = accounts && accounts.length > 0;

  // 푸시 알림 초기화 (로그인 후 한 번만 실행)
  const notification = useNotificationInitializer({
    autoRegister: shouldSetupNotification, // 조건부로 자동 등록
    onSuccess: async (token) => {
      console.log(
        '[Notification] 푸시 토큰 등록 성공:',
        token.substring(0, 20) + '...',
      );
      // 성공 시 완료 플래그 저장
      await AsyncStorage.setItem(NOTIFICATION_SETUP_KEY, 'true');
    },
    onError: (error) => {
      console.warn('[Notification] 푸시 알림 설정 오류:', error);
      // 에러가 발생해도 다음에 다시 시도할 수 있도록 플래그는 저장하지 않음
    },
    onNotificationReceived: (notification) => {
      console.log('[Notification] 알림 수신:', notification);
    },
    onNotificationResponse: (response) => {
      console.log('[Notification] 알림 탭:', response);
    },
  });

  // 알림 설정이 필요한지 확인
  useEffect(() => {
    const checkNotificationSetup = async () => {
      try {
        const isCompleted = await AsyncStorage.getItem(NOTIFICATION_SETUP_KEY);
        if (!isCompleted) {
          console.log('[Notification] 푸시 알림 설정 시작');
          setShouldSetupNotification(true);
        } else {
          console.log('[Notification] 푸시 알림 이미 설정됨');
        }
      } catch (error) {
        console.error('[Notification] 설정 확인 오류:', error);
        // 에러 시에도 설정 시도
        setShouldSetupNotification(true);
      }
    };

    checkNotificationSetup();
  }, []);

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
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
