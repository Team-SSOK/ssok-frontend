import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { useTransferStore } from '../stores/transferStore';
import { TransferCounterpart } from '../api/transferApi';
import { typography } from '@/theme/typography';

interface RecentCounterpartsProps {
  onCounterpartSelect: (counterpart: TransferCounterpart) => void;
}

const RecentCounterparts: React.FC<RecentCounterpartsProps> = ({
  onCounterpartSelect,
}) => {
  const { recentCounterparts, fetchRecentCounterparts } = useTransferStore();

  // 컴포넌트 마운트 시 최근 송금 상대방 목록 조회
  useEffect(() => {
    fetchRecentCounterparts();
  }, [fetchRecentCounterparts]);

  // 데이터가 없으면 렌더링하지 않음
  if (recentCounterparts.length === 0) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(400).duration(600)}
      style={styles.container}
    >
      <Text style={[typography.body1, styles.title]}>최근 송금 내역</Text>
      {recentCounterparts.slice(0, 5).map((counterpart, index) => (
        <Pressable
          key={`${counterpart.counterpartAccountNumber}-${index}`}
          style={styles.counterpartItem}
          onPress={() => onCounterpartSelect(counterpart)}
        >
          <View style={styles.counterpartInfo}>
            <Text style={styles.counterpartName}>
              {counterpart.counterpartName}
            </Text>
            <Text style={styles.counterpartAccount}>
              {counterpart.counterpartAccountNumber}
            </Text>
          </View>
          <Text style={styles.counterpartDate}>
            {new Date(counterpart.createdAt).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </Pressable>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 36,
    marginBottom: 16,
  },
  title: {
    color: colors.black,
    marginBottom: 12,
  },
  counterpartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 2,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  counterpartInfo: {
    flex: 1,
  },
  counterpartName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 2,
  },
  counterpartAccount: {
    fontSize: 12,
    color: colors.grey,
  },
  counterpartDate: {
    fontSize: 12,
    color: colors.grey,
  },
});

export default RecentCounterparts; 