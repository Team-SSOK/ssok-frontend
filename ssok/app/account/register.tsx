import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import {
  Account,
  accountApi,
  AccountRequest,
} from '@/modules/account/api/accountApi';
import AccountListItem from '@/modules/account/components/AccountListItem';
import Header from '@/components/Header';
import { colors } from '@/constants/colors';
import { useLoadingStore } from '@/stores/loadingStore';

export default function RegisterAccountScreen() {
  const router = useRouter();
  const { registerAccount } = useAccountStore();
  const [candidates, setCandidates] = useState<Account[]>([]);
  const { isLoading, withLoading } = useLoadingStore();

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
    const accountRequest: AccountRequest = {
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
      accountTypeCode:
        typeof account.accountTypeCode === 'string'
          ? 1 // Default value - consider adding a mapping function
          : Number(account.accountTypeCode),
    };

    await withLoading(async () => {
      try {
        await registerAccount(accountRequest);
        router.replace('/(tabs)');
      } catch (error) {
        console.error('계좌 등록에 실패했습니다.');
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <Text>연동 가능한 계좌가 없습니다.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
