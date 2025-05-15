import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { getBankName, getAccountType } from '@/mock/accountData';
import { formatNumber, maskAccountNumber } from '@/utils/formatters';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import { RegisteredAccount } from '@/modules/account/api/accountApi';

interface AccountCardProps {
  account: RegisteredAccount;
  balance: number;
  onPress?: () => void;
}

export default function AccountCard({
  account,
  balance,
  onPress,
}: AccountCardProps) {
  const bankName = account.bankName || getBankName(account.bankCode);
  const accountType =
    typeof account.accountTypeCode === 'number'
      ? getAccountType(account.accountTypeCode)
      : account.accountTypeCode;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={[typography.body1, styles.bankName]}>{bankName}</Text>
        <Text style={[typography.caption, styles.accountType]}>
          {accountType}
        </Text>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={[typography.caption, styles.balanceLabel]}>잔액</Text>
        <Text style={[typography.h2, styles.balance]}>
          {formatNumber(balance)}원
        </Text>
      </View>

      <View style={styles.accountInfoContainer}>
        <Text style={[typography.body1, styles.accountAlias]}>
          {account.accountAlias || '내 계좌'}
        </Text>
        <Text style={[typography.caption, styles.accountNumber]}>
          {maskAccountNumber(account.accountNumber)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.silver,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bankName: {
    color: colors.primary,
  },
  accountType: {
    color: colors.mGrey,
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceLabel: {
    color: colors.mGrey,
    marginBottom: 4,
  },
  balance: {
    color: colors.black,
  },
  accountInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.silver,
    paddingTop: 16,
  },
  accountAlias: {
    color: colors.black,
    marginBottom: 4,
  },
  accountNumber: {
    color: colors.mGrey,
  },
});
