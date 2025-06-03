import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
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
  // 애니메이션 값들
  const recipientOpacity = useSharedValue(0);
  const recipientTranslateY = useSharedValue(20);
  const amountOpacity = useSharedValue(0);
  const amountTranslateY = useSharedValue(20);
  const questionOpacity = useSharedValue(0);
  const questionTranslateY = useSharedValue(20);

  useEffect(() => {
    // 순차적 애니메이션
    // 1. 수취인 이름
    recipientOpacity.value = withDelay(
      100,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),
    );
    recipientTranslateY.value = withDelay(
      100,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.back(1.2)),
      }),
    );

    // 2. 금액
    amountOpacity.value = withDelay(
      300,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),
    );
    amountTranslateY.value = withDelay(
      300,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.back(1.2)),
      }),
    );

    // 3. 질문
    questionOpacity.value = withDelay(
      500,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),
    );
    questionTranslateY.value = withDelay(
      500,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.back(1.2)),
      }),
    );
  }, []);

  // 애니메이션 스타일들
  const recipientStyle = useAnimatedStyle(() => ({
    opacity: recipientOpacity.value,
    transform: [{ translateY: recipientTranslateY.value }],
  }));

  const amountStyle = useAnimatedStyle(() => ({
    opacity: amountOpacity.value,
    transform: [{ translateY: amountTranslateY.value }],
  }));

  const questionStyle = useAnimatedStyle(() => ({
    opacity: questionOpacity.value,
    transform: [{ translateY: questionTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={recipientStyle}>
        <Text style={[typography.h3, styles.recipientText]}>
          {recipientName ? recipientName : '홍길동'}
          <Text style={[typography.body1, styles.nim]}>님에게</Text>
        </Text>
      </Animated.View>

      <Animated.View style={amountStyle}>
        <Text style={[typography.h1, styles.amountText]}>
          {amount.toLocaleString('ko-KR')}
          <Text style={[typography.h3, styles.wonText]}>원을</Text>
        </Text>
      </Animated.View>

      <Animated.View style={questionStyle}>
        <Text style={[typography.h3, styles.questionText]}>보낼까요?</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
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
