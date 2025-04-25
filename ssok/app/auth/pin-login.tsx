import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { usePin } from '@/contexts/PinContext';
import PinDots from '@/modules/auth/components/PinDots';
import PinKeypad from '@/modules/auth/components/PinKeypad';
import usePinInput from '@/modules/auth/hooks/usePin';

export default function PinLogin() {
  const { verifyAndLogin } = usePin();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const maxLength = 6;

  const validatePin = async (inputPin: string) => {
    const isValid = await verifyAndLogin(inputPin);
    if (isValid) {
      // 로그인 성공 시 탭 화면으로 이동
      router.replace('/(tabs)');
    } else {
      // PIN 번호가 일치하지 않으면 에러 메시지 표시
      setErrorMessage('PIN 번호가 일치하지 않습니다.');
      return false;
    }
    return true;
  };

  const { inputPin, handlePressNumber, handleDelete, resetPin } = usePinInput({
    maxLength,
    onComplete: async (pin) => {
      const isValid = await validatePin(pin);
      if (!isValid) {
        setTimeout(() => {
          resetPin();
          setErrorMessage('');
        }, 1000);
      }
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.content}>
        <Text style={styles.title}>PIN 번호 로그인</Text>

        <View style={styles.pinSection}>
          <PinDots
            inputLength={inputPin.length}
            maxLength={maxLength}
            hasError={!!errorMessage}
            length={inputPin.length}
          />

          <View style={styles.errorContainer}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>
        </View>

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
  },
  title: {
    fontSize: 35,
    color: colors.black,
    marginBottom: 50,
  },
  pinSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  errorContainer: {
    height: 24,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
});
