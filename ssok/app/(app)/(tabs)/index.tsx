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
import { RegisteredAccount } from '@/modules/account/api/accountApi';
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
import useDialog from '@/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider';

export default function HomeScreen() {
  const { accounts, fetchAccounts, getAccountDetail, setPrimaryAccount } = useAccountStore();
  const [refreshing, setRefreshing] = useState(false);
  const recentTransactionsRef = useRef<RecentTransactionListRefType>(null);
  const router = useRouter();

  const { withLoading } = useLoadingStore();
  const { fetchProfile } = useProfileStore();
  const { showDialog, dialogState, hideDialog } = useDialog();

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

  const handleAccountLongPress = useCallback((account: RegisteredAccount) => {
    if (account.primaryAccount) {
      Toast.show({
        type: 'info',
        text1: '이미 주계좌입니다',
        text2: '현재 선택하신 계좌가 주계좌로 설정되어 있습니다.',
        position: 'bottom',
      });
      return;
    }

    const bankName = account.bankName || '은행';
    const maskedAccountNumber = account.accountNumber 
      ? account.accountNumber.replace(/(\d{3})-(\d{2})-(\d{4})-(\d{6})/, '$1-**-****-***$4')
      : '';

    showDialog({
      title: '주계좌 변경',
      content: 
        `${bankName} ${maskedAccountNumber}을(를)\n` +
        '주계좌로 변경하시겠습니까?\n\n' +
        '주계좌는 송금 시 기본으로 사용되는 계좌입니다.',
      confirmText: '변경',
      cancelText: '취소',
      onConfirm: async () => {
        hideDialog();
        await handleChangePrimaryAccount(account.accountId);
      },
      onCancel: hideDialog,
    });
  }, [showDialog, hideDialog]);

  const handleChangePrimaryAccount = async (accountId: number) => {
    await withLoading(async () => {
      try {
        const result = await setPrimaryAccount(accountId);
        
        if (result.success) {
          Toast.show({
            type: 'success',
            text1: '주계좌 변경 완료',
            text2: '주계좌가 성공적으로 변경되었습니다.',
            position: 'bottom',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: '주계좌 변경 실패',
            text2: result.message || '주계좌 변경에 실패했습니다.',
            position: 'bottom',
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: '주계좌 변경 실패',
          text2: '주계좌 변경 중 오류가 발생했습니다.',
          position: 'bottom',
        });
      }
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
              onAccountLongPress={handleAccountLongPress}
              onAddAccountPress={handleRegisterAccount}
            />
          </View>
          <RecentTransactionList ref={recentTransactionsRef} />
        </ScrollView>
      )}

      <DialogProvider
        visible={dialogState.visible}
        title={dialogState.title}
        content={dialogState.content}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm || hideDialog}
        onCancel={dialogState.onCancel || hideDialog}
        onDismiss={hideDialog}
      />
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
