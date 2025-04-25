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
import AuthStorage from '@/services/AuthStorage';

export default function PinConfirm() {
  const { pin: savedPin, saveUserRegistration } = usePin();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const maxLength = 6;

  const validatePin = async (inputPin: string) => {
    if (inputPin === savedPin) {
      try {
        // 휴대폰 번호 가져오기 (회원가입 과정에서 저장되어야 함)
        const phoneNumber = (await AuthStorage.getPhoneNumber()) || '';

        // 사용자 정보 등록 (전화번호, PIN)
        await saveUserRegistration(phoneNumber, inputPin);

        // 회원가입 완료 후 탭 화면으로 이동
        router.replace('/');
      } catch (error) {
        console.error('Error during registration:', error);
        Alert.alert('오류', '회원가입 중 오류가 발생했습니다.');
      }
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
