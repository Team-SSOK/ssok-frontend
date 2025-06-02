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
import {
  Account,
  accountApi,
  AccountRequest,
} from '@/modules/account/api/accountApi';
import AccountListItem from '@/modules/account/components/AccountListItem';
import LoadingModal from '@/modules/account/components/LoadingModal';
import Header from '@/components/CommonHeader';
import { colors } from '@/constants/colors';
import { useLoadingStore } from '@/stores/loadingStore';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import useDialog from '@/hooks/useDialog';

/**
 * 계좌 등록 화면
 *
 * 연동할 계좌를 선택하고 등록하는 화면입니다.
 */
export default function RegisterAccountScreen() {
  const router = useRouter();
  const { registerAccount, accounts } = useAccountStore();
  const [candidates, setCandidates] = useState<Account[]>([]);
  const { isLoading, withLoading } = useLoadingStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showDialog } = useDialog();

  // 이미 연동된 계좌인지 확인하는 함수
  const isAccountAlreadyLinked = useCallback((account: Account): boolean => {
    return accounts.some(
      (linkedAccount) =>
        linkedAccount.bankCode === account.bankCode &&
        linkedAccount.accountNumber === account.accountNumber
    );
  }, [accounts]);

  // 이미 연동된 계좌 터치 시 토스트 표시
  const handleAlreadyLinkedPress = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: '이미 연동된 계좌입니다',
      text2: '다른 계좌를 선택해 주세요.',
      position: 'bottom',
    });
  }, []);

  // 계좌 목록 로딩 (API 호출이 포함되어 있으므로 useCallback 유지)
  const loadCandidates = useCallback(async () => {
    setError(null);

    await withLoading(async () => {
      try {
        const response = await accountApi.getLinkedAccounts();
        if (response.data.isSuccess && response.data.result) {
          setCandidates(response.data.result);
        } else {
          throw new Error(
            response.data.message || '계좌 목록을 불러오는데 실패했습니다.',
          );
        }
      } catch (error) {
        const errorMessage =
          '계좌 목록을 불러오는데 실패했습니다. 다시 시도해주세요.';
        setError(errorMessage);

        Toast.show({
          type: 'error',
          text1: '계좌 목록 로딩 실패',
          text2: errorMessage,
          position: 'bottom',
        });
      }
    });
  }, [withLoading]);

  // 컴포넌트 마운트 시 계좌 목록 로딩
  useEffect(() => {
    const initializeData = async () => {
      // 등록된 계좌 목록과 후보 계좌 목록을 동시에 로딩
      await Promise.all([
        useAccountStore.getState().fetchAccounts(),
        loadCandidates(),
      ]);
    };

    initializeData();
  }, [loadCandidates]);

  // 계좌 선택 핸들러 (단순 상태 업데이트라 useCallback 불필요)
  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setModalVisible(true);
  };

  // 계좌 등록 완료 핸들러 (API 호출과 복잡한 로직이 있으므로 useCallback 유지)
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

    await withLoading(async () => {
      try {
        const result = await registerAccount(accountRequest);

        if (result.success && result.data) {
          Toast.show({
            type: 'success',
            text1: '계좌 등록 완료',
            text2: '계좌가 성공적으로 등록되었습니다.',
            position: 'bottom',
          });
          router.back();
        } else {
          Toast.show({
            type: 'error',
            text1: '계좌 등록 실패',
            text2: result.message || '계좌 등록에 실패했습니다.',
            position: 'bottom',
          });
        }
      } catch (error) {
        setModalVisible(false);

        showDialog({
          title: '계좌 등록 실패',
          content: '계좌 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
          confirmText: '재시도',
          cancelText: '취소',
          onConfirm: () => handleModalFinish(),
        });
      }
    });
  }, [selectedAccount, withLoading, registerAccount, router, showDialog]);

  // 재시도 핸들러 (간단한 함수 호출이므로 useCallback 불필요)
  const handleRetry = () => {
    loadCandidates();
  };

  // 빈 목록 컴포넌트 (memo 함수로 감싸서 처리하는 것이 더 적절)
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

      {isLoading && candidates.length === 0 ? (
        <View style={styles.loading}>
          <Text style={typography.body1}>계좌 목록을 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={candidates}
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
  },
  listContainer: {
    paddingVertical: 8,
    flex: 1,
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
