import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import {
  Account,
  accountApi,
  AccountRequest,
} from '@/modules/account/api/accountApi';
import AccountListItem from '@/modules/account/components/AccountListItem';
import LoadingModal from '@/modules/account/components/LoadingModal';
import Header from '@/components/Header';
import { colors } from '@/constants/colors';
import { useLoadingStore } from '@/stores/loadingStore';
import { Text } from '@/components/TextProvider';

export default function RegisterAccountScreen() {
  const router = useRouter();
  const { registerAccount } = useAccountStore();
  const [candidates, setCandidates] = useState<Account[]>([]);
  const { isLoading, withLoading } = useLoadingStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    await withLoading(async () => {
      try {
        const response = await accountApi.getLinkedAccounts();
        if (response.data.isSuccess && response.data.result) {
          setCandidates(response.data.result);
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('계좌 목록을 불러오는데 실패했습니다.');
      }
    });
  };

  const handleSelectAccount = async (account: Account) => {
    setSelectedAccount(account);
    setModalVisible(true);
  };

  const handleModalFinish = async () => {
    if (selectedAccount) {
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
          const registeredAccount = await registerAccount(accountRequest);

          if (registeredAccount) {
            await useAccountStore
              .getState()
              .setPrimaryAccount(registeredAccount.accountId);
          }

          router.replace('/(tabs)');
        } catch (error) {
          console.error('계좌 등록에 실패했습니다.');
          setModalVisible(false);
        }
      });
    }
  };

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
          <Text>계좌 목록을 불러오는 중...</Text>
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
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyList}>
              <Text></Text>
            </View>
          )}
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
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    padding: 16,
    alignItems: 'center',
  },
});
