import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface AmountDisplayProps {
  amount: number;
  recipientName: string;
  bankName: string;
  accountNumber?: string;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  recipientName,
  bankName,
  accountNumber,
}) => {
  const formattedAmount = amount.toLocaleString('ko-KR');
  const isZero = amount === 0;
  const isBluetoothTransfer = !accountNumber;

  return (
    <View style={styles.container}>
      {/* 받는 분 정보 카드 */}
      <View style={styles.recipientCard}>
        <View style={styles.recipientHeader}>
          <Text style={[typography.body1, styles.recipientLabel]}>받는 분</Text>
          <View style={styles.bankBadge}>
            <Text style={[typography.body2, styles.bankBadgeText]}>
              {bankName}
            </Text>
          </View>
        </View>
        <View style={styles.recipientNameContainer}>
          <Text style={[typography.h3, styles.recipientName]}>
            {recipientName}
          </Text>
          {!isBluetoothTransfer && (
            <Text style={[typography.body1, styles.recipientAccount]}>
              {accountNumber}
            </Text>
          )}
          {isBluetoothTransfer && (
            <Text style={[typography.caption, styles.bluetoothLabel]}>
              블루투스 송금
            </Text>
          )}
        </View>
      </View>

      {/* 금액 표시 섹션 */}
      <View style={styles.amountSection}>
        <View style={styles.amountContainer}>
          {isZero ? (
            <View style={styles.placeholderContainer}>
              <Ionicons name="wallet-outline" size={24} color={colors.lGrey} />
              <Text style={[typography.h3, styles.placeholderText]}>
                금액을 입력해주세요
              </Text>
            </View>
          ) : (
            <View style={styles.amountWrapper}>
              <Text style={[typography.h1, styles.currency]}>
                {formattedAmount}
              </Text>
              <Text style={[typography.h2, styles.currencyUnit]}>원</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  recipientCard: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  recipientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipientLabel: {
    color: colors.lGrey,
  },
  bankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.silver,
    borderRadius: 12,
  },
  bankBadgeText: {
    color: colors.mGrey,
  },
  recipientNameContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipientName: {
    color: colors.black,
  },
  recipientAccount: {
    color: colors.mGrey,
  },
  bluetoothLabel: {
    color: colors.primary,
    backgroundColor: colors.primary + '15', // 약간 투명한 배경색
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  amountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    marginBottom: 16,
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.lGrey,
    marginLeft: 8,
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currency: {
    color: colors.black,
  },
  currencyUnit: {
    color: colors.black,
    marginLeft: 4,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.silver,
    width: '40%',
    marginTop: 8,
  },
});

export default AmountDisplay;
