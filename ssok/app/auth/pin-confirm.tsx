import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
import { usePin } from '@/contexts/PinContext';
import PinDots from '@/modules/auth/components/PinDots';
import PinKeypad from '@/modules/auth/components/PinKeypad';
import usePinInput from '@/modules/auth/hooks/usePin';
import AuthStorage from '@/services/AuthStorage';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import { authApi } from '@/modules/auth/api/auth';
import { STORAGE_KEYS } from '@/modules/auth/utils/constants';
import LoadingIndicator from '@/components/LoadingIndicator';

export default function PinConfirm() {
  const { pin: savedPin, saveUserRegistration } = usePin();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const maxLength = 6;

  const validatePin = async (inputPin: string) => {
    if (inputPin === savedPin) {
      try {
        setIsLoading(true);

        // 필요한 회원 정보 가져오기
        const phoneNumber =
          (await AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER)) || '';
        const username =
          (await AsyncStorage.getItem(STORAGE_KEYS.USERNAME)) || '';
        const birthDate =
          (await AsyncStorage.getItem(STORAGE_KEYS.BIRTH_DATE)) || '';

        if (!phoneNumber || !username || !birthDate) {
          Alert.alert('오류', '회원정보를 가져오는 중 오류가 발생했습니다.');
          return false;
        }

        // 회원가입 API 호출
        const signupData = {
          username,
          phoneNumber,
          birthDate,
          pinCode: Number(inputPin),
        };

        console.log('[LOG] 회원가입 요청:', signupData);
        const response = await authApi.signup(signupData);

        if (response.data.isSuccess) {
          console.log('[LOG] 회원가입 성공:', response.data);

          // 사용자 ID 저장
          if (response.data.result?.userId) {
            await AsyncStorage.setItem(
              STORAGE_KEYS.USER_ID,
              response.data.result.userId.toString(),
            );
          }

          // 사용자 정보 등록 (전화번호, PIN)
          await saveUserRegistration(phoneNumber, inputPin);

          // 회원가입 완료 후 탭 화면으로 이동
          router.replace('/');
        } else {
          console.error('[ERROR] 회원가입 실패:', response.data);
          Alert.alert(
            '오류',
            response.data.message || '회원가입 중 오류가 발생했습니다.',
          );
          return false;
        }
      } catch (error) {
        console.error('Error during registration:', error);
        Alert.alert('오류', '회원가입 중 오류가 발생했습니다.');
        return false;
      } finally {
        setIsLoading(false);
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
        validatePin(pin).then((isValid) => {
          if (!isValid) {
            setTimeout(() => {
              resetPin();
              setErrorMessage('');
            }, 1000);
          }
        });
      },
    });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.content}>
        <Text style={[typography.h1, styles.title]}>PIN번호 확인</Text>

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

      {isLoading && <LoadingIndicator visible={true} />}
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
