import React, { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useSession } from '@/contexts/useSession';
import PinScreen from '@/modules/auth/components/PinScreen';
import useDialog from '@/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider';
import { ERROR_MESSAGES } from '@/modules/auth/utils/constants';

export default function PinSetup() {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'setup' | 'confirm'>('setup');

  const { setPin: setStoredPin } = useAuthStore();
  const {
    signUpAndLogin,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useSession();
  const { showDialog, dialogState, hideDialog } = useDialog();

  const handleComplete = useCallback(
    async (inputPin: string) => {
      if (step === 'setup') {
        // PIN 설정 단계
        setPin(inputPin);
        setStoredPin(inputPin); // Zustand 스토어에 PIN 저장
        setStep('confirm');
        return true; // PIN 입력 성공으로 처리하여 다음 단계로 진행
      }

      if (step === 'confirm') {
        // PIN 확인 단계
        if (inputPin !== pin) {
          showDialog({
            title: 'PIN 불일치',
            content: ERROR_MESSAGES.PIN_MISMATCH || 'PIN 번호가 일치하지 않습니다.',
            confirmText: '다시 시도',
            onConfirm: () => {
              hideDialog();
              setStep('setup');
              setPin('');
            },
          });
          return false;
        }

        // useSession의 signUpAndLogin 함수 호출
        const result = await signUpAndLogin(inputPin);

        if (result.success) {
          console.log('[LOG][PinSetup] 회원가입 및 로그인 성공, 화면 전환');
          router.replace('/(app)'); // 성공 시 메인 화면으로
          return true;
        } else {
          console.error(
            '[ERROR][PinSetup] 회원가입/로그인 실패:',
            result.message,
          );
          showDialog({
            title: '처리 실패',
            content:
              result.message ||
              ERROR_MESSAGES.SIGNUP_ERROR ||
              '처리 중 오류가 발생했습니다.',
            confirmText: '확인',
          });
          return false;
        }
      }

      return false;
    },
    [step, pin, setStoredPin, signUpAndLogin, showDialog, hideDialog],
  );

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
        title={step === 'setup' ? 'PIN번호 설정' : 'PIN번호 확인'}
        subtitle={
          step === 'setup'
            ? '6자리 숫자로 PIN을 설정해주세요.'
            : '설정한 PIN을 다시 입력하여 확인해주세요.'
        }
        onComplete={handleComplete}
        isLoading={isSessionLoading}
        resetTrigger={step}
      />
    </>
  );
}
