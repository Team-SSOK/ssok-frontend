import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { usePin } from '@/contexts/PinContext';
import PinDots from '@/modules/auth/components/PinDots';
import PinKeypad from '@/modules/auth/components/PinKeypad';
import usePinInput from '@/modules/auth/hooks/usePin';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

export default function PinSetup() {
  const { setPin: setContextPin } = usePin();
  const maxLength = 6;

  const handleComplete = (pin: string) => {
    // Context에 PIN 번호 저장
    setContextPin(pin);
    // PIN 번호 재입력 화면으로 이동
    router.push('/auth/pin-confirm');
  };

  const { inputPin, errorMessage, handlePressNumber, handleDelete } =
    usePinInput({
      maxLength,
      onComplete: handleComplete,
    });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <Text style={[typography.h1, styles.title]}>PIN번호 설정</Text>

        <PinDots
          inputLength={inputPin.length}
          maxLength={maxLength}
          hasError={!!errorMessage}
          length={inputPin.length}
        />

        <PinKeypad
          onPressNumber={handlePressNumber}
          onPressDelete={handleDelete}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 80,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 35,
    color: colors.black,
  },
  completeButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
