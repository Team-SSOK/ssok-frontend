import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { getBankName, getAccountType, getBankByCode } from '@/modules/account/constants/banks';
import { formatNumber, maskAccountNumber } from '@/utils/formatters';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import { RegisteredAccount } from '@/modules/account/api/accountApi';
import { Image } from 'expo-image';

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

  // 은행 정보를 은행 코드로 조회 (더 효율적)
  const bankInfo = getBankByCode(String(account.bankCode).padStart(3, '0'));

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        {bankInfo?.logoSource && (
          <Image 
            source={bankInfo.logoSource} 
            style={styles.bankLogo}
            contentFit="contain"
          />
        )}
        <View style={styles.bankInfo}>
          <Text style={[typography.body1, styles.bankName]}>{bankName}</Text>
          <Text style={[typography.caption, styles.accountType]}>
            {accountType}
          </Text>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={[typography.caption, styles.balanceLabel]}>잔액</Text>
        <Text style={[typography.h3, styles.balance]}>
          {formatNumber(balance)}원
        </Text>
      </View>

      <Text style={[typography.caption, styles.accountNumber]}>
        {maskAccountNumber(account.accountNumber)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bankLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  bankInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  accountAlias: {
    color: colors.black,
    marginBottom: 4,
  },
  accountNumber: {
    color: colors.mGrey,
  },
});
