import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  RefreshControl,
  Platform,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAccountStore } from '@/modules/account/stores/accountStore';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import HomeHeader from '@/modules/(tabs)/components/HomeHeader';
import AccountCard from '@/modules/(tabs)/components/AccountCard';
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
import Carousel from 'react-native-reanimated-carousel';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import { RegisteredAccount } from '@/modules/account/api/accountApi';

const { width: screenWidth } = Dimensions.get('window');

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

  // carousel 데이터 준비 - 계좌들 + 추가 연동 버튼
  const carouselData = hasAccounts 
    ? [...accounts, { isAddButton: true }] 
    : [];

  const renderCarouselItem = ({ item, index }: { item: RegisteredAccount | { isAddButton: boolean }, index: number }) => {
    // 계좌 추가 연동 버튼인 경우
    if ('isAddButton' in item && item.isAddButton) {
      return (
        <Pressable style={styles.addAccountCard} onPress={handleRegisterAccount}>
          <View style={styles.addAccountContent}>
            <View style={styles.addIconContainer}>
              <Text style={styles.addIcon}>+</Text>
            </View>
            <Text style={[typography.body1, styles.addAccountText]}>
              계좌 추가 연동
            </Text>
            <Text style={[typography.caption, styles.addAccountSubtext]}>
              새로운 계좌를 연결해보세요
            </Text>
          </View>
        </Pressable>
      );
    }

    // 일반 계좌 카드인 경우
    const account = item as RegisteredAccount;
    return (
      <AccountCard
        account={account}
        balance={account.balance || 0}
        onPress={() => handleAccountPress(account.accountId)}
      />
    );
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
          {hasAccounts && (
            <View style={styles.carouselContainer}>
              <Carousel
                loop={false}
                width={screenWidth - 40}
                height={200}
                data={carouselData}
                style={styles.carousel}
                snapEnabled={true}
                pagingEnabled={true}
                renderItem={renderCarouselItem}
              />
            </View>
          )}
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
  carousel: {
    width: screenWidth,
  },
  addAccountCard: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
  },
  addAccountContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addIcon: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  addAccountText: {
    color: colors.primary,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  addAccountSubtext: {
    color: colors.mGrey,
    textAlign: 'center',
  },
});
