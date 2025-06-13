import { useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/modules/auth/store/authStore';
import useDialog from '@/hooks/useDialog';
import { useSession } from '@/contexts/useSession';

/**
 * 로그인 플로우를 관리하는 커스텀 훅
 * 
 * 인증 상태 관리, 리디렉션 로직, 다이얼로그 처리 등을 담당합니다.
 */
export const useSignInFlow = () => {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  
  const {
    // 상태
    phoneNumber,
    verificationCode,
    verificationSent,
    verificationConfirmed,
    isSendingCode,
    isVerifyingCode,
    error,
    isUserRegistered,
    
    // 액션
    setPhoneNumber,
    setVerificationCode,
    formatPhoneNumber,
    sendVerificationCode,
    verifyCodeWithUserCheck,
    clearError,
  } = useAuthStore();

  const { dialogState, showDialog, hideDialog } = useDialog();

  // 통합된 로딩 상태
  const isLoading = sessionLoading || isSendingCode || isVerifyingCode;

  // 리디렉션 로직
  useEffect(() => {
    if (sessionLoading) return; 

    if (isAuthenticated) {
      router.replace('/(app)');
      return;
    }

    if (!isAuthenticated && isUserRegistered()) {
      router.replace('/(auth)/pin-login');
      return;
    }
  }, [isAuthenticated, sessionLoading, isUserRegistered]);

  // 휴대폰 번호 포맷팅 핸들러
  const handlePhoneNumberChange = useCallback((text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  }, [formatPhoneNumber, setPhoneNumber]);

  // 인증번호 발송 핸들러
  const handleSendVerificationCode = useCallback(async () => {
    clearError();
    
    const result = await sendVerificationCode();
    
    if (result.success) {
      showDialog({
        title: '인증번호 발송',
        content: '인증번호가 발송되었습니다.',
        confirmText: '확인',
      });
    } else {
      showDialog({
        title: '오류',
        content: result.message || '인증번호 발송 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    }
  }, [sendVerificationCode, showDialog, clearError]);

  // 인증번호 확인 핸들러
  const handleVerifyCode = useCallback(async () => {
    clearError();
    
    const result = await verifyCodeWithUserCheck();

    if (result.success && result.data) {
      const { existingUser, userId } = result.data;

      if (existingUser && userId) {
        // 기존 사용자 - PIN 재설정 페이지로 이동
        showDialog({
          title: '기존 사용자',
          content: '기존 사용자입니다. PIN을 재설정해주세요.',
          confirmText: '확인',
          onConfirm: () => {
            hideDialog();
            router.replace('/(auth)/pin-reset');
          },
        });
      } else {
        // 신규 사용자 - 회원가입 페이지로 이동
        showDialog({
          title: '신규 사용자',
          content: '신규 사용자입니다. 회원가입을 진행해주세요.',
          confirmText: '확인',
          onConfirm: () => {
            hideDialog();
            router.replace('/(auth)/register');
          },
        });
      }
    } else {
      showDialog({
        title: '오류',
        content: result.message || '인증번호가 올바르지 않습니다.',
        confirmText: '확인',
      });
    }
  }, [verifyCodeWithUserCheck, showDialog, hideDialog, clearError]);

  return {
    // 상태
    phoneNumber,
    verificationCode,
    verificationSent,
    verificationConfirmed,
    error,
    isLoading,
    
    // 다이얼로그 상태
    dialogState,
    hideDialog,
    
    // 핸들러
    handlePhoneNumberChange,
    setVerificationCode,
    handleSendVerificationCode,
    handleVerifyCode,
  };
};

export default useSignInFlow; 