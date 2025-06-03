import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInUp,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
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
  // 초기 렌더링 애니메이션만 유지
  const keypadOpacity = useSharedValue(0);
  const keypadTranslateY = useSharedValue(20);

  React.useEffect(() => {
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
  }, []);

  const keypadAnimatedStyle = useAnimatedStyle(() => ({
    opacity: keypadOpacity.value,
    transform: [{ translateY: keypadTranslateY.value }],
  }));

  // 키패드 버튼 컴포넌트 - 간단하게 정리
  const KeypadButton = ({
    value,
    onPress,
  }: {
    value: string;
    onPress: () => void;
  }) => {
    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    };

    return (
      <Pressable
        style={styles.keypadButton}
        onPress={handlePress}
        android_ripple={{ color: colors.primary + '20', borderless: true }}
      >
        <Text style={styles.keypadButtonText}>{value}</Text>
      </Pressable>
    );
  };

  // 백스페이스 버튼
  const BackspaceButton = ({ onPress }: { onPress: () => void }) => {
    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    };

    return (
      <Pressable
        style={styles.keypadButton}
        onPress={handlePress}
        android_ripple={{ color: colors.primary + '20', borderless: true }}
      >
        <Text style={styles.keypadButtonText}>←</Text>
      </Pressable>
    );
  };

  return (
    <Animated.View style={[styles.container, keypadAnimatedStyle]}>
      {/* 다음 버튼 */}
      <View style={styles.nextButtonWrapper}>
        {showNextButton && (
          <Animated.View
            entering={FadeInUp.duration(400).easing(Easing.out(Easing.quad))}
            exiting={FadeOut.duration(400).easing(Easing.out(Easing.cubic))}
            style={styles.nextButtonContainer}
          >
            <Pressable
              style={styles.nextButton}
              onPress={onNext}
              android_ripple={{ color: colors.white + '30' }}
            >
              <Text style={styles.nextButtonText}>다음</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* 키패드 버튼들 */}
      <View>
        <View style={styles.keypadRow}>
          <KeypadButton value="1" onPress={() => onKeyPress('1')} />
          <KeypadButton value="2" onPress={() => onKeyPress('2')} />
          <KeypadButton value="3" onPress={() => onKeyPress('3')} />
        </View>
        <View style={styles.keypadRow}>
          <KeypadButton value="4" onPress={() => onKeyPress('4')} />
          <KeypadButton value="5" onPress={() => onKeyPress('5')} />
          <KeypadButton value="6" onPress={() => onKeyPress('6')} />
        </View>
        <View style={styles.keypadRow}>
          <KeypadButton value="7" onPress={() => onKeyPress('7')} />
          <KeypadButton value="8" onPress={() => onKeyPress('8')} />
          <KeypadButton value="9" onPress={() => onKeyPress('9')} />
        </View>
        <View style={styles.keypadRow}>
          <KeypadButton value="00" onPress={() => onKeyPress('00')} />
          <KeypadButton value="0" onPress={() => onKeyPress('0')} />
          <BackspaceButton onPress={() => onKeyPress('delete')} />
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
    overflow: 'hidden',
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
    overflow: 'hidden',
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.black,
  },
});
