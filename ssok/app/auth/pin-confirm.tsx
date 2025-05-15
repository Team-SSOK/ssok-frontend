import React from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { authApi } from '@/modules/auth/api/auth';
import { STORAGE_KEYS } from '@/modules/auth/utils/constants';
import PinScreen from '@/modules/auth/components/PinScreen';
import useDialog from '@/modules/auth/hooks/useDialog';
import * as SecureStore from 'expo-secure-store';

export default function PinConfirm() {
  const pin = useAuthStore((state) => state.pin);
  const saveUserRegistration = useAuthStore(
    (state) => state.saveUserRegistration,
  );
  const setUserId = useAuthStore((state) => state.setUserId);
  const login = useAuthStore((state) => state.login);
  const { showDialog } = useDialog();

  const handleComplete = async (inputPin: string) => {
    if (inputPin === pin) {
      try {
        // 필요한 회원 정보 가져오기
        const phoneNumber =
          (await AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER)) || '';
        const username =
          (await AsyncStorage.getItem(STORAGE_KEYS.USERNAME)) || '';
        const birthDate =
          (await AsyncStorage.getItem(STORAGE_KEYS.BIRTH_DATE)) || '';

        if (!phoneNumber || !username || !birthDate) {
          showDialog({
            title: '오류',
            content: '회원정보를 가져오는 중 오류가 발생했습니다.',
            confirmText: '확인',
          });
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
        console.log('[LOG] 회원가입 응답:', response.data);
        if (response.data.isSuccess) {
          console.log('[LOG] 회원가입 성공:', response.data);

          // 사용자 ID 저장
          if (response.data.result?.userId) {
            const userId = response.data.result.userId;
            setUserId(userId);

            // 회원가입 후 바로 로그인 요청
            try {
              console.log('[LOG] 회원가입 후 자동 로그인 시도');
              const loginResponse = await authApi.login({
                userId,
                pinCode: Number(inputPin),
              });

              if (loginResponse.data.isSuccess && loginResponse.data.result) {
                const { accessToken, refreshToken } = loginResponse.data.result;

                console.log('[LOG] 자동 로그인 성공, 토큰 저장 시작');
                // 로그인 처리 (토큰 저장 및 상태 업데이트)
                await login(userId, accessToken, refreshToken);
              }
            } catch (loginError) {
              console.error('[ERROR] 자동 로그인 실패:', loginError);
              // 로그인 실패해도 회원가입은 성공했으므로 계속 진행
            }
          }

          // 사용자 정보 등록 (전화번호, PIN)
          await saveUserRegistration(phoneNumber, inputPin);

          // 회원가입 완료 후 탭 화면으로 이동
          router.replace('/');
          return true;
        } else {
          console.error('[ERROR] 회원가입 실패:', response.data);
          showDialog({
            title: '오류',
            content:
              response.data.message || '회원가입 중 오류가 발생했습니다.',
            confirmText: '확인',
          });
          return false;
        }
      } catch (error) {
        console.error('Error during registration:', error);
        showDialog({
          title: '오류',
          content: '회원가입 중 오류가 발생했습니다.',
          confirmText: '확인',
        });
        return false;
      }
    } else {
      // PIN 번호가 일치하지 않음
      return false;
    }
  };

  return <PinScreen title="PIN번호 확인" onComplete={handleComplete} />;
}
