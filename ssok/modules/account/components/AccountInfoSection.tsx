import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber, maskAccountNumber } from '@/utils/formatters';
import { router } from 'expo-router';

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
      <Text style={styles.accountType}>{accountType}</Text>
      <Text style={styles.accountNumber}>
        {maskAccountNumber(accountNumber)}
      </Text>

      <View style={styles.balanceRow}>
        <Text style={styles.balance}>{formatNumber(balance)}원</Text>
        <TouchableOpacity
          style={styles.transferButton}
          onPress={handleTransferPress}
          activeOpacity={0.7}
        >
          <Text style={styles.transferButtonText}>송금</Text>
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
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  accountNumber: {
    fontSize: 14,
    color: colors.mGrey,
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
  },
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
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AccountInfoSection;
