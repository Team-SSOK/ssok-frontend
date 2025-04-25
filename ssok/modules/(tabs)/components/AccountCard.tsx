import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { AccountData, getBankName, getAccountType } from '@/mock/accountData';
import { formatNumber, maskAccountNumber } from '@/utils/formatters';

interface AccountCardProps {
  account: AccountData;
  balance: number;
  onPress?: () => void;
}

export default function AccountCard({
  account,
  balance,
  onPress,
}: AccountCardProps) {
  const bankName = getBankName(account.bankCode);
  const accountType = getAccountType(account.accountTypeCode);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.bankName}>{bankName}</Text>
        <Text style={styles.accountType}>{accountType}</Text>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>잔액</Text>
        <Text style={styles.balance}>{formatNumber(balance)}원</Text>
      </View>

      <View style={styles.accountInfoContainer}>
        <Text style={styles.accountAlias}>{account.accountAlias}</Text>
        <Text style={styles.accountNumber}>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  accountType: {
    fontSize: 14,
    color: colors.mGrey,
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.mGrey,
    marginBottom: 4,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
  },
  accountInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.silver,
    paddingTop: 16,
  },
  accountAlias: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: colors.mGrey,
  },
});
