import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Image,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Account, RegisteredAccount } from '../api/accountApi';
import { banks } from '@/mock/bankData';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
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

  // 은행 코드로 은행 정보 찾기
  const findBank = () => {
    // 은행 코드가 문자열이면 숫자로 바꿔서 비교
    const bankCodeStr =
      typeof account.bankCode === 'number'
        ? String(account.bankCode).padStart(3, '0')
        : String(account.bankCode);

    return (
      banks.find((bank) => bank.code === bankCodeStr) ||
      banks.find((bank) => bank.name === account.bankName)
    );
  };

  const bank = findBank();

  return (
    <AnimatedTouchable
      style={[styles.container, containerStyle]}
      onPress={() => onSelect(account)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={styles.contentContainer}>
        {bank ? (
          bank.logoSource ? (
            <Image
              source={bank.logoSource}
              style={styles.bankLogo}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[
                styles.bankBadge,
                bank.color ? { backgroundColor: bank.color } : null,
              ]}
            >
              {bank.icon ? (
                <Ionicons name={bank.icon} size={20} color="white" />
              ) : (
                <Text style={styles.bankInitial}>
                  {bank.name?.charAt(0) || account.bankName?.charAt(0) || 'B'}
                </Text>
              )}
            </View>
          )
        ) : (
          <View style={styles.bankBadge}>
            <Text style={styles.bankInitial}>
              {account.bankName?.charAt(0) || 'B'}
            </Text>
          </View>
        )}

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

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.white,
    ...Platform.select({
      android: {
        elevation: 4,
      },
    }),
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
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  accountTypeText: {
    color: colors.mGrey || colors.grey,
    fontSize: 12,
    fontWeight: '500',
  },
});
