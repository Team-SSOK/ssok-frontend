import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface ConfirmQuestionProps {
  recipientName: string;
  amount: number;
}

/**
 * 송금 확인 화면의 중앙에 표시되는 질문 컴포넌트
 */
export default function ConfirmQuestion({
  recipientName,
  amount,
}: ConfirmQuestionProps) {
  return (
    <View style={styles.container}>
      <Text style={[typography.h3, styles.recipientText]}>
        {recipientName ? recipientName : '홍길동'}
        <Text style={[typography.body1, styles.nim]}>님에게</Text>
      </Text>
      <Text style={[typography.h1, styles.amountText]}>
        {amount.toLocaleString('ko-KR')}
        <Text style={[typography.h3, styles.wonText]}>원을</Text>
      </Text>
      <Text style={[typography.h3, styles.questionText]}>보낼까요?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  recipientText: {
    color: colors.black,
  },
  nim: {
    fontWeight: 'normal',
  },
  amountText: {
    color: colors.primary,
  },
  wonText: {
    color: colors.black,
  },
  questionText: {
    color: colors.black,
  },
});
