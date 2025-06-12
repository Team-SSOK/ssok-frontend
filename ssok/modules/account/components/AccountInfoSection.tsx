import React, { useState, memo } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors } from '@/constants/colors';
import { formatNumber } from '@/utils/formatters';
import { router } from 'expo-router';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import Toast from 'react-native-toast-message';

interface AccountInfoSectionProps {
  /**
   * 계좌 ID
   */
  accountId: number;

  /**
   * 계좌번호
   */
  accountNumber: string;

  /**
   * 계좌 유형 또는 별칭
   */
  accountType: string;

  /**
   * 계좌 잔액
   */
  balance: number;
}

/**
 * 계좌 정보 섹션 컴포넌트
 *
 * 계좌번호, 잔액 등 계좌 기본 정보를 표시하고, 계좌번호 복사 및 송금 기능을 제공합니다.
 */
const AccountInfoSection: React.FC<AccountInfoSectionProps> = ({
  accountId,
  accountNumber,
  accountType,
  balance,
}) => {
  const [copied, setCopied] = useState(false);

  // 송금 화면으로 이동 (단순 라우팅 함수이므로 useCallback 불필요)
  const handleTransferPress = () => {
    router.push(`/transfer?accountId=${accountId}` as any);
  };

  // 계좌번호 복사 (useCallback 유지: Clipboard 같은 비동기 함수이므로 의미있음)
  const copyAccountNumber = async () => {
    try {
      await Clipboard.setStringAsync(accountNumber);
      Toast.show({
        type: 'success',
        text1: '복사 완료',
        text2: '계좌번호가 클립보드에 복사되었습니다.',
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '복사 실패',
        text2: '계좌번호 복사 중 오류가 발생했습니다.',
        position: 'bottom',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.body1, styles.accountType]}>{accountType}</Text>

      <Pressable
        onPress={copyAccountNumber}
        accessibilityLabel="계좌번호 복사"
        accessibilityHint="터치하여 계좌번호를 클립보드에 복사합니다"
      >
        <View style={styles.accountNumberContainer}>
          <Text style={[typography.caption, styles.accountNumber]}>
            {accountNumber}
          </Text>
          <Text style={styles.copyText}>
            {copied ? '복사됨' : '터치하여 복사'}
          </Text>
        </View>
      </Pressable>

      <View style={styles.balanceRow}>
        <Text style={[typography.h1, styles.balance]}>
          {formatNumber(balance)}원
        </Text>
        <Pressable
          style={styles.transferButton}
          onPress={handleTransferPress}
          accessibilityLabel="송금하기"
          accessibilityHint="송금 화면으로 이동합니다"
        >
          <Text style={[typography.button, styles.transferButtonText]}>
            송금
          </Text>
        </Pressable>
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

// props가 변경될 때만 리렌더링하도록 메모이제이션
export default memo(AccountInfoSection);
