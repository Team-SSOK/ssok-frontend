import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '@/constants/colors';

interface ConfirmQuestionProps {
  recipientName: string;
  amount: string;
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
      <Text style={styles.recipientText}>
        {recipientName ? recipientName : ''}
        <Text style={styles.nim}>최지훈님에게</Text>
      </Text>
      <Text style={styles.amountText}>
        {amount}
        <Text style={styles.wonText}>원을</Text>
      </Text>
      <Text style={styles.questionText}>보낼까요?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  recipientText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  nim: {
    fontWeight: 'normal',
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  wonText: {
    fontSize: 22,
    fontWeight: 'normal',
    color: colors.black,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.black,
  },
});
