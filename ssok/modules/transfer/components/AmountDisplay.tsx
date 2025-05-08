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
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  recipientName,
  bankName,
}) => {
  const formattedAmount = amount.toLocaleString('ko-KR');
  const isZero = amount === 0;

  return (
    <View style={styles.container}>
      {/* 받는 분 정보 카드 */}
      <View style={styles.recipientCard}>
        <View style={styles.recipientHeader}>
          <Text style={[typography.button, styles.recipientLabel]}>
            받는 분
          </Text>
          <View style={styles.bankBadge}>
            <Text style={[typography.caption, styles.bankBadgeText]}>
              {bankName}
            </Text>
          </View>
        </View>
        <Text style={[typography.h3, styles.recipientName]}>
          {recipientName}
        </Text>
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

        {/* 하단 구분선 */}
        <View style={styles.divider} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  recipientCard: {
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  recipientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    color: colors.grey,
  },
  recipientName: {
    color: colors.black,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 16,
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
