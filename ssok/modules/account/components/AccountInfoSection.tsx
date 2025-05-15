import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { formatNumber } from '@/utils/formatters';
import { router } from 'expo-router';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface AccountInfoSectionProps {
  accountNumber: string;
  accountType: string;
  balance: number;
}

const AccountInfoSection: React.FC<AccountInfoSectionProps> = ({
  accountNumber,
  accountType,
  balance,
}) => {
  const handleTransferPress = () => {
    router.push('/transfer');
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.body1, styles.accountType]}>{accountType}</Text>
      <Text style={[typography.caption, styles.accountNumber]}>
        {accountNumber}
      </Text>

      <View style={styles.balanceRow}>
        <Text style={[typography.h1, styles.balance]}>
          {formatNumber(balance)}원
        </Text>
        <TouchableOpacity
          style={styles.transferButton}
          onPress={handleTransferPress}
          activeOpacity={0.7}
        >
          <Text style={[typography.button, styles.transferButtonText]}>
            송금
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  accountType: {
    marginBottom: 8,
  },
  accountNumber: {
    color: colors.mGrey,
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balance: {},
  transferButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferButtonText: {
    margin: 4,
    color: colors.white,
  },
});

export default AccountInfoSection;
