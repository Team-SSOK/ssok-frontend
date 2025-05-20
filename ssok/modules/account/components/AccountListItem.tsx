import React, { useEffect, memo } from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Account, RegisteredAccount } from '../api/accountApi';
import { findBank } from '@/modules/account/utils/bankUtils';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

interface AccountListItemProps {
  /**
   * 계좌 정보
   */
  account: Account | RegisteredAccount;

  /**
   * 계좌 선택 시 실행할 콜백 함수
   */
  onSelect: (account: Account) => void;

  /**
   * 애니메이션 순서를 위한 인덱스
   */
  index: number;
}

const ITEM_DELAY = 150;
const FADE_IN_DURATION = 300;
const SLIDE_DURATION = 400;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * 계좌 목록 아이템 컴포넌트
 *
 * 계좌 선택 화면에서 각 계좌를 표시하는 컴포넌트입니다.
 * 애니메이션 효과, 계좌 정보 표시, 은행 로고 등을 포함합니다.
 */
const AccountListItem: React.FC<AccountListItemProps> = ({
  account,
  onSelect,
  index = 0,
}) => {
  // 애니메이션 값
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  // 컴포넌트 마운트 시 애니메이션 시작
  useEffect(() => {
    const delay = ITEM_DELAY * index;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: FADE_IN_DURATION }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: SLIDE_DURATION }),
    );
  }, [index, opacity, translateY]);

  // 애니메이션 스타일
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  // 터치 애니메이션 핸들러 (단순한 값 설정이므로 useCallback 불필요)
  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // 은행 정보 조회
  const bank = findBank(account.bankCode, account.bankName);

  return (
    <AnimatedTouchable
      style={[styles.container, containerStyle]}
      onPress={() => onSelect(account)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      accessibilityLabel={`${account.bankName} ${account.accountNumber} 계좌 선택`}
      accessibilityHint="이 계좌를 선택하여 등록합니다"
    >
      <View style={styles.contentContainer}>
        <BankLogo bank={bank} bankName={account.bankName} />

        <View style={styles.bankInfo}>
          <Text style={[typography.body1, styles.bankName]}>
            {account.bankName}
          </Text>
          <Text style={[typography.body2, styles.accountNumber]}>
            {account.accountNumber}
          </Text>
        </View>

        <View style={styles.accountType}>
          <Text style={[typography.caption, styles.accountTypeText]}>
            {account.accountTypeCode}
          </Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

/**
 * 은행 로고 컴포넌트
 */
interface BankLogoProps {
  bank?: any;
  bankName?: string;
}

const BankLogo: React.FC<BankLogoProps> = memo(({ bank, bankName = '' }) => {
  if (bank?.logoSource) {
    return (
      <Image
        source={bank.logoSource}
        style={styles.bankLogo}
        resizeMode="contain"
        accessibilityLabel={`${bankName} 로고`}
      />
    );
  }

  // 로고가 없는 경우 이니셜로 표시
  return (
    <View style={styles.bankBadge}>
      <Text style={styles.bankInitial}>{bankName.charAt(0) || '?'}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  bankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  bankInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    color: colors.black,
    marginBottom: 4,
  },
  accountNumber: {
    color: colors.grey,
  },
  accountType: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  accountTypeText: {
    color: colors.mGrey || colors.grey,
    fontWeight: '500',
  },
});

export default memo(AccountListItem);
