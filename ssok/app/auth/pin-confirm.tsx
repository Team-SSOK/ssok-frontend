import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { usePin } from '@/contexts/PinContext';
import PinDots from '@/modules/auth/components/PinDots';
import PinKeypad from '@/modules/auth/components/PinKeypad';
import usePinInput from '@/modules/auth/hooks/usePin';

export default function PinConfirm() {
  const { pin: savedPin, isLoggedIn, setIsLoggedIn } = usePin();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const maxLength = 6;

  const validatePin = (inputPin: string) => {
    if (inputPin === savedPin) {
      // PIN 번호가 일치하면 로그인 상태로 변경하고 메인 화면으로 이동
      setIsLoggedIn(true);
      router.replace('/');
    } else {
      // PIN 번호가 일치하지 않으면 에러 메시지 표시
      setErrorMessage('PIN 번호가 일치하지 않습니다.');
      return false;
    }
    return true;
  };

  const { inputPin, isComplete, handlePressNumber, handleDelete, resetPin } =
    usePinInput({
      maxLength,
      onComplete: (pin) => {
        const isValid = validatePin(pin);
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
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <Text style={styles.title}>PIN번호 확인</Text>

        <PinDots
          inputLength={inputPin.length}
          maxLength={maxLength}
          hasError={!!errorMessage}
          length={inputPin.length}
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

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
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 50,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    marginBottom: 20,
  },
});
