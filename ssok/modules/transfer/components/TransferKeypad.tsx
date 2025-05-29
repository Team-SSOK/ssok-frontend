import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInUp,
  FadeOutDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';

interface TransferKeypadProps {
  onKeyPress: (key: string) => void;
  onNext: () => void;
  showNextButton: boolean;
}

/**
 * 송금용 키패드 컴포넌트
 * 숫자 입력 키패드와 조건부 다음 버튼을 포함합니다
 */
export default function TransferKeypad({
  onKeyPress,
  onNext,
  showNextButton,
}: TransferKeypadProps) {
  // 애니메이션을 위한 shared value
  const keypadOpacity = useSharedValue(0);
  const keypadTranslateY = useSharedValue(20);

  // 각 키패드 버튼의 애니메이션을 위한 shared values
  const buttonOpacities = Array.from({ length: 12 }, () => useSharedValue(0));
  const buttonTranslateYs = Array.from({ length: 12 }, () =>
    useSharedValue(15),
  );

  React.useEffect(() => {
    // 부드러운 키패드 전체 애니메이션
    keypadOpacity.value = withDelay(
      250,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      }),
    );
    keypadTranslateY.value = withDelay(
      250,
      withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      }),
    );

    // 각 버튼의 staggered 애니메이션
    buttonOpacities.forEach((opacity, index) => {
      opacity.value = withDelay(
        300 + index * 50,
        withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.quad),
        }),
      );
    });

    buttonTranslateYs.forEach((translateY, index) => {
      translateY.value = withDelay(
        300 + index * 50,
        withTiming(0, {
          duration: 400,
          easing: Easing.out(Easing.quad),
        }),
      );
    });
  }, []);

  // 애니메이션 스타일
  const keypadAnimatedStyle = useAnimatedStyle(() => ({
    opacity: keypadOpacity.value,
    transform: [{ translateY: keypadTranslateY.value }],
  }));

  // 개별 버튼 애니메이션 스타일 생성 함수
  const getButtonAnimatedStyle = (index: number) =>
    useAnimatedStyle(() => ({
      opacity: buttonOpacities[index].value,
      transform: [{ translateY: buttonTranslateYs[index].value }],
    }));

  // 키패드 버튼 컴포넌트
  const KeypadButton = ({
    value,
    onPress,
    style,
    index,
  }: {
    value: string;
    onPress: () => void;
    style?: any;
    index: number;
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      // 햅틱 피드백
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // 즉각적인 시각적 피드백
      scale.value = withSpring(0.95, {
        duration: 100,
        dampingRatio: 0.8,
      });

      setTimeout(() => {
        scale.value = withSpring(1, {
          duration: 150,
          dampingRatio: 0.8,
        });
      }, 100);

      // 즉시 onPress 실행
      onPress();
    };

    return (
      <Animated.View style={[getButtonAnimatedStyle(index), animatedStyle]}>
        <TouchableOpacity
          style={[styles.keypadButton, style]}
          onPress={handlePress}
          activeOpacity={0.7}
          delayPressIn={0}
          delayPressOut={0}
        >
          <Text style={styles.keypadButtonText}>{value}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 백스페이스 버튼
  const BackspaceButton = ({
    onPress,
    index,
  }: {
    onPress: () => void;
    index: number;
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      // 햅틱 피드백
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // 즉각적인 시각적 피드백
      scale.value = withSpring(0.95, {
        duration: 100,
        dampingRatio: 0.8,
      });

      setTimeout(() => {
        scale.value = withSpring(1, {
          duration: 150,
          dampingRatio: 0.8,
        });
      }, 100);

      // 즉시 onPress 실행
      onPress();
    };

    return (
      <Animated.View style={[getButtonAnimatedStyle(index), animatedStyle]}>
        <TouchableOpacity
          style={styles.keypadButton}
          onPress={handlePress}
          activeOpacity={0.7}
          delayPressIn={0}
          delayPressOut={0}
        >
          <Text style={styles.keypadButtonText}>←</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[styles.container, keypadAnimatedStyle]}>
      {/* 다음 버튼 - 금액 입력 시에만 표시 */}
      <View style={styles.nextButtonWrapper}>
        {showNextButton && (
          <Animated.View
            entering={FadeInUp.duration(400).easing(Easing.out(Easing.quad))}
            exiting={FadeOut.duration(400).easing(Easing.out(Easing.cubic))}
            style={styles.nextButtonContainer}
          >
            <TouchableOpacity style={styles.nextButton} onPress={onNext}>
              <Text style={styles.nextButtonText}>다음</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* 키패드 버튼들 - staggered 애니메이션 */}
      <View>
        <View style={styles.keypadRow}>
          <KeypadButton value="1" onPress={() => onKeyPress('1')} index={0} />
          <KeypadButton value="2" onPress={() => onKeyPress('2')} index={1} />
          <KeypadButton value="3" onPress={() => onKeyPress('3')} index={2} />
        </View>
        <View style={styles.keypadRow}>
          <KeypadButton value="4" onPress={() => onKeyPress('4')} index={3} />
          <KeypadButton value="5" onPress={() => onKeyPress('5')} index={4} />
          <KeypadButton value="6" onPress={() => onKeyPress('6')} index={5} />
        </View>
        <View style={styles.keypadRow}>
          <KeypadButton value="7" onPress={() => onKeyPress('7')} index={6} />
          <KeypadButton value="8" onPress={() => onKeyPress('8')} index={7} />
          <KeypadButton value="9" onPress={() => onKeyPress('9')} index={8} />
        </View>
        <View style={styles.keypadRow}>
          <KeypadButton value="00" onPress={() => onKeyPress('00')} index={9} />
          <KeypadButton value="0" onPress={() => onKeyPress('0')} index={10} />
          <BackspaceButton onPress={() => onKeyPress('delete')} index={11} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  nextButtonWrapper: {
    height: 60,
    marginBottom: 20,
    marginHorizontal: -20,
  },
  nextButtonContainer: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  keypadButton: {
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.black,
  },
});
