import React, { useState, useCallback } from 'react';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import PinScreen from '@/modules/auth/components/PinScreen';
import { useAuthStore } from '@/modules/auth/store/authStore';
import useDialog from '@/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider';

export default function PinResetScreen() {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'setup' | 'confirm'>('setup');

  const { dialogState, showDialog, hideDialog } = useDialog();
  const { user, resetPin, loginWithPinViaApi } = useAuthStore();

  const handlePinComplete = useCallback(
    async (inputPin: string) => {
      if (step === 'setup') {
        setPin(inputPin);
        setStep('confirm');
        return true; // PIN 입력 성공으로 처리하여 다음 단계로 진행
      }

      if (step === 'confirm') {
        if (inputPin !== pin) {
          showDialog({
            title: 'PIN 불일치',
            content: 'PIN 번호가 일치하지 않습니다. 다시 입력해주세요.',
            confirmText: '확인',
            onConfirm: () => {
              hideDialog();
              setStep('setup');
              setPin('');
            },
          });
          return false;
        }

        // PIN 재설정 처리
        try {
          if (!user?.id) {
            showDialog({
              title: '오류',
              content: '사용자 정보를 찾을 수 없습니다.',
              confirmText: '확인',
            });
            return false;
          }

          // authStore의 resetPin 액션 사용
          const resetResult = await resetPin(user.id, inputPin);

          if (resetResult.success) {
            // PIN 재설정 성공 후 로그인 처리
            const loginResult = await loginWithPinViaApi(inputPin, user.id);
            
            if (loginResult.success) {
              Toast.show({
                type: 'success',
                text1: 'PIN 재설정 완료',
                text2: 'PIN이 성공적으로 재설정되었습니다.',
                position: 'bottom',
              });
              
              // 메인 화면으로 이동
              router.replace('/(app)/(tabs)');
              return true;
            } else {
              showDialog({
                title: '로그인 실패',
                content: loginResult.message || '로그인에 실패했습니다.',
                confirmText: '확인',
              });
              return false;
            }
          } else {
            showDialog({
              title: 'PIN 재설정 실패',
              content: resetResult.message || 'PIN 재설정에 실패했습니다.',
              confirmText: '확인',
            });
            return false;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'PIN 재설정 중 오류가 발생했습니다.';
          showDialog({
            title: '오류',
            content: errorMessage,
            confirmText: '확인',
          });
          return false;
        }
      }

      return false;
    },
    [step, pin, user?.id, resetPin, loginWithPinViaApi, showDialog, hideDialog],
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
        title={step === 'setup' ? '새 PIN을 설정해주세요' : 'PIN을 다시 입력해주세요'}
        subtitle={
          step === 'setup'
            ? '6자리 숫자로 PIN을 설정해주세요.'
            : '설정한 PIN을 다시 입력하여 확인해주세요.'
        }
        onComplete={handlePinComplete}
        resetTrigger={step}
      />
    </>
  );
} 