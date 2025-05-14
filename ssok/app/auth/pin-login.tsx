import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { usePin } from '@/contexts/PinContext';
import PinDots from '@/modules/auth/components/PinDots';
import PinKeypad from '@/modules/auth/components/PinKeypad';
import usePinInput from '@/modules/auth/hooks/usePin';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import { authApi } from '@/modules/auth/api/auth';
import { getUserId, saveAuthTokens } from '@/modules/auth/utils/authUtils';
import LoadingIndicator from '@/components/LoadingIndicator';

export default function PinLogin() {
  const { verifyAndLogin } = usePin();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const maxLength = 6;

  const validatePin = async (inputPin: string) => {
    try {
      setIsLoading(true);

      // 로컬 PIN 검증
      const isLocalPinValid = await verifyAndLogin(inputPin);
      if (!isLocalPinValid) {
        setErrorMessage('PIN 번호가 일치하지 않습니다.');
        return false;
      }

      // 사용자 ID 가져오기
      const userId = await getUserId();
      if (!userId) {
        setErrorMessage('사용자 정보를 찾을 수 없습니다.');
        return false;
      }

      // 로그인 API 호출
      const loginData = {
        userId,
        pinCode: Number(inputPin),
      };

      console.log('[LOG] 로그인 요청:', { userId, pinCode: '******' });
      const response = await authApi.login(loginData);

      if (response.data.isSuccess && response.data.result) {
        console.log('[LOG] 로그인 성공');

        // 토큰 저장
        const { accessToken, refreshToken } = response.data.result;
        await saveAuthTokens(accessToken, refreshToken);

        // 로그인 성공 시 탭 화면으로 이동
        router.replace('/(tabs)');
        return true;
      } else {
        console.error('[ERROR] 로그인 실패:', response.data);
        setErrorMessage(response.data.message || '로그인에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('로그인 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
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
        <Text style={[typography.h1, styles.title]}>PIN 번호 로그인</Text>

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
