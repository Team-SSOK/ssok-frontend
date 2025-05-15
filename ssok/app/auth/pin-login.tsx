import React, { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { authApi } from '@/modules/auth/api/auth';
import PinScreen from '@/modules/auth/components/PinScreen';
import useDialog from '@/modules/auth/hooks/useDialog';
import { Alert } from 'react-native';

export default function PinLogin() {
  const verifyAndLogin = useAuthStore((state) => state.verifyAndLogin);
  const userId = useAuthStore((state) => state.userId);
  const login = useAuthStore((state) => state.login);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { showDialog } = useDialog();
  const params = useLocalSearchParams();

  // 로그인 상태 변경 감지 - 로그인 성공 시 (tabs)로 이동
  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn]);

  // 세션 만료 감지 (쿼리 파라미터로부터)
  useEffect(() => {
    // 현재 URL에서 세션 만료 파라미터 확인
    const sessionExpired = params.sessionExpired === 'true';
    if (sessionExpired) {
      Alert.alert(
        '세션 만료',
        '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
        [{ text: '확인', style: 'default' }],
      );
    }
  }, [params]);

  const handleComplete = async (inputPin: string) => {
    try {
      // 로컬 PIN 검증
      const isLocalPinValid = await verifyAndLogin(inputPin);
      if (!isLocalPinValid) {
        return false;
      }

      // 사용자 ID 확인
      if (!userId) {
        showDialog({
          title: '오류',
          content: '사용자 정보를 찾을 수 없습니다.',
          confirmText: '확인',
        });
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

        // 토큰 저장 및 로그인 상태 업데이트
        const { accessToken, refreshToken } = response.data.result;
        await login(userId, accessToken, refreshToken);

        // 로그인 성공 시 탭 화면으로 이동은 useEffect에서 처리
        return true;
      } else {
        console.error('[ERROR] 로그인 실패:', response.data);
        showDialog({
          title: '오류',
          content: response.data.message || '로그인에 실패했습니다.',
          confirmText: '확인',
        });
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      showDialog({
        title: '오류',
        content: '로그인 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
      return false;
    }
  };

  return <PinScreen title="PIN 번호 로그인" onComplete={handleComplete} />;
}
