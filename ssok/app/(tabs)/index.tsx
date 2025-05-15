import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import HomeHeader from '@/modules/(tabs)/components/HomeHeader';
import AccountCard from '@/modules/(tabs)/components/AccountCard';
import RecentTransactions from '@/modules/(tabs)/components/RecentTransactions';
import NoAccountsState from '@/modules/(tabs)/components/NoAccountsState';

export default function HomeScreen() {
  const router = useRouter();
  const { accounts, fetchAccounts } = useAccountStore();

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleRegisterAccount = () => {
    router.push('/account/register');
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleAccountPress = (accountId: number) => {
    router.push(`/account/${accountId}`);
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
        >
          {accounts[0] && (
            <AccountCard
              account={accounts[0]}
              balance={accounts[0].balance || 0}
              onPress={() => handleAccountPress(accounts[0].accountId)}
            />
          )}
          <RecentTransactions />
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
