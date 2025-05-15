import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Account, RegisteredAccount } from '../api/accountApi';
import { findBank } from '@/modules/account/utils/bankUtils';
import { Text } from '@/components/TextProvider';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

interface AccountListItemProps {
  account: Account | RegisteredAccount;
  onSelect: (account: Account) => void;
  index: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ITEM_DELAY = 150;
const FADE_IN_DURATION = 300;
const SLIDE_DURATION = 400;

export default function AccountListItem({
  account,
  onSelect,
  index = 0,
}: AccountListItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

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
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const bank = findBank(account.bankCode, account.bankName);

  return (
    <AnimatedTouchable
      style={[styles.container, containerStyle]}
      onPress={() => onSelect(account)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={styles.contentContainer}>
        <BankLogo bank={bank} bankName={account.bankName} />

        <View style={styles.bankInfo}>
          <Text style={styles.bankName}>{account.bankName}</Text>
          <Text style={styles.accountNumber}>{account.accountNumber}</Text>
        </View>

        <View style={styles.accountType}>
          <Text style={styles.accountTypeText}>{account.accountTypeCode}</Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

// 은행 로고 컴포넌트
function BankLogo({ bank }: { bank?: any; bankName?: string }) {
  if (bank?.logoSource) {
    return (
      <Image
        source={bank.logoSource}
        style={styles.bankLogo}
        resizeMode="contain"
      />
    );
  }
}

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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: colors.grey,
  },
  accountType: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  accountTypeText: {
    color: colors.mGrey || colors.grey,
    fontSize: 12,
    fontWeight: '500',
  },
});
