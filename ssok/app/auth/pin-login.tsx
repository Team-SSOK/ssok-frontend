import React from 'react';
import { router } from 'expo-router';
import { usePin } from '@/contexts/PinContext';
import { authApi } from '@/modules/auth/api/auth';
import { getUserId, saveAuthTokens } from '@/modules/auth/utils/authUtils';
import PinScreen from '@/modules/auth/components/PinScreen';
import useDialog from '@/modules/auth/hooks/useDialog';

export default function PinLogin() {
  const { verifyAndLogin } = usePin();
  const { showDialog } = useDialog();

  const handleComplete = async (inputPin: string) => {
    try {
      // 로컬 PIN 검증
      const isLocalPinValid = await verifyAndLogin(inputPin);
      if (!isLocalPinValid) {
        return false;
      }

      // 사용자 ID 가져오기
      const userId = await getUserId();
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

        // 토큰 저장
        const { accessToken, refreshToken } = response.data.result;
        await saveAuthTokens(accessToken, refreshToken);

        // 로그인 성공 시 탭 화면으로 이동
        router.replace('/(tabs)');
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
