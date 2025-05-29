import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAppState } from '@/hooks/useAppState';
import PinScreen from '@/modules/auth/components/PinScreen';
import useDialog from '@/modules/auth/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider';
import { BackHandler } from 'react-native';

/**
 * 재인증 화면
 *
 * 앱이 백그라운드에서 포그라운드로 복귀할 때 보안을 위해 PIN 재입력을 요구하는 화면입니다.
 * 기존의 PinScreen 컴포넌트를 재사용하여 일관된 UI/UX를 제공합니다.
 */
export default function ReauthScreen() {
  const [reauthAttempts, setReauthAttempts] = useState(0);
  const { handleReauth, clearReauthRequest } = useAppState();
  const { showDialog, dialogState, hideDialog } = useDialog();
  const [isLoading, setIsLoading] = useState(false);

  // 하드웨어 백 버튼 처리 (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // 재인증 화면에서는 백 버튼을 무시하여 뒤로 갈 수 없게 함
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  /**
   * PIN 입력 완료 시 재인증 처리
   */
  const handleComplete = async (inputPin: string) => {
    setReauthAttempts((prev) => prev + 1);
    setIsLoading(true);

    try {
      const result = await handleReauth(inputPin);

      if (result.success) {
        console.log('[LOG][ReauthScreen] 재인증 성공, 메인 화면으로 복귀');

        // 재인증 상태 확실히 초기화
        clearReauthRequest();

        // 재인증 성공 시 이전 화면으로 돌아가기
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(app)');
        }
        return true;
      } else {
        console.error('[ERROR][ReauthScreen] 재인증 실패:', result.message);

        // 3회 이상 실패 시 특별한 처리
        if (reauthAttempts >= 2 && result.message?.includes('PIN')) {
          showDialog({
            title: '재인증 실패',
            content:
              '재인증에 여러 번 실패했습니다. 잠시 후 다시 시도해주세요.',
            confirmText: '확인',
            onConfirm: () => {
              hideDialog();
              setReauthAttempts(0);
            },
          });
        } else {
          showDialog({
            title: '재인증 실패',
            content:
              result.message ||
              '재인증에 실패했습니다. PIN 코드를 다시 확인해주세요.',
            confirmText: '확인',
          });
        }
        return false;
      }
    } catch (error) {
      console.error('[ERROR][ReauthScreen] 재인증 중 오류:', error);
      showDialog({
        title: '오류',
        content: '재인증 중 오류가 발생했습니다. 다시 시도해주세요.',
        confirmText: '확인',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogProvider
        visible={dialogState.visible}
        title={dialogState.title}
        content={dialogState.content}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm || hideDialog}
        onCancel={dialogState.onCancel || hideDialog}
        onDismiss={hideDialog}
      />
      <PinScreen
        title="재로그인이 필요합니다"
        subtitle="보안을 위해 PIN 번호 6자리를 다시 입력해주세요"
        onComplete={handleComplete}
        isLoading={isLoading}
      />
    </>
  );
}
