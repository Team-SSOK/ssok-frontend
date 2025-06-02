import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAppState } from '@/hooks/useAppState';
import { useAuthStore } from '@/modules/auth/store/authStore';
import PinScreen from '@/modules/auth/components/PinScreen';
import useDialog from '@/hooks/useDialog';
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
  const { handleUserNotFound } = useAuthStore();
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

    const result = await handleReauth(inputPin);

    if (result.success) {
      console.log('[LOG][ReauthScreen] 재인증 성공, 메인 화면으로 복귀');

      // 재인증 상태 확실히 초기화
      clearReauthRequest();

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(app)');
      }
      setIsLoading(false);
      return true;
    } else {
      // 사용자 없음 에러 감지 (useAppState에서 이미 감지했지만 추가 보장)
      const isUserNotFoundError = 
        result.message?.includes('사용자 정보가 삭제되어') ||
        result.message?.includes('사용자를 찾을 수 없습니다') ||
        result.message?.includes('User not found');

      if (isUserNotFoundError) {
        console.log('[LOG][ReauthScreen] 사용자 없음 에러 감지 - 사용자에게 안내 다이얼로그 표시');
        
        // 재인증 상태 즉시 초기화
        clearReauthRequest();
        
        // 로딩 상태 해제
        setIsLoading(false);
        
        // 사용자에게 상황 설명 다이얼로그 표시
        showDialog({
          title: '계정 정보 없음',
          content: 
            '서버에서 회원님의 계정 정보를 찾을 수 없습니다.\n' +
            '보안상의 이유로 처음부터 다시 가입해 주세요.\n\n' +
            '문제가 지속되면 고객센터로 문의해 주세요.\n' +
            '📞 고객센터: 1669-1000',
          confirmText: '확인',
          onConfirm: async () => {
            console.log('[LOG][ReauthScreen] 다이얼로그 확인 - handleUserNotFound 호출 시작');
            hideDialog();
            
            try {
              await handleUserNotFound();
              console.log('[LOG][ReauthScreen] handleUserNotFound 호출 완료');
            } catch (error) {
              console.error('[LOG][ReauthScreen] handleUserNotFound 호출 중 오류:', error);
              // 실패해도 회원가입 페이지로 강제 이동
              router.replace('/(auth)/register');
            }
          },
        });
        
        return true; // PIN 화면에서 에러 표시하지 않음
      }

      console.log('[LOG][ReauthScreen] 재인증 실패:', result.message);
      setIsLoading(false);
      return false;
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
