import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ToastAndroid,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
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
  const [copied, setCopied] = useState(false);

  const handleTransferPress = () => {
    router.push('/transfer');
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(accountNumber);
    setCopied(true);

    // 복사 확인 메시지
    if (Platform.OS === 'android') {
      ToastAndroid.show('계좌번호가 복사되었습니다', ToastAndroid.SHORT);
    }

    // 2초 후 복사 상태 초기화
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.body1, styles.accountType]}>{accountType}</Text>
      <TouchableOpacity onPress={copyToClipboard} activeOpacity={0.6}>
        <View style={styles.accountNumberContainer}>
          <Text style={[typography.caption, styles.accountNumber]}>
            {accountNumber}
          </Text>
          <Text style={styles.copyText}>
            {copied ? '복사됨' : '터치하여 복사'}
          </Text>
        </View>
      </TouchableOpacity>

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
  accountNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountNumber: {
    color: colors.mGrey,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
    paddingBottom: 1,
    marginRight: 8,
  },
  copyText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
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
