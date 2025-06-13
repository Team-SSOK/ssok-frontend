import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { useAccountStore } from '@/modules/account/stores/accountStore';
import { Account, AccountRequest } from '@/modules/account/api/accountApi';
import AccountListItem from '@/modules/account/components/AccountListItem';
import LoadingModal from '@/modules/account/components/LoadingModal';
import Header from '@/components/CommonHeader';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import useDialog from '@/hooks/useDialog';
import { transparent } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

/**
 * 계좌 등록 화면
 *
 * 연동할 계좌를 선택하고 등록하는 화면입니다.
 */
export default function RegisterAccountScreen() {
  const router = useRouter();
  const {
    accounts,
    candidateAccounts,
    isLoading,
    error,
    registerAccount,
    fetchCandidateAccounts,
    fetchAccounts,
    setPrimaryAccount,
  } = useAccountStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { showDialog } = useDialog();

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchAccounts(), fetchCandidateAccounts()]);
    };
    initializeData();
  }, [fetchAccounts, fetchCandidateAccounts]);
  
  const isAccountAlreadyLinked = useCallback(
    (account: Account) =>
      accounts.some(
        (linked) =>
          linked.bankCode === account.bankCode &&
          linked.accountNumber === account.accountNumber,
      ),
    [accounts],
  );

  const handleAlreadyLinkedPress = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: '이미 연동된 계좌입니다',
      text2: '다른 계좌를 선택해 주세요.',
      position: 'bottom',
    });
  }, []);

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setModalVisible(true);
  };

  const handleModalFinish = useCallback(async () => {
    if (!selectedAccount) return;

    const accountRequest: AccountRequest = {
      accountNumber: selectedAccount.accountNumber,
      bankCode: selectedAccount.bankCode,
      accountTypeCode:
        typeof selectedAccount.accountTypeCode === 'string'
          ? 1
          : Number(selectedAccount.accountTypeCode),
    };

    const result = await registerAccount(accountRequest);

    if (result.success && result.data) {
      await setPrimaryAccount(result.data.accountId);
      await fetchAccounts(); 

      Toast.show({
        type: 'success',
        text1: '계좌 등록 완료',
        text2: '계좌가 주계좌로 등록되었습니다.',
        position: 'bottom',
      });
      router.replace('/');
    } else {
      setModalVisible(false);
      showDialog({
        title: '계좌 등록 실패',
        content: result.message || '계좌 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
        confirmText: '확인',
      });
    }
  }, [selectedAccount, registerAccount, setPrimaryAccount, fetchAccounts, router, showDialog]);

  const handleRetry = () => {
    fetchCandidateAccounts();
  };
  
  const EmptyListComponent = () => (
    <View style={styles.emptyList}>
      <Text style={typography.body1}>연동 가능한 계좌가 없습니다.</Text>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[typography.caption, styles.errorText]}>{error}</Text>
          <View style={styles.retryButtonContainer}>
            <Text
              style={[typography.button, styles.retryButton]}
              onPress={handleRetry}
            >
              다시 시도
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.background, colors.disabled]}
        style={styles.background}
      />
      <Header title="연동할 계좌 선택" />

      {isLoading && candidateAccounts.length === 0 ? (
        <View style={styles.loading}>
          <Text style={typography.body1}>계좌 목록을 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={candidateAccounts}
          keyExtractor={(item) => `${item.bankCode}-${item.accountNumber}`}
          renderItem={({ item, index }) => (
            <AccountListItem
              account={item}
              onSelect={handleSelectAccount}
              index={index}
              isAlreadyLinked={isAccountAlreadyLinked(item)}
              onAlreadyLinkedPress={handleAlreadyLinkedPress}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={EmptyListComponent}
        />
      )}

      <LoadingModal visible={modalVisible} onFinish={handleModalFinish} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    backgroundColor: 'transparent'
  },
  listContainer: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    marginBottom: 12,
  },
  retryButtonContainer: {
    marginTop: 8,
  },
  retryButton: {
    color: colors.primary,
    padding: 8,
  },
});
