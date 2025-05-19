import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { authApi } from '@/modules/auth/api/auth';
import PinScreen from '@/modules/auth/components/PinScreen';
import useDialog from '@/modules/auth/hooks/useDialog';
import { Alert, BackHandler } from 'react-native';

/**
 * PIN 로그인 화면
 *
 * 사용자가 미리 등록한 PIN 번호로 로그인할 수 있는 화면입니다.
 * 세션 만료 시 자동으로 이 화면으로 리디렉션됩니다.
 */
export default function PinLogin() {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { verifyAndLogin, userId, login, isLoggedIn } = useAuthStore();
  const { showDialog } = useDialog();
  const params = useLocalSearchParams();

  // 하드웨어 백 버튼 처리 (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // 로그인 화면에서는 백 버튼을 무시하여 뒤로 갈 수 없게 함
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  // 로그인 상태 변경 감지 - 로그인 성공 시 (tabs)로 이동
  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn]);

  // 세션 만료 감지 (쿼리 파라미터로부터)
  useEffect(() => {
    const sessionExpired = params.sessionExpired === 'true';
    if (sessionExpired) {
      Alert.alert(
        '세션 만료',
        '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
        [{ text: '확인', style: 'default' }],
      );
    }
  }, [params]);

  /**
   * PIN 입력 완료 시 로그인 처리
   * 이 함수는 PinScreen에 prop으로 전달되지만, 의존성이 자주 변경되지 않으므로
   * useCallback을 제거해도 성능에 큰 영향이 없습니다.
   */
  const handleComplete = async (inputPin: string) => {
    try {
      // 로그인 시도 횟수 증가
      setLoginAttempts((prev) => prev + 1);

      // 로컬 PIN 검증
      const isLocalPinValid = await verifyAndLogin(inputPin);
      if (!isLocalPinValid) {
        // 3회 이상 실패 시 경고 메시지
        if (loginAttempts >= 2) {
          showDialog({
            title: '로그인 실패',
            content:
              'PIN 번호를 3회 이상 잘못 입력하셨습니다. 다시 시도해주세요.',
            confirmText: '확인',
          });
          setLoginAttempts(0);
        }
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
      const loginResponse = await authApi.login({
        userId,
        pinCode: Number(inputPin),
      });

      if (loginResponse.data.isSuccess && loginResponse.data.result) {
        console.log('[LOG] 로그인 성공');

        // 토큰 저장 및 로그인 상태 업데이트
        const { accessToken, refreshToken } = loginResponse.data.result;
        await login(userId, accessToken, refreshToken);

        // 로그인 성공 시 탭 화면으로 이동은 useEffect에서 처리
        return true;
      } else {
        console.error('[ERROR] 로그인 실패:', loginResponse.data);
        showDialog({
          title: '오류',
          content: loginResponse.data.message || '로그인에 실패했습니다.',
          confirmText: '확인',
        });
        return false;
      }
    } catch (error) {
      console.error('[ERROR] 로그인 중 오류:', error);
      showDialog({
        title: '오류',
        content: '로그인 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
      return false;
    }
  };

  return (
    <PinScreen
      title="PIN 번호 로그인"
      subtitle="등록된 PIN 번호 6자리를 입력해주세요"
      onComplete={handleComplete}
    />
  );
}
